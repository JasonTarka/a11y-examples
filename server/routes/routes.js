'use strict';

let express = require( 'express' ),
	DataObject = require( '../domain/data/dataObject' );

let app = express();

module.exports = app;

let controllers = [
	require( './controllers/auth.controller' )(),
	require( './controllers/player.controller' )()
];

controllers.forEach( controller => {
	let router = express.Router(),
		routing = controller.routing,
		baseRoute = routing.baseRoute,
		configuredParams = new Set();

	routing.routes.forEach( route => {
		setupRouteParams( route.route );

		let routerMethod = router.get,
			method = route.method ? route.method.toLowerCase() : null;

		console.log( 'Method is: ', method );
		if( method && router[method] ) {
			routerMethod = router[method];
		}

		console.log(
			'Adding ' + (route.method || 'GET') + ' /api' + baseRoute + route.route
		);
		routerMethod.call(
			router,
			route.route,
			( req, res, next ) => handleRequest( req, res, next, controller, route.function )
		);
	} );

	app.use( baseRoute, router );

	function setupRouteParams( route ) {
		let matches = route.match( /[/]:([^:/]*)/g );
		if( !matches ) return;

		matches.map( match => match.replace( '/:', '' ) )
			.filter( name => !configuredParams.has( name ) )
			.forEach( name => {
				router.param( name, ( req, res, next, value ) => {
					console.log( 'Route param "%s" passed with value "%s"', name, value );
					req.routeParams = req.routeParams || {};
					req.routeParams[name] = value;
					next();
				} );
				configuredParams.add( name );
			} );
	}
} );

function handleRequest( req, res, next, controller, handler ) {
	let routeParams = req.routeParams,
		body = req.body,
		result = handler.call( controller, routeParams, body );

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
