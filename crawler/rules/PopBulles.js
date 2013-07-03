var PopBulles = function ( scrapinode ) {
	var path = /http:\/\/popbulles.com/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var name = $('div.logo-produit h1').text();
		
		if (!name) return false;

		if (!name.match(/champagne/i)) return false;
			
		return true;
	}

	
	var producerOperation = function(window){
	
		if (!window) return false;

		var $ = window.$;
			
		var producer = $('#product_addtocart_form div.product-shop div.logo-produit div p').text();
					
		return producer;
	
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $('span.regular-price span.price').text();
		
		return price;
	};
	
	var wineOperation = function(window){
	
		if (!window) return false;

		var $ = window.$;
			
		var producer = $('#product_addtocart_form div.product-shop div.logo-produit div p').text();
		var wine = 	$('div.product-name h2').text();		
		
		var regEx = new RegExp(producer, "ig");
		var replaceMask = "";
		wine = wine.replace(regEx, replaceMask);	
		
		regEx = new RegExp("magnum", "ig");	
		wine = wine.replace(regEx, replaceMask);	
		
		return wine;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var wine = 	$('div.product-name h2').text();		
						
		return wine;
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
		
		var wine = 	$('div.product-name h2').text();		
		
		if (wine.match(/magnum/i))		return (2);
		
		return (1);	
	}
	
	var photoOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var photo = $('p.product-image img').attr('src');
		
		if (photo) return photo;
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

module.exports = PopBulles;