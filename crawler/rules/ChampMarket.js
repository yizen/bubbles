var Champmarket = function ( scrapinode ) {
	var path = /http:\/\/www.champmarket.com/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var producer = $('.droiteFiche h1').text();
		if (!producer) return false;
			
		return true;
	}
	
	var producerOperation = function(window){
	
		if (!window) return;

		var $ = window.$;
		var producer = $('.droiteFiche h1').text();
	
		return producer;
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $('input[id=pdt_price]').val();
		
		return price;
	};
	
	var wineOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var wine = $('.ficheProduit .droiteFiche h2:first').text();
						
		return wine;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var wine = $('.ficheProduit .droiteFiche h2:first').text();
						
		return wine;	
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
		var photo = $('div.ficheProduit div.gaucheFiche img').attr('src');
		
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

module.exports = Champmarket;