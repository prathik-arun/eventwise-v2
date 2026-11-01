'use strict';

const fs = require('node:fs');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { buildBundle, OUTPUT_FILE } = require('../../scripts/build');

describe('the single-file index.html', () => {
  it('is up to date with src/ (run `npm run build` if this fails)', () => {
    assert.equal(fs.readFileSync(OUTPUT_FILE, 'utf8'), buildBundle());
  });

  it('needs no other files: nothing is loaded by URL', () => {
    const html = fs.readFileSync(OUTPUT_FILE, 'utf8');
    assert.doesNotMatch(html, /<script src=|<link rel="stylesheet"/);
  });

  it('runs on its own and builds a plan', () => {
    const html = fs.readFileSync(OUTPUT_FILE, 'utf8');
    const { window } = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
    const { document } = window;
    assert.equal(document.querySelectorAll('#type option').length, 8);
    assert.ok(document.querySelector('style').textContent.includes('--accent'));

    document.querySelector('#date').value = '2099-01-01';
    document.querySelector('#guests').value = '50';
    document.querySelector('#budget').value = '100000';
    document
      .querySelector('#plan-form')
      .dispatchEvent(new window.Event('submit', { cancelable: true }));
    assert.equal(document.querySelector('#results').hidden, false);
  });
});
