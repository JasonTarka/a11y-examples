'use strict';

module.exports = construct;

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
		return {
			baseRoute: '/players',
			routes: [
				{
					route: '/view/:player',
					function: this.view,
					authenticated: false
				},
				{
					route: '/',
					function: this.list,
					authenticated: false
				}
			]
		};
	}
}

function construct() {
	return require( '../../utils/utils' ).singleton( PlayerController );
}
