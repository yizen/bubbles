/* scrapinode callbacks */

var Cavespirituelle = function ( scrapinode ) {
	var path = /http:\/\/www.cave-spirituelle.com/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var producer = $('.product-name-attributes h1.product-domaine a span').text();
		if (!producer.match(/champagne/i)) return false;
		
		return true;
	}
	
	var producerOperation = function(window){
	
		if (!window) return;

		var $ = window.$;
		var producer = $('.product-name-attributes h1.product-domaine a span').text();
		
		if (!producer.match(/champagne/i)) return;
		
		return producer;
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $('.product-cart .prix').text();
		
		return price;
	};
	
	var wineOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var wine = $('.product-name-attributes p.product-cuvee-millesime').text();
						
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
	
	scrapinode.use (path,'isValid', isValidOperation);	

	scrapinode.use (path,'producer', producerOperation);
	scrapinode.use (path,'price', priceOperation);
	scrapinode.use (path,'wine', wineOperation);
	scrapinode.use (path,'name', nameOperation);
	scrapinode.use (path,'options', optionsOperation);
	scrapinode.use (path,'minQuantity', minQuantityOperation);
	scrapinode.use (path,'size', sizeOperation);

};

module.exports = Cavespirituelle;