(function($) {
	$(function() {
		//
		// Spinner used to set quantity -----------------------------------
		//
		// jQuery UI Spinner
	    $.widget( "ui.customspinner", $.ui.spinner, {
	      widgetEventPrefix: $.ui.spinner.prototype.widgetEventPrefix,
	      _buttonHtml: function() { // Remove arrows on the buttons
	        return "" +
	        "<a class='ui-spinner-button ui-spinner-up ui-corner-tr'>" +
	          "<span class='ui-icon " + this.options.icons.up + "'></span>" +
	        "</a>" +
	        "<a class='ui-spinner-button ui-spinner-down ui-corner-br'>" +
	          "<span class='ui-icon " + this.options.icons.down + "'></span>" +
	        "</a>";
	      }
	    });

		//
		// Sliders setup -----------------------------------
		//

		$('select#minimumSize, select#maximumSize').selectToUISlider({
				labels: 12,
				labelSrc: 'text',
				tooltip: false,
				sliderOptions: { 
					change:function(e, ui) { 
						var minSize = $('select#minimumSize').val();
						var maxSize = $('select#maximumSize').val();
						ga('send','event', 'Search', 'Size', 'Size '+minSize+' '+maxSize);

						launchSearch();
					}
				}
		}).hide();
		
		var tooltip = function(sliderObj, ui){
			val1			= '<div id="slider_tooltip">&euro; '+ sliderObj.slider("values", 0) +'</div>';
			val2			= '<div id="slider_tooltip">&euro; '+ sliderObj.slider("values", 1) +'</div>';
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
				 	var minPrice = $("#price-range").slider("values")[0];
				 	var maxPrice = $("#price-range").slider("values")[1];
				 	ga('send','event', 'Search', 'Price', 'Price '+minPrice+' '+maxPrice);
				 	launchSearch(); 
				 }
		});
	
		
		//
		// Events----------------------
		//
		
		$('#search-box').on('submit', function(event) {
			if ($('#search-query').val().length < 3) { return }	
			launchSearch();
			return false;
		});
		
		var color='whiteAndPink';
		
		$('#white').on('click', function(event) {
			color='White';
			ga('send','event', 'Search', 'Color', 'Color '+color);

			launchSearch();
		});
		
		$('#pink').on('click', function(event) {
			color='Pink';
			ga('send','event', 'Search', 'Color', 'Color '+color);
	
			launchSearch();
		});
		
		$('#whiteAndPink').on('click', function(event) {
			color='whiteAndPink';
			ga('send','event', 'Search', 'Color', 'Color '+color);

			launchSearch();
		});
		
		//
		// Fire search dynamically after a few keystrokes ----------------------
		//
		
		//setup before functions
		var typingTimer;					//timer identifier
		var doneTypingInterval = 500;	 //time in ms
		
		//on keyup, start the countdown
		$('#text').keyup(function(){
			typingTimer = setTimeout(doneTyping, doneTypingInterval);
		});
		
		//on keydown, clear the countdown 
		$('#text').keydown(function(){
			clearTimeout(typingTimer);
		});
		
		//user is "finished typing," launch search
		function doneTyping () {
			if ($('#text').val().length < 3) { return }
			ga('send', 'event', 'Search', 'Text', $('#text').val());

			launchSearch();
		}
		
		var launchSearch = function(firstRun) {
			
			var isFirstRun = firstRun || false;
		
			if (!isFirstRun) {
				$('header').removeClass('hidden-xs');
				$('header').hide();
				$("html, body").animate({ scrollTop: 0 }, 500);
				$('#searchbox').addClass('after-search');
				//launch spinner
				$('#spinner').spin("large","#333");
			}
			
			
			var minSize = $('select#minimumSize').val();
			var maxSize = $('select#maximumSize').val();
			
			var minPrice = $("#price-range").slider("values")[0];
			var maxPrice = $("#price-range").slider("values")[1];
			
			var maxResults = 40;
			
			if (isFirstRun) maxResults = 4;

			var qty 	= $("#qty").val() || 6;

			var keyword = $('#text').val();
			
			$.ajax({
				url: '/search?' + 'q='+keyword+'&minSize='+minSize+'&maxSize='+maxSize+'&minPrice='+minPrice+'&maxPrice='+maxPrice+'&color='+color+'&qty='+qty+'&maxResults='+maxResults
			}).done(function(wines) {
			
				$('#results').replaceWith(wines);
				
				$('#qty').customspinner({
					min: 1,
					max: 99
				}).on('focus', function () {
					$(this).closest('.ui-spinner').addClass('focus');
				}).on('blur', function () {
					$(this).closest('.ui-spinner').removeClass('focus');
				});
				
				$('#qty').on("spinstop", function() {
					if ($('#qty').val() == 1) {
						$('#qty-bottles').html("bouteille."); 
					} else {
						$('#qty-bottles').html("bouteilles."); 
					}
					
					launchSearch();		
				});
				
				
			}).always(function() {
				$('#spinner').spin(false);
			});
		}; 
		
		//
		// Inits----------------------
		//
		var getQuery = getURLParameter('q');
		
		if ($('#qty')) {
			$('#qty').customspinner({
					min: 1,
					max: 99
				}).on('focus', function () {
					$(this).closest('.ui-spinner').addClass('focus');
				}).on('blur', function () {
					$(this).closest('.ui-spinner').removeClass('focus');
				});
				
				$('#qty').on("spinstop", function() {
					if ($('#qty').val() == 1) {
						$('#qty-bottles').html("bouteille."); 
					} else {
						$('#qty-bottles').html("bouteilles."); 
					}
					
					launchSearch();		
				});
		}
		
		
		if (getQuery && getQuery != '') {
			$('#text').val(getQuery);
			launchSearch();
		}
		
		//Check if query is set in get variable
		$('#text').focus();	
		
		//Launch search at page load
		launchSearch(true);
		
		function getURLParameter(sParam) {
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++)  {
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] == sParam) {
					return decodeURIComponent(sParameterName[1]);
				}
			}
		}

	});
})(jQuery);
