module.exports = function(app){
	app.get('/login',  function(req, res){
		res.render('login');
	});
	
	app.post('/login', function(req, res) {
		var login = req.body.login;
		var password  = req.body.password;
		
		if (login == 'olivier' && password == 'bullesme') {
			req.session.loggedIn = true;
			
			res.redirect('/admin/');
		} else {
			res.render('login');	
		}
	});
};