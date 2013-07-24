module.exports = function(app){
	app.get('/bigdata/', function(req, res){
		res.render('bigdata');
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