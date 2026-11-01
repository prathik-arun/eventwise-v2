'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { bootApp } = require('../helpers/boot-app');

const window = bootApp();
const { button, el, labelledSection, onEnter } = window.Eventwise.dom;

describe('el', () => {
  it('never parses text as HTML', () => {
    const paragraph = el('p', {}, '<b>x</b>');
    assert.equal(paragraph.children.length, 0);
    assert.equal(paragraph.textContent, '<b>x</b>');
  });

  it('sets attributes, skipping false, null and undefined, and writing true as a bare attribute', () => {
    const input = el('input', {
      id: 'a',
      hidden: true,
      disabled: false,
      title: null,
      lang: undefined,
    });
    assert.equal(input.getAttribute('id'), 'a');
    assert.equal(input.getAttribute('hidden'), '');
    assert.equal(input.hasAttribute('disabled'), false);
    assert.equal(input.hasAttribute('title'), false);
    assert.equal(input.hasAttribute('lang'), false);
  });

  it('accepts a list of children as well as separate ones', () => {
    const list = el('ul', {}, [el('li', {}, 'a'), el('li', {}, 'b')], el('li', {}, 'c'));
    assert.equal(list.children.length, 3);
  });
});

describe('labelledSection', () => {
  it('points the section at its own heading', () => {
    const section = labelledSection('h-x', 'Title', el('p', {}, 'body'));
    assert.equal(section.getAttribute('aria-labelledby'), 'h-x');
    assert.equal(section.querySelector('h3#h-x').textContent, 'Title');
    assert.equal(section.querySelector('p').textContent, 'body');
  });
});

describe('button and onEnter', () => {
  it('button runs its handler and is not a submit button', () => {
    let clicks = 0;
    const control = button('Go', () => (clicks += 1), { class: 'alt' });
    control.click();
    assert.equal(clicks, 1);
    assert.equal(control.type, 'button');
    assert.equal(control.className, 'alt');
  });

  it('onEnter reacts to Enter only, and stops the form from submitting', () => {
    const input = el('input');
    let submits = 0;
    onEnter(input, () => (submits += 1));
    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a' }));
    const enter = new window.KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    input.dispatchEvent(enter);
    assert.equal(submits, 1);
    assert.equal(enter.defaultPrevented, true);
  });
});
