'use strict';

let passport = require( 'passport' ),
	JwtStrategy = require( 'passport-jwt' ).Strategy,

	authProvider = require( '../domain/providers/auth.provider' ),
	userProvider = require( '../domain/providers/user.provider' );

module.exports = createAuthStrategy();

function createAuthStrategy() {
	let options = {
		secretOrKey: process.env.TOTE_JWT_SECRET
	};

	passport.use(
		new JwtStrategy(
			options,
			( jwt, done ) =>
				validateSession( jwt.id, jwt.sessionKey )
					.then( (userId) => userProvider().fetchUser( userId ) )
					.then( user => done( null, user ) )
					.catch( () => done( null, false ) )
		)
	);

	return passport.authenticate( 'jwt', {session: false} );
}

function validateSession( userId, sessionKey ) {
	return new Promise( (resolve, reject) => {
		authProvider().fetchAuthSession( userId, sessionKey )
			.then( authSession => {
				if( !authSession.isValid ) {
					return reject();
				}

				authSession.markUsed();
				resolve( userId );
			} )
			.catch( reject );
	} );
}
