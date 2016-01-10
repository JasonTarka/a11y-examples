'use strict';

/***** 4xx *****/

class BadRequest extends Error {
	constructor( message ) {
		super( message || 'Bad Request Parameters' );
		this.name = 'Bad Request';
		this.status = 400;
	}
}

class InvalidParameter extends BadRequest {
	constructor( message ) {
		super( message || 'Invalid Parameter' );
	}
}

class NotAuthorized extends Error {
	constructor( message ) {
		super( message || 'Not Authorized' );
		this.name = 'Not Authorized';
		this.status = 401;
	}
}

class Forbidden extends Error {
	constructor( message ) {
		super( message || 'Forbidden' );
		this.name = 'Forbidden';
		this.status = 403;
	}
}

class NotFound extends Error {
	constructor( message ) {
		super( message || 'Not Found' );
		this.name = 'Not Found';
		this.status = 404;
	}
}

/***** 5xx *****/

class InternalServerError extends Error {
	constructor( message ) {
		super( message );
		this.name = 'Internal Server Error';
		this.status = 500;
	}
}

/**
 * For when a function has not been implemented, or correctly overridden.
 * Should never reach the user, but results in a generic 500 error.
 */
class FunctionNotImplemented extends InternalServerError {
	constructor( message ) {
		super( message || 'Function not implemented' );
	}
}

/**
 * For when a feature has not been implemented in the API.
 * Specifically a 501 error.
 */
class FeatureNotImplemented extends InternalServerError {
	constructor( message ) {
		super( message || 'Not Implemented' );
		this.status = 501;
	}
}

module.exports = {
	BadRequest: BadRequest,
	NotAuthorized: NotAuthorized,
	Forbidden: Forbidden,
	NotFound: NotFound,

	InvalidParameter: InvalidParameter,
	FunctionNotImplemented: FunctionNotImplemented,
	FeatureNotImplemented: FeatureNotImplemented
};
