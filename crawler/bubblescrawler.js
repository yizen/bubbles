var bubblescrawler = (function () {
	var crawler 	= require("simplecrawler");
	var scrapinode 	= require("scrapinode");
	var request 	= require('request');
	var db      	= require('../models');
	var _  			= require('underscore');
	_.str 			= require('underscore.string');
	_.mixin(_.str.exports());
	_.str.include('Underscore.string', 'string');
		
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
	var _explore = function (website, url, socket, callback) {
		//Test if url exists
		request(url, function (error, response, body) {
			if (error || response.statusCode == 404) {
				db.Wine.find({ where: {url: url} }).success(function(wineFound) {
					wineFound.active = false;
					wineFound.save();
				});
			} else {
				db.Wine.find({ where: {url: url} }).success(function(wineFound) {
					wineFound.active = true;
					wineFound.save();
				});
			}
		});		
		
		var scrapinodeOption = {
	       	url : url
	    };
		    
	    scrapinode.createScraper(scrapinodeOption, function(err, scraper) {
		
		    if (err) { 	
	    		if (socket) socket.emit('message', { message: 'Error '+ err+ " on :"+ url });
	    		console.error("Scrapinode Error :"+ err+ " on :"+ url);
	    		return;
			};
	
		    var isValid = scraper.get('isValid');
		    		    
		    if (isValid) {
		    var producer = scraper.get('producer');
		    var wine = scraper.get('wine');	
		    var price = scraper.get('price');
		    var name = scraper.get('name');
		    var options = scraper.get('options');
		    var size = scraper.get('size');
		    var minQuantity = scraper.get('minQuantity');
		    
		    if (producer) 	{producer = sanitize(producer)}
		    if (wine) 		{wine =sanitize(wine)}		    
		    if (name) 		{name =sanitize(name)}
		    if (price)		{price = stringToFloat(price)}
		    if (minQuantity){minQuantity = stringToFloat(minQuantity)}
		    
		    if (!name) {name = _.join(" ", producer, wine)}
		    
		    if (name == "") callback();
		    			    				    	
	    	db.Wine.find({ where: {url: url} }).success(function(wineFound) {
		    	if (wineFound) {
		    		if (socket) socket.emit('message', { message: "WINE EXIST : "+name+" @ "+price });
		    		console.warn("WINE EXIST : "+name+" @ "+price);
		    	
			    	if (wineFound.price != price) {
			    		if (socket) socket.emit('message', { message: "PRICE ALERT :"+name+", now @ :"+ price+ ", was :"+ wineFound.price+ " URL : "+ wineFound.url });
			    		console.warn("PRICE ALERT :"+name+", now @ :"+ price+ ", was :"+ wineFound.price+ " URL : "+ wineFound.url);
			    		
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
			    						    					    	
		    	} else {
		    	    db.Wine.find({where: {name:name, WebsiteId:website.id}}).success(function(duplicate) {
			    	   if (duplicate) { 
			    	   		if (socket) socket.emit('message', { message: "DUPLICATE :" + name });
					   		console.warn("DUPLICATE :" + name);
			    	   } 
			    	   else {
			    	   	 if (socket) socket.emit('message', { message: "NEW WINE " + name + " @ " + price + " " + url });
						 console.info("NEW WINE " + name + " @ " + price + " " + url);
				    	 var newWine = db.Wine.create ({
				    		name:name,
							wine:wine,
							producer:producer,
							url:url,
							price:price,
							minQuantity: minQuantity,
							size: size,
							options : options
						}).success( function( justCreated) {
							justCreated.setWebsite(webSite);
							justCreated.save();
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
	var _crawl = function (webSite) {
		webSite.lastCrawlStart = new Date();
		webSite.save();
	
		var mainCrawler = crawler.crawl(webSite.url);
		
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
		    //console.info("Started fetching resource:".green, queueItem.url);
		});
		
		mainCrawler.on("fetchcomplete",function(queueItem){
		  	explore(website, queueItem.url);
		});
		
		mainCrawler.on("fetchheaders",function(queueItem){
		    //console.log("Headers fetching resource:", queueItem.url);
		});
		
		mainCrawler.on("fetchclienterror",function(queueItemi, errorData){
		    console.error("Client Error fetching resource on "+queueItemi.url+" error :"+ errorData);
		});
		
		mainCrawler.on("fetchdataterror",function(queueItemi, errorData){
		    console.error("Data Error fetching resource on "+queueItemi.url+" error :"+ errorData);
		});
	
		mainCrawler.on("fetchdataerror",function(queueItem){
		    console.error("Error: fetching resource on "+ queueItem.url);
		});
		
		mainCrawler.on("complete", function(){
			console.info("Scanning complete for "+ mainCrawler.initialPath);
			webSite.lastCrawlEnd = new Date();
			webSite.save();
		});
		
		mainCrawler.start();
	}
	
	var sanitize = function(value) {

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
		if (name.match(/magnum/i)) return "Magnum";
		if (name.match(/demi-bouteille/i)) return "Demi-bouteille";
		if (name.match(/demi bouteille/i)) return "Demi-bouteille";

		if (name.match(/1\/2 b/i)) return "Demi-bouteille";

		if (name.match(/jéroboam/i)) return "Jeroboam";
		if (name.match(/jeroboam/i)) return "Jeroboam";
		if (name.match(/mathusalem/i)) return "Mathusalem";
		if (name.match(/salmanazar/i)) return "Salmanazar";
		if (name.match(/salomon/i)) return "Salomon";
		if (name.match(/balthazar/i)) return "Balthazar";
		if (name.match(/nabuchodosor/i)) return "Nabuchodosor";
		if (name.match(/primat/i)) return "Primat";
		if (name.match(/melchisédech/i)) return "Melchisédech";
		if (name.match(/melchisedech/i)) return "Melchisédech";

		else return null;
	}
	
	var extractOptionsFromName = function (name) {
		var options = ['étui', 'etui', 'coffret', 'carafe', 'flute', 'flûte', ]
	}
	
	var removeExtrasfromName = function (name) {
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
		
		//Remove text after "plus"
	}
	
	var removeString = function(value, searchMask, exceptions) {
		
		var doNotProcess = false;
	
		if (isArray(exceptions)) {
			exceptions.forEach(function(exception) {
				var regEx = new RegExp(exception, "ig");
				if (value.match(regEx)) doNotProcess = true;		
   			}); 			
		}
		
		if (doNotProcess) return;
	
		var regEx = new RegExp(searchMask, "ig");
		var replaceMask = "";
		return value.replace(regEx, replaceMask);
	}
	
	return {
		explore: function(website, url, socket, callback) {
			_explore(website, url, socket, callback );
		}
	}
})();

module.exports = bubblescrawler;