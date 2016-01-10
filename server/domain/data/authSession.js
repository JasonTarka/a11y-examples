'use strict';

let authProvider = require( '../providers/auth.provider' );

class AuthSession {
	constructor( userId, sessionKey, dateCreated, validUntil, lastUsed ) {
		this.userId = userId;
		this.sessionKey = sessionKey;
		this.dateCreated = new Date( dateCreated );
		this.validUntil = new Date( validUntil );
		this.lastUsed = new Date( lastUsed );
	}

	get isValid() {
		let now = new Date();
		return now < this.validUntil;
	}

	markUsed() {
		authProvider().markAuthSessionUsed( this.userId, this.sessionKey );
	}
}

/**
 * @type {AuthSession}
 */
module.exports = AuthSession;
