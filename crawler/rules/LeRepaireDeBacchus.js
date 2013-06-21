/* scrapinode callbacks */

var Lerepairedebacchus = function ( scrapinode ) {
	var path = /http:\/\/www.lerepairedebacchus.com/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var name = $('div#aoc_fiche_prod').text();
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
		var price = $("div.price-box span.price[id*='product-price']").text();
		
		if (!price) {
			var price = $("div.price-box span.price").text();
		}
		
		return price;
	};
	
	var wineOperation = function(window){
		return;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var name = $('div.product-name h1').text();
						
		return name;
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

module.exports = Lerepairedebacchus;