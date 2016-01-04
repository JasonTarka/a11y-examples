'use strict';

let should = require( 'should' ),

	passwordUtils = require( '../../../server/utils/password' );

describe( 'password utils', () => {
	describe( 'hash()', () => {
		it( 'should eventually return a base64-encoded string', done => {
			passwordUtils.hash( 'password' )
				.then( hash => {
					console.log( hash );
					should( hash ).not.be.undefined()
						.and.not.null()
						.and.be.a.String();

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'verify()', () => {
		const pass = 'this is the correct password';
		var hash;

		beforeEach( done => {
			passwordUtils.hash( pass )
				.then( h => {
					hash = h;
					done();
				} )
				.catch( done );
		} );

		it( 'should eventually return true for a correct password', done => {
			passwordUtils.verify( hash, pass )
				.then( result => {
					result.should.be.true();
					done();
				} )
				.catch( done );
		} );

		it( 'should eventually be false for an incorrect password', done => {
			passwordUtils.verify( hash, 'this is the wrong password' )
				.then( result => {
					result.should.be.false();
					done();
				} )
				.catch( done );
		} );

		it( 'should throw an error for a non-string hash', () => {
			(() => {
				passwordUtils.verify( 123, pass );
			}).should.throw();
		} );
	} );
} );
