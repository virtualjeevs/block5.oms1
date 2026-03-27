jQuery( window ).ready( function($) {
	var hasMedia = $( "#media" ).length > 0;
	
	// Just look for the API being available, should work in all versions >= 5.2.27
	var vhDissector = (typeof VHDissectorAPI !== "undefined") || (typeof tltAPI !== "undefined");
	
	if( hasMedia ) {
		$( "body" ).addClass( "media" );
		if( $( "body" ).hasClass( "dissection" ) ) {
			$( "#text" ).prepend( $( '<a class="maximize button" href="#">Maximize</a>' ).on( "click.cdg", function() {
				if( $( "body" ).hasClass( "small-photo" ) ) {
					$( "body" ).removeClass( "small-photo" );
					$( this ).removeClass( "minimize" ).addClass( "maximize" );
					$( this ).text( "Maximize" );
				} else {
					$( "body" ).addClass( "small-photo" );
					$( this ).removeClass( "maximize" ).addClass( "minimize" );
					$( this ).text( "Minimize" );
				}
				return false;
			} ) );
		}
	}
	$( "#content-menu" ).ajaxNavigation( function() {
		$( this ).parent().dropdownMenu();
	} );
	$( "#menu" ).ajaxNavigation( function() {
		$( this ).expandableMenu();
	} );
	$( "#menu" ).on( "click.cdg", "li.current > a", function() {
		$( "body" ).toggleClass( "menu" );
		return false;
	} );
	$( "#menu-button" ).on( "click.cdg", function() {
		$( "body" ).toggleClass( "menu" );
		return false;
	} );
	
	// This should be handled differently but waiting until all images load will work for now.
	$( window ).load( function() {
		if( $( "div.photo-browser" ).length > 0 ) {
			$( "div.photo-browser" ).photoBrowser();
		}
		
		// We would like to do this sooner but we need to wait for the load event or else Chromium aborts the navigation.
		if( vhDissector ) {
			var element = document.getElementById( "vhd" );
			if( element ) {
				if( element.click ) {
					element.click();
				} else if( document.createEvent ) {
					var event = document.createEvent( "MouseEvents" );
					event.initMouseEvent( "click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
					element.dispatchEvent( event );
				}
			}
		} else {
			$( "body" ).on( "click.cdg", "a.vhd", function() {
				return false;
			} );
		}
	});
	
	$( "body" ).on( "click.cdg", "div.pin", function() {
		$( "div.label", this ).toggleClass( "active" );
		return false;
	} );
});
