async 			= require('async');
bubblescrawler	= require('../crawler/bubblescrawler');

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
					res.render('admin', { websites : websites });				
			});	
		});
	});
	
	app.get('/admin/refresh/:website', function (req, res) {	
		var websiteId = req.param('website');

		db.Website.find(websiteId).success(function(website) {
			website.lastRefreshStart = new Date();
						
			var timeout = 4500;
			
			db.Job.create ({
				type: "REFRESH",
				status: "RUNNING"
			}).success( function( job) {
				job.setWebsite(website);
				job.save();
			
				website.save().success(function() {
					res.redirect('/admin/');
				});
						 								
				website.getWines().success(function(wines) {		
					async.eachSeries(
						wines, 
						function (wine, callback){				
							console.log("Starting "+wine.name);
							setTimeout(function () {
								bubblescrawler.explore(website, wine.url, job);
								callback();
								}, timeout);
							},
							
							function(err) {				
								website.lastRefreshEnd = new Date();
								
								if (err) {
									job.status = "ERROR";
								} else {
									job.status = "OK";
								}
								job.save();
							}
					); //async
				}); //get Wines	
			}); //Job Create		
		}); //db.Website.find
	});
	
	app.get('/admin/job/:job', function (req, res) {
		var jobId = req.param('job');
		
		db.Job.find(jobId).success(function(job) {
			job.getLogs().success(function(logs){
				res.render('job', { job: job, logs : logs });				
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
		var status = app.es.status('bubbles')
		.on('data', function(data) {
			status = JSON.parse(data);
        	res.render('elasticsearchstatus', {status : status});
		})
		.exec();
	});
	
	app.get('/admin/elasticsearch/reindex/', function (req, res) {
		app.es.deleteIndex('bubbles')
		.on('data', function(data) {
			res.redirect('/admin/elasticsearch/');
			db.Wine.findAll().success(function(wines) {
				wines.forEach(function(wine, index) {
					wine.getWebsite().success(function(website) {
						var copy = JSON.parse(JSON.stringify(wine));
						copy.website = website.name;
						app.es.index('bubbles', 'wine', copy, copy.id)
							.on('data', function(data) {
								console.log(data)
							})
							.exec();
					});
	   			}); 
			});
		})
		.exec();
	});
};