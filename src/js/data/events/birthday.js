export const birthday = {
  label: 'Birthday',
  icon: '🎂',
  minPerGuest: 600,
  rushDays: 21,
  allocation: {
    Venue: 20,
    Catering: 35,
    Decor: 12,
    'Cake & desserts': 8,
    Entertainment: 12,
    'Photo & video': 5,
    'Return gifts': 4,
    Contingency: 4,
  },
  milestones: [
    { daysBefore: 60, task: 'Set budget, guest list and theme' },
    { daysBefore: 45, task: 'Book venue and entertainer' },
    { daysBefore: 30, task: 'Order cake and decor; send invites' },
    { daysBefore: 14, task: 'Confirm RSVPs and order return gifts' },
    { daysBefore: 7, task: 'Reconfirm vendors and finalise food' },
    { daysBefore: 1, task: 'Set up the space and collect the cake' },
    { daysBefore: 0, task: 'Event day: enjoy the party' },
  ],
  vendorTasks: {
    Venue: ['Confirm timing, capacity and any decoration rules'],
    Catering: ['Check allergies and kids or elders needs', 'Confirm serving staff and cutlery'],
    Decor: ['Order balloons, banners and table settings', 'Plan a photo corner'],
    'Cake & desserts': ['Confirm flavour, size and pickup time'],
    Entertainment: [
      'Book host, magician or DJ and agree on duration',
      'Prepare a playlist and a game plan',
    ],
    'Photo & video': ['Assign a friend or hire a photographer for key moments'],
    'Return gifts': ['Order a few spares beyond the guest count'],
    Contingency: ['Keep for last-minute needs'],
  },
  ideas: [
    {
      title: 'Treasure hunt',
      detail: 'Clue cards around the venue keep children busy and need little budget.',
    },
    {
      title: 'DIY dessert bar',
      detail: 'Let guests decorate cupcakes; it doubles as the activity.',
    },
    {
      title: 'Memory jar',
      detail: 'Guests write wishes on cards that the birthday person reads later.',
    },
  ],
  venueSearches: ['Party Halls', 'Kids Party Venues', 'Restaurants with Private Dining'],
  shopping: {
    Decor: [
      { label: 'Balloon kits', query: 'birthday balloons decoration kit' },
      { label: 'Banners and backdrops', query: 'birthday banner backdrop' },
    ],
    'Cake & desserts': [
      { label: 'Cake toppers and candles', query: 'cake topper candles' },
      { label: 'Cake stands', query: 'cake stand' },
    ],
    'Return gifts': [{ label: 'Return gifts', query: 'return gifts for kids birthday' }],
  },
};
