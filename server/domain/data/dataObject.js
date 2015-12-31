'use strict';

let NotImplemented = require( '../../utils/errors' ).FunctionNotImplemented;

class DataObject {
	constructor() {
		this.dirtyFields = new Set();
	}

	markDirty( field ) {
		if( !this.dirtyFields.has( field ) ) {
			this.dirtyFields.add( field );
		}
	}

	get isDirty() {
		return !!this.dirtyFields.size;
	}

	get data() {
		throw new NotImplemented();
	}
}

module.exports = DataObject;
