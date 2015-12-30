'use strict';

module.exports = construct;

class PlayerController {
	constructor() {
		this._provider = require( '../../domain/providers/player.provider' )();
	}

	list() {
		return this._provider.fetchPlayers();
	}

	view( routeParams ) {
		return new Promise( ( resolve, reject ) => {
			this._provider.fetchPlayers()
				.then( players => {
					resolve( players.find( x => x.id == routeParams.player ) );
				} )
				.catch( reject );
		} );
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
