(function($) {
	// http://stackoverflow.com/questions/280634/endswith-in-javascript
	function endsWith( str, suffix ) {
    	return str.indexOf( suffix, str.length - suffix.length ) !== -1;
	}
	
	function getPath( str ) {
		return str.substr( 0, str.lastIndexOf( '/' ) + 1 );
	}
	
	$.fn.ajaxNavigation = function( complete ) {
		return this.each( function() {
			var parent = $( this );
			$.ajax( {
				url: $( this ).data( "source" ),
				dataType: "html"
			} ).done( function( html ) {
				parent.append( html );
				$( "a", parent ).each( function() {
					var linkPath = getPath( $( this ).attr( "href" ) );
					var windowPath = getPath( window.location.pathname );
					if( linkPath.indexOf( "/" ) != -1 ) {
						if( linkPath && endsWith( windowPath, linkPath ) ) {
							relativePath = linkPath.replace( /([^/])+/g, ".." );
							$( this ).attr( "href", "#" )
							$( this ).parent().addClass( "current" );
							// Not where this goes but works for now.
							$( this ).parents( ".expandable-menu li.expandable" ).addClass( "expanded" );
							$( "> ul", $( this ).parents( ".expandable-menu li.expandable" ) ).show();
							$( "a", parent ).each( function() {
								if( getPath( $( this ).attr( "href" ) ) ) {
									$( this ).attr( "href", relativePath + $( this ).attr( "href" ) );
								}
							} );
							return false;
						}
					} else {
						if( endsWith( window.location.pathname, "/" + $( this ).attr( "href" ) ) ) {
							$( this ).attr( "href", "#" )
							$( this ).parent().addClass( "current" );
						}
					}
				} );
				complete.call( parent );
			} );
		} );
	};
})(jQuery);
