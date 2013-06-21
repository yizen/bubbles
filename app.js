var express 		= require('express'),
  	lunr 			= require('lunr'),
  	async 			= require('async'),
  	expressWinston 	= require('express-winston'),
  	winston			= require('winston'),
  	db 				= require('./models'),  	
  	bubblescrawler	= require('./crawler/bubblescrawler');
  	
var routes 			= require('./routes');  	

var app = module.exports = express();
var port = 3000;

var searchIndex = lunr(function () {
		 		this.field('name', {boost: 10})
		 		this.field('url')
		 		this.ref('id')
});

//Init models
db.sequelize.sync().complete(function(err) {
	if (err) {
	   	throw err
	} else {
	  	
	  	console.log("Database initialized");
	  	
	  	//Set up search with LUNR
		
		db.Wine.findAll().success(function(wines) {
			wines.forEach(function(wine) {
				searchIndex.add({
					id: wine.id,
					name: wine.wine+" "+wine.producer,
					url: wine.url
				});			
   			}); 
		})
	}
});


// Configuration

app.configure(function(){
	//app.use(express.logger({format: 'dev'}));
	
	app.use(express.static(__dirname + '/public'));

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
  
	app.use(require('less-middleware')({ 
  		src: __dirname + '/public/less',
  		dest: __dirname + '/public/css',
  		prefix: "/css",
		// force true recompiles on every request... not the best
		// for production, but fine in debug while working through changes
		force: true
	}));

	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({secret: 'Gpe3YY88WGtxzizVh'}));
	app.use(express.methodOverride());
	
	// express-winston logger makes sense BEFORE the router.
    app.use(expressWinston.logger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        })
      ]
    }));

    app.use(app.router);

    // express-winston errorHandler makes sense AFTER the router.
    app.use(expressWinston.errorLogger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        })
      ]
    }));

    // Optionally you can include your custom error handler after the logging.
    /*
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    */
  
	app.use(app.router);
});

app.configure('development', function(){
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.locals.pretty = true;
});

app.configure('production', function(){
  //app.use(express.errorHandler());
});

// Routes
app.get('/', require('./routes/home'));
app.get('/search',  require('./routes/search'));

app.get('/admin/', function (req, res) {
	//Admin login page
	db.Website.findAll().success(function(websites) {
		websites.forEach( function (website) {
			website['refresh'] = "admin/refresh/"+website.id;
			website['crawl'] = "admin/crawl/"+website.id;
		});
		
		res.render('admin', { websites : websites });
	});
});

app.get('/admin/refresh/:website', function (req, res) {
	console.log ('hello');
	res.render('refresh');
	
	var websiteId = req.param('website');
	
	db.Website.find(websiteId).success(function(website) {
		website.lastRefreshStart = new Date();
		website.save();
		
		var asyncProcessOn = true;
		
		io.sockets.on('connection', function (socket) {
			
			// Client disconnects
			socket.on('disconnect', function () {
				app.emit('event:refresh:stop');
			});
			
			
			// Are we the current socket or a previous one that got disconnected ? 
			socket.get('active', function(err, active){
				if (!err) {
					if (active == "reset") {
						socket.disconnect();
					};
					
					app.on('event:refresh:stop', function(){
						console.log ("STOP");
						socket.set('active', false);
						asyncProcessOn = false;
					}); //refresh stop
											
					socket.emit('message', { message: 'Refresh started '+website.name });
					var timeout = 4500;
										
					website.getWines().success(function(wines) {
						console.log("Total "+wines.length);
					
						async.eachSeries(
							wines, 
							function (wine, callback){
								
								console.log("Starting "+wine.name+" ? "+asyncProcessOn);
								
								if (asyncProcessOn) {
									setTimeout(function () {
										bubblescrawler.explore(website, wine.url, socket, app);
										callback();
									}, timeout);	 
								} else {
									callback(true);
								}
							},
							function(err) {				
								website.lastRefreshEnd = new Date();
								website.save();
								socket.emit('message', { message: "Refresh finished at :" + website.lastRefreshEnd });
						}); //async
				  	}); //get Wines			
					
				}; // not err
			}); // socket.get.active
		}); //socket.on.connection	
	}); //db.Website.find
});


// redirect all others to the index (HTML5 history)
app.get('*', require('./routes/home'));

// Start server
/*
app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
*/

var io = require('socket.io').listen(app.listen(port));
