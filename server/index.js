'use strict';

let express = require( 'express' ),
	logger = require( 'morgan' ),

	api = require( './routes/routes' );

let app = express(),
	development = app.get( 'env' ) === 'development';

app.use( logger( 'dev' ) );
app.use( '/api', api );

// Handle anything that doesn't have a route
app.use( ( req, res, next ) => {
	let err = new Error( 'Not Found' );
	err.status = 404;
	next( err );
} );

// General error handler
app.use( ( err, req, res ) => {
	res.status( err.status || 500 );

	/* eslint-disable no-console */
	console.error( err.message );
	console.error( err.stack );
	/* eslint-enable no-console */

	var ret = {
		message: err.message
	};

	if( development ) {
		ret.stack = err.stack;
	}

	res.send( ret );
} );

// Start the server
let server = app.listen( 3000, () => {
	let host = server.address().address,
		port = server.address().port;

	console.log( 'App listening at %s', host, port ); // eslint-disable-line
} );
