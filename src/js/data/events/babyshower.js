'use strict';

Eventwise.profiles.babyshower = {
  label: 'Baby shower',
  icon: '🍼',
  minPerGuest: 700,
  rushDays: 21,
  allocation: {
    Venue: 20,
    'Food & desserts': 30,
    Decor: 18,
    'Games & activities': 10,
    'Photo & video': 6,
    'Return gifts': 10,
    Contingency: 6,
  },
  milestones: [
    { daysBefore: 45, task: 'Set budget, guest list and theme' },
    { daysBefore: 35, task: 'Book venue and decor' },
    { daysBefore: 28, task: 'Send invitations' },
    { daysBefore: 21, task: 'Order cake and plan games' },
    { daysBefore: 10, task: 'Confirm RSVPs and order return gifts' },
    { daysBefore: 3, task: 'Reconfirm food and decor' },
    { daysBefore: 1, task: 'Set up with a comfortable seating area' },
    { daysBefore: 0, task: 'Event day: enjoy the celebration' },
  ],
  vendorTasks: {
    Venue: ['Check seating comfort, lifts and washroom access'],
    'Food & desserts': [
      'Choose light, pregnancy-friendly options',
      'Confirm cake flavour and pickup time',
    ],
    Decor: ['Order theme props, balloons and a photo corner'],
    'Games & activities': ['Prepare 2 or 3 simple games and small prizes'],
    'Photo & video': ['Assign someone to capture key moments'],
    'Return gifts': ['Order a few spares beyond the guest count'],
    Contingency: ['Keep for last-minute needs'],
  },
  ideas: [
    {
      title: 'Guess the baby item',
      detail: 'A simple game using baby products that guests can take home.',
    },
    {
      title: 'Wishes for baby book',
      detail: 'Guests write advice and blessings to read later.',
    },
    {
      title: 'Pastel dessert table',
      detail: 'A neutral palette suits any outcome and photographs well.',
    },
  ],
  venueSearches: ['Party Halls', 'Restaurants with Private Dining', 'Cafes for Private Events'],
  shopping: {
    Decor: [{ label: 'Baby shower decor kits', query: 'baby shower decoration kit' }],
    'Games & activities': [{ label: 'Baby shower games', query: 'baby shower games kit' }],
    'Return gifts': [{ label: 'Return gifts', query: 'return gifts for guests' }],
  },
};
