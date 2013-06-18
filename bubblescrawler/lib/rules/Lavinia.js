var _  			= require('underscore');
_.str 			= require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

var Lavinia = function ( scrapinode ) {
	var path = /http:\/\/www.lavinia.fr/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var breadcrumb = $('nav.m-breadcrumb.mbb').text();
		if (!breadcrumb) return false;
		
		if (!breadcrumb.match(/champagne/i)) return false;
		
		return true;
	}
	
	var producerOperation = function(window){
	
		if (!window) return;

		var $ = window.$;
		var fullName = $('h1.m-header').contents(':not(span)').text();
		var partsName = _.words(fullName, ",");
	
		return partsName[0];
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $('label[itemprop="lowPrice"]').text();
		
		return price;
	};
	
	var wineOperation = function(window){
		
		if (!window) return;

		var $ = window.$;
		var fullName = $('h1.m-header').contents(':not(span)').text();
		var partsName = _.words(fullName, ",");
	
		var wine = partsName[1];
		
		var qty = $('h1.m-header span').text();
		
		/* FIXME : should be in quantity check 
		
		if (qty.match(/0,3/i)) 		wine = wine+" - Demi-bouteille";
		if (qty.match(/0,2/i)) 		wine = wine+" - Demi-bouteille";
		if (qty.match(/18,00/i))	wine = wine+" - Salomon";
		if (qty.match(/15,00/i))	wine = wine+" - Nabuchodosor";
		if (qty.match(/3,00/i))	wine = wine+" - JŽroboam";
		if (qty.match(/1,50/i))	wine = wine+" - Magnum";
		
		*/
		
		return wine;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var name = $('h1.m-header').text();
						
		return name;	
	}
	
	scrapinode.use (path,'isValid', isValidOperation);

	scrapinode.use (path,'producer', producerOperation);
	scrapinode.use (path,'price', priceOperation);
	scrapinode.use (path,'wine', wineOperation);
	scrapinode.use (path,'name', nameOperation);


};

module.exports = Lavinia;