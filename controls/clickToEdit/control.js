'use strict';

const KeyCodes = {
	Enter: 13,
	Esc: 27,
	Tab: 9
};

class ClickToEdit {

	constructor( node, data ) {
		this.data = data;
		this.title = this.data.title;
		this.isSelect = this.data.type === 'select';
		this.selectMap = this.isSelect ? new Map() : null;

		this.value = this.data.value;

		this.elements = {
			root: $( '.clickToEdit', node ),
			button: $( 'button', node ),
			contents: $( '.display .contents', node ),
			display: $( '.display', node ),
			title: $( '.title', node ),
			input: $( '.input input', node ),
			inputContainer: $( '.input', node )
		};

		this.init();
	}

	init() {
		let title = this.data.title;
		this.elements.title.text( title );

		this.elements.button
			.on( 'keydown', e => this.editButtonKeyDown( e ) )
			.on( 'click', () => this.editButtonClick() )
			.on( 'focus', () => this.editButtonFocus() )
			.on( 'blur', () => this.editButtonBlur() );

		this.elements.contents
			.on( 'click', () => this.contentsClick() );

		if( this.isSelect ) {
			this.elements.input.remove();
			this.elements.input = this._constructSelect();
			this.elements.inputContainer.append( this.elements.input );
			this.elements.root.addClass( 'select' );
		} else {
			this.elements.input
			    .attr( 'name', this.data.name );
		}

		this.updateEditButton();
		this._updateDisplayedValue();

		// Information on what just happened, and how to finish editing.
		// Will be read out when focusing in the field, before the contents.
		this.elements.input
		    .attr( 'aria-label', `Editing ${title}. Hit Tab to finish, or Escape to cancel.` )
			.on( 'keydown', e => this.inputKeyDown( e ) )
			.on( 'keyup', e => this.inputKeyUp( e ) )
			.on( 'blur', () => this.inputBlur() )
	}

	_constructSelect() {
		const name = this.data.name,
			options = this.data.options;

		options.forEach( data => this._fillSelectMap( data ) );

		return $( `
				<select name="${name}">
					<option value=""
							aria-label="No value"
					>
						---
					</option>
				</select>`
			).append( options.map( data => this._constructOption( data ) ) );
	}

	_fillSelectMap( option ) {
		if( option.options ) {
			return option.options.forEach( data => this._fillSelectMap( data ) );
		}

		this.selectMap.set( option.value, option.text );
	}

	/**
	 * @param {OptionData} data
	 * @private
	 */
	_constructOption( data ) {
		const text = data.text,
			value = data.value,
			selected = data.selected ? 'selected="selected"' : '',
			subOptions = data.options;

		if( subOptions != null ) {
			return this._constructOptionGroup( text, subOptions );
		}

		return $( `
				<option value="${value}"
						${selected}
				>
					${text}
				</option>`
		);
	}

	/**
	 * @param {string} text
	 * @param {Array<OptionData>} subOptions
	 * @private
	 */
	_constructOptionGroup( text, subOptions ) {
		let options = subOptions.map( data => this._constructOption( data ) );
		return $( `
				<optgroup label="${text}">
			` ).append( options );
	}

	/***** Specifically around editing *****/

	activateEdit() {
		this.elements.input.val( this.value );

		this.elements.display.addClass( 'hidden' );
		this.elements.inputContainer.removeClass( 'hidden' );
		this.elements.input.focus();
	}

	cancelEdit() {
		this.endEdit();
	}

	saveEdit() {
		this.value = this.elements.input.val();
		this.endEdit();
	}

	endEdit() {
		this._updateDisplayedValue();
		this.elements.display.removeClass( 'hidden' );
		this.elements.inputContainer.addClass( 'hidden' );

		this.updateEditButton();
		this.elements.button.focus();

		Announce.announce( 'Done editing' );
	}

	updateEditButton() {
		const text = this.value
			? this.isSelect
				? this.selectMap.get( this.value )
				: this.value
			: 'No Value';
		this.elements.button.text( `${this.title}: ${text}. Activate to edit.` );
	}

	_updateDisplayedValue() {
		const value = this.value;

		if( value ) {
			this.elements.contents.removeClass( 'empty' )
				.text( this.isSelect ? this.selectMap.get( value ) : value );
		} else {
			this.elements.contents.addClass( 'empty' )
				.text( this.title );
		}
	}

	/***** Event handling *****/
	contentsClick() {
		this.activateEdit();
	}

	editButtonFocus() {
		// Fake-focus the clickable contents when focusing on the button
		this.elements.contents.addClass( 'focused' );
	}

	editButtonBlur() {
		// Remove the contents fake-focus when blurring the button
		this.elements.contents.removeClass( 'focused' );
	}

	editButtonKeyDown( event ) {
		if( event.keyCode === KeyCodes.Enter ) {
			// Flag used to ignore the first Enter keyup in the input
			// field if the user hits Enter to activate the edit.
			this.editButtonClicked = true;
		}
	}

	editButtonClick() {
		this.activateEdit();
	}

	inputBlur() {
		this.saveEdit();
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	inputKeyDown( event ) {
		if( event.keyCode === KeyCodes.Tab ) {
			// Prevent moving to next element for a split second
			event.preventDefault();
			this.saveEdit();
		}
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	inputKeyUp( event ) {
		if( event.keyCode === KeyCodes.Enter
			&& !this.editButtonClicked
		) {
			// Prevent accidental form submission
			event.preventDefault();
			this.saveEdit();
		} else if( event.keyCode === KeyCodes.Esc ) {
			this.cancelEdit();
		}
		this.editButtonClicked = false;
	}
}

window.ClickToEdit = ClickToEdit;
