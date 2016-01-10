'use strict';

let Route = require( './route' );

class RoutingInfo {
	constructor( baseRoute, routes ) {
		if( typeof baseRoute !== 'string' ) {
			throw new Error( '"basePath" is not valid' );
		}
		if( !(routes instanceof Array && routes.length)
			&& !(routes instanceof Route)
		) {
			throw new Error( '"routes" cannot be empty' );
		}

		if( !(routes instanceof Array) ) {
			routes = [routes];
			// 2 to skip basePath and routes
			for( let i = 2; i < arguments.length; i++ ) {
				routes.push( arguments[i] );
			}
		}

		/** @type {string} */
		this.baseRoute = baseRoute.startsWith( '/' )
			? baseRoute
			: '/' + baseRoute;


		/**@type {Route[]} */
		this.routes = routes;
	}
}

/**
 * @type {RoutingInfo}
 */
module.exports = RoutingInfo;
