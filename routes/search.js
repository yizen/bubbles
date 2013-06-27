transportationFees = require('../lib/transportationFees');

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
					
					wine.size = item._source.size;

					wine.website = item._source.website;						
					wine.euro = formatEuro(item._source.price);
					wine.options = item._source.options;
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
		return numFormat.join(' ')+','+numFormatDec+' &euro;'; /*format 000.000.000,00 */
	}
};
