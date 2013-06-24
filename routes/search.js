module.exports = function(app){

	app.get('/search', function(req, res){
		console.log(req.query);
  
		var q = req.query.q;
		
		var bouteille = req.query.bouteille;
		var demibouteille = req.query.demibouteille;
		var magnum = req.query.magnum;
		var jeroboam = req.query.jeroboam;
		var mathusalem = req.query.mathusalem;
		var salmanazar = req.query.salmanazar;
		var balthazar = req.query.balthazar;
		var nabuchodonosor = req.query.nabuchodonosor;

		var sizes = new Array();
		
		if (bouteille == "undefined") 		sizes['1'] 		= false;
		if (demibouteille == "undefined") 	sizes['0.5'] 	= false;
		if (magnum == "undefined") 			sizes['2'] 		= false;
		if (jeroboam == "undefined") 		sizes['4'] 		= false;
		if (mathusalem == "undefined") 		sizes['8'] 		= false;
		if (salmanazar == "undefined") 		sizes['12'] 	= false;
		if (balthazar == "undefined") 		sizes['16'] 	= false;
		if (nabuchodonosor == "undefined") 	sizes['20'] 	= false;
			
		//var results = app.searchIndex.search(q);
		
		var qryObj =
		{
		  "from": 0,
		  "size": 100,
		  "query": {
		    "multi_match": {
		      "query": "veuve",
		      "fields": [
		        "wine.producer",
		        "wine.wine"
		      ]
		    }
		  },
		  "sort": [
		    {
		      "wine.price": {
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
			if (data.hits.total > 0) {
				data.hits.hits.forEach(function(item) { 
					var wine = new Object;
					wine.wine = item._source.wine;
					
					if (item.highlight.producer) {
						wine.producer = item.highlight.producer;
					} else {
						wine.producer = item._source.producer;
					}
					
					wine.options = item._source.options;
					wine.website = item._source.website;						
					wine.euro = formatEuro(item._source.price);
					wine.options = item._source.options
					wines.push(wine);	
				});
				
				res.render('results', { wines : wines });
			};
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
