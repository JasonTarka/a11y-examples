'use strict';

module.exports = construct;

let jwt = require( 'jsonwebtoken' ),

	errors = require( '../../utils/errors' ),
	userProvider = require( '../../domain/providers/user.provider' ),
	passwordUtils = require( '../../utils/password' );

class AuthController {
	constructor() {
	}

	/**
	 * @returns {UserProvider}
	 * @private
	 */
	get _provider() {
		return userProvider();
	}

	login( routeParams, body ) {
		if( !body || !body.username || !body.password ) {
			throw new errors.BadRequest(
				'Must include a username and password'
			);
		}

		let errorMessage = 'Invalid username or password';

		return this._provider.tryFetchUserByUsername( body.username )
			.then( user => {
				if( user == null ) {
					return new errors.Forbidden( errorMessage );
				}

				return passwordUtils.verify( user.password, body.password )
					.then( isValid => {
						if( !isValid ) {
							return new errors.Forbidden( errorMessage );
						}

						let token = jwt.sign(
							{
								id: user.id,
								username: user.username,
								playerId: user.playerId
							},
							process.env.TOTE_JWT_SECRET
						);

						return {
							token: token
						};
					} );
			} );
	}

	get routing() {
		return {
			baseRoute: '/auth',
			routes: [
				{
					route: '/login',
					method: 'POST',
					function: this.login,
					authenticated: false
				}
			]
		};
	}
}

/**
 * @returns {AuthController}
 */
function construct() {
	return require( '../../utils/utils' ).singleton( AuthController );
}

