'use strict';

Eventwise.profiles.corporate = {
  label: 'Corporate event',
  icon: '💼',
  minPerGuest: 1500,
  rushDays: 45,
  allocation: {
    Venue: 25,
    'Food & beverages': 25,
    'AV & production': 15,
    'Branding & printing': 8,
    'Speakers & entertainment': 10,
    'Travel & stay': 7,
    'Gifts & swag': 5,
    Contingency: 5,
  },
  milestones: [
    { daysBefore: 120, task: 'Define goals, audience and budget' },
    { daysBefore: 100, task: 'Shortlist and book the venue' },
    { daysBefore: 75, task: 'Confirm speakers and agenda' },
    { daysBefore: 60, task: 'Book AV, catering and branding vendors' },
    { daysBefore: 45, task: 'Open registrations and send invites' },
    { daysBefore: 21, task: 'Arrange travel, stay and swag' },
    { daysBefore: 7, task: 'Final run-through and attendee briefing' },
    { daysBefore: 1, task: 'Venue walk-through and tech rehearsal' },
    { daysBefore: 0, task: 'Event day: run the show and collect feedback' },
  ],
  vendorTasks: {
    Venue: ['Check Wi-Fi, power backup, parking and accessibility'],
    'Food & beverages': [
      'Confirm headcount and dietary needs',
      'Plan tea and coffee breaks around the agenda',
    ],
    'AV & production': ['Test projector, microphones and recording', 'Keep a technician on site'],
    'Branding & printing': ['Approve proofs for banners, badges and signage'],
    'Speakers & entertainment': ['Confirm slides, timings and travel for each speaker'],
    'Travel & stay': ['Block rooms and share an arrival plan'],
    'Gifts & swag': ['Order with a buffer for walk-ins'],
    Contingency: ['Hold for last-minute vendor or venue issues'],
  },
  ideas: [
    {
      title: 'Lightning talks',
      detail: 'Short five-minute talks keep energy up and need no big speaker fees.',
    },
    {
      title: 'Networking bingo',
      detail: 'A card of conversation prompts helps attendees meet new people.',
    },
    {
      title: 'Live feedback wall',
      detail: 'Attendees post sticky notes, giving instant insight for the next event.',
    },
  ],
  venueSearches: ['Conference Halls', 'Convention Centres', 'Hotels with Banquet Halls'],
  shopping: {
    'AV & production': [{ label: 'Wireless microphones', query: 'wireless microphone' }],
    'Branding & printing': [
      { label: 'Banner stands', query: 'roll up banner stand' },
      { label: 'Lanyards and badge holders', query: 'lanyard badge holder' },
    ],
    'Gifts & swag': [{ label: 'Corporate gift sets', query: 'corporate gift set' }],
  },
};
