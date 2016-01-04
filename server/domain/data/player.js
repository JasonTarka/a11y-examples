'use strict';

let DataObject = require( './dataObject' ),
	InvalidParameter = require( '../../utils/errors' ).InvalidParameter;

let _data = new WeakMap();

class Player extends DataObject {
	constructor( id, name, email, bio, imgPath ) {
		super();

		_data.set( this, {
			id: id,
			name: name,
			email: email,
			bio: bio,
			imgPath: imgPath
		} );
	}

	get data() {
		return _data.get( this );
	}

	// ----- id -----
	get id() {
		return _data.get( this ).id;
	}

	set id( val ) {
		if( !isFinite( val ) ) {
			throw new InvalidParameter( '"id" must be a number' );
		}

		_data.get( this ).id = val;
		super.markDirty( 'id' );
	}

	// ----- name -----
	get name() {
		return _data.get( this ).name;
	}

	set name( val ) {
		if( !val ) {
			throw new InvalidParameter( '"name" must not be empty' );
		}
		_data.get( this ).name = val.toString();
		super.markDirty( 'name' );
	}

	// ----- email -----
	get email() {
		return _data.get( this ).email;
	}

	set email( val ) {
		if( val
			&& !(val instanceof String)
			&& !val.match( /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i )
		) {
			throw new InvalidParameter( '"email" must be a valid email address' );
		}

		_data.get( this ).email = val;
		super.markDirty( 'email' );
	}

	// ----- bio -----
	get bio() {
		return _data.get( this ).bio;
	}

	set bio( val ) {
		_data.get( this ).bio = val.toString();
		super.markDirty( 'bio' );
	}

	// ----- imgPath -----

	get imgPath() {
		return _data.get( this ).imgPath;
	}

	set imgPath( val ) {
		_data.get( this ).imgPath = val.toString();
		super.markDirty( 'imgPath' );
	}
}

/**
 * @type {Player}
 */
module.exports = Player;
