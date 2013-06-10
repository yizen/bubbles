/* scrapinode callbacks */

var Champagneendirect = function ( scrapinode ) {
	var path = /http:\/\/www.champagneendirect.fr/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var price = $('body#product span.price.unit').text();
		if (!price) return false;
			
		return true;
	}

	
	var producerOperation = function(window){
		return;
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $("span.price.unit").text();
		
		return price;
	};
	
	var wineOperation = function(window){
		return;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var name = $('div#pb-left-column h2').text();
		console.log(name);
		return name;
	}
		
	scrapinode.use (path,'isValid', isValidOperation);

	scrapinode.use (path,'producer', producerOperation);
	scrapinode.use (path,'price', priceOperation);
	scrapinode.use (path,'wine', wineOperation);
	scrapinode.use (path,'name', nameOperation);

};

module.exports = Champagneendirect;