'use strict';

let should = require( 'should' ),
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' ),
	jwt = require( 'jsonwebtoken' ),

	errors = require( '../../../../server/utils/errors' ),
	User = require( '../../../../server/domain/data/user' ),
	AuthSession = require( '../../../../server/domain/data/authSession' );

require( 'should-sinon' );

describe( 'Auth Controller', () => {
	const username = 'Darth.Vader',
		password = 'the password of the user',
		jwtSecret = '12345';

	var AuthController,
		/** @type {AuthController} */
		controller,
		/** @type {User} */
		user,
		/** @type {UserProviderMock} */
		userProviderMock,
		/** @type {AuthProviderMock} */
		authProviderMock,
		data;

	before( () => {
		mockery.enable( {
			warnOnUnregistered: false
		} );
	} );

	after( () => {
		mockery.disable();
	} );

	beforeEach( () => {
		userProviderMock = new UserProviderMock();
		mockery.registerMock(
			'../../domain/providers/user.provider',
			() => userProviderMock
		);
		mockery.registerMock(
			'../providers/user.provider',
			() => userProviderMock
		);

		authProviderMock = new AuthProviderMock();
		mockery.registerMock(
			'../../domain/providers/auth.provider',
			() => authProviderMock
		);

		user = new User( 42 );
		user.username = username;
		user.password = password;
		user.markClean();

		userProviderMock.user = user;
		data = {
			body: {
				username: username,
				password: password
			}
		};

		AuthController = require(
			'../../../../server/routes/controllers/auth.controller'
		);
		controller = new AuthController();
		controller.jwtSecret = jwtSecret;
	} );

	afterEach( () => {
		mockery.deregisterAll();
	} );

	describe( 'login', () => {
		it( 'rejects with Forbidden when no user is found', done => {
			userProviderMock.user.username = 'something.else';

			controller.login( data )
				.then(
					() => done( new Error( 'Should have thrown error' ) ),
					err => {
						err.should.be.instanceOf( errors.Forbidden );
						done();
					}
				)
				.catch( done );
		} );

		it( 'rejects with Forbidden when password is wrong', done => {
			data.body.password = 'the wrong password';

			controller.login( data )
				.then(
					() => done( new Error( 'Should have been rejected' ) ),
					err => {
						err.should.be.instanceOf( errors.Forbidden );
						done();
					}
				)
				.catch( done );
		} );

		describe( 'valid credentials', () => {
			it( 'creates a new auth session', done => {
				sinon.spy( authProviderMock, 'createAuthSession' );

				controller.login( data )
					.then( () => {
						authProviderMock.createAuthSession
							.should.be.calledWith( user.id );
						done();
					} )
					.catch( done );
			} );

			it( 'eventually returns a valid JWT', done => {
				controller.login( data )
					.then( result => {
						should( result ).not.be.undefined()
							.and.not.be.null()
							.and.have.property( 'token' );

						let obj = jwt.verify( result.token, jwtSecret );
						obj.should.have.properties( {
							id: user.id,
							username: username,
							sessionKey: authProviderMock.sessionKey
						} );

						done();
					} )
					.catch( done );
			} );
		} );
	} );

	function UserProviderMock() {
		this.user = null;
		this.tryFetchUserByUsername = username =>
			new Promise( ( resolve ) => resolve(
				this.user && this.user.username == username
					? this.user
					: null
			) );
	}

	function AuthProviderMock() {
		this.sessionKey = 'a1b2c3d4';
		this.createAuthSession =
			() => new AuthSession( user.id, this.sessionKey );
	}
} );
