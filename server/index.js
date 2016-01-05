'use strict';

let express = require( 'express' ),
	logger = require( 'morgan' ),
	bodyParser = require( 'body-parser' ),

	api = require( './routes/routes' ),
	errors = require( './utils/errors' );

let app = express(),
	development = app.get( 'env' ) === 'development';

app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( '/api', api );

// Handle anything that doesn't have a route
app.use( ( req, res, next ) => {
	let err = new errors.NotFound();
	next( err );
} );

// General error handler
app.use( ( err, req, res, next ) => { // eslint-disable-line no-unused-vars
	/* eslint-disable no-console */
	console.error( err.message );
	console.error( err.stack );
	/* eslint-enable no-console */

	var ret = {
		error: err.name,
		reason: err.message
	};

	if( development ) {
		ret.stack = err.stack;
	}

	res.status( err.status || 500 )
		.send( ret );
} );

// Start the server
let server = app.listen( 3000, () => {
	let host = server.address().address,
		port = server.address().port;

	console.log( 'App listening at %s', host, port ); // eslint-disable-line
} );
