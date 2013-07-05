(function($) {
	 $(function() {
	 
	 	$("span#more").on("click", function(){
	 		$("#refine").slideToggle(200);
		});
	 	
	 	//setup before functions
		var typingTimer;                //timer identifier
		var doneTypingInterval = 500;  //time in ms
		
		//on keyup, start the countdown
		$('#search-query').keyup(function(){
		    typingTimer = setTimeout(doneTyping, doneTypingInterval);
		});
		
		//on keydown, clear the countdown 
		$('#search-query').keydown(function(){
		    clearTimeout(typingTimer);
		});
		
		//user is "finished typing," do something
		function doneTyping () {
		    if ($('#search-query').val().length < 3) { return }
			launchSearch();
		}
		
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
			
			//launch spinner
			$('#spinner').spin();
			
			var minSize = $('select#minimumSize').val();
			var maxSize = $('select#maximumSize').val();
			
			var minPrice = $("#price-range").slider("values")[0];
			var maxPrice = $("#price-range").slider("values")[1];

			
			$.ajax({
				url: '/search?' + 'q='+ $('#search-query').val()+'&minSize='+minSize+'&maxSize='+maxSize+'&minPrice='+minPrice+'&maxPrice='+maxPrice+'&color='+color
			}).done(function(wines) {
				$('#results').replaceWith(wines);
			}).always(function() {
				$('#spinner').spin(false);
			});
		}; 
		
		
		$('#search-query').focus();	

	});
})(jQuery);
