# Accessible HTML Control Examples

This project is a collection of interactive HTML controls that have been designed with accessibility (a11y) in mind,
particularly from the perspective of screen-readers.
They are intended as examples of practices you can adopt for your own project(s).

While there are some aspects that are specific to the exact control they're being utilised on, there are a number of
practices that are much more general, and should be followed anywhere you're creating an interactive webpage.
For example, the timing of ARIA alerts compared to focus changes, or using offscreen controls.

This README, and the project as a whole, is not intended as a primer for web accessibility.
Instead it assumes that you're already familiar with the basics of [WAI-ARIA (Web Accessibility Initiative – Accessible
Rich Internet Applications)][wai-aria] and [WCAG (Web Content Accessibility Guidelines)][wcag], and attempts to help you
with some of the trickier aspects.

[wai-aria]: https://www.w3.org/WAI/intro/aria
[wcag]: https://www.w3.org/WAI/intro/wcag

## What is Web Accessibility, and why is it important?

The W3C has [a better explanation][w3c] that I'd ever be able to write.
If this is your first foray into web accessibility, WAI-ARIA, etc., I'd highly recommend checking out that page before
continuing to read this README.

[w3c]: https://www.w3.org/WAI/intro/accessibility.php

## Code Examples

The example controls can be found under `examples/`, each in their own folder.
The index page that uses them is in `demo/`.
They're written in ES6 to make the code cleaner and easier to read, but the same approaches can be applied in regular
JavaScript/ES5.

The "loader" is something I threw together quickly to avoid relying on any particular framework, and, for the most part,
can be safely ignored.

### Running the Demo

If you're using an "Evergreen" browser that supports ES6+ (Firefox, Chrome, Edge), you can run the demo without the dev
dependencies and additional compilation using:

```bash
npm install --production
npm start
```

If you're using a browser that doesn't support ES6+ (Internet Explorer 11, Safari), additional dependencies and
compilation will be required:

```bash
npm install
npm run start:old-browser
```

Both of these will start the demo and let you view it at **[http://localhost:3000][localhost]**

If you're not sure which to run, you can try `npm start` and see if it loads.
If it doesn't, then try `npm run start:old-browser`.
Alternatively, you can check out the [ECMAScript Compatibility Table][es-table] to see what your browser supports.

[localhost]: http://localhost:3000
[es-table]: https://kangax.github.io/compat-table/es6/

## General Concepts and Practices

### It's All About Context

Context is the most important aspect of a webpage, no matter your perspective.
What is the page for? What is it for? Where are you?
Whether you're someone who likes to tab between links and form elements, someone who clicks things with the mouse, or
someone who uses a screen-reader to navigate a page, context is everything.

As a web developer, it's your job to make sure all your users can get around the page, know how to use everything, and
don't lose their place partway through.
All of the techniques described here are, essentially, ways of giving users context.

### Label your Inputs

This is one of the most basic requirements for making a form accessible.
Any time you have a form element, you *must* label it using a `<label>` element.

For anyone using a screen-reader, it will give the element a name for when it receives focus, or when the user is
looking through a list of all form elements on the page.
For sighted users, it gives a much larger area to click on to activate the control.

An example with a checkbox:

```HTML
<!-- Not good. do NOT do this -->
<div>
	<h2>Rocket Engines</h2>

	<input type="checkbox" name="enabled" />
	Enable Rocket Engines
</div>
```

A screen-reader user would navigate to the checkbox and simply be told that it's a checkbox.
No information about what it's for would be said, and they'd be forced to figure it out by continuing to read the page
and figure out the context.

A sighted user would be able to see what it's for, but would have to click the tiny box that is the checkbox.
Not easy for someone who has difficulties with fine motor control, a lousy mouse, or just using a touchscreen.

 ```HTML
 <!-- Good, do this -->
 <div>
 	<h2>Rocket Engines</h2>
 
 	<label>
		<input type="checkbox" name="enabled" />
		Enable Rocket Engines 	
	</label>
 </div>
 ```

By using a `<label>`, a screen-reader would be able to associate the text with the checkbox, and tell the user what it's
for when they get to it. No guessing or context searching required.

For a sighted user, they can now click on the text to active it, making it a much larger, easier to hit, target.

While the technique of putting both the text and input element inside the label is recommended--both by myself and
others--there are other ways you can achieve the same results, which would be just as effective.
The Mozilla Developer Network (MDN) [`<label>` element documentation][mdn-label] has examples.

**Note:** Buttons (`<button>...</button>` and `<input type="[button|submit]" />`) are the exception to this rule, as
they are self-labelling.

[mdn-label]: https://developer.mozilla.org/en/docs/Web/HTML/Element/label

### Hiding Elements

There are times that you'll want to hide elements, either from your sighted users so only those using a screen-reader
can see it, or hiding from screen-readers but still showing it everyone else.

#### Visually hidden/Offscreen elements (screen-reader only)

The practice of hiding an element from sighted users is typically done by creating an "offscreen" element.
The element is positioned way off the edge of the screen, and usually only a single pixel large.
This effectively makes it invisible to anyone looking at the page, but it is still in the DOM, can still be interacted
with, and will still show up to screen-readers.

##### When to use it

You would want to use offscreen elements when you're including extra text or other elements that a sighted user doesn't
need to see and/or interact with it, but a screen-reader user does. Some examples:

- Instructions or extra descriptions
  - How to use a special control
  - Summary information for a table
  - Brief description of page stage (see the Radio Group section below)
  - Alternate form of visual information, such as images or graphs
- Faking the appearance and interaction of a control
  - Using a button or radio button without the control being visible
    - Examples in the Click-to-Edit and Radio Group controls, described below
  - Differences in visual layout and [semantic ordering][semantic_ordering]
    - More detail in "Faking visual focus" below

[semantic_ordering]: https://www.w3.org/TR/UNDERSTANDING-WCAG20/content-structure-separation-sequence.html

##### How to do it

The de facto method is with some [offscreen CSS from WebAIM][webaim].
However, I recommend adding `white-space: nowrap` to what they provide.

```CSS
.offscreen {
	position: absolute;
	left: -10000px;
	top: auto;
	width: 1px;
	height: 1px;
	overflow: hidden;
	white-space: nowrap;
}
```

I've run into issues with NVDA/Firefox and VoiceOver/Safari with the CSS provided by WebAIM. NVDA/Firefox strips
spaces from the text being read, and VoiceOver/Safari wraps it harshly and reads it as one letter per line.
Including `white-space: nowrap` fixes both these issues, without causing any issues.

**Note:** Do **NOT** use `display: none`, or setting the element height or width to 0.
Screen-readers will treat these elements as non-existent.

[webaim]: http://webaim.org/techniques/css/invisiblecontent/#absolutepositioning

#### Hiding from screen-readers

There are some elements that are important for visual styling, or pure user interactivity, that you'll want to hide from
screen-readers.
This is easily accomplished by adding `aria-hidden="true"` to the element.

```HTML
This is some text that the screen-reader will see.
<span aria-hidden="true">
	Screen-readers will not include this in the document structure.
</span> 
```

Some times you may want to use it:

- Purely visual parts of the page
- Things that are duplicated offscreen due to visual style vs. [semantic order][semantic_ordering]
- ARIA Live elements that are being used for announcements
  - Described more in "ARIA Alerts" below

You should use this **only** when you **have** to.
When you do have to use it, you should provide an alternative for screen-reader users to access the same control or
information.

### Focus

Focusing elements on a web page--whether it's the user moving the focus or JavaScript moving it for them--can seem
simple, but in certain situations, can be very tricky to get right.

Most users will focus on elements by clicking on them, or using the Tab key to move between focusable elements.
Screen-reader users can use the above, or similar using quick-nav tools, but frequently will focus elements just as part
of navigating/reading the page.

#### Visual focus

One of the most basic aspects of making your page visually accessible to both those who do and do not have a disability,
is to [visually indicate which element has focus][visible-focus].
Most browsers will do this for you by default by putting an outline or glow around the element.
However, this may not always occur, either because the browser doesn't do it (eg: Internet Explorer 11), a CSS "reset"
has been applied, the element is offscreen, or any number of other reasons.

Applying your own focus effect is really easy:

```CSS
.your-element:focus {
	border: thin solid blue;
}
```

When choosing how to show focus, you can use whatever styling you want, but users working in high contrast mode won't be
able to see colour or background changes.
As such, it's recommended to use outlines, borders, and/or underlines to indicate focus.

If you want to have a completely custom effect, without the browser putting its own focus indicator, you can do so by
setting `outline: none`.
However, you **must** add something of your own to make the focus visible again.

[visible-focus]: https://www.w3.org/WAI/WCAG20/quickref/#qr-navigation-mechanisms-focus-visible

#### Faking visual focus

If the user is able to focus on an element they cannot see, you must apply a focus style to something that they can see.
You can see an example of this in the Click-to-Edit control, where the Activate button is offscreen, but the clickable,
though unfocusable, element is onscreen and receives a focus highlight when the button is focused.

This is done through a combination of JavaScript and CSS. For example, your JavaScript could be:

```JavaScript
$( '.offscreenButton' )
	.on( 'focus', function() {
		$( '.onscreenButton' ).addClass( 'focused' );
	} )
	.on( 'blur', function() {
		$( '.onscreenButton' ).removeClass( 'focused' );
	} );
```

Your CSS would look like:

```CSS
.onscreenButton {
	/* CSS to make it appear offscreen */
}

.onscreenButton:focus {
	outline: none;
}

.onscreenButton {
	/* Some general styling for the "fake" button */
}

.onscreenButton.focused {
	border: thin solid blue;
	background-color: lightblue;
}
```

Faking focus is something you may also need to do if you want to include a control in one spot of the semantic order,
but for technical reasons need to put the visible control somewhere else.
While this is not recommended, there are edge cases where it is necessary.

Whenever possible you should use the same control for keyboard, screen-reader, and sighted users.

#### Controlling a user's focus

The more dynamic a control the more likely it is you will have to move the user's focus using JavaScript.
While not a big concern for sighted or keyboard users, you can cause a lot of confusion for screen-reader users if
you're not careful.

Every time you change the focus the screen-reader will start reading out the element that it was moved to.
Even empty element will be read as, "blank".

Unless you need to move the user's focus, don't.

If you have to, move it somewhere that makes sense.
In the Click-to-Edit control, the focus moves from the activation button to the input field, which is labelled to reduce
confusion.

##### Edge cases

One case that I've run into is if you're moving the focus from an element to one of its children, such as from a
container `<div>` to an in-place editor--such as TinyMCE operating in a `<div>`--that is a child of that container.
In this case you may have to move the focus outside of the parent before you can move it to the child.

Another edge case is when you move the user's focus to an element then delete it when it loses focus.
If done immediately it can cause a screen-reader to lose its place on the page and malfunction, rendering the entire
page completely unusable.
To counter this use a timeout after the user has moved, even of just a few milliseconds, before deleting it.

These were both issues I found with a couple of browser/screen-reader combinations, and may affect others.
If you find yourself creating such scenarios, manual testing is essential.

### ARIA Alerts

WAI-ARIA has a mechanism for prompting a screen-reader to read some text without any user interaction, known as
[ARIA Live Regions][aria-live-w3c].
This is useful for things like chat rooms, news tickers, error alerts, or general information about state changes.

I'd suggest looking at these resources to learn how they work and how to use them:

- [W3C WAI-ARIA Practices Guide for Live Regions][aria-live-w3c]
- [MDN documentation for ARIA Live Regions][aria-live-mdn]

There is an additional technique that I've found can be useful.
`aria-atomic="true"` will cause all of the text to be read out when any of it changes.
However, if you update the contents of an `aria-live` region but set the contents to what is already there then nothing
will be read as nothing has changed. In this scenario, you would want to empty the field then fill it in.
If doing this, you don't need to include `aria-atomic="true"` and can get away with just using `aria-live="polite"`.

```HTML
<span aria-live="polite"
	  aria-hidden="true"
>
	Old text in the announcement container
</span>
```

```JavaScript
function announceText( text ) {
	$( '.announcement' ) // Fetch your aria-live container
		.empty()         // Empty the text so the entire contents change
		.text( text );   // Insert the new text to be read
}
```

[aria-live-w3c]: https://www.w3.org/TR/wai-aria-practices/#liveprops
[aria-live-mdn]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions

#### Timing of alerts

If you are doing a focus change and alert at the same time, you should do the focus change first, then update the text
after a timeout (25-100ms works well).
Failing to do this will cause one of the focused text or the alert text to be interrupted to read the other, leading to
stuttering or confusing speech.

### Error Handling

TODO

### Grouping Elements

To provide further context to form elements, you should use the various methods of control grouping.

A `<fieldset>` element can be used to group a number of controls together, and give them a common name with `<legent>`.
This creates a visual grouping of elements, and for screen-reader users, depending on the software, may cause the form
elements to be grouped or further labelled by the legend text, particularly in quick-nav menus.
For example:

```HTML
<fieldset>
	<legend>Account Details</legend>
	<label>
		Username:
		<input type="text" name="username" />
	</label>
	<label>
		Password:
		<input type="password" name="password" />
	</label>
</fieldset>
```

Radio buttons can be grouped by an element using `role="radiogroup"`.
The containing element can be styled to provide a visual grouping, and, if it's labelled, some screen-readers will use
the label to help describe or the radio buttons, such as in quick-nav menus.
For example:

```HTML
<fieldset>
	<legend>Account Details</legend>

	<!-- ...other form controls... -->

	<div role="radiogroup" aria-labelledby="account-type-label">
		<span id="account-type-label">Account Type</span>
		<label>
			<input type="radio" name="account-type" value="admin" />
			Administrator
		</label>
		<label>
			<input type="radio" name="account-type" value="moderator" />
			Moderator
		</label>
		<label>
			<input type="radio" name="account-type" value="normal" />
			Normal
		</label>
	</div>
</fieldset>
```

Similar groupings can be created with `role="group"`.
For example:

```HTML
<fieldset>
	<legend>Account Details</legend>

	<!-- ...other form controls... -->

	<div role="group" aria-labelledby="phone-label">
		<span id="phone-label">Phone Number</span>
		<input type="text" name="phone-1" title="Area code" />
		<input type="text" name="phone-2" title="Office code" />
		<input type="text" name="phone-3" title="Station number" />
	</div>
</fieldset>
```

The W3C Wiki has an [article on grouping related form controls][grouping-w3c] that goes into more detail.

[grouping-w3c]: https://www.w3.org/WAI/GL/wiki/Using_grouping_roles_to_identify_related_form_controls

## Control-Specific Concepts and Practices

### Click-to-Edit

This is an example of a click-to-edit field that you may encounter on the web.
Commonly used when viewing information about a record where you may want to edit parts of it, but don't want it to look
like a form.
Instead the data is displayed inline and the user can click the text to start editing it.

This can be easy for a sighted user to understand, but someone using a screen-reader can easily get lost unless the
control is designed with care.

My control isn't the only way to do it, but it's what I've found works well and covers most of the edge cases you may
encounter.

#### Activation & focus

There are 3 parts to the control:

1. Offscreen `<button>` for activating the edit field
2. Onscreen display of information, with clickable area to activate the edit field
3. Initially hidden input field with label where the actual editing happens

The offscreen button uses a standard HTML `<button>` element, which can receive focus and be activated with the Enter or
Space keys.
Using a native button gets you all the [required behaviour and keyboard interaction for a button][button-reqs] for free.
It contains the information for the field, as well as instructions for editing the field.

The onscreen display is hidden from screen-readers using `aria-hidden="true"`, and although it can be clicked, it cannot
be focused.
However, it appears to receive focus when the button is focused, so sighted users aren't aware that there is something
invisible that is actually focused.

When the button is activated, or the onscreen display clicked, both the button and display are hidden, the labeled input
field is displayed, and the focus moved to the field.

[button-reqs]: https://www.w3.org/TR/wai-aria-practices-1.1/#button

#### Editing instructions

While a sighted user would be able to see the cursor and background colour change when hovering over the edit display, a
screen-reader user needs the same information presented in a different way.

For this control, the information for the field is contained entirely in the button.
This includes the name, and instructions to edit it. For example, "First Name: John. Activate to edit."
This provides context, the data, and knowledge that the field can be edited, and how to do so.

When editing, the input field has an `aria-label` attribute, specifying the text to label it with.
This is read out as soon as the user's focus is moved into the input field.
For example, "Editing First Name. Hit Tab to finish, or Escape to cancel."
This lets the user know what just happened (they moved to an input field for editing the first name), and how to return
to the previous mode (tab or escape).
While the enter key or anything that shifts focus away from the field would also work, this lets them know for certain.

#### Capturing the Tab key

The Tab key is a special case to handle, especially since the control moves the user's focus when it's hit.
The Tab key will move the user's focus to the next tab-stop unless you stop it on the input's `keydown` event using
`event.preventDefault()`.
If you fail to do so, the user's focus will move to the next element, the focus styling will be applied, and a
screen-reader will begin to read out the text, before your JavaScript has a chance to move the focus elsewhere.
This leads to a jarring experience, and should be prevented.

The Click-to-Edit control handles this case, and can be used as an example on how to do it properly.

### Radio Group

#### Grouping the radio buttons

TODO

#### Early display of selected value

TODO

#### Summarizing the option

TODO

## Recommended Resources

- [WAI-ARIA 1.1 Description and Specifications](https://www.w3.org/TR/wai-aria-1.1/)
- [WAI-ARIA 1.1 Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/#button)
- [Techniques for WCAG 2.0](https://www.w3.org/TR/WCAG20-TECHS/)
- [MDN Reference for Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)