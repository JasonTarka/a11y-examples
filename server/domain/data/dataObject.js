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

	_markDirty( field ) {
		if( !this.dirtyFields.has( field ) ) {
			this.dirtyFields.add( field );
		}
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

	/**
	 * @returns {Object|object}
	 */
	get data() {
		throw new NotImplemented();
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
