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
		var price = $("form[data-section='product'] label[itemprop='lowPrice']").text();
		return price;
	};
	
	var wineOperation = function(window){
		
		if (!window) return;

		var $ = window.$;
		var fullName = $('h1.m-header').contents(':not(span)').text();
		var partsName = _.words(fullName, ",");
	
		var wine = partsName[1];
		
		return wine;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var name = $('h1.m-header').text();
						
		return name;	
	}
	
	var optionsOperation = function(window) {
		return;
	}
	
	var minQuantityOperation = function(window) {
		return;
	}
	
	var sizeOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		
		var qty = $('h1.m-header span').text();
		
		if (qty.match(/0,3/i)) 		return (0.5);
		if (qty.match(/0,2/i)) 		return (0.5);
		if (qty.match(/18,00/i))	return (24);
		if (qty.match(/15,00/i))	return (20);
		if (qty.match(/3,00/i))	 	return (4);
		if (qty.match(/1,50/i))		return (2);
		
		return (1);	
	}
	
	var photoOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var photo = $("div.content_product img[itemprop='image']").attr('src');
		
		if (photo) return ('http://www.lavinia.fr'+photo);
		return;
	}
	
	scrapinode.use (path,'isValid', isValidOperation);	

	scrapinode.use (path,'producer', producerOperation);
	scrapinode.use (path,'price', priceOperation);
	scrapinode.use (path,'wine', wineOperation);
	scrapinode.use (path,'name', nameOperation);
	scrapinode.use (path,'options', optionsOperation);
	scrapinode.use (path,'minQuantity', minQuantityOperation);
	scrapinode.use (path,'size', sizeOperation);
	scrapinode.use (path,'photo', photoOperation);
};

module.exports = Lavinia;