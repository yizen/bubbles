var bubblescrawler = (function () {
	var crawler 	= require("simplecrawler");
	var scrapinode 	= require("scrapinode");
	var request 	= require('request');
	var db      	= require('../models');
	var _  			= require('underscore');
	_.str 			= require('underscore.string');
	_.mixin(_.str.exports());
	_.str.include('Underscore.string', 'string');
	
	var http 		= require('http-get');
	var crypto = require('crypto');
	var fs = require('fs'); 
		
    /* Specific sites rules */
	var PlusDeBulles = require("./rules/PlusDeBulles")(scrapinode);
	var Champmarket = require("./rules/Champmarket")(scrapinode);
	var Cavespirituelle = require("./rules/Cavespirituelle")(scrapinode);
	var Debullesenbulles = require("./rules/Debullesenbulles")(scrapinode);
	var Lerepairedebacchus = require("./rules/Lerepairedebacchus")(scrapinode);
	var Vinatis = require("./rules/Vinatis")(scrapinode);
	var Cavagogo = require("./rules/Cavagogo")(scrapinode);
	var Champagneendirect = require("./rules/Champagneendirect")(scrapinode);
	var Nicolas = require("./rules/Nicolas")(scrapinode);
	var Champagnepascher = require("./rules/Champagnepascher")(scrapinode);
	var Lavinia = require("./rules/Lavinia")(scrapinode);
	var PopBulles = require("./rules/PopBulles")(scrapinode);
	
	var _log = function( job, message, level, url, website ) {
	
		var newlog = db.Log.create ({
					message:message,
					level:level,
					url:url
		}).success( function( justCreated) {
			justCreated.setJob(job);
			justCreated.save();
		});     

		console.log(message, url);
	}
	
    /*
     * Sync : synchronise databases and datamodel.
     *
     */
    var _sync  = function () { 
    	db.sequelize.sync().complete(function(err) {
			if (err) {
				throw err
			}    
		});
	};

	/*
	 * Explore : check a single URL
	 *
	 */
	var _explore = function (website, url, job) {
		//Test if url exists
		request(url, function (error, response, body) {
			if (error || response.statusCode == 404) {
				db.Wine.find({ where: {url: url} }).success(function(wineFound) {
					wineFound.active = false;
					wineFound.save();
					_log(job, 'Wine not found', 'WARN', url, website);					
				});
			} else {
				db.Wine.find({ where: {url: url} }).success(function(wineFound) {
					if (wineFound) {
						wineFound.active = true;
						wineFound.save();
					}
				});
			}
		});		
		
		var scrapinodeOption = {
	       	url : url
	    };
		    
	    scrapinode.createScraper(scrapinodeOption, function(err, scraper) {
		
		    if (err) { 	
		    	_log(job, 'Scrapinode error '+err, 'ERROR', url, website);					
	    		return new Error("Scrapinode Error :"+ err);
			};
	
		    var isValid = scraper.get('isValid');
		    		    
		    if (isValid) {
			    var producer 	= sanitize(scraper.get('producer'));
			    var wine 		= sanitize(scraper.get('wine'));	
			    var price 		= sanitize(scraper.get('price'));
			    var name 		= sanitize(scraper.get('name'));
			    var options 	= sanitize(scraper.get('options'));
			    var size 		= sanitize(scraper.get('size'));
			    var minQuantity = sanitize(scraper.get('minQuantity'));
			    var photo		= sanitize(scraper.get('photo'));
			    
				//Change string to float for values.
			    if (price)		{price = stringToFloat(price)}
			    if (minQuantity){minQuantity = stringToFloat(minQuantity)}
			    
			    if (!name) {name = _.join(" ", producer, wine)}
			    if (name == "") {
		    		_log(job, 'Name empty', 'ERROR', url, website);					
					return new Error("Name empty on :"+ url);
			    }
			    
			    if (!options) options = extractOptionsFromName(name);
			    if (!size) size= extractSizeFromName(name);
			    
			    color = extractColorFromName(name);			    
			    name = removeExtrasfromName(name);
			    			    				    	
		    	db.Wine.find({ where: {url: url} }).success(function(wineFound) {
			    	if (wineFound) {
			    	
			    		//_log(job, 'Wine found '+name, 'INFO', url, website);					
			    	
				    	if (wineFound.price != price) {
				    					    
				    		_log(job, 'Price change on '+name+ ' new price is '+price, 'INFO', url, website);					
				    		
					    	var oldPrice = wineFound.price;
					    	var oldDate = wineFound.updatedAt;
					    	
					    	wineFound.price = price;
					    	wineFound.lastPriceModified = new Date();
					    	wineFound.save();
					    	
					    	var newPrice = db.Price.create({
						    	price:oldPrice,
						    	date:oldDate
					    	}).success( function (justCreated) {
						    	justCreated.setWine(wineFound);
						    	justCreated.save();
					    	});
				    	}
				    	
				    	if (!wineFound.size) {
					    	wineFound.size = size;
					    	wineFound.save();
				    	}
				    	
				    	if (!wineFound.options) {
					    	wineFound.options = options;
					    	wineFound.save();
				    	}
				    	
				    	if (wineFound.minQuantity == null) {
					    	wineFound.minQuantity = minQuantity;
					    	wineFound.save();
				    	}
				    	
				    	if (!wineFound.photo && photo) {
							_log(job, 'New Photo '+photo+' for '+name, 'INFO', url, website);					
							
							//Get file extension
							var photoBits = new Array;
							photoBits = photo.split("\\");
							var photoName = photoBits[photoBits.length-1];
							var photoExt = photoName.substring(photoName.lastIndexOf(".")+1);
							photoExt = photoExt.split("?")[0];

							var filename = 'photo_'+crypto.randomBytes(4).readUInt32LE(0)+'.'+photoExt;
					    	
					    	http.get(photo, global.photodir+'/'+filename, function (error, result) {
								if (error) {
									_log(job, error+' on '+photo+' for '+name, 'ERROR', url, website);					
								} else {
									wineFound.photo = filename;
									wineFound.save();
									_log(job, 'Photo downloaded to '+result.file+' for '+name, 'INFO', url, website);					
								}
							});
				    	}
				    						    					    	
			    	} else {
			    	    db.Wine.find({where: {name:name, WebsiteId:website.id}}).success(function(duplicate) {
				    	   if (duplicate) { 
				    			_log(job, 'Duplicate on '+name, 'INFO', url, website);					
				    	   } 
				    	   else {
				    	   	 	_log(job, 'New wine '+name, 'INFO', url, website);					

					    	 var newWine = db.Wine.create ({
					    		name:name,
								wine:wine,
								producer:producer,
								url:url,
								price:price,
								minQuantity: minQuantity,
								size: size,
								color: color,
								options : options,
								active: true
							}).success( function( justCreated) {
								justCreated.setWebsite(website);
								justCreated.save();
								
								//photo
								if (photo) {
									_log(job, 'New Photo '+photo+' for '+name, 'INFO', url, website);					
									
									//Get file extension
									var photoBits = new Array;
									photoBits = photo.split("\\");
									var photoName = photoBits[photoBits.length-1];
									var photoExt = photoName.substring(photoName.lastIndexOf(".")+1);							
									photoExt = photoExt.split("?")[0];
									
									var filename = 'photo_'+crypto.randomBytes(4).readUInt32LE(0)+'.'+photoExt;
							    	
							    	http.get(photo, global.photodir+'/'+filename, function (error, result) {
										if (error) {
											_log(job, error+' on '+photo+' for '+name, 'ERROR', url, website);					
										} else {
											justCreated.photo = filename;
											justCreated.save();
											_log(job, 'Photo downloaded to '+result.file+' for '+name, 'INFO', url, website);					
										}
									});
								}
								
							});     
				    	   }//end else 
			    	    }); //end find
			    	} //end else
		    	}); // end find
		  }; //end is valid  
		}); //end create scrapinos
		 		
	};
	
	/*
     * crawlAll : run crawl for every active website.
     *
     */
	var _crawlAll = function () {
		db.Website.findAll({ where: {active: true} }).success(function(websites) {
			var length = websites.length,
		    element = null;
			for (var i = 0; i < length; i++) {
				element = websites[i];
				crawl(element);
			}
		});
	};
	
	/*
     * Crawl : search for a new website
     *
     * Param : website : a model/Website object
     */
	var _crawl = function (website, job) {
		website.lastCrawlStart = new Date();
		website.save();
	
		var mainCrawler = crawler.crawl(website.url);
		
		mainCrawler.timeout = 5000;
		mainCrawler.interval = 3600;
		
		mainCrawler.downloadUnsupported = false;
		mainCrawler.acceptCookies = true;
		mainCrawler.maxConcurrency = 1;
		mainCrawler.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36";
		
		var conditionID = mainCrawler.addFetchCondition(function(parsedURL) {
		    return !(
		    parsedURL.path.match(/\.css/i) || 
		    parsedURL.path.match(/\.pdf/i) ||
		    parsedURL.path.match(/\.ico/i) ||
		    parsedURL.path.match(/\.swf/i) ||
		    		    
		    
		    parsedURL.path.match(/\.js/i) ||
		    parsedURL.path.match(/\/\.js\.php/i) ||
		    parsedURL.path.match(/\.js\//i) ||
	
		    
		    parsedURL.path.match(/\.xml/i) ||
		    parsedURL.path.match(/\.rss/i) ||
		
		    parsedURL.path.match(/\.jpg/i) ||
		    parsedURL.path.match(/\.png/i) ||
		    parsedURL.path.match(/\.gif/i) ||
		    parsedURL.path.match(/jquery/i) ||
		    parsedURL.path.match(/blank/i) ||
		    
		    parsedURL.path.match(/\/panier/i) ||
		    parsedURL.path.match(/\/checkout/i) ||
		    parsedURL.path.match(/\/account/i) ||
		    parsedURL.path.match(/\/blog/i) ||
		    parsedURL.path.match(/\/modules/i) ||
		    parsedURL.path.match(/\/configurateur/i) ||
		    parsedURL.path.match(/\/livraison/i) ||
		    parsedURL.path.match(/\/modes-de-paiement/i) ||
		    parsedURL.path.match(/\/magazine/i) ||
		    parsedURL.path.match(/\/a_propos/i) ||
		    parsedURL.path.match(/\/cgv/i) ||
		   	parsedURL.path.match(/\/commande/i) ||
		   	parsedURL.path.match(/\/epuise/i) ||
		   	parsedURL.path.match(/\/livraison/i) ||
		   	parsedURL.path.match(/\/newsletter/i) ||	   	
		    parsedURL.path.match(/\/contact/i) ||
		    parsedURL.path.match(/\/presse/i) ||
		    parsedURL.path.match(/\/authentification/i) ||
		    parsedURL.path.match(/\/glossaire/i) ||
			parsedURL.path.match(/\/product_compare/i) ||
			parsedURL.path.match(/\/recrutement/i) ||
			parsedURL.path.match(/\/catalogsearch/i) ||
			parsedURL.path.match(/\/search/i) ||
			parsedURL.path.match(/\/vins-etiquettes-abimees/i) ||
	    
		    parsedURL.path.match(/\/back=/i) ||
		    parsedURL.path.match(/add&amp/i) ||
		    parsedURL.path.match(/cart.php/i) ||
		    
			parsedURL.path.match(/millesime_filtre=/i) ||
		    parsedURL.path.match(/nez=/i) ||
		    parsedURL.path.match(/mode_culture=/i) ||
		    parsedURL.path.match(/cepage_filtre=/i) ||
		    parsedURL.path.match(/couleur=/i) ||
		    parsedURL.path.match(/goutstyle=/i) ||
		    parsedURL.path.match(/occasion=/i) ||
		    
		    parsedURL.path.match(/\/amp%3Bamp%3Bamp/i) ||
	
		    parsedURL.path.match(/\/rosedeal/i) ||
		    
		    parsedURL.path.match(/\/feeds/i) ||
	
		    parsedURL.path.match(/spiritueux/i) ||
		    parsedURL.path.match(/alsace/i) ||
		    parsedURL.path.match(/bourgogne/i) ||
		    parsedURL.path.match(/rhone/i) ||
			parsedURL.path.match(/languedoc/i) ||
			parsedURL.path.match(/bordeaux/i) ||
			parsedURL.path.match(/bordelais/i) ||
			parsedURL.path.match(/beaujolais/i) ||
			parsedURL.path.match(/roussillon/i) ||
			parsedURL.path.match(/savoie/i) ||
			parsedURL.path.match(/provence/i) ||
			parsedURL.path.match(/sud-ouest/i) ||
			parsedURL.path.match(/corse/i) ||
			
			parsedURL.path.match(/\/vins-du-monde/i) ||
			parsedURL.path.match(/\/vins-de-loire/i) ||
			parsedURL.path.match(/\/autres-regions-de-france/i) ||
						
		    parsedURL.path.match(/\/en\//i)); 
		}, function(err){console.error("addFetchCondition", err);});
		
		mainCrawler.on("fetchstart",function(queueItem){
		    console.info("Started fetching resource:".green, queueItem.url);
		});
		
		mainCrawler.on("fetchcomplete",function(queueItem){
		  	_explore(website, queueItem.url, job);
		});
		
		mainCrawler.on("fetchheaders",function(queueItem){
		    //console.log("Headers fetching resource:", queueItem.url);
		});
		
		mainCrawler.on("fetchclienterror",function(queueItemi, errorData){
			_log(job, "Client Error fetching resource on "+queueItemi.url+" error :"+ errorData, 'ERROR', queueItemi.url, website);	
		});
		
		mainCrawler.on("fetchdataterror",function(queueItemi, errorData){
			_log(job, "Data Error fetching resource on "+queueItemi.url+" error :"+ errorData, 'ERROR', queueItemi.url, website);	
		});
	
		mainCrawler.on("fetchdataerror",function(queueItem){
			_log(job, "Fetchdataerror Error fetching resource on "+queueItem.url+" error :"+ errorData, 'ERROR', queueItem.url, website);	
		});
		
		mainCrawler.on("complete", function(){
			_log(job, "Scanning complete for "+mainCrawler.initialPath, 'INFO', mainCrawler.initialPath, website);			
			website.lastCrawlEnd = new Date();
			website.save();
			return;
		});
		
		mainCrawler.start();
	}
	
	var sanitize = function(value) {
		if (!value) return;

		value = _.trim(value);
		value = _.clean(value);
		
		return value;
	}
	
	var stringToFloat = function(value) {
		value = value.replace(" ",""); 
		value = value.replace(",","."); 
				
		numValue = parseFloat(value);
			
		if (numValue > 0) {
			return numValue;}
		else {
			return null;
		}
	}
	
	var extractSizeFromName = function(name) {
		if (name.match(/demi-bouteille/i)) return 0.5;
		if (name.match(/demi bouteille/i)) return 0.5;
		if (name.match(/1\/2 b/i)) return 0.5;

		if (name.match(/magnum/i)) return 2;

		if (name.match(/jéroboam/i)) return 4;
		if (name.match(/jeroboam/i)) return 4;
		
		if (name.match(/mathusalem/i)) return 8;
		
		if (name.match(/salmanazar/i)) return 12;
		
		if (name.match(/balthazar/i)) return 16;
		
		if (name.match(/nabuchodosor/i)) return 20;
		
		if (name.match(/salomon/i)) return 24;
		
		if (name.match(/primat/i)) return 36;
		
		if (name.match(/melchisédech/i)) return 40;
		if (name.match(/melchisedech/i)) return 40;

		else return 1;
	}
	
	var extractColorFromName = function(name) {
		if (name.match(/rosé/i)) return "Rosé";
		if (name.match(/rose/i)) return "Rosé";
		if (name.match(/pink/i)) return "Rosé";

		else return "White";
	}
	
	var extractOptionsFromName = function (name) {
		var options = ['étui', 'etui', 'coffret', 'carafe', 'flute', 'flûte' ];
		
		
	}
	
	var removeExtrasfromName = function (value) {
		value = removeString( value, 'champagne', 
			[	'Les Demoiselles de Champagne', 
				'Ratafia de Champagne', 
				'Comtes de Champagne', 
				'Fleur de Champagne', 
				'Femme de Champagne', 
				'Fine de Champagne'] );
				
		value = removeString( value, '75 cl');
		
		//Remove text in brackets.
		value.replace(/ *\([^)]*\) */g, '');
		
		return value;
	}
	
	var removeString = function(value, searchMask, exceptions) {
		
		var doNotProcess = false;
		
		if (typeof(exceptions) != "undefined") {
			if (exceptions.isArray) {
				exceptions.forEach(function(exception) {
					var regEx = new RegExp(exception, "ig");
					if (value.match(regEx)) doNotProcess = true;		
	   			}); 			
   			}
		}
		
		if (doNotProcess) return;
	
		var regEx = new RegExp(searchMask, "ig");
		var replaceMask = "";
		return value.replace(regEx, replaceMask);
	}
	
	return {
		explore: function( website, url, job) {
			_explore( website, url, job );
		},
		crawl: function (website, job) {
			_crawl(website, job);
		}
	}
})();

module.exports = bubblescrawler;