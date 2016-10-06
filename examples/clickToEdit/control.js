'use strict';

const KeyCodes = {
	Enter: 13,
	Esc: 27,
	Tab: 9
};

class ClickToEdit {
	constructor( node, data ) {
		this.data = JSON.parse( data );
		this.title = this.data.title;

		this.contents = this.data.contents;

		this.elements = {
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
		var title = this.data.title;
		this.elements.title.text( title );

		this.elements.button
			.on( 'keydown', e => this.editButtonKeyDown( e ) )
			.on( 'keyup', e => this.editButtonKeyUp( e ) )
			.on( 'click', () => this.editButtonClick() )
			.on( 'focus', () => this.editButtonFocus() )
			.on( 'blur', () => this.editButtonBlur() );

		this.updateEditButton();

		this.elements.contents
			.text( this.data.contents )
			.on( 'click', () => this.contentsClick() );

		this.elements.input
			.attr( 'name', this.data.name )
			// Information on what just happened, and how to finish editing.
			// Will be read out when focusing in the field, before the contents.
			.attr( 'aria-label', `Editing ${title}. Hit Tab to finish, or Escape to cancel.` )
			.on( 'keydown', e => this.inputKeyDown( e ) )
			.on( 'keyup', e => this.inputKeyUp( e ) )
			.on( 'blur', () => this.inputBlur() );
	}

	/***** Specifically around editing *****/

	activateEdit() {
		this.elements.input.val( this.contents );

		this.elements.display.addClass( 'hidden' );
		this.elements.inputContainer.removeClass( 'hidden' );
		this.elements.input.focus();
	}

	cancelEdit() {
		this.endEdit();
	}

	saveEdit() {
		this.contents = this.elements.input.val();
		this.endEdit();
	}

	endEdit() {
		this.elements.contents.text( this.contents );
		this.elements.display.removeClass( 'hidden' );
		this.elements.inputContainer.addClass( 'hidden' );

		this.updateEditButton();
		this.elements.button.focus();

		Announce.announce( 'Done editing' );
	}

	updateEditButton() {
		this.elements.button.text( `${this.title}: ${this.contents}. Activate to edit.` );
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

	editButtonKeyUp( event ) {
		// TODO: FIgure out how I've done this before
		// Prevent the default action in case the user hits Enter, which
		// may attempt to submit the form
		// event.preventDefault();
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
