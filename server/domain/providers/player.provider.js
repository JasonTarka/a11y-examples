'use strict';

module.exports = construct;

let database = require( './database' ),
	singleton = require( '../../utils/utils' ).singleton,
	Player = require( '../data/player' );

class PlayerProvider {
	constructor() {
		this._db = database();
	}

	fetchPlayers() {
		let sql = 'SELECT * FROM players';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql )
				.then(
					rows => resolve( rows.map( createPlayer ) )
				)
				.catch( reject );
		} );
	}

	fetchPlayer( playerId ) {
		let sql = 'SELECT * FROM players WHERE id = ?';

		return new Promise( ( resolve, reject ) => {
			this._db.executeQuery( sql, [playerId] )
				.then( players => {
					if( !players || players.length == 0 ) {
						let err = new Error( 'Player not found' );
						err.status = 404;
						return reject( err );
					}
					resolve( createPlayer( players[0] ) );
				} )
				.catch( reject );
		} );
	}
}

function createPlayer( row ) {
	let player = new Player(
		row.id,
		row.name,
		row.email,
		row.bio,
		row.imgPath
	);
	return player;
}

/**
 * @returns {PlayerProvider}
 */
function construct() {
	return singleton( PlayerProvider );
}
