export const engagement = {
  label: 'Engagement',
  icon: '💑',
  minPerGuest: 1200,
  rushDays: 60,
  allocation: {
    Venue: 25,
    Catering: 28,
    'Decor & flowers': 12,
    'Photo & video': 8,
    'Attire & jewellery': 12,
    'Music & entertainment': 5,
    'Invitations & gifts': 4,
    Contingency: 6,
  },
  milestones: [
    { daysBefore: 180, task: 'Set budget and guest list' },
    { daysBefore: 150, task: 'Book venue and caterer' },
    { daysBefore: 120, task: 'Book photographer and decor' },
    { daysBefore: 90, task: 'Shop for attire and jewellery' },
    { daysBefore: 45, task: 'Send invitations' },
    { daysBefore: 21, task: 'Finalise menu and ceremony schedule' },
    { daysBefore: 7, task: 'Reconfirm vendors and clear payments' },
    { daysBefore: 1, task: 'Rehearse the ring exchange and set up' },
    { daysBefore: 0, task: 'Event day: name a point person for each vendor' },
  ],
  vendorTasks: {
    Venue: [
      'Confirm capacity, seating and stage layout',
      'Check booking, cancellation and overtime terms',
    ],
    Catering: [
      'Arrange a tasting and confirm dietary needs',
      'Agree per-plate price and staff count',
    ],
    'Decor & flowers': [
      'Share a theme and get an itemised quote',
      'Confirm stage and ring-ceremony setup',
    ],
    'Photo & video': ['Agree on a shot list and delivery date'],
    'Attire & jewellery': ['Book fittings early and plan alterations'],
    'Music & entertainment': ['Confirm sound limits and a playlist'],
    'Invitations & gifts': ['Proof invitation text and arrange exchange gifts'],
    Contingency: ['Keep untouched until the final week'],
  },
  ideas: [
    {
      title: 'Couple journey reel',
      detail: 'Play a short photo montage during the ring ceremony.',
    },
    {
      title: 'Blessing wall',
      detail: 'Guests leave notes for the couple on a floral backdrop.',
    },
    {
      title: 'Family menu stations',
      detail: 'One counter for each family favourite keeps the menu personal.',
    },
  ],
  venueSearches: ['Banquet Halls', 'Restaurants with Private Dining', 'Resorts'],
  shopping: {
    'Decor & flowers': [
      { label: 'Flower decor', query: 'artificial flowers decoration' },
      { label: 'Fairy lights', query: 'led fairy string lights' },
    ],
    'Invitations & gifts': [
      { label: 'Ring ceremony platters', query: 'engagement ring ceremony platter' },
    ],
    'Attire & jewellery': [{ label: 'Jewellery sets', query: 'jewellery set for women' }],
  },
};
