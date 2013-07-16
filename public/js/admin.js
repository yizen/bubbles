(function($) {
	 $(function() {

	 	//Modal for confirm delete Job
	 	$('#modal-from-dom').on('show', function() {
		    var id = $(this).data('id'),
		        removeBtn = $(this).find('.danger');
		
		    removeBtn.attr('href', removeBtn.attr('href')+id);
		});
		
		$('.confirm-delete').on('click', function(e) {
		    e.preventDefault();
		
		    var id = $(this).data('id');
		    $('#modal-from-dom').data('id', id).modal('show');
		});
		
		// Switch
		$("[data-toggle='switch']").wrap('<div class="switch" />').parent().bootstrapSwitch();
		
		//Get change for switch
		$('input.switchStatus').change( function() {
			//alert($(this).attr("checked"));
			//alert;
			
			var active = ($(this).attr("checked")) === undefined ? false : true;

			$.ajax({
				type: "POST",
				url: "/admin/setactive/",
				data: { websiteId: ($(this).attr("data-website")), active: active }
			}).done(function( msg ) {
				console.log(msg);
			});
			
		})
	 
	});
})(jQuery);
