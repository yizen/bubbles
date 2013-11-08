(function($) {
	 $(function() {		
		// Switch
		$("[data-toggle='switch']").wrap('<div class="switch" />').parent().bootstrapSwitch();
		
		//Get change for switch website.jade
		$('input.switchStatus').change( function() {
			var active = ($(this).attr("checked")) === undefined ? false : true;

			$.ajax({
				type: "POST",
				url: "/admin/ajax/setactive/",
				data: { websiteId: ($(this).attr("data-website")), active: active }
			}).done(function( msg ) {
				console.log(msg);
			});
			
		});
		
		//typeahead for wine.jade
		var producerNames = new Array();
		var producerIds = new Object();
		$.getJSON( '/admin/ajax/producers/', null,
        	function ( jsonData )
			{
            	$.each( jsonData, function ( index, producer )
				{
                	producerNames.push( producer.name );
					producerIds[producer.name] = producer.id;
				});
				
            $( '#producerRef' ).typeahead( 
            	{ 
            		source:		producerNames ,
					updater:	function(item) {
						selectedProducer = producerIds[item.toString()];
						$('#producerRefValue').val(selectedProducer);
						
						$('#wineRef')
							.find('option') 
							.remove()
							.end();
												
						//Load Wine data
						$.getJSON("/admin/ajax/listwineref/", {producerId:selectedProducer}, function(result) {
							var options = $("#wineRefId");
							
						    for (var item in result) {
						        options.append($("<option />").val(result[item].id).text(result[item].name));
						    };
						});
						
						return item;
					}
				});
        });
        
        $('#addWineRef').on('click', function(e) {
        	e.preventDefault();

        	if ($('#producerRef').val() == "") return;
        	if ($('#producerRefValue').val() == "") return;
        	if ($('#newName').val() == "") return;
        	
        	$.ajax({
				type: "POST",
				url: "/admin/ajax/createwineref/",
				data: { producerId: ($('#producerRefValue').val()), wine: ($('#newName').val()) }
			}).done(function( msg ) {
				window.location.reload();
			});
        	
        });
        
        $('#search').on('click', function(e) {
        	e.preventDefault();
        	
        	var q = $('#producerRef').val();
        	
        	window.location.href = encodeURI("/admin/producers/search/"+q);
        });
               
        $('#clearjobs').on('click', function(e) {
			$.get('/admin/clearalljobs/', function(data) {
				window.location.href = encodeURI("/admin/");
  			}); 
        });
        
        $( "#wineRefId" ).change(function() {
        	var producer = $('#producerRef').val();
        	var wine = $('#wineRefId option:selected').text();
        	
        	$('#wine').val(wine);
        	$('#producer').val(producer);	
		});

	 
	});
})(jQuery);
