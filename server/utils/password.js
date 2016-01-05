'use strict';
module.exports = {
	hash: hashPassword,
	verify: verifyPassword
};

let scrypt = require( 'scrypt' );

function hashPassword( password ) {
	const MAX_TIME = 0.9; // Maximum time to spend hashing (in seconds)

	let params = scrypt.paramsSync( MAX_TIME );
	let hashBuffer = scrypt.kdfSync( password, params );
	let hash = hashBuffer.toString( 'base64' );

	return hash;
}

function verifyPassword( hash, password ) {
	if( typeof hash === 'string' ) {
		hash = new Buffer( hash, 'base64' );
	} else if( !(hash instanceof Buffer) ) {
		throw new Error( 'hash must be a Buffer of base64-encoded string' );
	}

	return scrypt.verifyKdf( hash, password );
}
