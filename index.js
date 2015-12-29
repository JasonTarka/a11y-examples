'use strict';

let express = require( 'express' ),
	logger = require( 'morgan' );

let app = express(),
	development = app.get( 'env' ) === 'development';

app.use( logger( 'dev' ) );

app.get( '/', ( req, res ) => {
	res.send( 'Hello, World!' );
} );

app.use( ( req, res, next ) => {
	let err = new Error( 'Not Found' );
	err.status = 404;
	next( err );
} );

app.use( ( err, req, res, next ) => {
	console.log( 'Error handler called' );
	console.log( err );
	res.status( err.status || 500 );

	var ret = {
		message: err.message
	};

	if( development ) {
		ret.stack = err.stack;
	}

	res.send( ret );
} );

let server = app.listen( 3000, () => {
	let host = server.address().address,
		port = server.address().port;

	console.log( 'App listening at http://%s:%s', host, port ); // eslint-disable-line
} );
