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

search.addEventListener('keyup', function(){

	if (search.value.length < 3) { return }

	var xhr = new XMLHttpRequest;
	xhr.open('GET', '/search/' + search.value, true);
	xhr.onreadystatechange = function(){
		if (4 == xhr.readyState) {
	      results(xhr.responseText);
	    }
	};
	xhr.send();
}, false);

var results= function (wines) {
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
	});
})(jQuery);
