var express 		= require('express'),
  	async 			= require('async'),
  	expressWinston 	= require('express-winston'),
  	winston			= require('winston'),
  	db 				= require('./models'),  	
  	bubblescrawler	= require('./crawler/bubblescrawler');
  	
var routes 			= require('./routes');  	

var app = module.exports = express();
var port = 3000;

//Init models
db.sequelize.sync().complete(function(err) {
	if (err) {
	   	throw err
	}
});

// Configuration

app.configure(function(){	
	app.use(express.static(__dirname + '/public'));
	
	global.photodir = __dirname + '/public' + '/photos';

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
	app.use(express.cookieParser( 'Gpe3YY88WGtxzizVh' ));
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
  app.locals.pretty = true;
});

app.configure('production', function(){
});

// Routes
require('./routes')(app);

// redirect all others to the index (HTML5 history)
app.get('*', require('./routes/home'));

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});