async 			= require('async');

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
			
		var results = app.searchIndex.search(q);
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
							return numFormat.join(' ')+','+numFormatDec+' &euro;'; /*format 000.000.000,00 */
						}
						
						wine.euro = formatEuro(wine.price);
						
						var include = true;
						
						for (var key in sizes) {
							if ((!sizes[key]) && (wine.size == key)) include = false;
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
};
