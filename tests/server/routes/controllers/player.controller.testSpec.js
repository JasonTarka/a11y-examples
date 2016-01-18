'use strict';

let should = require( 'should' ),
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' ),

	errors = require( '../../../../server/utils/errors' ),
	Player = require( '../../../../server/domain/data/player' ),
	permissions = require( '../../../../server/utils/enums' ).permissions;

require( 'should-sinon' );

describe.only( 'Player Controller', () => {
	const playerId = 21,
		playerName = 'Joe Namith',
		playerEmail = 'joe.namith@example.com',
		playerBio = 'oseph William Namath, nicknamed "Broadway Joe", is a former' +
					' American football quarterback and actor.',
		playerImgPath = '/path/to/image.png';


	var PlayerController,
		/** @type {PlayerController} */
		controller,
		/** @type {Player} */
		player,
		/** @type {PlayerProviderMock} */
		playerProviderMock,
		/** @type {UserMock} */
		user,
		data;

	before( () => mockery.enable( {
		warnOnUnregistered: false
	} ) );

	after( () => {
		mockery.disable();
	} );

	beforeEach( () => {
		player = new Player( playerId, playerName, playerEmail, playerBio, playerImgPath );
		user = new UserMock();

		playerProviderMock = new PlayerProviderMock();
		mockery.registerMock(
			'../../domain/providers/player.provider',
			() => playerProviderMock
		);

		data = {
			user: user,
			routeParams: {
				player: playerId
			},
			body: {
				name: player.name,
				email: player.email,
				bio: player.bio,
				imgPath: player.imgPath
			}
		};

		// Ensure we're not using the cached version from other tests
		mockery.registerAllowable(
			'../../../../server/routes/controllers/player.controller',
			true
		);
		PlayerController = require(
			'../../../../server/routes/controllers/player.controller'
		);
		controller = new PlayerController();
	} );

	afterEach( () => mockery.deregisterAll() );

	describe( 'update', () => {
		it( 'enforces Manage Players permission', done => {
			const requiredPermission = permissions.ManagePlayers;

			user.hasManagePermission = false;
			sinon.spy( user, 'hasPermission' );

			controller.update( data )
				.then(
					() => done( new Error( 'Should have been rejected' ) )
				)
				.catch( err => {
					if( err ) return done( err );

					user.hasPermission
						.should.be.calledWith( requiredPermission );
					done();
				} );
		} );

		it( 'updates user properties', done => {
			data.body = {
				name: 'Joe Naismith',
				email: 'joe.naismith@example.net',
				bio: 'James Naismith (November 6, 1861 – November 28, 1939) was' +
					 ' a Canadian-American physical educator, physician,' +
					 ' chaplain, sports coach and innovator.',
				imgPath: '/path/to/joe.png'
			};

			sinon.stub( player, 'save', () => {
				player.name.should.equal( data.body.name );
				player.email.should.equal( data.body.email );
				player.bio.should.equal( data.body.bio );
				player.imgPath.should.equal( data.body.imgPath );
			} );

			controller.update( data )
				.then( () => {
					player.save.should.be.called();
					done();
				} )
				.catch(
					err => done( err || new Error( 'Rejected' ) )
				);
		} );

		describe( 'single properties changed', () => {
			[
				{prop: 'name', value: 'Yoda'},
				{prop: 'email', value: 'yoda@example.org'},
				{prop: 'bio', value: 'A Jedi on a far away planet'},
				{prop: 'imgPath', value: '/path/to/another.jpeg'}
			].forEach( x =>
				it( 'only updates changed property, ' + x.prop, done => {
					data.body = {};
					data.body[x.prop] = x.value;

					sinon.stub( player, 'save', () => {
						player.name.should.equal(
							data.body.name || player.name
						);
						player.email.should.equal(
							data.body.email || player.email
						);
						player.bio.should.equal(
							data.body.bio || player.bio
						);
						player.imgPath.should.equal(
							data.body.imgPath || player.imgPath
						);
					} );

					controller.update( data )
						.then( () => {
							player.save.should.be.called();
							done();
						} )
						.catch(
							err => done( err || new Error( 'Rejected' ) )
						);
				} )
			);


		} );
	} );

	describe( 'create', () => {
		it( 'creates a new player', done => {
			data.body = {
				name: 'David Bowie',
				email: 'david.bowie@example.io',
				bio: 'Trapped in a tin can',
				imgPath: '/path/to/bowie.space'
			};
			player = null;

			sinon.stub( playerProviderMock, 'createPlayer', newPlayer => {
				player = newPlayer;

				should( newPlayer ).not.be.undefined()
					.and.not.be.null();
				should( newPlayer.id ).be.undefined();
				newPlayer.name.should.equal( data.body.name );
				newPlayer.email.should.equal( data.body.email );
				newPlayer.bio.should.equal( data.body.bio );
				newPlayer.imgPath.should.equal( data.body.imgPath );

				return newPlayer;
			} );

			controller.create( data )
				.then( retPlayer => {
					playerProviderMock.createPlayer
						.should.be.calledOnce();
					retPlayer.should.be.instanceOf( Player );
					done();
				} )
				.catch(
					err => done( err || new Error( 'Error occurred' ) )
				);
		} );

		it( 'enforces Manage Players permission', done => {
			const requiredPermission = permissions.ManagePlayers;

			user.hasManagePermission = false;
			sinon.spy( user, 'hasPermission' );

			controller.create( data )
				.then(
					() => done( new Error( 'Should have been rejected' ) )
				)
				.catch( err => {
					if( err ) return done( err );

					user.hasPermission
						.should.be.calledWith( requiredPermission );
					done();
				} );
		} );
	} );

	function PlayerProviderMock() {
		this.fetchPlayer = id => new Promise( ( resolve, reject ) =>
			id == player.id
				? resolve( player )
				: reject( new errors.NotFound() )
		);

		this.createPlayer = function() {};
	}

	function UserMock() {
		this.hasManagePermission = true;
		this.hasPermission = () => new Promise( ( resolve, reject ) =>
			this.hasManagePermission ? resolve() : reject()
		);
	}
} );
