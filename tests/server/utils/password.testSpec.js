'use strict';

let should = require( 'should' ),

	passwordUtils = require( '../../../server/utils/password' );

describe( 'password utils', () => {
	describe( 'hash()', () => {
		it( 'should return a base64-encoded string', () => {
			let hash = passwordUtils.hash( 'password', 'a1b2c3' );
			should( hash ).not.be.undefined()
				.and.not.null()
				.and.be.a.String();
		} );
	} );

	describe( 'verify()', () => {
		const pass = 'this is the correct password',
			salt = 'this is a salt';
		let hash = passwordUtils.hash( pass, salt );

		it( 'eventually returns true for a correct password', done => {
			passwordUtils.verify( hash, pass, salt )
				.then( result => {
					result.should.be.true();
					done();
				} )
				.catch( done );
		} );

		it( 'eventually returns false for an incorrect password', done => {
			passwordUtils.verify( hash, 'this is the wrong password', salt )
				.then( result => {
					result.should.be.false();
					done();
				} )
				.catch( done );
		} );

		it( 'throws an error for a non-string hash', () => {
			(() => {
				passwordUtils.verify( 123, pass, salt );
			}).should.throw();
		} );
	} );

	it( 'salts the password', done => {
		const password = 'the password',
			salts = ['salt', 'pepper'];

		let hash = passwordUtils.hash( password, salts[0] );
		passwordUtils.verify( hash, password, salts[0] )
			.then( result => result.should.be.true() )
			.then( () => passwordUtils.verify( hash, password, salts[1] ) )
			.then( result => result.should.be.false() )
			.then( () => done() )
			.catch( done );
	} );
} );
