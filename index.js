'use strict';

const express = require( 'express' );

const port = process.env.NODE_PORT || 3000,
	host = process.env.NODE_IP || 'localhost';

const app = express();

app.use( express.static( 'demo' ) );
app.use( '/examples', express.static( 'examples' ) );

app.listen( port, () => {
	console.log( `Demo listening on http://${host}:${port}` );
} );