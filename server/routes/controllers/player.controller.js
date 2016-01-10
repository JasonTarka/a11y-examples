'use strict';

module.exports = construct;

let RoutingInfo = require( '../data/routingInfo' ),
	Route = require( '../data/route' );


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

	get routing() {
		return new RoutingInfo(
			'/players',
			new Route(
				'/',
				this.list
			),
			new Route(
				'/:player',
				this.list
			)
		);
	}
}

function construct() {
	return require( '../../utils/utils' ).singleton( PlayerController );
}
