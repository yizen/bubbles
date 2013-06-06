/* scrapinode callbacks */

var Cavagogo = function ( scrapinode ) {
	var path = /http:\/\/www.cavagogo.com/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var name = $('#lien_second_niveau_navigation_fiche_produit span').text();
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
		var price = $('div#catalogue_pwb input[id=prix]').val();
		
		return price;
	};
	
	var wineOperation = function(window){
		
		return;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
	
		var $ = window.$;
		var name = $('div#catalogue_pwb input[id=titre]').val();
						
		return name;
	}
		
	scrapinode.use (path,'isValid', isValidOperation);

	scrapinode.use (path,'producer', producerOperation);
	scrapinode.use (path,'price', priceOperation);
	scrapinode.use (path,'wine', wineOperation);
	scrapinode.use (path,'name', nameOperation);

};

module.exports = Cavagogo;