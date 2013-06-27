/* scrapinode callbacks */

var Debullesenbulles = function ( scrapinode ) {
	var path = /http:\/\/www.debullesenbulles.com/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var name = $('form#pan h1.titre_fiche').text();
		if (!name) return false;
		
		if (!name.match(/^champagne/i)) return false;
			
		return true;
	}

	
	var producerOperation = function(window){
	
		return;
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $('div#panier div#zone_prix span').text();
		
		return price;
	};
	
	var wineOperation = function(window){
		
		return;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var name = $('form#pan h1.titre_fiche').text();
						
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
		//images de mauvaise qualitŽ > skip.
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

module.exports = Debullesenbulles;