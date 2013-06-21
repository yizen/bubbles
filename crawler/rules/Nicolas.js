var _  			= require('underscore');
_.str 			= require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');


var Nicolas = function ( scrapinode ) {
	var path = /http:\/\/www.nicolas.com/;
	
	var isValidOperation = function(window) {
		if (!window) return false;

		var $ = window.$;
			
		var type = $('div.pro_blk_trans div.pro_blk_trans_titre').text();
		if (_(type).isBlank()) {
			type = $('div.icc_blk_trans_titre').text();
		}
		
		if (!type) return false;	
		
		if (!type.match(/champagne/i)) return false;
			
		return true;
	}

	
	var producerOperation = function(window){
		return;
	};
	
	var priceOperation = function(window){
		
		if (!window) return;
	
		var $ = window.$;
		var price = $("table.pro_table_commande div.pro_commande_prix").text();
		if (_(price).isBlank()) {
			price = $('table.icc_table_commande div.icc_commande_prix').text();
		}
		return price;
	};
	
	var wineOperation = function(window){
		return;
	};
	
	var nameOperation = function(window) {
		if (!window) return;
		
	
		var $ = window.$;
		var name = $('div.pro_titre h1').text();
		
		
		if (_(name).isBlank()) {
			name = $('div.icc_titre h1').text();
		}
		
		return name.toString('UTF-8');
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

module.exports = Nicolas;