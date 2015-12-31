'use strict';

class InvalidParameter extends Error {
	constructor( message ) {
		super( message || 'Invalid Parameter' );
		super.message = message || 'Invalid Parameter';
		this.status = 400;
	}
}

class NotFound extends Error {
	constructor( message ) {
		super( message || 'Not Found' );
		this.status = 404;
	}
}

/**
 * For when a function has not been implemented, or correctly overridden.
 * Should never reach the user, but results in a generic 500 error.
 */
class FunctionNotImplemented extends Error {
	constructor( message ) {
		super( message || 'Function not implemented' );
		this.status = 500;
	}
}

/**
 * For when a feature has not been implemented in the API.
 * Specifically a 501 error.
 */
class FeatureNotImplemented extends Error {
	constructor( message ) {
		super( message || 'Not Implemented' );
		this.status = 501;
	}
}

module.exports = {
	NotFound: NotFound,
	InvalidParameter: InvalidParameter,
	FunctionNotImplemented: FunctionNotImplemented,
	FeatureNotImplemented: FeatureNotImplemented
};
