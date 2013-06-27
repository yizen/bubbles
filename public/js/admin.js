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
	 
	});
})(jQuery);
