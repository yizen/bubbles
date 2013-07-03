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
		if (!window) return;
		
		var $ = window.$;
		var photo = $('div#primary_block div#image-block img#bigpic').attr('src');
		
		if (photo) return ('http://www.champagneendirect.fr'+photo);
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

module.exports = Champagneendirect;