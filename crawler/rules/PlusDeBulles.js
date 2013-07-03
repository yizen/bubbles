var PlusDeBulles = function ( scrapinode ) {
	var path = /http:\/\/www.plus-de-bulles.com/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var producer = $('#product_right_top h1').contents(':not(span)').text();
		if (!producer) return false;
		if (producer == "Screwpull") return false;
			
		return true;
	}
	
	var producerOperation = function(window){
		if (!window) return;
	
		var $ = window.$;
		var producer = $('#product_right_top h1').contents(':not(span)').text();
		return producer;
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $('#our_price_display').text();
	
		return price;
	};
	
	var wineOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var wine = $('#product_right_top h1 span').text();
		return wine;
	};
	
	var nameOperation = function(window) {
		return;
	}
	
	var optionsOperation = function(window) {
		return;
	}
	
	var minQuantityOperation = function(window) {
		return;
	}
	
	var sizeOperation = function(window) {
		return;
		
	}
	
	var optionsOperation = function(window) {
		return;
	}
	
	var minQuantityOperation = function(window) {
		return;
	}
	
	var sizeOperation = function(window) {
		return;
		
	}
	
	var photoOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var photo = $('#product_left #image-block img').attr('src');
		
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

module.exports = PlusDeBulles;