'use strict';

module.exports = construct;

let database = require( './database' ),
	singleton = require( '../../utils/utils' ).singleton;

class PlayerProvider {
	constructor() {
		this._db = database();
	}

	fetchPlayers() {
		return new Promise( ( resolve, reject ) => {
			let sql = 'SELECT * FROM players';
			this._db.executeQuery( sql )
				.then( rows => {
					resolve( rows );
				} )
				.catch( reject );
		} );
	}
}

/**
 * @returns {PlayerProvider}
 */
function construct() {
	return singleton( PlayerProvider );
}
