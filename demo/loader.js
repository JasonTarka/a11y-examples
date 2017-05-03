'use strict';

class Loader {

	constructor() {
		if( Loader.Instance != null )
			return Loader.Instance;

		this._loaded = new Set();
		this._loading = new Map();
		this._loadedCss = new Set();

		/** @type {Loader} */
		Loader.Instance = this;
	}

	loadAll( node ) {
		node = node || $( 'html' );

		let promises = $( '[data-src]', node ).toArray().map(
			element => this.loadElement( $( element ) )
		);

		Promise.all( promises )
			.then( () => $( 'main[aria-busy]' ).attr( 'aria-busy', 'false' ) );
	}

	loadElement( node ) {
		const name = node.attr( 'data-src' ),
			className = name[0].toUpperCase() + name.substr( 1 ),
			data = node.text().trim();

		return this.loadScript( name )
			.then( () => this.loadCss( name ) )
			.then( () => this._loaded.add( name ) )
			.then( () => this.loadHtml( name, node ) )
			.then( () => new window[className]( node, data ) )
			.catch( err => Loader.logError( err, name ) );
	}

	loadScript( name ) {
		return new Promise( ( resolve, reject ) => {
			if( this._loaded.has( name ) ) {
				// Already loaded, nothing to do
				return resolve();
			}
			if( this._loading.has( name ) ) {
				// Return the existing promise
				return this._loading.get( name )
				           .then( resolve )
				           .catch( reject );
			}

			let promise = new Promise(
				( subResolve, subReject ) => {
					let script = document.createElement( 'script' );
					script.onload = () => {
						this._loaded.add( name );
						this._loading.delete( name );
						subResolve();
					};
					script.onerror = subReject;

					document.head.appendChild( script );
					script.src = `/controls/${name}/control.js`;
				} )
				.then( resolve )
				.catch( reject );

			this._loading.set( name, promise );
		} );
	}

	loadCss( name ) {
		if( !this._loadedCss.has( name ) ) {
			$( 'body' ).append( $(
				`<link rel="stylesheet" href="/controls/${name}/control.css" />`
			) );
		}
	}

	loadHtml( name, node, location ) {
		location = location || `/controls/${name}/control.html`;

		return new Promise( ( resolve, reject ) =>
			$.ajax( {
				url: location,
				success: data => {
					$( node ).html( data );
					resolve();
				},
				error: ( jqxhr, textStatus, error ) => reject( error )
			} )
		);
	}

	static logError( err, name ) {
		console.error( `Error occurred loading "${name}": `, err );
		$( '.error:first' )
			.removeClass( 'hidden' )
			.append( `<span>Error occurred loading "${name}"</span>` )
	}
}
