export const housewarming = {
  label: 'Housewarming',
  icon: '🏡',
  minPerGuest: 500,
  rushDays: 21,
  allocation: {
    'Puja & rituals': 15,
    Catering: 35,
    'Decor & flowers': 15,
    'Cleaning & setup': 12,
    'Return gifts': 10,
    'Photo & video': 5,
    Contingency: 8,
  },
  milestones: [
    { daysBefore: 30, task: 'Fix the auspicious time with a priest and set the guest list' },
    { daysBefore: 21, task: 'Book caterer and puja items' },
    { daysBefore: 14, task: 'Send invitations' },
    { daysBefore: 7, task: 'Order decor, flowers and return gifts' },
    { daysBefore: 3, task: 'Deep clean and arrange the home' },
    { daysBefore: 1, task: 'Reconfirm priest, food and setup' },
    { daysBefore: 0, task: 'Event day: puja, meal and house tour' },
  ],
  vendorTasks: {
    'Puja & rituals': ['Confirm the priest and the full samagri list'],
    Catering: [
      'Plan a simple meal and confirm serving staff',
      'Arrange seating or tables for the crowd',
    ],
    'Decor & flowers': ['Order toran, flowers and rangoli materials'],
    'Cleaning & setup': ['Book a deep clean and fix lights and fittings'],
    'Return gifts': ['Order useful gifts with a few spares'],
    'Photo & video': ['Assign someone to capture the puja and house tour'],
    Contingency: ['Keep for repairs and last-minute needs'],
  },
  ideas: [
    {
      title: 'Home story corner',
      detail: 'Show photos of the house journey from plot to move-in.',
    },
    {
      title: 'Traditional milk-boiling moment',
      detail: 'Invite elders to take part in the first ritual.',
    },
    {
      title: 'Plant sapling favours',
      detail: 'Give guests small plants as eco-friendly return gifts.',
    },
  ],
  /** A housewarming happens at home, so there are no venues to search for. */
  venueSearches: [],
  shopping: {
    'Puja & rituals': [{ label: 'Puja item kits', query: 'griha pravesh puja samagri kit' }],
    'Decor & flowers': [
      { label: 'Door toran decor', query: 'door toran decoration' },
      { label: 'Flower garlands', query: 'artificial marigold flower garlands' },
    ],
    'Return gifts': [{ label: 'Return gifts', query: 'return gift for housewarming' }],
  },
};
