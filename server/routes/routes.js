'use strict';

let express = require( 'express' ),
	util = require( 'util' ), // Node's util

	DataObject = require( '../domain/data/dataObject' ),
	authenticate = require( './auth' );

let app = express();

module.exports = app;

let controllers = [
	require( './controllers/auth.controller' )(),
	require( './controllers/player.controller' )(),
	require( './controllers/user.controller' )()
];

controllers.forEach( controller => {
	let router = express.Router(),
		/** @type {RoutingInfo} */
		routingInfo = controller.routing,
		configuredParams = new Set();

	routingInfo.routes.forEach( route => {
		setupRouteParams( route.route );

		let routerMethod = router.get,
			method = route.method ? route.method.toLowerCase() : null;

		if( router[method] ) {
			routerMethod = router[method];

			util.log(
				'Adding %s %s /api%s',
				pad( route.authenticated ? 'Authenticated' : '', 13 ),
				pad( route.method, 5 ),
				routingInfo.baseRoute + route.route
			);
		} else {
			util.error(
				'Cannot bind route %s %s',
				route.method,
				('/api' + routingInfo.baseRoute + route.route)
			);
		}

		let handle = ( req, res, next ) => handleRequest(
			req,
			res,
			next,
			controller,
			route.handler
		);

		if( route.authenticated ) {
			routerMethod.call( router, route.route, authenticate, handle );
		} else {
			routerMethod.call( router, route.route, handle );
		}
	} );

	app.use( routingInfo.baseRoute, router );

	function setupRouteParams( route ) {
		let matches = route.match( /[/]:([^:/]*)/g );
		if( !matches ) return;

		matches.map( match => match.replace( '/:', '' ) )
			.filter( name => !configuredParams.has( name ) )
			.forEach( name => {
				router.param( name, ( req, res, next, value ) => {
					util.log( 'Route param "%s" passed with value "%s"', name, value );
					req.routeParams = req.routeParams || {};
					req.routeParams[name] = value;
					next();
				} );
				configuredParams.add( name );
			} );
	}
} );

function handleRequest( req, res, next, controller, handler ) {
	let data = {
			routeParams: req.routeParams,
			body: req.body,
			user: req.user
		},
		result = handler.call( controller, data );

	if( result instanceof Promise ) {
		return result.then( val => res.send( convertResult( val ) ) )
			.catch( next );
	}

	if( result instanceof Error ) {
		return next( result );
	}

	res.send( convertResult( result ) );

	function convertResult( data ) {
		if( data instanceof DataObject ) {
			return data.data;
		}

		// Assume that if the first element in the array is a DataObject
		// then it is an array of DataObjects.
		if( data instanceof Array
			&& data.length
			&& data[0] instanceof DataObject
		) {
			return data.map( x => x.data );
		}

		return data;
	}
}

function pad( input, space ) {
	let str = input.toString();
	str += new Array( space - str.length + 1 ).join( ' ' );
	return str;
}
