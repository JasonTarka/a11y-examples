'use strict';

let DataObject = require( './dataObject' ),
	InvalidParameter = require( '../../utils/errors' ).InvalidParameter,
	passwordUtils = require( '../../utils/password' );

let _data = new WeakMap();

const MIN_PASSWORD_LENGTH = 8;

class User extends DataObject {
	constructor( id, username, password, playerId ) {
		super();

		_data.set( this, {
			id: id,
			username: username,
			password: password,
			playerId: playerId
		} );
	}

	get data() {
		return _data.get( this );
	}

	// ----- id -----
	get id() {
		return _data.get( this ).id;
	}

	// ----- username -----
	get username() {
		return _data.get( this ).username;
	}

	set username( val ) {
		if( !val ) {
			throw new InvalidParameter( '"username" must not be empty' );
		}

		if( typeof val !== 'string'
			|| !val.match( /^[a-zA-Z0-9_.-]+$/ )
		) {
			throw new InvalidParameter( '"username" is not valid' );
		}

		_data.get( this ).username = val.toString();
		super.markDirty( 'username' );
	}

	// ----- password -----
	get password() {
		return _data.get( this ).password;
	}

	set password( val ) {
		if( !val
			|| typeof val !== 'string'
		) {
			throw new InvalidParameter( '"password" must not be empty' );
		} else if( val.length < MIN_PASSWORD_LENGTH ) {
			throw new InvalidParameter(
				'"password" must have at least ' + MIN_PASSWORD_LENGTH + ' characters'
			);
		}

		_data.get( this ).password = passwordUtils.hash( val );
		super.markDirty( 'password' );
	}

	// ----- player ID -----
	get playerId() {
		return _data.get( this ).playerId;
	}

	set playerId( val ) {
		_data.get( this ).playerId = val;
		super.markDirty( 'playerId' );
	}
}

/**
 * @type {User}
 */
module.exports = User;
