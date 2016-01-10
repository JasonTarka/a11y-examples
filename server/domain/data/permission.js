'use strict';

var DataObject = require( './dataObject' );

let _data = new WeakMap();

class Permission extends DataObject {
	constructor( id, name ) {
		super();

		_data.set( this, {
			id: id,
			name: name
		} );
	}

	get data() {
		return {
			id: this.id,
			name: this.name
		};
	}

	get id() {
		return _data.get( this ).id;
	}

	get name() {
		return _data.get( this ).name;
	}
}

module.exports = Permission;
