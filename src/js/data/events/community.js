'use strict';

Eventwise.profiles.community = {
  label: 'Community event',
  icon: '🏘️',
  minPerGuest: 150,
  rushDays: 30,
  allocation: {
    'Venue & permits': 20,
    'Food & refreshments': 25,
    'Sound, stage & AV': 15,
    'Publicity & printing': 10,
    'Safety & first aid': 8,
    'Programme & activities': 12,
    Contingency: 10,
  },
  milestones: [
    { daysBefore: 90, task: 'Define goals, committee and budget' },
    { daysBefore: 75, task: 'Apply for permits and book the venue' },
    { daysBefore: 60, task: 'Recruit volunteers; book sound and AV' },
    { daysBefore: 45, task: 'Confirm food, speakers and activities' },
    { daysBefore: 30, task: 'Launch publicity and printing' },
    { daysBefore: 14, task: 'Brief volunteers; arrange first aid and insurance' },
    { daysBefore: 7, task: 'Walk the venue and finalise the run of show' },
    { daysBefore: 1, task: 'Set up stage and signage; sound check' },
    { daysBefore: 0, task: 'Event day: run the programme and collect feedback' },
  ],
  vendorTasks: {
    'Venue & permits': [
      'Obtain municipal, police and sound permissions',
      'Confirm toilets, parking and accessibility',
    ],
    'Food & refreshments': [
      'Get quotes from 2 or more caterers or local groups',
      'Plan drinking water and waste bins',
    ],
    'Sound, stage & AV': [
      'Confirm power load and a backup generator',
      'Test microphones before doors open',
    ],
    'Publicity & printing': [
      'Print posters and share on community groups',
      'Prepare a short event page or form',
    ],
    'Safety & first aid': [
      'Place first-aid kit and fire extinguishers',
      'Mark emergency exits and assign marshals',
    ],
    'Programme & activities': [
      'Share a timed run of show with all performers',
      'Plan a rain or heat backup',
    ],
    Contingency: ['Hold for permits, repairs or last-minute hires'],
  },
  ideas: [
    {
      title: 'Skill-share stalls',
      detail: 'Locals teach crafts, cooking or repairs for free to build participation.',
    },
    {
      title: 'Neighbourhood potluck',
      detail: 'Families bring a dish, cutting food cost and boosting ownership.',
    },
    {
      title: 'Volunteer recognition wall',
      detail: 'Thank helpers publicly to keep them engaged for the next event.',
    },
  ],
  venueSearches: ['Community Halls', 'Auditoriums', 'Open Event Grounds'],
  shopping: {
    'Sound, stage & AV': [{ label: 'Portable speakers', query: 'portable pa speaker with mic' }],
    'Publicity & printing': [{ label: 'Banner stands', query: 'roll up banner stand' }],
    'Food & refreshments': [
      {
        label: 'Eco-friendly plates and cups',
        query: 'biodegradable disposable plates cups',
      },
    ],
    'Safety & first aid': [{ label: 'First-aid kits', query: 'first aid kit' }],
  },
};
