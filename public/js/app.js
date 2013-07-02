(function($) {
	 $(function() {
	 
	 	$("#optionsOn").click(function () {
		 	$("#refine-container").toggle();
		 });
		 
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
		
		 var tooltip = function(sliderObj, ui){
         	val1            = '<div id="slider_tooltip">&euro; '+ sliderObj.slider("values", 0) +'</div>';
            val2            = '<div id="slider_tooltip">&euro; '+ sliderObj.slider("values", 1) +'</div>';
            sliderObj.children('.ui-slider-handle').first().html(val1);
            sliderObj.children('.ui-slider-handle').last().html(val2);                  
          };

       		
		$( "#price-range" ).slider({
			range: true,
			min: 0,
			max: 500,
			values: [ 10, 300 ],
			slide: function( e, ui ) {
                tooltip($(this),ui);                    
              },              
              create:function(e,ui){
                tooltip($(this),ui);                    
             },
              stop:function(e,ui) {
	             launchSearch(); 
              }
		});
	 
		// Focus state for append/prepend inputs
		$('.input-prepend, .input-append').on('focus', 'input', function () {
				$(this).closest('.control-group, form').addClass('focus');
		}).on('blur', 'input', function () {
				$(this).closest('.control-group, form').removeClass('focus');
		}); 
		
		$('#search-box').on('submit', function(event) {
			if ($('#search-query').val().length < 3) { return }	
			launchSearch();
			return false;
		});
		
		$('#search-query').on('keyup', function(event) {
			if ($('#search-query').val().length < 3) { return }
			launchSearch();
		});
		
		var color='whiteAndPink';
		
		$('#white').on('click', function(event) {
			color='White';
			launchSearch();
		});
		
		$('#pink').on('click', function(event) {
			color='Pink';
			launchSearch();
		});
		
		$('#whiteAndPink').on('click', function(event) {
			color='whiteAndPink';
			launchSearch();
		});
						
		var launchSearch = function() {
			var minSize = $('select#minimumSize').val();
			var maxSize = $('select#maximumSize').val();
			
			var minPrice = $("#price-range").slider("values")[0];
			var maxPrice = $("#price-range").slider("values")[1];

			
			$.ajax({
				url: '/search?' + 'q='+ $('#search-query').val()+'&minSize='+minSize+'&maxSize='+maxSize+'&minPrice='+minPrice+'&maxPrice='+maxPrice+'&color='+color
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
