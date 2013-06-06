/* scrapinode callbacks */

var Vinatis = function ( scrapinode ) {
	var path = /http:\/\/www.vinatis.com/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var name = $('body#product h1 i span.SousTitre').text();
		
		if (!name) return false;

		if (!name.match(/champagne/i)) return false;
			
		return true;
	}

	
	var producerOperation = function(window){
	    
		return;
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $('form#buy_block span.price:first').text();
		
		return price;
	};
	
	var wineOperation = function(window){
		
		return;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var name = $('div#primary_block h1').contents(':not(i)').text();
						
		return name;
	}
		
	scrapinode.use (path,'isValid', isValidOperation);

	scrapinode.use (path,'producer', producerOperation);
	scrapinode.use (path,'price', priceOperation);
	scrapinode.use (path,'wine', wineOperation);
	scrapinode.use (path,'name', nameOperation);

};

module.exports = Vinatis;