'use strict';

module.exports = construct;

let database = require( './database' ),
	singleton = require( '../../utils/utils' ).singleton,
	errors = require( '../../utils/errors' ),
	tools = require( './providerTools' ),
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

	createPlayer( player ) {
		let sql = 'INSERT INTO players(name, email, bio, imgPath) ' +
				  'VALUES(?, ?, ?, ?)',
			values = [
				player.name,
				player.email,
				player.bio,
				player.imgPath
			];

		return this._db.executeInsert( sql, values )
			.then( newId => this.fetchPlayer( newId ) );
	}

	/**
	 * @param player {Player}
	 */
	updatePlayer( player ) {
		return new Promise( ( resolve, reject ) => {
			if( !player.isDirty ) {
				return resolve();
			}

			let statement = tools.generateUpdateStatement( player, 'players' );

			this._db.executeNonQuery( statement.sql, statement.params )
				.then( () => {
					player.markClean();
					resolve();
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
