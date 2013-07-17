var Auchan = function ( scrapinode ) {
	var path = /http:\/\/www.auchan.fr/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var category = $('p.descCom').text();
		
		if (!category) return false;

		if (!category.match(/champagne/i)) return false;
			
		return true;
	}

	
	var producerOperation = function(window){
	    
		return;
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price1 = $('div.priceArea div.price span.value').text();
		var price2 = $('div.priceArea div.price span.cent').text();
		return price1+price2;
	};
	
	var wineOperation = function(window){
		
		return;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var name = $('div#detailsHeadZone h1.title').text();
						
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
	
	var photoOperation = function(window) {
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

module.exports = Auchan;