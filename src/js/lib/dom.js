/**
 * Small DOM helpers. Text is always added as text nodes, never parsed as
 * HTML, so user input cannot inject markup.
 */
/** @returns {Element | null} first match for `selector` under `root` */
const $ = (selector, root = document) => root.querySelector(selector);

/** @returns {Element[]} every match for `selector` under `root` */
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * Creates an element.
 * @param {string} tag
 * @param {Record<string, string | boolean | null | undefined>} [attributes]
 *   `true` sets a bare attribute; `false`, `null` and `undefined` skip it.
 * @param {...(Node | string | Array<Node | string>)} children
 * @returns {HTMLElement}
 */
function el(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value == null) {
      continue;
    }
    element.setAttribute(name, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    element.append(child);
  }
  return element;
}

/** Creates a `<section>` labelled by its own `<h3>` heading. */
const labelledSection = (headingId, title, ...children) =>
  el('section', { 'aria-labelledby': headingId }, el('h3', { id: headingId }, title), ...children);

/** Creates a button that runs `onClick` when pressed. */
function button(label, onClick, attributes = {}) {
  const element = el('button', { type: 'button', ...attributes }, label);
  element.addEventListener('click', onClick);
  return element;
}

/** Runs `onSubmit` when Enter is pressed inside `input`, without submitting a form. */
function onEnter(input, onSubmit) {
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    onSubmit();
  });
}

export { $, $$, el, labelledSection, button, onEnter };
