'use strict';

let api = require( 'express' )();
module.exports = api;

let routes = [
	require( './players' ),
	require( './shows' )
];

routes.forEach( x => api.use( x.baseRoute, x.router ) );
