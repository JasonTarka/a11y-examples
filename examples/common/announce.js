'use strict';

// The amount of time to delay the announcement for, allowing any
// focus changes to occur first
const ANNOUNCE_DELAY = 250;

class Announce {
	static announce( text ) {
		let container = $( '[aria-live]:first' );
		if( !container.length ) {
			container = $( `<span aria-live="polite" aria-atomic="true" class="offscreen"></span>` );
			$('body').append( container );
		}

		// Empty the text first to ensure the entire contents change.
		// aria-atomic="true" is supposed to take care of this, but if you're
		// re-announcing the same text (eg: "Done editing.") as what's already
		// there,
		container.text( '' );
		setTimeout(
			() => container.text( text ),
			ANNOUNCE_DELAY
		);
	}
}
