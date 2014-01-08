var bigData = (function () {
	
	async 			= require('async');
	fs 				= require('fs');
	
	var _recalcStats = function() {
	
		if (fs.existsSync('./bigdata/data.json')) {
			var stat = fs.statSync('./bigdata/data.json');
			var suffix = stat.mtime.getTime();
			fs.renameSync('./bigdata/data.json', './bigdata/data-'+suffix+'.json') 
		}
					
		async.parallel({
			websiteCount: function(callback) {
				db.Website.count().success(function(c) {
					callback(null, c);
				});
			},
			wineCount: function(callback) {
				db.Wine.count().success(function(c) {
					callback(null, c);
				});
			},
			producerCount: function(callback) {
				db.Producer.count().success(function(c) {
					callback(null, c);
				});
			},
			wineRefCount: function(callback) {
				db.Winereference.count().success(function(c) {
					callback(null, c);
				});
			},
			meanPrice: function(callback) {
				db.sequelize.query("select avg(price) as mean from Wines WHERE size = 1").success(function(c){
					var meanPrice = Math.floor(c[0].mean);
					callback(null, meanPrice);
				});
			},
			medianPrice: function(callback) {
				db.Wine.findAll({where: {size: 1}}).success(function(wines){
					var medianPrice = medianWines(wines);
					callback(null, medianPrice);
				});
			},
			meanPricePink: function(callback) {
				db.sequelize.query("select avg(price) as mean from Wines WHERE color = 'pink' AND size=1").success(function(c){
					var meanPrice = Math.floor(c[0].mean);
					callback(null, meanPrice);
				});
			},
			medianPricePink: function(callback) {
				db.Wine.findAll({where: {size: 1, color: 'pink'}}).success(function(wines){
					var medianPrice = medianWines(wines);
					callback(null, medianPrice);
				});
			},
			meanPriceWhite: function(callback) {
				db.sequelize.query("select avg(price) as mean from Wines WHERE color = 'white' AND size=1").success(function(c){
					var meanPrice = Math.floor(c[0].mean);
					callback(null, meanPrice);
				});
			},
			medianPriceWhite: function(callback) {
				db.Wine.findAll({where: {size: 1, color: 'white'}}).success(function(wines){
					var medianPrice = medianWines(wines);
					callback(null, medianPrice);
				});
			},
			percentPink: function(callback) {
				db.Wine.count().success(function(total) {
					db.Wine.count({where: {color: 'pink'}}).success(function(pink) {
						callback(null, Math.floor(100*pink/total));
					});
				});
			}
		},
		
		function(err, results){
			fs.writeFileSync('./bigdata/data.json', JSON.stringify(results));
			return;
		});
	}
	
	var  medianWines = function(wines) {
	    wines.sort( function(a,b) {return a.price - b.price;} );
	 
	    var half = Math.floor(wines.length/2);
	 
	    if(wines.length % 2)
	        return wines[half].price;
	    else
	        return (wines[half-1].price + wines[half].price) / 2.0;
	}
	
	return {
		recalcStats: function() {
			_recalcStats();
		}
	}	
})();

module.exports = bigData;