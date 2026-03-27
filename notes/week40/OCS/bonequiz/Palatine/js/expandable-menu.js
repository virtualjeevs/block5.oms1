(function($) {
	$.fn.expandableMenu = function() {
		return this.each( function() {
			$( this ).on( "click.expandable-menu", "li.expandable > a", function() {
				$( this ).parent().toggleClass( "expanded" );
				$( "> ul", $( this ).parent() ).slideToggle();
				return false;
			} );
		} );
	};
})(jQuery);
