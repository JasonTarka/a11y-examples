'use strict';

module.exports = construct;

class UserController {
	constructor() {
		this._provider = require( '../../domain/providers/player.provider' )();
	}

	list() {
		return this._provider.fetchPlayers();
	}

	view( routeParams ) {
		let playerId = routeParams.player;

		return this._provider.fetchPlayer( playerId );
	}

	create( routeParams, body ) {

	}

	get routing() {
		return {
			baseRoute: '/users',
			routes: [
				{
					route: '/view/:user',
					method: 'GET',
					function: this.view,
					authenticated: false
				},
				{
					route: '/create',
					method: 'POST',
					function: this.create,
					authenticated: true
				},
				{
					route: '/',
					method: 'GET',
					function: this.list,
					authenticated: false
				}
			]
		};
	}
}

function construct() {
	return require( '../../utils/utils' ).singleton( UserController );
}
