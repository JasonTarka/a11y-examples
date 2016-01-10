'use strict';

let userProvider = require( '../../domain/providers/user.provider' ),
	User = require( '../../domain/data/user' ),
	permissions = require( '../../utils/enums' ).permissions;

module.exports = construct;

class UserController {
	constructor() {
	}

	/**
	 * @returns {UserProvider}
	 * @private
	 */
	get _provider() {
		return userProvider();
	}

	list() {
		return this._provider.fetchUsers();
	}

	view( data ) {
		let userId = data.routeParams.user;

		return this._provider.fetchUsers( userId );
	}

	create( data ) {
		return data.user.hasPermission( permissions.ManagePlayers )
			.then( () => {
				let body = data.body;
				let user = new User();
				user.username = body.username;
				user.password = body.password;
				user.playerId = body.playerId;

				return this._provider.createUser( user );
			} );
	}

	get routing() {
		return {
			baseRoute: '/users',
			routes: [
				{
					route: '/view/:user',
					method: 'GET',
					function: this.view,
					authenticated: true
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
					authenticated: true
				}
			]
		};
	}
}

function construct() {
	return require( '../../utils/utils' ).singleton( UserController );
}
