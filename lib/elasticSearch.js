var elasticSearch = (function () {
	
	var ejs 	= require('elastic.js'),
    nc 			= require('elastic.js/elastic-node-client');
	
	var _reindexWines = function(callback) {
		callback = callback || function() {};
	
		ejs.client = nc.NodeClient('localhost', '9200');
		
		db.Wine.findAll().success(function(wines) {
			async.each(wines,
				function(wine, callback) {
					wine.getWebsite().success(function(website) {
						copy = JSON.parse(JSON.stringify(wine));
						copy.website = website.name;
						var doc = ejs.Document('bubbles', 'wine', copy.id).source(copy).upsert(copy).doUpdate(function(data) {
								callback();
							}, 
							function(error) {
								callback("Error at index Wine"+JSON.stringify(error));
							}
						);
					});
				},
				function (err) {
					if (err) console.error(err);
					callback();
			});
		});
	}
	
	var _reindexProducers = function(callback) {
		callback = callback || function() {};

		ejs.client = nc.NodeClient('localhost', '9200');
	
		db.Producer.findAll().success(function(producers) {
			async.eachSeries(
				producers,
				function(producer, callback) {
					var doc = ejs.Document('bubbles', 'producer', producer.id).source(producer).upsert(producer).doUpdate(function(data) {
							callback();
						}, function(error) {
							callback("Error at index Producer "+JSON.stringify(error));
						}
					);
	   			},
	   			function(err) {
	   				if (err) console.error(err);
	   				callback();
	   			});
		});
	}
	
	var _reindexReferenceWines = function(callback) {
		callback = callback || function() {};

		ejs.client = nc.NodeClient('localhost', '9200');
	
		async.waterfall([
			function (callback) {
				//FIXME : we should clear the INDEX/TYPE before.
				callback();
			},
			function (callback) {
				db.Winereference.findAll().success(function(winesRefs) {
					//Store all wine reference in new Array.		
					var elasticWines = new Array();
				
					//Loop through all wine ref to build basic table
					//eachSeries prevent messing with an apparent non thread safe library ?
					async.eachSeries(winesRefs, 	
						function(wineRef, callbackWinesRef) {
							//Get producer
							wineRef.getProducer().success(function(producer) {
								newWineRef = new Object();
								elasticWines.push(newWineRef);

								newWineRef.id = wineRef.id;
								newWineRef.name = wineRef.name;
								newWineRef.producer = producer.name;
								newWineRef.sizes = new Object();
							
								//Get all wines
								wineRef.getWines().success(function(wines) {
								
									async.eachSeries(wines, 
										function(wine, callbackWines) {
										
											newWineRef.color = wine.color;
										
											newWine = new Object;
											newWine.id = wine.id;
											newWine.size = wine.size;
											newWine.url = wine.url;
											newWine.price = wine.price;
											newWine.active = wine.active;
											newWine.options = wine.options;
											newWine.photo = wine.photo;
											
											wine.getWebsite().success(function(website) {
												newWine.websiteId = website.id;
												newWine.website = website.name;
												
												if (newWineRef.sizes[wine.size] === undefined) {
													newWineRef.sizes[wine.size] = new Object();
													newWineRef.sizes[wine.size].wines = new Array();	
													newWineRef.sizes[wine.size].bestPrice = null;
													newWineRef.sizes[wine.size].bestWineId = null;
												}
											
												(newWineRef.sizes[wine.size].wines).push(newWine);
												
												callbackWines();
											});
											
														
										},
										function(err) {
											callbackWinesRef()
										}
									);
								});
							});
						},
						function(err) {
							callback( null, elasticWines );
						}
					);
				});
			},
			
			function(elasticWines, callback) {
				//Find the best price
				//Using eachSeries for the low price to pay for better debug !
				
				async.eachSeries(elasticWines,
					function(wineRef, callbackElasticWines) {
						
						for(var size in wineRef.sizes) {
							async.eachSeries(wineRef.sizes[size].wines, 
								function(wine, callbackWine){
									if (wine.active) {
										if (!wineRef.sizes[size].bestWineId) {
											wineRef.sizes[size].bestWineId = wine.id;
											wineRef.sizes[size].bestWinePrice = wine.price;
											wineRef.sizes[size].bestWineWebsiteName = wine.website;
											wineRef.sizes[size].bestWineWebsiteId = wine.websiteId;
										} else
										if (wine.price < wineRef.sizes[size].bestWinePrice) {
											wineRef.sizes[size].bestWineId = wine.id;
											wineRef.sizes[size].bestWinePrice = wine.price;
											wineRef.sizes[size].bestWineWebsiteName = wine.website;
											wineRef.sizes[size].bestWineWebsiteId = wine.websiteId;

										}	
									}
									
									callbackWine(); 
								}
							)
						}
						callbackElasticWines();
					},
					function(err){
						callback(null, elasticWines);
					}
				);	
			},
			
			function(elasticWines, callback) {
				//Insert into ElasticSearch
				
				async.eachSeries(elasticWines,
					function(wineRef, callbackElasticWines) {
						for(var size in wineRef.sizes) {
							var insertedData = new Object();
							
							insertedData.id = wineRef.id;
							insertedData.name = wineRef.name;
							insertedData.producer = wineRef.producer;
							insertedData.size = size;
							insertedData.bestWineId = wineRef.sizes[size].bestWineId;
							insertedData.bestWinePrice = wineRef.sizes[size].bestWinePrice;
							insertedData.bestWineWebsiteName = wineRef.sizes[size].bestWineWebsiteName;
							insertedData.bestWineWebsiteId = wineRef.sizes[size].bestWineWebsiteId;
							insertedData.color = wineRef.color;
							insertedData.wines = wineRef.sizes[size].wines;
							
							var doc = ejs.Document('bubbles', 'winereference', (wineRef.id+size)).source(insertedData).upsert(insertedData).doUpdate(function(data) {
								if (data.error) console.log("Upsert error "+wineRef.id+" data:"+JSON.stringify(data));
							}, function(error) {
								console.error("Error at index Winereference"+JSON.stringify(error));
							});

						}
						callbackElasticWines();
					},
					function(err){
						callback(null, elasticWines);
					}
				);	
			}	
		],
		function (err) {
			callback();
		});
	}
	
	return {
		reindexWines: function(callback) {
			_reindexWines(callback);
		},
		reindexProducers: function (callback) {
			_reindexProducers(callback);
		},
		reindexReferenceWines: function(callback) {
			_reindexReferenceWines(callback);
		}
	}	
})();

module.exports = elasticSearch;