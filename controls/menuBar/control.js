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
 * @property {boolean|undefined} checked - This option is a checkbox, and whether it is selected by default.
 *      Note: If this is not set, then the option will be considered an action, rather than a state selection
 * @property {boolean|undefined} selected - This option is a radio button, and whether it is selected by default.
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

	static get Selectors() {
		return {
			Menu: '.menu',
			MenuItem: '.menuItem',
			Expandable: '[aria-haspopup="true"]',
			Expanded: '[aria-expanded="true"]',
			SubMenu: '[role="menu"]'
		};
	}

	static get Attributes() {
		return {
			Expanded: 'aria-expanded',
			Checked: 'aria-checked',
			HasPopup: 'aria-haspopup'
		};
	}

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
				<div role="menuitem"
					 class="menu"
					 tabindex="${tabIndex}"
					 data-hotkey="${hotkey}"
					 aria-haspopup="true"
					 aria-expanded="false"
				>
					<span class="title">
						${title}				
					</span>
					<div role="menu"></div>
				</div>`
			).on( 'click', event => this._toggleMenu( menu, event ) )
			.on( 'keydown', event => this._keyDownMenu( menu, event ) )
			.on( 'blur', event => this._blur( menu ) );

		menu.children( MenuBar.Selectors.SubMenu )
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
			checked = data.checked == null ? '' : `aria-checked="${data.checked}"`,
			selected = data.selected == null ? '' : `aria-checked="${data.selected}"`;

		const role =
			checked
				? 'menuitemcheckbox'
				: selected
					? 'menuitemradio'
					: 'menuitem';

		let menuOption = $( `
				<div role="${role}"
					 class="menuItem"
					 tabindex="-1"
					 data-hotkey="${hotkey}"
					 aria-haspopup="${!!options.length}"
					 ${expanded}
					 ${checked || selected}
				>
					<span class="title">
						${title}				
					</span>
				</div>`
			).on( 'click', event => this._activateMenuOption( event, menuOption, data ) )
			.on( 'keydown', event => this._keyDownMenuOption( event, menuOption, data ) )
			.on( 'focus', event => MenuBar._focus( menuOption ) )
			.on( 'blur', event => this._blur( menuOption ) );

		if( options.length ) {
			menuOption.append(
				$( `<div role="menu"></div>` )
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
	_keyDownMenu( node, event ) {
		const sibling = MenuBar.Selectors.Menu;

		switch( event.which ) {
			case KeyCodes.Enter:
			case KeyCodes.Space:
				return this._toggleMenu( node, event );

			case KeyCodes.DownArrow:
				// Open the menu if it's not already
				if( node.attr( MenuBar.Attributes.Expanded ) !== 'true' ) {
					this._toggleMenu( node, event );
				} else {
					node.find( MenuBar.Selectors.MenuItem )
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
	_keyDownMenuOption( event, node, data ) {
		const menuItemSelector = MenuBar.Selectors.MenuItem,
			menuSelector = MenuBar.Selectors.Menu;

		switch( event.which ) {
			case KeyCodes.Enter:
			case KeyCodes.Space:
				return this._activateMenuOption( event, node, data );

			case KeyCodes.DownArrow:
				MenuBar._findSibling( node, menuItemSelector, true ).focus();
				break;

			case KeyCodes.UpArrow:
				MenuBar._findSibling( node, menuItemSelector, false ).focus();
				break;

			case KeyCodes.RightArrow:
				if( node.attr( MenuBar.Attributes.HasPopup ) === 'true' ) {
					this._toggleMenu( node, event );
				} else {
					let nextMenu = MenuBar._findSibling(
						node.closest( menuSelector ),
						menuSelector,
						true
					);
					this._toggleMenu( nextMenu, event );
				}
				break;

			case KeyCodes.LeftArrow:
				let parentOption = node.parentsUntil( menuSelector, menuItemSelector );
				if( parentOption.length ) {
					// This is a sub-menu
					this._toggleMenu( parentOption.first() )
						.focus();
				} else {
					// This is a top-level menu, go to the next menu
					let prevMenu = MenuBar._findSibling(
						node.closest( menuSelector ),
						menuSelector,
						false
					);
					this._toggleMenu( prevMenu, event );
				}
				break;

			default:
				return;
		}

		event.preventDefault();
		event.stopPropagation();
	}

	static _focus( node ) {
		node.siblings( MenuBar.Selectors.Expanded )
			.attr( MenuBar.Attributes.Expanded, false );
	}

	_blur( node, fromTimeout ) {
		const focused = $( ':focus' ),
			parent = node.parent();

		// New node isn't focused yet, try again in a moment
		if( !focused.length && !fromTimeout ) {
			if( fromTimeout ) {
				return;
			} else {
				return setTimeout(
					() => this._blur( node, true ),
					10
				);
			}
		}

		// Currently focused element is a child, ignore it
		if( $.contains( node[0], focused[0] ) ) {
			return;
		}

		// Focused is a sibling, ignore it
		if( $.contains( parent[0], focused[0] ) ) {
			return;
		}

		// focused is outside of the menu, close everything
		if( !$.contains( this.elements.bar[0], focused[0] ) ) {
			this.elements.bar.children( MenuBar.Selectors.Expanded ).each(
				(index, element) => this._toggleMenu( $( element ) )
			);
		}
	}

	/**
	 * @param event {MouseEvent|KeyboardEvent}
	 * @param node {jQuery}
	 * @private
	 */
	_toggleMenu( node, event ) {
		if( event ) {
			event.preventDefault();
			event.stopPropagation();
		}

		let openMenu = node.attr( MenuBar.Attributes.Expanded ) !== 'true';
		node.attr( MenuBar.Attributes.Expanded, openMenu )
			.siblings( MenuBar.Selectors.Expandable )
			.attr( MenuBar.Attributes.Expanded, false );

		if( openMenu ) {
			node.find( `${MenuBar.Selectors.SubMenu} > ${MenuBar.Selectors.MenuItem}` )
				.first()
				.focus();
		} else {
			node.find( MenuBar.Selectors.Expanded )
				.attr( MenuBar.Attributes.Expanded, false );
		}

		return node;
	}

	/**
	 * @param event {MouseEvent|KeyboardEvent}
	 * @param node {jQuery}
	 * @param data {MenuBarOption}
	 * @private
	 */
	_activateMenuOption( event, node, data ) {
		event.preventDefault();
		event.stopPropagation();

		const onClick = MenuBar._getFunction( data.onclick ),
			isCheckbox = data.checked != null,
			isRadio = data.selected != null,
			isChecked = node.attr( MenuBar.Attributes.Checked ) !== 'true', // Not equals so it becomes unchecked
			hasSubMenu = data.options;

		if( hasSubMenu ) {
			return this._toggleMenu( node );
		}

		if( isCheckbox ) {
			node.attr( MenuBar.Attributes.Checked, isChecked );
			onClick( data.value, isChecked );
		} else if( isRadio ) {
			node.attr( MenuBar.Attributes.Checked, true )
				.siblings( MenuBar.Selectors.MenuItem )
				.attr( MenuBar.Attributes.Checked, false );
			onClick( data.value );
		} else {
			onClick( data.value );
		}

		node.parentsUntil( this.elements.bar, MenuBar.Selectors.Expandable )
			.each(
				( index, element ) => this._toggleMenu( $( element ) )
			);
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