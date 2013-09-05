async 			= require('async');
bubblescrawler	= require('../crawler/bubblescrawler');
paginator 		= require('../lib/pagination');
var sizes 		= require('../lib/sizes');

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
		res.redirect('/admin/wines/page/1');
	});
	
	app.get('/admin/wines/page/:page?', function (req, res) {
	    var offset = 0;
	    var limit = 10;
	    
	    var page = req.params.page || 1;
	    if (page) offset = (page-1)*limit;
	    
		db.Wine.findAndCountAll({offset: offset, limit: limit}).success(function(wines) {
			async.each(wines.rows, function(wine, callback) {
				wine.getWebsite().success(function(website) {
					wine.getWinereference().success(function(winereference) {
						
						if (winereference) {
							wine['reference'] = winereference.id;
						}
					
						wine['website'] = website.name;
						wine['sizeText'] = sizes.sizeNumToText(wine.size);
					
						if (wine.photo) {
							var photo = '/photos/'+wine.photo;
							var fullURL = req.protocol + "://" + req.get('host') + photo;
		
							var base64photo = new Buffer(fullURL).toString('base64');
							wine['photo'] = '/thumbs/small/images/'+base64photo+".jpg";
						} else {
							wine['photo'] = '/images/no-image.png';
						}
						
						callback();
					});			
				});
				}, function(err) {
					var pagination = paginator.paginate('/admin/wines/', wines.count, limit, page);
					res.render('admin/wines', { wines : wines.rows, pagination : pagination });				
			});	
		});
	});
	
	app.get('/admin/wine/:id?', function (req, res) {
		var id = req.params.id;
		
		if (!id) {
			res.redirect('/admin/');
			return;
		}
				
		async.series({
			wine: function (callback) {
				db.Wine.find(id).success(function(wine) {
					wine.getWebsite().success(function(website) {
						wine.getWinereference().success(function(winereference) {
							if (winereference) {
								wine['reference'] = winereference.id;
							}
						
							wine['website'] = website.name;
							wine['sizeText'] = sizes.sizeNumToText(wine.size);
						
							if (wine.photo) {
								var photo = '/photos/'+wine.photo;
								var fullURL = req.protocol + "://" + req.get('host') + photo;
			
								var base64photo = new Buffer(fullURL).toString('base64');
								wine['photo'] = '/thumbs/small/images/'+base64photo+".jpg";
							} else {
								wine['photo'] = '/images/no-image.png';
							}
							
							callback (null, wine);
						});			
					});
				});
			},
			
			websites: function(callback) {
				db.Website.findAll().success(function(websites) {
					callback (null, websites);
				})		
			},
			
			colors: function(callback) {
				colors = new Array();
				colors.push("White");
				colors.push("Pink");
				
				callback (null, colors);
			},
			
			sizeList: function(callback) {
				size = new Object;
				size = sizes.sizesArray();
				
				var sizeList = new Array();
				
				for (var index in size) {
					var obj = new Object;
					obj.name = size[index];
					obj.id = index;
					
					sizeList.push(obj);
				}
				
				callback (null, sizeList);
			},
			
			prevNext: function(callback) {
				var prevNext = new Object;
				
				if (id > 1) {
					prevNext.prev = parseInt(id)-1;
				} else {
					prevNext.prev = null;
				}
				
				db.Wine.max('id').success(function(max) {
					if (id < max) {
						prevNext.next = parseInt(id) + 1;
					} else {
						prevNext.next = null;
					}
					
					callback(null, prevNext);
				});
			},
			
			wineRef: function(callback) {
				db.Wine.find(id).success(function(wine) {			
					wine.getWinereference().success(function(wineReference) {
					
						wineRef = new Object;
						wineRef.wines = new Array();
						wineRef.producerName = "",
						wineRef.producerId = "";
						wineRef.id = "";

						if (wineReference) {
							
							wineRef.id = wineReference.id;
							
							wineReference.getProducer().success(function(producer){
								if (producer) {
									wineRef.producerName = producer.name;
									wineRef.producerId = producer.id;
								
									producer.getWinereferences().success(function(wines){
										if (wines) wineRef.wines = wines;
										callback(null, wineRef);
									});
									
								} else {
									console.error("Error : winereference without a producer defined, should not happen "+wineReference.name);
									callback("Error winereference without a producer defined, should not happen", null);
								}
							});
						} else {						
							db.Producer.find({where: {name: wine.producer}}).success(function(producer){
								if (producer) {
									wineRef.producerName = producer.name;
									wineRef.producerId = producer.id;
								
									producer.getWinereferences().success(function(wines){
										if (wines) wineRef.wines = wines;
										callback(null, wineRef);
									});
								} else {
									callback(null, wineRef);
								}
								
							});
						}
					});
				});
			}
		},
		
		function(err, results) {
			res.render('admin/wine', {wine: results.wine, websites: results.websites, colors: results.colors, sizeList: results.sizeList, prevNext:results.prevNext, wineRef: results.wineRef });	
		});		
	});	
	
	app.get('/admin/producers/', function (req, res) {
		res.redirect('/admin/producers/page/1');
	});
	
	app.get('/admin/ajax/producers/', function (req, res) {
		db.Producer.findAll().success(function(producers) {
			res.json(producers);
		});
	});
		
	app.get('/admin/producers/page/:page?', function (req, res) {

	    var offset = 0;
	    var limit = 10;
	    
	    var page = req.params.page || 1;
	    if (page) offset = (page-1)*limit;
	    
		db.Producer.findAndCountAll({offset: offset, limit: limit}).success(function(producers) {
		
			async.forEach(producers.rows, function(producer, callback) {
			
				if (producer.image) {
					//wine.photo = '/photos/'+item._source.photo;
					var photo = '/producer/'+producer.image;
					var fullURL = req.protocol + "://" + req.get('host') + photo;

					var base64photo = new Buffer(fullURL).toString('base64');
					producer.image = '/thumbs/small/images/'+base64photo+".jpg";
				} else {
					producer.image = '/images/no-image-pixel.png';
				}
				
				producer.getWinereferences().success(function(winesRef) {
					producer.winesRef = winesRef;
					
					async.forEach(producer.winesRef, function(wineRef, callback){
						wineRef.getWines().success(function (wines){
												
							if (wines) {
							    wineRef.wines = wines;
							    
							    async.forEach(wineRef.wines, function(wine, callback){
								    if (wine.photo) {
										var photo = '/photos/'+wine.photo;
										var fullURL = req.protocol + "://" + req.get('host') + photo;
					
										var base64photo = new Buffer(fullURL).toString('base64');
										wine['photo'] = '/thumbs/small/images/'+base64photo+".jpg";
									} else {
										wine['photo'] = '/images/no-image.png';
									}
									callback();
							    },
							    function(err) {
								    callback();
							    });   
							} else {
								callback();
							}
						});
					},
					function (err) {
						callback();			
					});					
				});	
			}, function(err) {
					var pagination = paginator.paginate('/admin/producers/', producers.count, limit, page);
					res.render('admin/producers', { producers : producers.rows, pagination : pagination });				
			});	
		});
	});
	
	app.get('/admin/producers/search/:name?', function (req, res) {
	    
		var name = req.params.name || "deutz";
				
		ejs.client = nc.NodeClient('localhost', '9200');
		
		var index 	= 'bubbles';
		var type 	= 'producer';
		var request 	= ejs.Request({indices: index, types: type});
		query  = ejs.MatchQuery('name', name.toString()).maxExpansions(10).operator('and');
		
		request.query(query).size(100).doSearch(function(results){
			if (!results.hits) {
				console.log('Error executing search');
				console.log(request.toString());
				res.redirect('/admin/');
			}
			
			hits = results.hits;
			producers = new Array();
			
			if (hits && hits.total > 0) {
				async.each(hits.hits, function(item, callback) {				
					var producerId = item._source.id;
					 
					db.Producer.find(producerId).success(function(producer){
						if (producer.image) {
							//wine.photo = '/photos/'+item._source.photo;
							var photo = '/producer/'+producer.image;
							var fullURL = req.protocol + "://" + req.get('host') + photo;
		
							var base64photo = new Buffer(fullURL).toString('base64');
							producer.image = '/thumbs/small/images/'+base64photo+".jpg";
						} else {
							producer.image = '/images/no-image-pixel.png';
						}
						
						producer.getWinereferences().success(function(winesRef) {
							producer.winesRef = winesRef;
							
							async.forEach(producer.winesRef, function(wineRef, callback){
								wineRef.getWines().success(function (wines){								
									if (wines) {
									    wineRef.wines = wines;
									    
									    async.forEach(wineRef.wines, function(wine, callback){
										    if (wine.photo) {
												var photo = '/photos/'+wine.photo;
												var fullURL = req.protocol + "://" + req.get('host') + photo;
							
												var base64photo = new Buffer(fullURL).toString('base64');
												wine['photo'] = '/thumbs/small/images/'+base64photo+".jpg";
											} else {
												wine['photo'] = '/images/no-image.png';
											}
											callback();
									    },
									    function(err) {
										    callback();
									    });   
									} else {
										callback();
									}
								});
							});
					});
				});	
				}, 
					function(err) {
						var pagination = "";
						res.render('admin/producers', { producers : producers, pagination : pagination });				
				});	
			} else {
				var pagination = "No results found.";
				var producers = Array();
				res.render('admin/producers', { producers : producers, pagination : pagination });				
			}
		});
	});
	
	app.get('/admin/ajax/removeWineReference/:id?', function(req, res) {
		
		var id = req.params.id;
		
		if (!id) {
			res.redirect('/admin/producers/page/1');
		} else {
			db.Winereference.find(id).success(function(wineRef){
				wineRef.destroy().success(function(){
					res.redirect('back');
				});
			});
		}
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
	
	app.post('/admin/ajax/updatewine/', function(req, res) {
		var	id = req.body.id,
			active = req.body.active,
			websiteId = req.body.websiteId,
			name = req.body.name,
			producer = req.body.producer,
			wineName = req.body.wine,
			size = req.body.size,
			options = req.body.options,
			color = req.body.color,
			price = req.body.price,
			minQuantity = req.body.minQuantity ,
			wineRefId = req.body.wineRefId;
			
		(active == 'on') ? active=true : active=false;
		
		
		db.Wine.find(id).success(function(wine){
			if (wine) {
				wine.active 	= active;
				wine.name 		= name;
				wine.producer 	= producer;
				wine.wine 		= wineName;
				wine.size 		= (size ? parseFloat(size) : null);
				wine.options 	= options;
				wine.color 		= color;
				wine.price 		= (price ? parseFloat(price) : null);
				wine.minQuantity = (minQuantity ? parseInt(minQuantity) : null);
				
				wine.save().success(function() {
					if (wineRefId) {
						db.Winereference.find(wineRefId).success(function(wineReference){
							wine.setWinereference(wineReference);
							wine.save().success(function() {
								ejs.client = nc.NodeClient('localhost', '9200');
								wine.getWebsite().success(function(website) {
									copy = JSON.parse(JSON.stringify(wine));
									copy.website = website.name;
									var doc = ejs.Document('bubbles', 'wine', copy.id).source(copy).upsert(copy).doUpdate(function(data) {
										res.redirect('back');
										}, function(error) {
											console.error("Error at index "+JSON.stringify(error));
										}
									);
								});
							})
						});
					} else {
						res.redirect('back');
					}
				})
				.error(function(error) {
					console.error("Wine update : "+error)
				});
				
			} else {
				res.redirect('back');
			}
		});			
	});
	
	app.post('/admin/ajax/createwineref/', function (req, res) {
		var producerId = req.param('producerId', null); 
		var wine = req.param('wine', null); 

		if (!producerId || !wine) {
			console.log('Missing producerId or wine');
			res.send('Missing producerId or wine');
			return false;
		}
		
		db.Winereference.create({ name: wine}).success(function(wineRef){
			db.Producer.find(producerId).success(function(producer){
				wineRef.setProducer(producer);
				wineRef.save().success(function(newWine){
					if (newWine) {
						res.send(200);
					}
				});
			});
		});
	});
	
	
	app.get('/admin/ajax/listwineref/', function (req, res) {
		var producerId = req.param('producerId', null); 

		if (!producerId) {
			console.log('Missing producerId');
			res.send('Missing producerId');
			res.redirect('back');

			return false;
		}
		
		db.Producer.find(producerId).success(function(producer){
			producer.getWinereferences().success(function(wines) {
				res.json(wines);
			});
		});
	});
	
	app.post('/admin/ajax/setactive/', function (req, res) {
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
		});
		
		db.Producer.findAll().success(function(producers) {
			producers.forEach(function(producer, index) {
				var doc = ejs.Document('bubbles', 'producer', producer.id).source(producer).upsert(producer).doUpdate(function(data) {
					}, function(error) {
						console.error("Error at index "+JSON.stringify(error));
					}
				);
	
   			});
		});
	});
};