transportationFees 	= require('../lib/transportationFees');
sizes 				= require('../lib/sizes');

var _  				= require('underscore');
	_.str 			= require('underscore.string');
	_.mixin(_.str.exports());
	_.str.include('Underscore.string', 'string');

module.exports = function(app){

	app.get('/search', function(req, res){
		console.log(req.query);
  
		var q 		= req.query.q;
		var qty 	= req.query.qty || 1;

		var minSize =  req.query.minSize || 1;
		var maxSize =  req.query.maxSize || 20;
	
		var qryObj =
		{
		  "from": 0,
		  "size": 100,
		  
		  "query": {
		    "match" : {
				"name" : {
					"query" : q.toString(),
					"operator" : "and",
					"fuzziness": 0.4
				}
			}
		  },
		  "filter": {
			  "range" : {
				  "size" : {
					  "from" : parseFloat(minSize),
					  "to" : parseFloat(maxSize)
				  }
			  }
		  },
		  "sort": [
		    {
		      "price": {
		        "order": "asc"
		      }
		    }
		  ],
		  "highlight": {
		    "fields": {
		      "producer": {},
		      "wine" : {}
		    }
		  }
		};
		
			
		console.log(JSON.stringify(qryObj));
		
		var wines = new Array();
		
		app.es.search('bubbles', 'wine', qryObj, function(err, data){
			data = JSON.parse(data);
			
			if (data.hits && data.hits.total > 0) {
						
				data.hits.hits.forEach(function(item) { 
					var wine = new Object;
					wine.wine = item._source.wine;

					if (item.highlight && item.highlight.producer) {
						wine.producer = item.highlight.producer;
					} else {
						wine.producer = item._source.producer;
					}
					
					if (item.highlight && item.highlight.wine) {
						wine.wine = item.highlight.wine;
					} else {
						wine.wine = item._source.wine;
					}
					
					wine.size =  _.capitalize(sizes.sizeNumToText(item._source.size));

					wine.website = item._source.website;						
					wine.euro = formatEuro(item._source.price);
					wine.options = _.capitalize(item._source.options);
					wine.url = item._source.url;
					wine.total = formatEuro(item._source.price + transportationFees.transportationFees(qty, item._source.website));

					wines.push(wine);	
				});
				
				res.render('results', { wines : wines });
			} else {
				res.render('noresults' );
			}
		});

	});	
			
	var formatEuro = function  (number) {
		return _.numberFormat(number, 2, ',', ' ')+' &euro;'; /*format 000.000.000,00 */
	}
};
