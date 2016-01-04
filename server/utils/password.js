'use strict';
module.exports = {
	hash: hashPassword,
	verify: verifyPassword
};

let scrypt = require( 'scrypt' );

function hashPassword( password ) {
	const MAX_TIME = 0.9; // Maximum time to spend hashing (in seconds)

	return scrypt.params( MAX_TIME )
		.then( params => scrypt.kdf( password, params ) )
		.then( hash => hash.toString( 'base64' ) );
}

function verifyPassword( hash, password ) {
	if( typeof hash === 'string' ) {
		hash = new Buffer( hash, 'base64' );
	} else if( !(hash instanceof Buffer) ) {
		throw new Error( 'hash must be a Buffer of base64-encoded string' );
	}

	return scrypt.verifyKdf( hash, password );
}
