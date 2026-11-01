'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadCore } = require('../helpers/load-core');

const { constants, content, profiles } = loadCore();

describe('event profiles', () => {
  it('cover the eight supported event types', () => {
    assert.deepEqual(Object.keys(profiles), [
      'wedding',
      'birthday',
      'community',
      'engagement',
      'babyshower',
      'anniversary',
      'corporate',
      'housewarming',
    ]);
  });

  for (const [type, profile] of Object.entries(profiles)) {
    describe(type, () => {
      const categories = Object.keys(profile.allocation);

      it('has display details and thresholds', () => {
        assert.ok(profile.label && profile.icon);
        assert.ok(profile.minPerGuest > 0 && profile.rushDays > 0);
      });

      it('splits exactly 100% of the budget and ends with contingency', () => {
        const total = Object.values(profile.allocation).reduce((sum, share) => sum + share, 0);
        assert.equal(total, 100);
        assert.equal(categories.at(-1), constants.CONTINGENCY);
      });

      it('has vendor tasks for every category and for no unknown one', () => {
        assert.deepEqual(Object.keys(profile.vendorTasks).sort(), [...categories].sort());
        for (const tasks of Object.values(profile.vendorTasks)) {
          assert.ok(tasks.length >= 1);
        }
      });

      it('has milestones counting down to event day', () => {
        const days = profile.milestones.map((milestone) => milestone.daysBefore);
        assert.equal(days.at(-1), 0);
        assert.ok(
          days.every((day, i) => i === 0 || days[i - 1] > day),
          'strictly decreasing',
        );
        assert.ok(profile.milestones.every((milestone) => milestone.task));
      });

      it('has starter ideas, venue searches and shopping suggestions that fit its budget', () => {
        assert.ok(profile.ideas.length >= 3);
        assert.ok(Array.isArray(profile.venueSearches));
        for (const category of Object.keys(profile.shopping)) {
          assert.ok(categories.includes(category), category);
        }
        for (const items of Object.values(profile.shopping)) {
          assert.ok(items.every((item) => item.label && item.query));
        }
      });
    });
  }
});

describe('shared content', () => {
  it('has a styling tip for every style', () => {
    assert.ok(Object.values(content.VIBES).every((tip) => tip.length > 10));
  });

  it('only gives search words to styles that exist', () => {
    for (const style of Object.keys(content.VIBE_SEARCH_WORDS)) {
      assert.ok(content.VIBES[style], style);
    }
  });

  it('has enough chart colours for the largest budget', () => {
    const largest = Math.max(
      ...Object.values(profiles).map((p) => Object.keys(p.allocation).length),
    );
    assert.ok(content.CHART_COLORS.length >= largest);
  });
});
