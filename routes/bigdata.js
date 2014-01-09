async 			= require('async');
fs 				= require('fs');
bigData			= require('./../lib/bigData');
path  			= require('path');


module.exports = function(app){
	app.get('/bigdata/', function(req, res) {
		fs.readFile(path.resolve(__dirname, '../bigdata/data.json'), function read(err, data) {
		    if (err) {
		        throw err;
		    }
		    bigdata = JSON.parse(data);
			res.render('bigdata', {bigdata: bigdata} );
		});
	});
	
	app.get('/bigdata/refresh/', function(req, res) {
		bigData.recalcStats();
		res.end();
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