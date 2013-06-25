/*'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.when('/view1', {templateUrl: 'partials/partial1', controller: MyCtrl1});
	$routeProvider.when('/view2', {templateUrl: 'partials/partial2', controller: MyCtrl2});
	$routeProvider.otherwise({redirectTo: '/view1'});
	$locationProvider.html5Mode(true);
}]);
*/

var search = document.querySelector('[type=search]');

$('#checkboxes label').on('click', function(event) {
	launchSearch();
});


$('#search-query-2').on('keyup', function(event) {
	launchSearch();
});


var launchSearch = function() {
	if (search.value.length < 3) { return }
	
	var options = new Array();
	options['bouteille'] = $('input#bouteille').attr('checked');
	options['demibouteille'] = $('input#demibouteille').attr('checked');
	options['magnum'] = $('input#magnum').attr('checked');
	options['jeroboam'] = $('input#jeroboam').attr('checked');
	options['mathusalem'] = $('input#mathusalem').attr('checked');
	options['salmanazar'] = $('input#salmanazar').attr('checked');
	options['balthazar'] = $('input#balthazar').attr('checked');
	options['nabuchodonosor'] = $('input#nabuchodonosor').attr('checked');
	
	
	var optionsString = "";
	for(var key in options) {
		optionsString += "&"+key.toString()+"="+options[key];
	}
	/*
	var xhr = new XMLHttpRequest;
	xhr.open('GET', '/search?' + 'q='+ search.value + optionsString, true);
	xhr.onreadystatechange = function(){
		if (4 == xhr.readyState) {
		   results(xhr.responseText);
		 }
	};
	xhr.send();*/
	
	$.ajax({
		url: '/search?' + 'q='+ search.value + optionsString
	}).success(function(wines) {
		$('#results').replaceWith(wines);
	});
};

var results = function (wines) {
	
};



(function($) {

	// Add segments to a slider
	  $.fn.addSliderSegments = function (amount) {
	    return this.each(function () {
	      var segmentGap = 100 / (amount - 1) + "%"
	        , segment = "<div class='ui-slider-segment' style='margin-left: " + segmentGap + ";'></div>";
	      $(this).prepend(segment.repeat(amount - 2));
	    });
	  };

	  String.prototype.repeat = function(num) {
		  return new Array(num + 1).join(this);
	  };

	 $(function() {
		// Focus state for append/prepend inputs
		$('.input-prepend, .input-append').on('focus', 'input', function () {
				$(this).closest('.control-group, form').addClass('focus');
		}).on('blur', 'input', function () {
				$(this).closest('.control-group, form').removeClass('focus');
		});  
		
		
		$('#search-query-2').focus();
		
		var $sizes = $("#sizes")
			,sizesValueMultiplier = 0.5
			,sizesOptions;
    
		if ($sizes.length > 0) {
			$sizes.slider({
				min: 1,
				max: 20,
				values: [2 ,10],
				orientation: "horizontal",
				range: true,
				slide: function(event, ui) {
					$sizes.find(".ui-slider-value:first").text(ui.values[0] * sizesValueMultiplier).end()
						  .find(".ui-slider-value:last").text(ui.values[1] * sizesValueMultiplier);
				}
			});
      
			sizesOptions = $sizes.slider("option");
      
			$sizes.addSliderSegments(sizesOptions.max).find(".ui-slider-value:first").text(sizesOptions.values[0] * sizesValueMultiplier).end()
			.find(".ui-slider-value:last").text(sizesOptions.values[1] * sizesValueMultiplier);
		}
	});
	
	//Searchbar fixed on top for scroll
	$(document).scroll(function(){
		var elem = $('.searchbar');
		if (!elem.attr('data-top')) {
			if (elem.hasClass('searchbar-fixed-top'))
				return;
			var offset = elem.offset();
			elem.attr('data-top', offset.top);
		}
		
		if (elem.attr('data-top') - elem.outerHeight() <= $(this).scrollTop() - $(elem).outerHeight())
			elem.addClass('searchbar-fixed-top');
		else
			elem.removeClass('searchbar-fixed-top');
	});
})(jQuery);
