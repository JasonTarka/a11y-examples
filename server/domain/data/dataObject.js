'use strict';

let NotImplemented = require( '../../utils/errors' ).FunctionNotImplemented;

class DataObject {
	constructor() {
		/**
		 * @type {Set}
		 */
		this.dirtyFields = new Set();
	}

	markDirty( field ) {
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
}

module.exports = DataObject;
