'use strict';

/**
 * Data for creation of a Tab
 * @typedef {Object} TabData
 * @property {string} name - HTML ID for the Tab & its Tab panel
 * @property {string} title - Text to display for the Tab
 * @property {string} contents - Path to HTML file containing the Tab's contents
 * @property {bool} selected - Whether this Tab is the selected Tab or not
 */

const TabKeyCodes = {
	LeftArrow: 37,
	RightArrow: 39,
	Home: 36,
	End: 35
};

class TabGroup {
	constructor( node, data ) {
		/** @type {Array<TabData>} */
		this.data = JSON.parse( data );

		this.elements = {
			tabList: $( '.tabList', node ),
			container: $( '.tabContainer', node )
		};

		this.init();
	}

	init() {
		// Make sure there's only one Tab displayed by selected
		let foundSelected = false;
		this.data.forEach( tabData => {
			tabData.selected = !foundSelected && tabData.selected;
			foundSelected = foundSelected || tabData.selected;
		} );

		this.firstTab = this.data[0].name;
		this.lastTab = this.data[this.data.length - 1].name;

		let tabList = [],
			tabPanels = [];
		for( let i = 0; i < this.data.length; i++ ) {
			let prev = i > 0 ? this.data[i - 1].name : null,
				next = i < this.data.length - 1 ? this.data[i + 1].name : null;

			console.log( this.data[i].name, prev, next );

			tabList.push(
				this._constructTab( this.data[i], prev, next )
			);
			tabPanels.push(
				this._constructTabPanel( this.data[i] )
			);
		}

		this.elements.tabList.append( tabList );
		this.elements.container.append( tabPanels );
	}

	_constructTab( data, prev, next ) {
		const name = data.name,
			title = data.title,
			isSelected = data.selected;

		return $( `
				<span id="${name}-tab"
					  role="tab"
					  aria-controls="${name}"
					  aria-selected="${isSelected ? 'true' : 'false'}"
					  tabindex="${isSelected ? 0 : -1}"
				>
					${title}
				</span>`
			).on( 'keydown', e => this._keyDown( e, prev, next ) );
	}

	_constructTabPanel( data ) {
		const name = data.name,
			isSelected = data.selected,
			cssClass = isSelected ? 'selected' : '';

		return $( `
			<div id="${name}"
				 role="tabpanel"
				 class="${cssClass}"
				 aria-labelledby="${name}-tab"
			>
				${data.title}
			</div>` );
	}

	_activateTab( name ) {
		console.log( 'Activate tab:', name );
		if( !name ) return;

		const oldTab = this.elements.tabList.children( '[aria-selected="true"]' ),
			oldPanel = this.elements.container.children( '.selected' ),
			newTab = this.elements.tabList.children( `#${name}-tab` ),
			newPanel = this.elements.container.children( `#${name}` );

		oldPanel.toggleClass( 'selected', false )
			.attr( 'aria-expanded', false );
		oldTab.attr( 'aria-selected', false )
			.attr( 'tabindex', -1 );

		newPanel.toggleClass( 'selected', true )
			.attr( 'aria-expanded', true );
		newTab.attr( 'aria-selected', true )
			.attr( 'tabindex', 0 )
			.focus();
	}

	/***** Event Handlers *****/

	/**
	 * @param {KeyboardEvent} event - The keyboard event
	 * @param {string} prev - The ID of the previous Tab
	 * @param {string} next - The ID of the next Tab
	 * @private
	 */
	_keyDown( event, prev, next ) {
		console.log( 'Keydown event: ', event.which );

		switch( event.which ) {
			case TabKeyCodes.Home:
				this._activateTab( this.firstTab );
				break;
			case TabKeyCodes.End:
				this._activateTab( this.lastTab );
				break;
			case TabKeyCodes.LeftArrow:
				this._activateTab( prev );
				break;
			case TabKeyCodes.RightArrow:
				this._activateTab( next );
				break;
			default:
				return;
		}

		event.preventDefault();
		return false;
	}
}

window.TabGroup = TabGroup;