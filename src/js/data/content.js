'use strict';

/** User-facing copy and lookup tables that are shared by several event types. */
Eventwise.content = {
  /** Style choices, each with the styling tip shown in the plan. */
  VIBES: Object.freeze({
    Traditional: 'Lean on cultural rituals, marigolds, brass lamps and live folk music.',
    'Modern minimal': 'Use a two-colour palette, clean signage and a few bold statement pieces.',
    'Outdoor / garden': 'Pick golden-hour timing, shaded seating and a rain plan.',
    'Fun & colourful': 'Use bright colours, interactive game zones and a photo wall.',
    'Eco-friendly': 'Choose reusable crockery, potted-plant decor and seed-paper invitations.',
  }),

  /** Word added to decor searches for a style. Styles not listed add nothing. */
  VIBE_SEARCH_WORDS: Object.freeze({
    Traditional: 'traditional',
    'Modern minimal': 'minimal',
    'Fun & colourful': 'colourful',
    'Eco-friendly': 'eco friendly',
  }),

  /** Words in "specific needs" that trigger a shopping link. */
  SHOPPING_KEYWORDS: Object.freeze([
    { word: 'flower', label: 'Flowers and garlands', query: 'artificial flowers decoration' },
    { word: 'garland', label: 'Garlands', query: 'artificial marigold flower garlands' },
    { word: 'cake', label: 'Cake toppers and candles', query: 'cake topper candles' },
    { word: 'balloon', label: 'Balloons', query: 'balloons decoration set' },
    { word: 'light', label: 'Fairy lights', query: 'led fairy string lights' },
    { word: 'candle', label: 'Decorative candles', query: 'decorative candles' },
    { word: 'banner', label: 'Banners', query: 'party banner' },
    { word: 'gift', label: 'Gift boxes and wrapping', query: 'gift wrapping paper box' },
    { word: 'rangoli', label: 'Rangoli kits', query: 'rangoli colours stencil' },
    { word: 'photo', label: 'Photo booth props', query: 'photo booth props' },
  ]),

  /** Google Maps searches offered for every event type. */
  VENDOR_SEARCHES: Object.freeze([
    'Caterers',
    'Florists',
    'Decorators',
    'Bakeries',
    'Photographers',
  ]),

  /** One-tap questions for the "Ask Eventwise" box. */
  QUICK_QUESTIONS: Object.freeze([
    'How can I save 15%?',
    'What could go wrong?',
    'What should I do this week?',
    'Write a short invitation message',
  ]),

  /** Budget chart colours, reused in the same order by the donut and the table. */
  CHART_COLORS: Object.freeze([
    '#4b2fd6',
    '#e0457b',
    '#0b8f6a',
    '#d98200',
    '#2a7de1',
    '#9b4bd6',
    '#c4382b',
    '#5a7a00',
    '#6b6b8a',
  ]),
};
