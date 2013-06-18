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
	console.log("check");
	launchSearch();
});


$('#search-query-2').on('keyup', function(event) {
	launchSearch();
});


var launchSearch = function() {
	if (search.value.length < 3) { return }

	var options = Array();
	options['bouteille'] = $('input#bouteille').attr('checked');
	options['demibouteille'] = $('input#demibouteille').attr('checked');
	
	var optionsString = "";
	for(var key in options) {
		optionsString += "&"+key.toString()+"="+options[key];
	}
	
	var xhr = new XMLHttpRequest;
	xhr.open('GET', '/search?' + 'q='+ search.value + optionsString, true);
	xhr.onreadystatechange = function(){
		if (4 == xhr.readyState) {
		   results(xhr.responseText);
		 }
	};
	xhr.send();
};

var results = function (wines) {
	$('#results').replaceWith(wines);
};

(function($) {
	 $(function() {
		// Focus state for append/prepend inputs
		$('.input-prepend, .input-append').on('focus', 'input', function () {
				$(this).closest('.control-group, form').addClass('focus');
		}).on('blur', 'input', function () {
				$(this).closest('.control-group, form').removeClass('focus');
		});  
		
		
		$('#search-query-2').focus();
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
