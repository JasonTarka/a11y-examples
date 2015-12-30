'use strict';

module.exports = {
	singleton: singleton
};

function singleton( type ) {
	var self = singleton;
	if( !self.instances ) {
		self.instances = new WeakMap();
	}

	if( !self.instances.has( type )
		|| !(self.instances.get( type ) instanceof type)
	) {
		let obj = new type();
		self.instances.set( type, obj );
	}

	return self.instances.get( type );
}
