'use strict';

let NotImplemented = require( '../../utils/errors' ).FunctionNotImplemented,
	utils = require( '../../utils/utils' );

let _data = new WeakMap();

class DataObject {
	constructor( data ) {
		/**
		 * @type {Set}
		 */
		this.dirtyFields = new Set();

		_data.set( this, data );
	}

	markClean() {
		this.dirtyFields = new Set();
	}

	/**
	 * @returns {boolean}
	 */
	get isDirty() {
		return !!this.dirtyFields.size;
	}

	/***** Methods/Properties to be overridden *****/

	/**
	 * @returns {Object|object}
	 */
	get data() {
		throw new NotImplemented();
	}

	/**
	 * An array of fields that are used as identifiers for this object.
	 * eg: primary keys in the database
	 * @returns {string[]}
	 */
	get identifierFields() {
		throw new NotImplemented();
	}

	/***** Private/Protected methods *****/

	_markDirty( field ) {
		if( !this.dirtyFields.has( field ) ) {
			this.dirtyFields.add( field );
		}
	}

	_getFieldVal( field ) {
		return _data.get( this )[field];
	}

	_getFieldVals() {
		return utils.clone( _data.get( this ) );
	}

	_setFieldVal( field, value ) {
		let data = _data.get( this );
		if( data[field] === value ) {
			return;
		}

		data[field] = value;
		this._markDirty( field );
	}
}

module.exports = DataObject;
