'use strict';

let DataObject = require( './dataObject' ),
	InvalidParameter = require( '../../utils/errors' ).InvalidParameter,
	passwordUtils = require( '../../utils/password' ),
	utils = require( '../../utils/utils' ),
	userProvider = require( '../providers/user.provider' ),
	errors = require( '../../utils/errors' );

const MIN_PASSWORD_LENGTH = 8,
	MAX_SALT_LENGTH = 20;

let _permissions = new WeakMap();

class User extends DataObject {
	constructor( id, username, password, salt, playerId ) {
		super( {
			id: id,
			username: username,
			password: password,
			salt: salt,
			playerId: playerId
		} );
	}

	get data() {
		let data = this._getFieldVals();
		delete data.password;
		delete data.salt;
		return data;
	}

	// ----- id -----
	get id() {
		return this._getFieldVal( 'id' );
	}

	// ----- username -----
	get username() {
		return this._getFieldVal( 'username' );
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

		this._setFieldVal( 'username', val.toString() );
	}

	// ----- password -----
	get password() {
		return this._getFieldVal( 'password' );
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

		let salt = utils.generateRandomString( MAX_SALT_LENGTH ),
			password = passwordUtils.hash( val, salt );

		this._setFieldVal( 'salt', salt );
		this._setFieldVal( 'password', password );
	}

	// ----- salt -----
	get salt() {
		return this._getFieldVal( 'salt' );
	}

	// ----- player ID -----
	get playerId() {
		return this._getFieldVal( 'playerId' );
	}

	set playerId( val ) {
		this._setFieldVal( 'playerId', val );
	}

	/**
	 * Checks if the user has a given permission or not.
	 * Resolves the promise if the permission is available, and rejects it
	 * otherwise.
	 *
	 * @param permissionId
	 * @returns {Promise}
	 */
	hasPermission( permissionId ) {
		return new Promise( ( resolve, reject ) => {
			if( !_permissions.get( this ) ) {
				userProvider().fetchPermissionsForUser( this.id )
					.then( perms => {
						_permissions.set( this, new Set(
							perms.map( x => x.id )
						) );

						if( _permissions.get( this ).has( permissionId ) ) {
							resolve();
						} else {
							reject( new errors.NotAuthorized() );
						}
					} )
					.catch( reject );
			} else if( _permissions.get( this ).has( permissionId ) ) {
				resolve();
			} else {
				reject();
			}
		} );
	}
}

/**
 * @type {User}
 */
module.exports = User;
