async 			= require('async');

module.exports = function(app){
	app.get('/bigdata/', function(req, res){
			
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
				db.sequelize.query('select avg(price) as price from Wines').success(function(c){
					var price = Math.floor(c[0].price);
					callback(null, price);
				});
			}			
		},
		
		function(err, results){
			res.render('bigdata', {bigdata: results} );

		});
	});
	
	app.get('/bigdata/mostFrequentProducers/', function(req, res){
	
		db.sequelize.query('select id, producer, count(*) as volume, avg(price) as price from Wines group by producer').success(function(rows){
			rows.sort(function(a, b){
				return b.value-a.value
			});
			
			res.json(rows);

		});
	
	});
};