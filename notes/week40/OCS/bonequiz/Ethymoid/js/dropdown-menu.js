(function($) {
	$.fn.dropdownMenu = function() {
		return this.each( function() {
			var menu = $( "ul", this );
			$( ".dropdown-menu-header > a", this ).on( "click.dropdown-menu", function() {
				menu.toggleClass( "active" );
				return false;
			} );
			$( "li.current > a", menu ).on( "click.dropdown-menu", function() {
				menu.toggleClass( "active" );
				return false;
			} );
			$( ".dropdown-menu-header > a", this ).text( $( "li.current > a", menu ).text() );
		} );
	};
})(jQuery);
