'use strict';

let userProvider = require( '../../domain/providers/user.provider' ),
	User = require( '../../domain/data/user' );

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

	view( routeParams ) {
		let userId = routeParams.user;

		return this._provider.fetchUsers( userId );
	}

	create( routeParams, body ) {
		// TODO: permission checks
		let user = new User();
		user.username = body.username;
		user.password = body.password;
		user.playerId = body.playerId;

		return this._provider.createUser( user );
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
