var express 		= require('express'),
  	uuid 			= require('node-uuid'),  	
  	async 			= require('async'),
  	expressWinston 	= require('express-winston'),
  	winston			= require('winston'),
  	db 				= require('./models'),  	
  	elasticSearchClient = require('elasticsearchclient'),
  	bubblescrawler	= require('./crawler/bubblescrawler');
  	
var routes 			= require('./routes');  	

var app = module.exports = express();
var port = 3000;


//Connect to Elasticsearch
var elasticSearchserverOptions = {
    host: 'localhost',
    port: 9200,
    pathPrefix:'',
    secure: false,
};

app.es = new elasticSearchClient(elasticSearchserverOptions);

//Init models
db.sequelize.sync().complete(function(err) {
	if (err) {
	   	throw err
	} else {
	  	
	  	console.log("Database initialized");
	  	
	  	//Set up search
		
		db.Wine.findAll().success(function(wines) {
			wines.forEach(function(wine, index) {
				wine.getWebsite().success(function(website) {
					var copy = JSON.parse(JSON.stringify(wine));
					copy.website = website.name;
					/*app.es.index('bubbles', 'wine', copy, copy.id)
						.on('data', function(data) {
							console.log(data)
						})
						.exec();	*/
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
require('./routes')(app);

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
	
	
	var job = uuid.v1();	
	var websiteId = req.param('website');
	
	db.Website.find(websiteId).success(function(website) {
		website.lastRefreshStart = new Date();
		website.refreshStatus = "RUNNING";
		website.save().success(function() {
			res.redirect('/admin/');
		});
		
		var timeout = 4500;
										
		website.getWines().success(function(wines) {
					
			async.eachSeries(
				wines, 
				function (wine, callback){				
					console.log("Starting "+wine.name);
					setTimeout(function () {
						bubblescrawler.explore(website, wine.url, job);
						callback();
						}, timeout);
					},
					
					function(err) {				
						website.lastRefreshEnd = new Date();
						
						if (err) {
							website.refreshStatus = "ERROR";
						} else {
							website.refreshStatus = "OK";
						}
						website.save();
					}
			); //async
		}); //get Wines			
	}); //db.Website.find
	
	
});


// redirect all others to the index (HTML5 history)
app.get('*', require('./routes/home'));

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});