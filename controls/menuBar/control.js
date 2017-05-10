'use strict';

/**
 * @typedef {Object} MenuBarData
 * @property {string} title - The user-visible name for this menubar; primarily for screen readers
 * @property {Array<MenuBarMenu>} menus - The top-level menus to display
 */

/**
 * @typedef {Object} MenuBarMenu
 * @property {string} title - The user-visible name of this menu
 * @property {string} hotkey - Key that can be hit to activate this menu
 * @property {Array<MenuBarOption>} options - List of options in this menu
 */

/**
 * @typedef {Object} MenuBarOption
 * @property {string} title - The user-visible name of this menu option
 * @property {string} value - Value to be used for callbacks
 * @property {string} hotkey - Key that can be hit to activate this menu option
 * @property {boolean|undefined} checked - Whether this option is selected by default.
 *      Note: If this is not set, then the option will be considered an action, rather than a state selection
 * @property {Array<MenuBarOption>|undefined} options - List of options in a sub-menu
 * @property {MenuBarAction} onclick - JavaScript to perform when the option is activated
 *      Note: If "checked" is set, then the checked state (true/false) will be passed, along with the value
 */

/**
 * @typedef {function} MenuBarAction
 * @param value {string} - The value of the activated {MenuBarOption}
 * @param checked {boolean|undefined} - The new checked state of the option, if "checked" has been set on the {MenuBarOption}
 */

class MenuBar {
	constructor( node, data ) {
		this.data = data;
		this.title = data.title;
		this.menus = data.menus;

		this.elements = {
			bar: $( '.menuBar', node )
		};

		this._init();
	}

	_init() {
		const menuBar = this.elements.bar;

		let isFirst = true,
			menus = this.menus.map( data => {
				let element = this._constructMenu( data, isFirst );
				isFirst = false;
				return element;
			} );

		menuBar.append( menus );
	}

	/**
	 * @param data {MenuBarMenu}
	 * @param isFirst {boolean}
	 * @private
	 */
	_constructMenu( data, isFirst ) {
		const title = data.title,
			options = data.options.map( x => this._constructMenuOption( x ) ),
			hotkey = data.hotkey,
			tabIndex = isFirst ? 0 : -1;

		let menu = $( `
				<div role="menu"
					 tabindex="${tabIndex}"
					 data-hotkey="${hotkey}"
					 aria-haspopup="true"
					 aria-expanded="false"
				>
					<span class="title">
						${title}				
					</span>
					<div class="menuItems"></div>
				</div>`
			).on( 'click', event => MenuBar._toggleMenu( menu, event ) )
			.on( 'keydown', event => MenuBar._keyDownMenu( menu, event ) );

		menu.children( '.menuItems' )
			.append( options );

		return menu;
	}

	/**
	 * @param data {MenuBarOption}
	 * @private
	 */
	_constructMenuOption( data ) {
		const title = data.title,
			options = (data.options || []).map( x => this._constructMenuOption( x ) ),
			expanded = options.length ? 'aria-expanded="false"' : '',
			hotkey = data.hotkey,
			checked = data.checked == null ? '' : `aria-checked="${data.checked}"`;

		let menuOption = $( `
				<div role="menuitem"
					 tabindex="-1"
					 data-hotkey="${hotkey}"
					 aria-haspopup="${!!options.length}"
					 ${expanded}
					 ${checked}
				>
					<span class="title">
						${title}				
					</span>
				</div>`
			).on( 'click', event => MenuBar._activateMenuOption( event, menuOption, data ) )
			.on( 'keydown', event => MenuBar._keyDownMenuOption( event, menuOption, data ) );

		if( options.length ) {
			menuOption.append(
				$( `<div class="menuItems"></div>` )
					.append( options )
			);
		}

		return menuOption;
	}

	/**
	 * @param funcName {string}
	 * @returns {MenuBarAction}
	 * @private
	 */
	static _getFunction( funcName ) {
		const noop = () => {};
		if( !funcName ) return noop;

		const chunks = funcName.split( '.' );
		if( !chunks || !chunks.length ) return noop;

		let func = chunks.reduce(
			( prev, curr ) => prev[curr],
			window
		);

		return func;
	}

	/***** Event Handling *****/

	/**
	 * @param event {KeyboardEvent}
	 * @param node {jQuery}
	 * @private
	 */
	static _keyDownMenu( node, event ) {
		const sibling = '[role="menu"]';

		switch( event.which ) {
			case KeyCodes.Enter:
			case KeyCodes.Space:
				return MenuBar._toggleMenu( node, event );

			case KeyCodes.DownArrow:
				// Open the menu if it's not already
				if( node.attr( 'aria-expanded' ) !== 'true' ) {
					MenuBar._toggleMenu( node, event );
				} else {
					node.find( '[role="menuitem"]' )
						.first()
						.focus();
				}
				break;

			case KeyCodes.RightArrow:
				MenuBar._findSibling( node, sibling, true ).focus();
				break;

			case KeyCodes.LeftArrow:
				MenuBar._findSibling( node, sibling, false ).focus();
				break;


			default:
				return;
		}

		event.preventDefault();
		event.stopPropagation();
	}

	/**
	 * @param event {KeyboardEvent}
	 * @param node {jQuery}
	 * @param data {MenuBarOption}
	 * @private
	 */
	static _keyDownMenuOption( event, node, data ) {
		const sibling = '[role="menuitem"]',
			menuSelector = '[role="menu"]';

		switch( event.which ) {
			case KeyCodes.Enter:
			case KeyCodes.Space:
				return MenuBar._activateMenuOption( event, node, data );

			case KeyCodes.DownArrow:
				MenuBar._findSibling( node, sibling, true ).focus();
				break;

			case KeyCodes.UpArrow:
				MenuBar._findSibling( node, sibling, false ).focus();
				break;

			case KeyCodes.RightArrow:
				let nextMenu = MenuBar._findSibling(
					node.closest( menuSelector ),
					menuSelector,
					true
				);
				MenuBar._toggleMenu( nextMenu, event );
				break;

			case KeyCodes.LeftArrow:
				let prevMenu = MenuBar._findSibling(
					node.closest( menuSelector ),
					menuSelector,
					false
				);
				MenuBar._toggleMenu( prevMenu, event );
				break;

			default:
				return;
		}

		event.preventDefault();
		event.stopPropagation();
	}

	/**
	 * @param event {MouseEvent|KeyboardEvent}
	 * @param node {jQuery}
	 * @private
	 */
	static _toggleMenu( node, event ) {
		if( event ) {
			event.preventDefault();
			event.stopPropagation();
		}

		let openMenu = node.attr( 'aria-expanded' ) !== 'true';
		node.attr( 'aria-expanded', openMenu )
			.siblings( `[aria-expanded]` )
			.attr( 'aria-expanded', false );

		if( openMenu ) {
			node.find( '.menuItems [role="menuitem"]' )
				.first()
				.focus();
		}
	}

	/**
	 * @param event {MouseEvent|KeyboardEvent}
	 * @param node {jQuery}
	 * @param data {MenuBarOption}
	 * @private
	 */
	static _activateMenuOption( event, node, data ) {
		event.preventDefault();
		event.stopPropagation();

		const onClick = MenuBar._getFunction( data.onclick ),
			isCheckbox = data.checked != null,
			isChecked = node.attr( 'aria-checked' ) === 'true',
			hasSubMenu = data.options;

		if( hasSubMenu ) {

		} else {
			isCheckbox
				? onClick( data.value, isChecked )
				: onClick( data.value );
			node.parentsUntil( '.menuBar', '[aria-expanded]' )
				.each(
					( index, element ) => MenuBar._toggleMenu( $( element ) )
				);
		}
	}

	static _findSibling( node, selector, getNext ) {
		let sibling;
		if( getNext ) {
			sibling = node.next( selector );
			if( !sibling.length ) {
				sibling = node.siblings( selector ).first()
			}
		} else {
			sibling = node.prev( selector );
			if( !sibling.length ) {
				sibling = node.siblings( selector ).last()
			}
		}
		return sibling;
	}
}

window.MenuBar = MenuBar;