module.exports = function(app){
	app.get('/out/:id', function(req, res){
		var wineId = req.param('id');
		db.Wine.find(wineId).success(function(wine) {
			if (wine) {
				res.redirect(wine.url);
				
				var cookie = req.signedCookies.query;		

				db.Clic.create ({
					query: cookie.q,
					qty: cookie.qty,
					minSize:cookie.minSize,
					maxSize:cookie.maxSize,
					minPrice:cookie.minPrice,
					maxPrice:cookie.maxPrice,
					color:cookie.color
				}).success( function( clic) {
					clic.setWine(wine);
					clic.save();
				});
			}
			
		});
	});
}