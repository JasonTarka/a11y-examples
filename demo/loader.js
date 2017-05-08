'use strict';

class Loader {

	constructor() {
		if( Loader.Instance != null )
			return Loader.Instance;

		this._loaded = new Set();
		this._loading = new Map();
		this._loadedCss = new Set();
		this._loadingHtml = new Map();
		this._loadedHtml = new Map();

		/** @type {Loader} */
		Loader.Instance = this;
	}

	loadAll( node ) {
		node = node || $( 'main[aria-busy]' );

		let promises = $( '[data-src]', node ).toArray().map(
			element => this.loadElement( $( element ) )
		);

		Promise.all( promises )
			.then( () => node.attr( 'aria-busy', 'false' ) );
	}

	loadElement( node ) {
		const name = node.attr( 'data-src' ),
			className = name[0].toUpperCase() + name.substr( 1 );
		let data = node.text().trim();

		return this.loadScript( name )
			.then( () => this.loadCss( name ) )
			.then( () => this.loadHtml( name, node ) )
			.then( () => new window[className]( node, JSON.parse( data ) ) )
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
			this._loadedCss.add( name );
			$( 'body' ).append( $(
				`<link rel="stylesheet" href="/controls/${name}/control.css" />`
			) );
		}
	}

	loadHtml( name, node, location ) {
		let useCache = false;
		if( !location ) {
			location = `/controls/${name}/control.html`;
			useCache = true;
		}

		return new Promise( (resolve, reject) => {
			if( useCache && this._loadedHtml.has( name ) ) {
				$(node).html( this._loadedHtml.get( name ) );
				resolve();
			} else if (useCache && this._loadingHtml.has( name ) ) {
				this._loadingHtml.get( name )
					.then( () => {
						$( node ).html( this._loadedHtml.get( name ) );
						resolve();
					} )
					.catch( reject );
			} else {
				let promise = new Promise( ( subResolve, subReject ) =>
						$.ajax( {
							url: location,
							success: data => {
								this._loadedHtml.set( name, data );
								$( node ).html( data );
								subResolve();
								this._loadingHtml.delete( name );
							},
							error: ( jqxhr, textStatus, error ) => subReject( error )
						} )
					).then( resolve )
					.catch( reject );
				this._loadingHtml.set( name, promise );
			}
		} );


	}

	static logError( err, name ) {
		console.error( `Error occurred loading "${name}": `, err );
		$( '.error:first' )
			.removeClass( 'hidden' )
			.append( `<span>Error occurred loading "${name}"</span>` )
	}
}
