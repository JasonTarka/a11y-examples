'use strict';

class Loader {
	constructor() {
		this._loaded = new Set();
		this._loading = new Set();
	}

	loadAll() {
		let self = this;
		$( '[data-src]' ).each( function() {
			self.loadElement( $( this ) );
		} );
	}

	loadElement( node ) {
		const name = node.attr( 'data-src' ),
			className = name[0].toUpperCase() + name.substr( 1 ),
			data = node.text().trim();

		this.loadScript( name )
			.then( () => this.loadCss( name ) )
			.then( () => this._loaded.add( name ) )
			.then( () => this.loadHtml( name, node ) )
			.then( () => new window[className]( node, data ) )
			.then( () => $( 'main[aria-busy]' ).attr( 'aria-busy', 'false' ) )
			.catch( error );

		function error( err ) {
			console.error( `Error occurred loading ${name}: `, err )
			$( '.error:first' )
				.removeClass( 'hidden' )
				.append( `<span>Error occurred loading ${name}</span>` )
		}
	}

	loadScript( name ) {
		return new Promise( ( resolve, reject ) => {
			if( this._loaded.has( name ) || this._loading.has( name ) ) {
				resolve();
			} else {
				this._loading.add( name );
				$.getScript( `/examples/${name}/control.js` )
					.done( () => resolve() )
					.fail( ( jqxhr, settings, exception ) => reject( exception ) );
			}
		} );
	}

	loadCss( name ) {
		if( !this._loaded.has( name ) ) {
			$( 'body' ).append( $(
				`<link rel="stylesheet" href="/examples/${name}/control.css" />`
			) );
		}
	}

	loadHtml( name, node ) {
		return new Promise( ( resolve, reject ) =>
			$.ajax( {
				url: `/examples/${name}/control.html`,
				success: data => {
					$( node ).html( data );
					resolve();
				},
				error: ( jqxhr, textStatus, error ) => reject( error )
			} )
		);
	}
}
