/* Need to re-center/zoom the image when div.photo-browser resizes, not just the window. */
(function($) {
	var photoBrowserLinksInitialized = false;
	
	$.fn.photoBrowser = function() {
		if( !photoBrowserLinksInitialized ) {
			$( "body" ).on( "click.photo-browser", "a.photo-browser", function() {
				$( "#" + $( this ).attr( "rel" ) ).get( 0 ).pbActivate();
			} );
			photoBrowserLinksInitialized = true;
		}
		
		return this.each( function() {
			var photoBrowser = $( this );
			var currentPhoto = $( ".photo", this ).first();
			var currentPhotoDOM = currentPhoto.get( 0 );
			
			var toolbar = $( '<div class="toolbar"></div>' );
			
			var previousButton = $( '<a class="previous button" href="#">Previous</a>' ).on( "click.photo-browser", function() {
				if( currentPhoto.prev( ".photo" ).length > 0 ) {
					currentPhoto.prev( ".photo" ).get( 0 ).pbActivate();
				}
				return false;
			} );
			
			var nextButton = $( '<a class="next button" href="#">Next</a>' ).on( "click.photo-browser", function() {
				if( currentPhoto.next( ".photo" ).length > 0 ) {
					currentPhoto.next( ".photo" ).get( 0 ).pbActivate();
				}
				return false;
			} );
			
			var labelsToggle = $( '<a class="labels" href="#">Hide Labels</a>' ).on( "click.photo-browser", function() {
				if( $( this ).text() == "Show Labels" ) {
					$( this ).text( "Hide Labels" );
					$( "img.label", photoBrowser ).show();
				} else {
					$( this ).text( "Show Labels" );
					$( "img.label", photoBrowser ).hide();
				}
				return false;
			} );
			
			var zoomSlider = $( '<div class="zoom-slider"></div>' ).slider( {
				min: 50, max: 200, value: 100,
				change: function( event, ui ) {
					currentPhotoDOM.pbScaleFromCenter( ui.value / 100 );
				}, slide: function( event, ui ) {
					currentPhotoDOM.pbScaleFromCenter( ui.value / 100 );
				}, start: function() {
					currentPhotoDOM.pbBeginScaleFromCenter();
				}, stop: function() {
					currentPhotoDOM.pbEndScaleFromCenter();
				}
			} );
			
			var zoomOutButton = $( '<a class="zoom-out button" href="#">Zoom Out</a>' ).on( "click.photo-browser", function() {
				zoomSlider.slider( "value", zoomSlider.slider( "value" ) - 10 );
				return false;
			} );
			
			var zoomInButton = $( '<a class="zoom-in button" href="#">Zoom In</a>' ).on( "click.photo-browser", function() {
				zoomSlider.slider( "value", zoomSlider.slider( "value" ) + 10 );
				return false;
			} );
			
			var caption = $( '<div class="caption">&nbsp;</div>' );
			
			photoBrowser.prepend(
				toolbar.append(
					$( previousButton ),
					$( nextButton ),
					$( '<div class="controls"></div>' ).append( labelsToggle ),
					// &nbsp; in div.zoom prevents strange height calculations
					$( '<div class="zoom">&nbsp;</div>' ).append( zoomOutButton, zoomSlider, zoomInButton )
				)
			);
			photoBrowser.append( caption );
			
			$( "div.photo", photoBrowser ).each( function() {
				var photo = $( this );
				var mainImage = $( "img", this ).first();
				var nonFixedImages = $( "img:not( .fixed ), div.overlay", this );
				
				// Activates a photo causing it to be shown and the others within the same photo browser to be hidden.
				this.pbActivate = function() {
					$( "a.photo-browser[rel='" + currentPhotoDOM.id + "']" ).removeClass( "current" );
					currentPhotoDOM = this;
					currentPhoto = $( currentPhotoDOM );
					currentPhoto.show();
					currentPhoto.siblings( ".photo" ).hide();
					caption.text( mainImage.attr( "alt" ) );
					zoomSlider.slider( "option", "min", Math.min( currentPhoto.innerWidth() / mainImage.prop( "naturalWidth" ), currentPhoto.innerHeight() / mainImage.prop( "naturalHeight" ) ) * 100 );
					currentPhotoDOM.pbBeginScaleFromCenter();
					currentPhotoDOM.pbScaleFromCenter( zoomSlider.slider( "value" ) / 100 );
					currentPhotoDOM.pbEndScaleFromCenter();
					$( "a.photo-browser[rel='" + this.id + "']" ).addClass( "current" );
					if( $( "img.label", currentPhoto ).length > 0 ) {
						labelsToggle.show();
					} else {
						labelsToggle.hide();
					}
				};
				
				this.pbResizeWindow = function() {
					var minScale = Math.min( currentPhoto.innerWidth() / mainImage.prop( "naturalWidth" ), currentPhoto.innerHeight() / mainImage.prop( "naturalHeight" ) ) * 100;
					if( zoomSlider.slider( "value" ) == zoomSlider.slider( "option", "min" ) ) {
						zoomSlider.slider( "option", "min", minScale );
						zoomSlider.slider( "value", minScale );
					} else {
						zoomSlider.slider( "option", "min", minScale );
						var bounds = {
							x: photo.innerWidth() / 2 - center.x * ( mainImage.width() / mainImage.prop( "naturalWidth" ) ),
							y: photo.innerHeight() / 2 - center.y * ( mainImage.height() / mainImage.prop( "naturalHeight" ) ),
							width: mainImage.width(),
							height: mainImage.height()
						};
						var min = { x: 0, y: 0 }, max = { x: 0, y: 0 };
						min.x = photo.innerWidth() - bounds.width;
						min.x = Math.min( min.x, min.x / 2 );
						max.x = Math.max( min.x, 0 );
						min.y = photo.innerHeight() - bounds.height;
						min.y = Math.min( min.y, min.y / 2 );
						max.y = Math.max( min.y, 0 );
						bounds.x = Math.max( Math.min( bounds.x, max.x ), min.x );
						bounds.y = Math.max( Math.min( bounds.y, max.y ), min.y );
						nonFixedImages.each( function() {
							var image = $( this );
							image.css( "top", bounds.y );
							image.css( "left", bounds.x );
						} );
					}
				};
				
				// Adjusts the zoom so the entire image fits in the window.
				this.pbZoomToFit = function() {
					zoomSlider.slider( "value", zoomSlider.slider( "option", "min" ) );
				};
				
				var center = { x: 0, y: 0 };
				
				// Begins center based scaling so that a single center point is maintained throughout.
				this.pbBeginScaleFromCenter = function() {
					center.x = ( photo.innerWidth() / 2 - mainImage.position().left ) / ( mainImage.width() / mainImage.prop( "naturalWidth" ) );
					center.y = ( photo.innerHeight() / 2 - mainImage.position().top ) / ( mainImage.height() / mainImage.prop( "naturalHeight" ) );
				};
				
				// Sets the scale of the image keeping the center point in the center of the screen if possible.
				this.pbScaleFromCenter = function( scale ) {
					var bounds = {
						x: photo.innerWidth() / 2 - center.x * scale,
						y: photo.innerHeight() / 2 - center.y * scale,
						width: mainImage.prop( "naturalWidth" ) * scale,
						height: mainImage.prop( "naturalHeight" ) * scale
					};
					var min = { x: 0, y: 0 }, max = { x: 0, y: 0 };
					min.x = photo.innerWidth() - bounds.width;
					min.x = Math.min( min.x, min.x / 2 );
					max.x = Math.max( min.x, 0 );
					min.y = photo.innerHeight() - bounds.height;
					min.y = Math.min( min.y, min.y / 2 );
					max.y = Math.max( min.y, 0 );
					bounds.x = Math.max( Math.min( bounds.x, max.x ), min.x );
					bounds.y = Math.max( Math.min( bounds.y, max.y ), min.y );
					nonFixedImages.each( function() {
						var image = $( this );
						image.width( bounds.width );
						// Only need to apply height on divs because they don't have an inherent aspect ratio.
						if( image.is( "div" ) ) {
							image.height( bounds.height );
						}
						image.css( "top", bounds.y );
						image.css( "left", bounds.x );
					} );
				};
				
				// Ends center based scaling so that a single center point is maintained throughout.
				this.pbEndScaleFromCenter = function() {
					center.x = ( photo.innerWidth() / 2 - mainImage.position().left ) / ( mainImage.width() / mainImage.prop( "naturalWidth" ) );
					center.y = ( photo.innerHeight() / 2 - mainImage.position().top ) / ( mainImage.height() / mainImage.prop( "naturalHeight" ) );
				};
				
				// Translates the image on screen by the specified amount in X and Y.
				this.pbTranslate = function( translation ) {
					var bounds = {
						x: mainImage.position().left + translation.x,
						y: mainImage.position().top + translation.y,
						width: mainImage.width(),
						height: mainImage.height()
					};
					var min = { x: 0, y: 0 }, max = { x: 0, y: 0 };
					min.x = photo.innerWidth() - bounds.width;
					min.x = Math.min( min.x, min.x / 2 );
					max.x = Math.max( min.x, 0 );
					min.y = photo.innerHeight() - bounds.height;
					min.y = Math.min( min.y, min.y / 2 );
					max.y = Math.max( min.y, 0 );
					bounds.x = Math.max( Math.min( bounds.x, max.x ), min.x );
					bounds.y = Math.max( Math.min( bounds.y, max.y ), min.y );
					nonFixedImages.each( function() {
						var image = $( this );
						image.css( "top", bounds.y );
						image.css( "left", bounds.x );
					} );
					center.x = ( photo.innerWidth() / 2 - bounds.x ) / ( bounds.width / mainImage.prop( "naturalWidth" ) );
					center.y = ( photo.innerHeight() / 2 - bounds.y ) / ( bounds.height / mainImage.prop( "naturalHeight" ) );
				};
				
				$( this ).on( "touchstart.photo-browser", function( event ) {
					var previousClientX = event.originalEvent.changedTouches[0].clientX;
					var previousClientY = event.originalEvent.changedTouches[0].clientY;
					$( document ).on( "touchmove.photo-browser", function( event ) {
						currentPhotoDOM.pbTranslate( { x: event.originalEvent.changedTouches[0].clientX - previousClientX, y: event.originalEvent.changedTouches[0].clientY - previousClientY } );
						previousClientX = event.originalEvent.changedTouches[0].clientX;
						previousClientY = event.originalEvent.changedTouches[0].clientY;
						event.stopImmediatePropagation();
						event.preventDefault();
					} );
					$( document ).on( "touchend.photo-browser", function( event ) {
						$( document ).unbind( ".photo-browser" );
						event.stopImmediatePropagation();
						event.preventDefault();
					} );
					event.stopImmediatePropagation();
					event.preventDefault();
				} );
				
				$( this ).on( "mousedown.photo-browser", function( event ) {
					if( event.which == 1 ) {
						var previousClientX = event.clientX;
						var previousClientY = event.clientY;
						$( document ).on( "mousemove.photo-browser", function( event ) {
							currentPhotoDOM.pbTranslate( { x: event.clientX - previousClientX, y: event.clientY - previousClientY } );
							previousClientX = event.clientX;
							previousClientY = event.clientY;
							event.stopImmediatePropagation();
							event.preventDefault();
						} );
						$( document ).on( "mouseup.photo-browser", function( event ) {
							$( document ).unbind( ".photo-browser" );
							event.stopImmediatePropagation();
							event.preventDefault();
						} );
						event.stopImmediatePropagation();
						event.preventDefault();
					}
				} );
				
			} );
			
			currentPhotoDOM.pbActivate();
			currentPhotoDOM.pbZoomToFit();
			
			$( window ).on( "resize.photo-browser", function() {
				currentPhotoDOM.pbResizeWindow();
			} );
		} );
	};
})(jQuery);
