'use strict';

module.exports = construct;

let jwt = require( 'jsonwebtoken' ),

	RoutingInfo = require( '../data/routingInfo' ),
	Route = require( '../data/route' ),
	errors = require( '../../utils/errors' ),
	userProvider = require( '../../domain/providers/user.provider' ),
	authProvider = require( '../../domain/providers/auth.provider' ),
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

	/**
	 * @returns {AuthProvider}
	 * @private
	 */
	get _authProvider() {
		return authProvider();
	}

	login( data ) {
		let body = data.body;

		if( !body || !body.username || !body.password ) {
			throw new errors.BadRequest(
				'Must include a username and password'
			);
		}

		let errorMessage = 'Invalid username or password';

		return this._provider.tryFetchUserByUsername( body.username )
			.then( user => {
				if( user == null ) {
					throw new errors.Forbidden( errorMessage );
				}

				return passwordUtils.verify( user.password, body.password )
					.then( isValid => {
						if( !isValid ) {
							throw new errors.Forbidden( errorMessage );
						}
					} )
					.then(
						() => this._authProvider.createAuthSession( user.id )
					)
					.then( authSession => {
						let token = jwt.sign(
							{
								id: user.id,
								username: user.username,
								playerId: user.playerId,
								sessionKey: authSession.sessionKey
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
		return new RoutingInfo(
			'/auth',
			new Route(
				'/login',
				this.login,
				'POST'
			)
		);
	}
}

/**
 * @returns {AuthController}
 */
function construct() {
	return require( '../../utils/utils' ).singleton( AuthController );
}

