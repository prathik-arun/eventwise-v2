import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as budget from '../../src/js/planner/budget.js';
import * as links from '../../src/js/planner/links.js';

describe('amazonSearchUrl', () => {
  it('encodes the query and stays on amazon.in', () => {
    assert.equal(links.amazonSearchUrl('a&b c'), 'https://www.amazon.in/s?k=a%26b%20c');
  });
});

describe('buildShoppingLinks', () => {
  const labelsFor = (request, rows) =>
    links.buildShoppingLinks(request, rows).map((link) => link.label);

  it('turns "specific needs" into links, matching the start of words', () => {
    const request = { type: 'birthday', vibe: 'Traditional', requests: 'Flowers and a cake' };
    const labels = labelsFor(request, budget.allocateBudget('birthday', 50_000));
    assert.ok(labels.includes('Flowers and garlands'));
    assert.ok(labels.includes('Cake toppers and candles'));

    const noMatch = { type: 'birthday', vibe: 'Traditional', requests: 'sunflower' };
    assert.ok(!labelsFor(noMatch, []).includes('Flowers and garlands'));
  });

  it('never repeats a link', () => {
    const request = { type: 'birthday', vibe: 'Eco-friendly', requests: 'cake' };
    const labels = labelsFor(request, budget.allocateBudget('birthday', 50_000));
    assert.equal(new Set(labels).size, labels.length);
  });

  it('adds the chosen style to decor searches only', () => {
    const request = { type: 'birthday', vibe: 'Eco-friendly', requests: '' };
    const urls = links.buildShoppingLinks(request, budget.allocateBudget('birthday', 50_000));
    const decor = urls.find((link) => link.label === 'Balloon kits');
    const cake = urls.find((link) => link.label === 'Cake stands');
    assert.match(decodeURIComponent(decor.url), /k=eco friendly birthday balloons/);
    assert.match(decodeURIComponent(cake.url), /k=cake stand$/);
  });

  it('returns nothing for a plan with no matches', () => {
    const request = { type: 'housewarming', vibe: 'Traditional' };
    assert.deepEqual(links.buildShoppingLinks(request, []), []);
  });
});

describe('mapsSearchUrl', () => {
  it('rounds a location to about 1 km', () => {
    const place = { lat: 12.9716, lng: 77.5946 };
    assert.equal(
      links.mapsSearchUrl('Banquet Halls', place, ''),
      'https://www.google.com/maps/search/Banquet%20Halls/@12.97,77.59,13z',
    );
  });

  it('searches inside a typed area and encodes it', () => {
    assert.equal(
      links.mapsSearchUrl('Party Halls', null, 'Indiranagar & co'),
      'https://www.google.com/maps/search/Party%20Halls%20in%20Indiranagar%20%26%20co',
    );
  });

  it('falls back to a plain search', () => {
    assert.equal(
      links.mapsSearchUrl('Caterers', null, ''),
      'https://www.google.com/maps/search/Caterers',
    );
  });
});

describe('places', () => {
  it('formatPlace shows two decimals', () => {
    assert.equal(links.formatPlace({ lat: 12.97163, lng: 77.59456 }), '12.97, 77.59');
  });

  it('isValidPlace rejects impossible or non-numeric coordinates', () => {
    assert.equal(links.isValidPlace(12.9, 77.5), true);
    assert.equal(links.isValidPlace(91, 0), false);
    assert.equal(links.isValidPlace(0, -181), false);
    assert.equal(links.isValidPlace(NaN, 0), false);
    assert.equal(links.isValidPlace(undefined, 0), false);
  });

  it('findVenueRow finds categories starting with "Venue"', () => {
    assert.equal(
      links.findVenueRow(budget.allocateBudget('community', 1e5)).category,
      'Venue & permits',
    );
    assert.equal(links.findVenueRow(budget.allocateBudget('housewarming', 1e5)), undefined);
  });
});
