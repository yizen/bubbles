(function($) {
	$(function() {
		//
		// Focus state for append/prepend inputs ---------------------------
		//
		$('.input-group').on('focus', '.form-control', function () {
			$(this).closest('.form-group, .navbar-search').addClass('focus');
		
		}).on('blur', '.form-control', function () {
			$(this).closest('.form-group, .navbar-search').removeClass('focus');
		});
		
		// Placeholders for input/textarea
		$("input, textarea").placeholder();
		
		//
		// Header scroll change opacity ------------------------------------
		//
		/*
var divs = $('header');
		var range = 130;
		$(window).on('scroll', function() {
			var st = $(this).scrollTop();
			divs.each(function() {
				var offset = $(this).offset().top;
				var height = $(this).outerHeight();
				offset = offset + height / 2;
				$(this).css({
					'opacity': (1 - ((st - offset + range) / range))
				});
			});
		});
*/
	});
})(jQuery);
