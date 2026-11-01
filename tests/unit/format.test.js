'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadCore } = require('../helpers/load-core');

const { format } = loadCore();

describe('formatINR', () => {
  it('uses Indian digit grouping with no decimals', () => {
    assert.equal(format.formatINR(500000), '₹5,00,000');
    assert.equal(format.formatINR(1234.56), '₹1,235');
  });
});

describe('formatDate', () => {
  it('writes day, short month and year', () => {
    assert.match(format.formatDate(new Date(2026, 11, 12)), /12 Dec 2026/);
  });
});

describe('pluralize', () => {
  it('only adds "s" when the count is not one', () => {
    assert.equal(format.pluralize(1, 'day'), '1 day');
    assert.equal(format.pluralize(0, 'day'), '0 days');
    assert.equal(format.pluralize(2, 'guest'), '2 guests');
  });
});
