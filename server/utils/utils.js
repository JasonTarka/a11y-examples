'use strict';

module.exports = {
	singleton: singleton,
	clone: clone,
	generateRandomString: generateRandomString,
	setToArray: setToArray
};

let crypto = require( 'crypto' );

function singleton( type ) {
	var self = singleton;
	if( !self.instances ) {
		self.instances = new WeakMap();
	}

	if( !self.instances.has( type )
		|| !(self.instances.get( type ) instanceof type)
	) {
		let obj = new type();
		self.instances.set( type, obj );
	}

	return self.instances.get( type );
}

function clone( obj ) {
	var copy;

	if( obj == null || typeof obj !== 'object' ) {
		return obj;
	}
	if( obj instanceof Array ) {
		copy = [];
		obj.forEach( x => copy.push( x ) );
		return copy;
	}
	if( obj instanceof Date ) {
		copy = new Date();
		copy.setTime( obj.getTime() );
		return copy;
	}
	if( obj instanceof Object ) {
		copy = new obj.constructor();

		Object.keys( obj )
			.filter( x => obj.hasOwnProperty( x ) )
			.forEach( key => {
				copy[key] = clone( obj[key] );
			} );
	}

	return copy;
}

function generateRandomString( maxLength ) {
	let length = Math.floor( maxLength / 2 );

	return crypto.randomBytes( length )
		.toString( 'hex' );
}

function setToArray( set ) {
	if( !(set instanceof Set) ) {
		throw new Error( 'Not a set' );
	}

	let arr = [];
	set.forEach( x => arr.push( x ) );
	return arr;
}
