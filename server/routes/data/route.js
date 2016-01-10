'use strict';

class Route {
	constructor( route, handler, method, authenticated ) {
		if( typeof route !== 'string' ) {
			throw new Error( '"route" is not valid' );
		}
		if( typeof handler !== 'function' ) {
			throw new Error( '"handler" must be a function' );
		}

		/** @type {string} */
		this.route = route.startsWith( '/' ) ? route : '/' + route;
		/** @type {function} */
		this.handler = handler;
		/** @type {string} */
		this.method = method || 'GET';
		/** @type {boolean} */
		this.authenticated = !!authenticated;
	}
}

/**
 * @type {Route}
 */
module.exports = Route;
