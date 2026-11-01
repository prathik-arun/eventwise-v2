export const wedding = {
  label: 'Wedding',
  icon: '💍',
  minPerGuest: 1500,
  rushDays: 90,
  allocation: {
    Venue: 30,
    Catering: 28,
    'Decor & flowers': 10,
    'Photo & video': 9,
    'Attire & beauty': 8,
    'Music & entertainment': 5,
    'Invitations & stationery': 2,
    'Travel & stay': 3,
    Contingency: 5,
  },
  milestones: [
    { daysBefore: 365, task: 'Set budget and draft the guest list' },
    { daysBefore: 300, task: 'Book venue and fix the date' },
    { daysBefore: 270, task: 'Book caterer and photographer' },
    { daysBefore: 180, task: 'Book decor, music and attire' },
    { daysBefore: 120, task: 'Send save-the-dates and block guest stays' },
    { daysBefore: 60, task: 'Send invitations' },
    { daysBefore: 30, task: 'Finalise menu, seating and RSVPs' },
    { daysBefore: 14, task: 'Confirm final headcount with vendors' },
    { daysBefore: 7, task: 'Reconfirm all vendors and clear payments' },
    { daysBefore: 1, task: 'Hold a rehearsal and pack an emergency kit' },
    { daysBefore: 0, task: 'Event day: name a point person for each vendor' },
  ],
  vendorTasks: {
    Venue: [
      'Compare 3 venues and check capacity, parking and power backup',
      'Get the contract reviewed: cancellation, overtime and deposit terms',
    ],
    Catering: [
      'Arrange a tasting and confirm dietary options',
      'Agree per-plate price, staff count and wastage policy',
    ],
    'Decor & flowers': [
      'Share a mood board and get an itemised quote',
      'Confirm setup and teardown timings',
    ],
    'Photo & video': [
      'Review past work and agree on a shot list',
      'Confirm deliverables and delivery date',
    ],
    'Attire & beauty': ['Book fittings and trials early', 'Plan alterations buffer of two weeks'],
    'Music & entertainment': [
      'Confirm sound limits and licences',
      'Share a must-play and do-not-play list',
    ],
    'Invitations & stationery': [
      'Proof the text twice before printing',
      'Set up an RSVP tracking sheet',
    ],
    'Travel & stay': ['Block rooms with a group rate', 'Arrange guest transport on key days'],
    Contingency: ['Keep this untouched until the final week'],
  },
  ideas: [
    {
      title: 'Story-led welcome wall',
      detail: 'Display a timeline of the couple with photos from childhood to engagement.',
    },
    {
      title: 'Regional food counters',
      detail: 'Showcase dishes from both families for a personal and cost-balanced menu.',
    },
    {
      title: 'Live sketch artist',
      detail: 'Guests take home a caricature as a keepsake instead of a costly favour.',
    },
  ],
  venueSearches: ['Banquet Halls', 'Wedding Lawns', 'Resorts and Farmhouses', 'Convention Centres'],
  shopping: {
    'Decor & flowers': [
      { label: 'Flower garlands', query: 'artificial marigold flower garlands' },
      { label: 'Stage and mandap decor', query: 'wedding stage decoration items' },
      { label: 'Fairy lights', query: 'led fairy string lights' },
    ],
    'Invitations & stationery': [{ label: 'Invitation cards', query: 'wedding invitation cards' }],
    'Attire & beauty': [{ label: 'Bridal accessories', query: 'bridal jewellery set' }],
  },
};
