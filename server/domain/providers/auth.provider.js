'use strict';

module.exports = construct;

let database = require( './database' ),
	utils = require( '../../utils/utils' ),
	errors = require( '../../utils/errors' ),
	AuthSession = require( '../data/authSession' );

const SESSION_KEY_LENGTH = 20;

class AuthProvider {
	constructor() {
		this._sessionLength = process.env.TOTE_SESSION_LENGTH_MINUTES
			? process.env.TOTE_SESSION_LENGTH_MINUTES
			: 300;
	}

	/**
	 * @returns {Database}
	 * @private
	 */
	get _db() {
		return database();
	}

	get _newValidUntilDate() {
		let date = new Date(),
			millis = this._sessionLength * 60 * 1000;
		date.setTime( date.getTime() + millis );

		return date;
	}

	/**
	 * @param userId
	 * @returns {Promise.<AuthSession>}
	 */
	createAuthSession( userId ) {
		let sql = 'INSERT INTO user_auth_sessions' +
				  '(userId, sessionKey, validUntilDate, lastUsedDate)' +
				  ' VALUES(?,?,?,?)',
			sessionKey = utils.generateRandomString( SESSION_KEY_LENGTH ),
			params = [
				userId,
				sessionKey,
				this._newValidUntilDate,
				new Date()
			];

		return this._db.executeInsert( sql, params )
			.then( () => this.fetchAuthSession( userId, sessionKey ) );
	}

	/**
	 * @param userId
	 * @param sessionKey
	 * @returns {Promise.<AuthSession>}
	 */
	fetchAuthSession( userId, sessionKey ) {
		let sql = 'SELECT userId, sessionKey, dateCreated, ' +
				  'validUntilDate, lastUsedDate' +
				  ' FROM user_auth_sessions' +
				  ' WHERE userId = ?' +
				  '   AND sessionKey = ?',
			params = [userId, sessionKey];

		return this._db.executeQuery( sql, params )
			.then( rows => {
				if( !rows || !rows.length ) {
					throw new errors.Forbidden();
				}
				return createAuthSession( rows[0] );
			} );
	}

	markAuthSessionUsed( userId, sessionKey ) {
		let sql = 'UPDATE user_auth_sessions' +
				  ' SET validUntilDate = ?,' +
				  ' lastUsedDate = NOW()' +
				  ' WHERE userId = ?' +
				  ' AND sessionKey = ?',
			params = [
				this._newValidUntilDate,
				userId,
				sessionKey
			];

		return this._db.executeNonQuery( sql, params );
	}
}

function createAuthSession( row ) {
	let session = new AuthSession(
		row.userId,
		row.sessionKey,
		row.dateCreated,
		row.validUntilDate,
		row.lastUsedDate
	);
	return session;
}

/**
 * @returns {AuthProvider}
 */
function construct() {
	return utils.singleton( AuthProvider );
}
