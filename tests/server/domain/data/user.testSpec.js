'use strict';

let should = require( 'should' ),

	User = require( '../../../../server/domain/data/user' );

describe( 'User data object', () => {
	const id = 56,
		username = 'my username',
		password = '123456',
		playerId = 45;

	var user;

	beforeEach( () => {
		user = new User( id, username, password, playerId );
	} );

	it( 'should populate fields from constructor', () => {
		user = new User( id, username, password, playerId );

		user.id.should.equal( id );
		user.username.should.equal( username );
		user.password.should.equal( password );
		user.playerId.should.equal( playerId );
	} );

	it( 'should not be dirty from the start', () => {
		user.isDirty.should.be.false();
	} );

	it( 'should return a correct data object', () => {
		user.data.should.have.properties( {
			id: id,
			username: username,
			playerId: playerId
		} );

		user.data.should.not.have.property( 'password' );
	} );

	describe( 'dirtying fields', () => {
		[
			{field: 'username', val: 'another_username'},
			{field: 'password', val: 'another password'},
			{field: 'playerId', val: 34}
		].forEach( change => {
			it( 'should mark ' + change.field + ' as dirty', () => {
				user[change.field] = change.val;
				user.dirtyFields.has( change.field ).should.be.true();

				user.isDirty.should.be.true();
			} );
		} );
	} );

	describe( 'authentication', () => {

	} );
} );
