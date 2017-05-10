'use strict';

/**
 * Data for creation of a Tab
 * @typedef {Object} TabData
 * @property {string} name - HTML ID for the Tab & its Tab panel
 * @property {string} title - Text to display for the Tab
 * @property {string} contents - Path to HTML file containing the Tab's contents
 * @property {string} src - Path to point a frame at
 * @property {bool} selected - Whether this Tab is the selected Tab or not
 */

class TabGroup {

	constructor( node, data ) {
		/** @type {Array<TabData>} */
		this.data = data;
		this.loader = Loader.Instance;

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
			let data = this.data[i],
				prev = i > 0 ? this.data[i - 1].name : null,
				next = i < this.data.length - 1 ? this.data[i + 1].name : null;

			tabList.push(
				this._constructTab( data, prev, next )
			);
			let panel;
			if( !data.src ) {
				panel = TabGroup._constructTabPanel( data );
				this._initializeTab( panel );
			} else {
				panel = this._constructFrameTabPanel( data );
			}
			tabPanels.push( panel );
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
			).on( 'keydown', event => this._keyDown( event, prev, next ) )
			.on( 'click', event => this._activateTab( name ) );
	}

	static _constructTabPanel( data ) {
		const name = data.name,
			contentLocation = data.contents,
			isSelected = data.selected;

		return $( `
			<div id="${name}"
				 role="tabpanel"
				 aria-expanded="${isSelected}"
				 aria-labelledby="${name}-tab"
				 aria-busy="true"
				 data-content-location="${contentLocation}"
			>
				${data.title}
			</div>` );
	}

	_constructFrameTabPanel( data ) {
		const name = data.name,
			src = data.src,
			isSelected = data.selected;

		let panel = $( `
				<iframe id="${name}"
						role="tabpanel"
						src="${src}"
						aria-expanded="${isSelected}"
						aria-labelledby="${name}-tab"
						aria-busy="true"
				></iframe>`
			).on( 'load', () => panel.removeAttr( 'aria-busy' ) );

		if( this._getHost( src ) === document.location.host ) {
			panel.on( 'load', () => this._addResizeHandler( panel ) );
		}

		return panel;
	}

	_addResizeHandler( panel ) {
		let frameDocument = panel[0].contentDocument;

		let observer = new MutationObserver( () => TabGroup._frameResize( panel ) );
		observer.observe(
			frameDocument,
			{
				childList: true,
				attributes: true,
				characterData: true,
				subtree: true
			}
		);

		TabGroup._frameResize( panel );
	}

	_getHost( url ) {
		let a = this._a;
		if( !a ) {
			a = this._a = document.createElement( 'a' );
		}

		a.href = url;
		try {
			return new URL( a.href ).host;
		} catch(e) { // IE11 doesn't support the URL object
			// Pre-assigned href was relative, so a.host will be undefined, but a.href will include the hostname in the
			// string. Assigning it back to itself lets a.host have a value.
			a.href = a.href.toString();
			return a.host;
		}
	}

	/**
	 * @param {jQuery} node
	 * @private
	 */
	_initializeTab( node ) {
		let location = node.attr( 'data-content-location' );
		node.removeAttr( 'data-content-location' );

		return this.loader.loadHtml( null, node, location )
			.then( () => this.loader.loadAll( node ) )
			.then( () => node.removeAttr( 'aria-busy' ) )
			.catch( err => Loader.logError( err, location ) );
	}

	_activateTab( name ) {
		if( !name ) return;

		const oldTab = this.elements.tabList.children( '[aria-selected="true"]' ),
			oldPanel = this.elements.container.children( '[aria-expanded="true"]' ),
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

		// Make sure tabs are resized when we switch to them, as they would be 0-height when invisible
		if( newPanel.is( 'iframe' ) ) {
			TabGroup._frameResize( newPanel );
		}
	}

	/***** Event Handlers *****/

	/**
	 * @param {KeyboardEvent} event - The keyboard event
	 * @param {string} prev - The ID of the previous Tab
	 * @param {string} next - The ID of the next Tab
	 * @private
	 */
	_keyDown( event, prev, next ) {
		switch( event.which ) {
			case KeyCodes.Home:
				this._activateTab( this.firstTab );
				break;
			case KeyCodes.End:
				this._activateTab( this.lastTab );
				break;
			case KeyCodes.LeftArrow:
				this._activateTab( prev );
				break;
			case KeyCodes.RightArrow:
				this._activateTab( next );
				break;
			default:
				return;
		}

		event.preventDefault();
		return false;
	}

	/**
	 * @param {jQuery} panel
	 * @private
	 */
	static _frameResize( panel ) {
		let body = panel[0].contentDocument.documentElement,
			height = body.offsetHeight;
		panel.height( height );
	}
}

window.TabGroup = TabGroup;