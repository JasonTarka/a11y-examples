'use strict';

let router = require( 'express' ).Router(),

	getProvider = require( '../domain/providers/Players' );

module.exports = {
	baseRoute: '/player',
	router: router
};

router.get( '/', ( req, res ) => {
	res.send( {hello: 'world'} );
} );


router.get( '/list', (req, res, next) => {
	let provider = getProvider();
	provider.fetchPlayers()
		.then( players => {
			res.send( players );
		} )
		.catch( next );
} );

router.get( '/:player', ( req, res ) => {
	res.send( { id: req.playerId } );
} );

router.param( 'player', ( req, res, next, id ) => {
	console.log( 'Player route called with ID of %d', id );
	req.playerId = id;
	next();
} );
