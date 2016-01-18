'use strict';

let DataObject = require( './dataObject' ),
	InvalidParameter = require( '../../utils/errors' ).InvalidParameter,
	playerProvider = require( '../providers/player.provider' );

class Player extends DataObject {
	constructor( id, name, email, bio, imgPath ) {
		super( {
			id: id,
			name: name,
			email: email,
			bio: bio,
			imgPath: imgPath
		} );
	}

	get data() {
		return this._getFieldVals();
	}

	get identifierFields() {
		return ['id'];
	}

	// ----- id -----
	get id() {
		return this._getFieldVal( 'id' );
	}

	// ----- name -----
	get name() {
		return this._getFieldVal( 'name' );
	}

	set name( val ) {
		if( !val ) {
			throw new InvalidParameter( '"name" must not be empty' );
		}
		this._setFieldVal( 'name', val.toString() );
	}

	// ----- email -----
	get email() {
		return this._getFieldVal( 'email' );
	}

	set email( val ) {
		if( val
			&& !(val instanceof String)
			&& !val.match( /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i )
		) {
			throw new InvalidParameter( '"email" must be a valid email address' );
		}

		this._setFieldVal( 'email', val.toString() );
	}

	// ----- bio -----
	get bio() {
		return this._getFieldVal( 'bio' );
	}

	set bio( val ) {
		this._setFieldVal( 'bio', val.toString() );
	}

	// ----- imgPath -----

	get imgPath() {
		return this._getFieldVal( 'imgPath' );
	}

	set imgPath( val ) {
		val = val ? val.toString() : null;
		this._setFieldVal( 'imgPath', val );
	}

	save() {
		if( !this.id ) {
			throw new Error( 'Cannot create player' );
		}

		return playerProvider().updatePlayer( this )
			.then( () => this );
	}
}

/**
 * @type {Player}
 */
module.exports = Player;
