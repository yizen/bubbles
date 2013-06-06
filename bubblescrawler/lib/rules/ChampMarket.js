/* scrapinode callbacks */

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
	
	scrapinode.use (path,'isValid', isValidOperation);

	scrapinode.use (path,'producer', producerOperation);
	scrapinode.use (path,'price', priceOperation);
	scrapinode.use (path,'wine', wineOperation);
	scrapinode.use (path,'name', nameOperation);


};

module.exports = Champmarket;