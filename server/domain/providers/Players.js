'use strict';

module.exports = construct;

let database = require( './Database' );

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
	if( construct._instance instanceof PlayerProvider ) {
		return construct._instance;
	}

	construct._instance = new PlayerProvider();
	return construct._instance;
}
