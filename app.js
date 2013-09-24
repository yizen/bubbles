var express 		= require('express'),
  	async 			= require('async'),
  	expressWinston 	= require('express-winston'),
  	winston			= require('winston'),
  	db 				= require('./models'),  	
  	bubblescrawler	= require('./crawler/bubblescrawler'),
  	thumbs			= require('connect-thumbs'),
  	later			= require('later'),
  	Poet 			= require('poet');
  	
var app = module.exports = express();
var port = 3000;

//Init data model with Sequelize
db.sequelize.sync().complete(function() {
	console.log("Database started, sync completed");
				 }).error(function(error) {
	console.error("Could not sync database "+error);				 
});

//Setup Later configuration for crawler refresh
later.date.localTime();
var refreshSchedule = later.parse.recur().on('02:00:00').time();
var refreshTask 	= later.setInterval(bubblescrawler.refreshAllWebsites, refreshSchedule);

// Configuration
app.configure(function(){	
	 app.use(thumbs({
		 "ttl": 92000
		, "tmpCacheTTL": 86400
		, "tmpDir": "./tmp/thumbnails"
	    , "presets": {
	        small: {
	          width: 180
	          , compression:.5
	        }
	        , medium: {
	          width: 300
	          , compression:.7
	        }
	        , large: {
	          width: 900
	          , compression:.85
	        }
		}
	}));
	
	app.use(express.static(__dirname + '/public'));
	
	global.photodir = __dirname + '/public' + '/photos';

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
  
	app.use(require('less-middleware')({ 
  		src: __dirname + '/public/less',
  		dest: __dirname + '/public/css',
  		prefix: "/css",
		force: false
	}));
	
	/*
	app.use(expressWinston.logger({
      transports: [
        new winston.transports.Console({
          json: false,
          colorize: true
        })
      ]
    }));
    */
    
    function requireLogin(req, res, next) {
		if (req.session.loggedIn) {
			next(); // allow the next route to run
		} else {
			// require the user to log in
			res.redirect("/login"); // or render a form, etc.
		}
	}
    
    app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.cookieParser( 'Gpe3YY88WGtxzizVh' ));
	app.use(express.session({ secret: 'LujfScBVmsD29S' }));
	app.use(express.methodOverride());	
    
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
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    
    app.all("/admin/*", requireLogin, function(req, res, next) {
		next(); // if the middleware allowed us to get here,
          		// just move on to the next route handler
	});
	
	app.use(app.router);
	    
    //Poet blogging engine
	var poet = Poet(app, {
	  postsPerPage: 3,
	  posts: __dirname+'/posts',
	  metaFormat: 'json',
	  routes: {
	    '/blog/post/:post': 		'blog/post',
	    '/blog/page/:page': 		'blog/page',
	    '/blog/tag/:tag': 			'blog/tag',
	    '/blog/category/:category':	'blog/category'
		}
	  });

	poet.watch(function () {
		// watcher reloaded
	}).init().then(function () {
		// Ready to go!
  	});
	
	require('./routes')(app);
	
	app.get('/rss', function (req, res) {
	  // Only get the latest posts
	  var posts = poet.helpers.getPosts(0, 5);
	  res.setHeader('Content-Type', 'application/rss+xml');
	  res.render('blog/rss', { posts: posts });
	});
});

app.configure('development', function(){
  app.locals.pretty = true;
});

app.configure('production', function(){
});


// redirect all others to the index
//app.get('*', require('./routes/home'));

// Start server
app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode, started at %s", this.address().port, app.settings.env, new Date());
});