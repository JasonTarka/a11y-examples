'use strict';

let mysql = require( 'mysql' );
module.exports = construct;

class Database {
	constructor( host, database, user, password ) {
		this._pool = mysql.createPool( {
			host: host,
			database: database,
			user: user,
			password: password,

			// Pool settings
			connectionLimit: 100,
			debug: false
		} );
	}

	executeQuery( sql, params ) {
		params = params || [];
		return new Promise( ( resolve, reject ) => {
			this._conn
				.then( connection => {
					connection.query( sql, params, ( err, rows ) => {
						connection.release();
						if( err ) {
							return reject( err );
						}
						resolve( rows );
					} );
				} )
				.catch( reject );
		} );
	}

	/**
	 * Execute an INSERT query, getting the newly inserted ID as a result
	 * @param sql The SQL to execute
	 * @param params The ordered parameters of the SQL
	 * @returns {Promise.<Number>}
	 */
	executeInsert( sql, params ) {
		return this.executeQuery( sql, params )
			.then( result => result.insertId );
	}

	get _conn() {
		return new Promise( ( resolve, reject ) => {
			this._pool.getConnection( ( err, connection ) => {
				if( err ) {
					connection.release();
					return reject( new Error( 'Error getting database connection' ) );
				}

				resolve( connection );
			} );
		} );
	}
}

/**
 * @returns {Database}
 */
function construct() {
	if( construct._instance instanceof Database ) {
		return construct._instance;
	}

	construct._instance = new Database(
		process.env.TOTE_DB_HOST,
		process.env.TOTE_DB_DATABASE,
		process.env.TOTE_DB_USER,
		process.env.TOTE_DB_PASSWORD
	);

	return construct._instance;
}
