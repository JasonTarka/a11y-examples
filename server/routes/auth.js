'use strict';

let passport = require( 'passport' ),
	JwtStrategy = require( 'passport-jwt' ).Strategy,

	userProvider = require( '../domain/providers/user.provider' );

module.exports = createAuthStrategy();

function createAuthStrategy() {
	let options = {
		secretOrKey: process.env.TOTE_JWT_SECRET
	};

	passport.use(
		new JwtStrategy(
			options,
			( jwt_user, done ) =>
				userProvider().fetchUser( jwt_user.id )
					.then( user => done( null, user ) )
					.catch( () => done( null, false ) )
		)
	);

	return passport.authenticate( 'jwt', {session: false} );
}
