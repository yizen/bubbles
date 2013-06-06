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
		
	scrapinode.use (path,'isValid', isValidOperation);

	scrapinode.use (path,'producer', producerOperation);
	scrapinode.use (path,'price', priceOperation);
	scrapinode.use (path,'wine', wineOperation);
	scrapinode.use (path,'name', nameOperation);

};

module.exports = Debullesenbulles;