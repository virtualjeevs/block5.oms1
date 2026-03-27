jQuery( window ).ready( function($) {
	// FIXME: This is how this should work:
	// - Let the overlay image get initialized on any container element.
	// - Add the "overlay-image" class to that container.
	// - Add the "overlay" class to all images except the first.
	// - Iterate through the ids of each overlay attaching to any links with a corresponding href.
	$( "body" ).on( "click.overlay-image", "a.overlay-image", function() {
		var overlayImage = $( "#" + $( this ).attr( "rel" ) );
		overlayImage.siblings( ".overlay" ).hide();
		overlayImage.show();
		$( "a.overlay-image" ).removeClass( "current" );
		$( "a.overlay-image[rel='" + $( this ).attr( "rel" ) + "']" ).addClass( "current" );
		if( $( this ).attr( "href" ) === "#" ) {
			return false;
		}
	} );
});
