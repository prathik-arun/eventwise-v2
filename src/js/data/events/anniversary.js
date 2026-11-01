'use strict';

Eventwise.profiles.anniversary = {
  label: 'Anniversary',
  icon: '🥂',
  minPerGuest: 1000,
  rushDays: 30,
  allocation: {
    Venue: 22,
    Catering: 30,
    'Decor & flowers': 12,
    'Cake & desserts': 8,
    'Photo & video': 8,
    'Music & entertainment': 8,
    'Gifts & keepsakes': 8,
    Contingency: 4,
  },
  milestones: [
    { daysBefore: 60, task: 'Set budget, guest list and theme' },
    { daysBefore: 45, task: 'Book venue and caterer' },
    { daysBefore: 30, task: 'Book photographer and entertainment' },
    { daysBefore: 21, task: 'Send invitations' },
    { daysBefore: 14, task: 'Order cake and keepsakes' },
    { daysBefore: 7, task: 'Confirm RSVPs and reconfirm vendors' },
    { daysBefore: 1, task: 'Set up and prepare the slideshow or speeches' },
    { daysBefore: 0, task: 'Event day: celebrate' },
  ],
  vendorTasks: {
    Venue: ['Confirm timing, capacity and decoration rules'],
    Catering: ['Match the menu to the couple favourites', 'Confirm serving staff'],
    'Decor & flowers': ['Plan a memory wall and a floral backdrop'],
    'Cake & desserts': ['Confirm flavour, size and pickup time'],
    'Photo & video': ['Plan a photo slideshow and a family group shot'],
    'Music & entertainment': ['Prepare a playlist from the couple years together'],
    'Gifts & keepsakes': ['Order framed photos or an album'],
    Contingency: ['Keep for last-minute needs'],
  },
  ideas: [
    {
      title: 'Years-together timeline',
      detail: 'Display one photo for each year on a string of lights.',
    },
    {
      title: 'Vow renewal toast',
      detail: 'Invite the couple to say a few words and raise a toast.',
    },
    {
      title: 'Favourite-songs set',
      detail: 'Build the playlist from songs that mark their milestones.',
    },
  ],
  venueSearches: ['Banquet Halls', 'Rooftop Restaurants', 'Restaurants with Private Dining'],
  shopping: {
    'Decor & flowers': [
      { label: 'Anniversary decor', query: 'anniversary decoration items' },
      { label: 'Fairy lights', query: 'led fairy string lights' },
    ],
    'Cake & desserts': [{ label: 'Cake toppers and candles', query: 'cake topper candles' }],
    'Gifts & keepsakes': [{ label: 'Photo frames', query: 'photo frame gift' }],
  },
};
