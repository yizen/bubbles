/**
 * Module dependencies.
 */

var express = require('express'),
  	routes = require('./routes'),
  	api = require('./routes/api'),
  	lunr = require('lunr'),
  	async = require('async'),
  	db = require('./models');

var app = module.exports = express();

var index = lunr(function () {
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
				index.add({
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
	app.use(express.logger({format: 'dev'}));
	
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
  
	app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.locals.pretty = true;
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);

app.get('/search', function(req, res){
  console.log(req.query);
  
  var q = req.query.q;
  var demibouteille = req.query.demibouteille;
  
  var sizes = new Array();
  
  if (demibouteille == "undefined") sizes['Demi-bouteille'] = false;
  
  var results = index.search(q);
  var wines = new Array();
  
  console.log("TOTAL RESULTS : ",results.length);
  
  async.each(
  		results, 
  		function (item, callback){ 
	  		db.Wine.find(item.ref).success(function(wine){
				wine.getWebsite().success(function(website) {
					wine.website = website.name;
					
					function formatEuro (number) {
						
						if (!number) return ("Prix sur demande");
					
						var numberStr = parseFloat(number).toFixed(2).toString();
						var numFormatDec = numberStr.slice(-2); /*decimal 00*/
						numberStr = numberStr.substring(0, numberStr.length-3); /*cut last 3 strings*/
						var numFormat = new Array;
						while (numberStr.length > 3) {
							numFormat.unshift(numberStr.slice(-3));
							numberStr = numberStr.substring(0, numberStr.length-3);
						}
						numFormat.unshift(numberStr);
						return numFormat.join(' ')+','+numFormatDec+' €'; /*format 000.000.000,00 */
					}
					
					wine.euro = formatEuro(wine.price);
					
					
					var include = true;
					
					for (var key in sizes) {
						if ((!sizes[key]) && (wine.size == key) )include = false;
					}
					
					
					if (include) 
						wines.push(wine);
						
					callback(); // tell async that the iterator has completed
					});
			})
		}, 
		function(err) {
	    
			wines.sort(function(a, b){
		  		return a.price-b.price
		  	});
	  		
		  	res.render('results', { wines : wines });
		 }
	);
});

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
