'use strict';

let express = require( 'express' );
let app = express();

module.exports = app;

let controllers = [
	require( './controllers/player.controller' )()
];

controllers.forEach( controller => {
	let router = express.Router(),
		routing = controller.routing,
		baseRoute = routing.baseRoute,
		configuredParams = new Set();

	routing.routes.forEach( route => {
		setupRouteParams( route.route );

		router.use(
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
		result = handler.call( controller, routeParams );

	if( result instanceof Promise ) {
		return result.then( val => res.send( val ) )
			.catch( next );
	}

	if( result instanceof Error ) {
		return next( result );
	}

	res.send( result );
}
