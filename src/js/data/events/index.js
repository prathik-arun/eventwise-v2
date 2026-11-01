import { anniversary } from './anniversary.js';
import { babyshower } from './babyshower.js';
import { birthday } from './birthday.js';
import { community } from './community.js';
import { corporate } from './corporate.js';
import { engagement } from './engagement.js';
import { housewarming } from './housewarming.js';
import { wedding } from './wedding.js';

/**
 * Every supported event type, keyed by id. The order here is the order of the
 * "Event type" dropdown. To add an event type, create its file next to this
 * one and add it to this list.
 */
export const PROFILES = {
  wedding,
  birthday,
  community,
  engagement,
  babyshower,
  anniversary,
  corporate,
  housewarming,
};
