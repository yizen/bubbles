async 			= require('async');
bubblescrawler	= require('../crawler/bubblescrawler');

var ejs 			= require('elastic.js'),
    nc 				= require('elastic.js/elastic-node-client');  	

module.exports = function(app){
	app.get('/admin/', function (req, res) {
		//Admin login page
		db.Website.findAll().success(function(websites) {
			async.each(websites, function(website, callback) {
				website['refresh'] = "admin/refresh/"+website.id;
				website['crawl'] = "admin/crawl/"+website.id;
				website['jobs'] = new Array;
				//Query jobs for this website
				website.getJobs().success(function(jobs) {
					website['jobs'] = jobs;
					callback();
				});
				}, function(err) {
					res.render('admin/admin', { websites : websites });				
			});	
		});
	});
	
	app.get('/admin/wines/', function (req, res) {
		db.Wine.findAll().success(function(wines) {
			async.each(wines, function(wine, callback) {
				wine.getWebsite().success(function(website) {
					wine['website'] = website.name;
					
					if (wine.photo) {
						var photo = '/photos/'+wine.photo;
						var fullURL = req.protocol + "://" + req.get('host') + photo;
	
						var base64photo = new Buffer(fullURL).toString('base64')
						wine['photo'] = '/thumbs/small/images/'+base64photo+".jpg";
					} else {
						wine['photo'] = '/images/no-image.png';
					}
					
					callback();
				});
				}, function(err) {
					res.render('admin/wines', { wines : wines });				
			});	
		});
	});
	
	app.get('/admin/clics/', function (req, res) {
		db.Clic.findAll().success(function(clics){
			async.each(clics, function(clic, callback) {
				clic.getWine().success(function(wine) {
					clic['wine'] = wine.wine;
					callback();
				});
				}, function(err) {
					res.render('admin/clics', { clics : clics });				
			});	

		});
	});
	
	app.post('/admin/setactive/', function (req, res) {
		var websiteId 	= req.param('websiteId', null); 
		var active 		= req.param('active', null); 

		if (!websiteId || !active) {
			console.log('Missing websiteId or active');
			res.send('Missing websiteId or active');
			return false;
		}
		
		(active == "true") ? activedb = true : activedb = false;
		
		db.Website.find(websiteId).success(function(website) {
			website.active = activedb;
			website.save().success(function(){
				res.send('Changed '+websiteId+' to '+active);
				return;
			}).error(function(err){
				console.error( err );
				res.send('Error changing status');
				return false;
			})
		});
		
	});
	
	app.get('/admin/refresh-all/', function (res, res) {
		bubblescrawler.resfreshAllWebsites(); 
		res.redirect('/admin/');
	});
	
	app.get('/admin/refresh/:website', function (req, res) {	
		var websiteId = req.param('website');

		db.Website.find(websiteId).success(function(website) {
			bubblescrawler.refreshWebsite(website);
			res.redirect('/admin/');
		}); 
	});
		
	app.get('/admin/crawl/:website', function (req, res) {	
		var websiteId = req.param('website');

		db.Website.find(websiteId).success(function(website) {
			website.lastCrawlStart = new Date();
						
			var timeout = 4500;
			
			db.Job.create ({
				type: "CRAWL",
				status: "RUNNING"
			}).success( function( job) {
				job.setWebsite(website);
				job.save();
			
				website.save().success(function() {
					res.redirect('/admin/');
				});
						 		
				bubblescrawler.crawl(website, job);		 		
						 								
			}); //Job Create		
		}); //db.Website.find
	});

	
	app.get('/admin/job/:job', function (req, res) {
		var jobId = req.param('job');
		
		db.Job.find(jobId).success(function(job) {
			job.getLogs().success(function(logs){
				res.render('admin/job', { job: job, logs : logs });				
			});	
		}); //db.Job.find
	});


	app.get('/admin/job/stop/:job', function (req, res) {
		var jobId = req.param('job');
		
		db.Job.find(jobId).success(function(job) {
			job.status = "STOPPED"
			job.save().success(function(err){
				res.redirect('/admin/');
			});
		}); //db.Job.find
	});
	
	app.get('/admin/job/clear/:job', function (req, res) {
		var jobId = req.param('job');
		
		if (!jobId) {
			res.redirect('/admin/');
			return; 
		}
		
		db.Job.find(jobId).on('success', function(job) {
			if (!job) {
				res.redirect('/admin/');
				return; 
			}
			job.destroy().on('success', function(u) {
					// successfully deleted the job
					//delete all child Logs
					db.Log.findAll({where: "JobId = "+jobId}).success(function(logs) {
						async.each(
							logs, 
							function (log, callback){				
								log.destroy().on('success', function() {
									callback();
									})
								},
								
								function(err) {				
									res.redirect('/admin/');
								}
						); //async
					});
			});
		});
	});
	
	app.get('/admin/elasticsearch/', function (req, res) {
		ejs.client = nc.NodeClient('localhost', '9200');
		
		var info = ejs.NodeStats();
		
		info.doStats(function success(status){
			res.render('admin/elasticsearch', {status : status});
		}, function error(status){
			res.render('admin/elasticsearch', {status : status});
		});
	});
	
	app.get('/admin/elasticsearch/reindex/', function (req, res) {
		ejs.client = nc.NodeClient('localhost', '9200');

		db.Wine.findAll().success(function(wines) {
			wines.forEach(function(wine, index) {
				wine.getWebsite().success(function(website) {
					
					copy = JSON.parse(JSON.stringify(wine));
					copy.website = website.name;
					var doc = ejs.Document('bubbles', 'wine', copy.id).source(copy).upsert(copy).doUpdate(function(data) {
					}, function(error) {
						console.error("Error at index "+JSON.stringify(error));
					}
					);
				});
   			});
   			
   			res.redirect('/admin/elasticsearch/');

		});
	});
};