/* scrapinode callbacks */

var Champagnepascher = function ( scrapinode ) {
	var path = /http:\/\/www.champagnepascher.fr/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var name = $('body#product div#primary_block h1').text();
		if (!name) return false;
					
		return true;
	}

	var producerOperation = function(window){
		return;
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $("span#our_price_display").text();
				
		return price;
	};
	
	var wineOperation = function(window){
		return;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var name = $('body#product div#primary_block h1').text();
						
		return name;
	}
		
	scrapinode.use (path,'isValid', isValidOperation);

	scrapinode.use (path,'producer', producerOperation);
	scrapinode.use (path,'price', priceOperation);
	scrapinode.use (path,'wine', wineOperation);
	scrapinode.use (path,'name', nameOperation);

};

module.exports = Champagnepascher;