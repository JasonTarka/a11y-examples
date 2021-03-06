'use strict';

class RadioGroup {
	constructor( node, data ) {
		this.data = data;

		this.elements = {
			title: $( '.title', node ),
			selectionInfo: $( '.selection-info', node ),
			description: $( '.description', node ),
			options: $( '.options', node )
		};
		this.selected = null;

		this.init();
	}

	init() {
		const titleId = `${this.data.name}-title`;

		this.elements.title
			.text( this.data.title )
			.attr( 'id', titleId );
		this.elements.options.attr( 'aria-labelledby', titleId );
		this.elements.description.text( this.data.description );

		Object.keys( this.data.options )
			.forEach( value => this.elements.options.append(
				this.constructOptionNode( value, this.data.options[value] )
			) );

		this.elements.options.find( 'input:radio' )
			.on( 'change', e => this.radioChanged( e ) )
			.on( 'focus', e => this.radioFocused( e ) )
			.on( 'blur', e => this.radioBlurred( e ) );

		this.updateSelectionInfo();
	}

	updateSelectionInfo() {
		const text = this.selected == null
			? `No ${this.data.title} selected.`
			: `${this.data.options[this.selected].summary} selected.`;

		this.elements.selectionInfo.text( text );

		this.elements.options.find( 'label' ).removeClass( 'selected' );
		this.getOption( this.selected ).addClass( 'selected' );
	}

	/***** Event handling *****/

	/**
	 * @param {InputEvent} event
	 */
	radioChanged( event ) {
		this.selected = event.target.value;
		this.updateSelectionInfo();
	}

	/**
	 * @param {InputEvent} event
	 */
	radioFocused( event ) {
		const value = event.target.value;
		this.getOption( value ).addClass( 'focused' );
	}

	/**
	 * @param {InputEvent} event
	 */
	radioBlurred( event ) {
		const value = event.target.value;
		this.getOption( value ).removeClass( 'focused' );
	}

	/***** Node Creation *****/

	constructOptionNode( value, optionData ) {
		const name = this.data.name,
			title = this.data.title,
			summary = optionData.summary,
			description = optionData.description,
			id = `${name}-${value}`;

		let selected = '';
		if( optionData.selected ) {
			this.selected = value;
			selected = 'checked="checked"';
		}

		return $( `
			<label id="${id}">
				<span class="offscreen">
					<!-- Using aria-label to give the radio a shorter name --> 
					<input type="radio"
						   value="${value}"
						   name="${name}"
						   aria-label="${summary}"
						   ${selected}
						/>
				</span>

				<!-- Hidden from screen readers to not repeat information -->
				<div class="summary">
					${summary}
				</div>
				<div class="description">
					${description}
				</div>
			</label>` );
	}

	getOption( value ) {
		return this.elements.options.find( `#${this.data.name}-${value}` );
	}
}

window.RadioGroup = RadioGroup;
