'use strict';

module.exports = construct;

let database = require( './database' ),
	singleton = require( '../../utils/utils' ).singleton,
	errors = require( '../../utils/errors' ),
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
						return reject(
							new errors.NotFound( 'Player not found' )
						);
					}
					resolve( createPlayer( players[0] ) );
				} )
				.catch( reject );
		} );
	}

	/**
	 * @param player {Player}
	 */
	updatePlayer( player ) {
		return new Promise( (resolve, reject) => {
			let sql = 'UPDATE players SET',
				updates = '',
				params = [];

			if( !player.isDirty ) {
				return resolve();
			}

			let data = player.data;

			player.dirtyFields.forEach( field => {
				updates += (updates ? ', ' : ' ') + field + ' = ?';
				params.push( data[field] );
			} );

			sql = sql + updates + ' WHERE id = ?';
			params.push( player.id );

			this._db.executeNonQuery( sql, params )
				.then( () => {
					player.markClean();
					resolve();
				} );
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
