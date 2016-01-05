'use strict';

module.exports = construct;

let database = require( './database' ),
	singleton = require( '../../utils/utils' ).singleton,
	errors = require( '../../utils/errors' ),
	User = require( '../data/user' );

class UserProvider {
	constructor() {
		this._db = database();
	}

	/**
	 * @param user {User}
	 */
	createUser( user ) {
		let sql = 'INSERT INTO users(username, password, playerId) ' +
				  'VALUES(?, ?, ?)',
			values = [user.username, user.password, user.playerId];

		return this._db.executeInsert( sql, values )
			.then( newId => this.fetchUser( newId ) );
	}

	fetchUsers() {
		let sql = 'SELECT * FROM users WHERE deleted = 0';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql )
				.then(
					rows => resolve( rows.map( createUser ) )
				)
				.catch( reject );
		} );
	}

	fetchUser( userId ) {
		let sql = 'SELECT * FROM users WHERE id = ? AND deleted = 0';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql, [userId] )
				.then( users => {
					if( !users || users.length == 0 ) {
						return reject(
							new errors.NotFound( 'User not found' )
						);
					}
					resolve( createUser( users[0] ) );
				} )
				.catch( reject );
		} );
	}

	/**
	 * Try to fetch the user matching the given username.
	 * If no user is found then the promise will be resolved with {null}.
	 *
	 * @param username
	 * @returns {Promise}
	 */
	tryFetchUserByUsername( username ) {
		let sql = 'SELECT * FROM users WHERE username = ? AND deleted = 0';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql, [username] )
				.then( users => {
					if( !users || users.length == 0 ) {
						return resolve( null );
					}
					resolve( createUser( users[0] ) );
				} )
				.catch( reject );
		} );
	}
}

function createUser( row ) {
	let user = new User(
		row.id,
		row.username,
		row.password,
		row.playerId
	);
	return user;
}

/**
 * @returns {UserProvider}
 */
function construct() {
	return singleton( UserProvider );
}
