'use strict';

module.exports = construct;

let RoutingInfo = require( '../data/routingInfo' ),
	Route = require( '../data/route' ),
	permissions = require( '../../utils/enums' ).permissions;


class PlayerController {
	constructor() {
		this._provider = require( '../../domain/providers/player.provider' )();
	}

	list() {
		return this._provider.fetchPlayers();
	}

	view( data ) {
		let playerId = data.routeParams.player;

		return this._provider.fetchPlayer( playerId );
	}

	update( data ) {
		let playerId = data.routeParams.player,
			body = data.body;

		return data.user.hasPermission( permissions.ManagePlayers )
			.then( () => this._provider.fetchPlayer( playerId ) )
			.then( player => {
				player.name = body.name || player.name;
				player.email = body.email || player.email;
				player.bio = body.bio || player.bio;
				player.imgPath = body.imgPath || player.imgPath;
				return player.save();
			} );
	}

	get routing() {
		return new RoutingInfo(
			'/players',
			new Route(
				'/',
				this.list
			),
			new Route(
				'/:player',
				this.view
			),
			new Route(
				'/:player',
				this.update,
				'PATCH',
				true
			)
		);
	}
}

function construct() {
	return require( '../../utils/utils' ).singleton( PlayerController );
}
