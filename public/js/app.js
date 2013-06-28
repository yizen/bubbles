(function($) {
	 $(function() {
	 	$('select#minimumSize, select#maximumSize').selectToUISlider({
				labels: 12,
				labelSrc: 'text',
				tooltip: false,
				sliderOptions: { 
					change:function(e, ui) { 
						//minSize = $('select#minimumSize option').eq(ui.values[0]).val();
						//maxSize = $('select#maximumSize option').eq(ui.values[1]).val();
						launchSearch();
					}
				}
		}).hide();
	 
		// Focus state for append/prepend inputs
		$('.input-prepend, .input-append').on('focus', 'input', function () {
				$(this).closest('.control-group, form').addClass('focus');
		}).on('blur', 'input', function () {
				$(this).closest('.control-group, form').removeClass('focus');
		}); 
		
		$('#search-box').on('submit', function(event) {	
			launchSearch();
			return false;
		});
		
		$('#search-query').on('keyup', function(event) {
			launchSearch();
		});
		
		var launchSearch = function() {
			if ($('#search-query').val().length < 3) { return }
			
			var minSize = $('select#minimumSize').val();
			var maxSize = $('select#maximumSize').val();
			
			
			$.ajax({
				url: '/search?' + 'q='+ $('#search-query').val()+'&minSize='+minSize+'&maxSize='+maxSize
			}).success(function(wines) {
				$('#results').replaceWith(wines);
			});
		}; 
		
		
		$('#search-query').focus();
		

	});
	
	//Searchbar fixed on top for scroll
	
	/*
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
*/
})(jQuery);
