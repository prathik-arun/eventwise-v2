import { COORDINATE_DECIMALS } from '../data/constants.js';
import { SHOPPING_KEYWORDS, VIBE_SEARCH_WORDS } from '../data/content.js';
import { PROFILES } from '../data/events/index.js';

/** Outbound search links: Amazon.in for shopping and Google Maps for venues and vendors. */

const MAPS_SEARCH_URL = 'https://www.google.com/maps/search/';
const MAPS_ZOOM_LEVEL = 13;
const DECOR_CATEGORY = /Decor/;
const VENUE_CATEGORY = /^Venue/;

// Each keyword matches at the start of a word, so "flowers" matches "flower" but "sunflower" does not.
const KEYWORD_MATCHERS = SHOPPING_KEYWORDS.map((keyword) => ({
  ...keyword,
  pattern: new RegExp(`\\b${keyword.word}`),
}));

const amazonSearchUrl = (query) => `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

/**
 * Shopping links for what the user typed under "specific needs", followed by
 * the standard suggestions for each budget category. Links are never repeated.
 * @param {{type: string, vibe: string, requests?: string}} request
 * @param {{category: string}[]} rows the plan's budget rows
 * @returns {{label: string, url: string}[]}
 */
function buildShoppingLinks(request, rows) {
  const links = [];
  const seenQueries = new Set();
  const add = (label, query) => {
    if (seenQueries.has(query)) {
      return;
    }
    seenQueries.add(query);
    links.push({ label, url: amazonSearchUrl(query) });
  };

  const requested = String(request.requests ?? '').toLowerCase();
  for (const { pattern, label, query } of KEYWORD_MATCHERS) {
    if (pattern.test(requested)) {
      add(label, query);
    }
  }

  const styleWord = VIBE_SEARCH_WORDS[request.vibe] ?? '';
  const suggestions = PROFILES[request.type].shopping;
  for (const { category } of rows) {
    const withStyle = styleWord && DECOR_CATEGORY.test(category);
    for (const { label, query } of suggestions[category] ?? []) {
      add(label, withStyle ? `${styleWord} ${query}` : query);
    }
  }
  return links;
}

/** @returns {string} a short "12.97, 77.59" label for a location */
const formatPlace = ({ lat, lng }) =>
  `${lat.toFixed(COORDINATE_DECIMALS)}, ${lng.toFixed(COORDINATE_DECIMALS)}`;

/**
 * Builds a Google Maps search link. A location is rounded to about 1 km so
 * the exact position is never put in a link.
 * @param {string} query what to search for
 * @param {{lat: number, lng: number} | null} place the user's location, if shared
 * @param {string} areaText an area or city typed by the user
 */
function mapsSearchUrl(query, place, areaText) {
  if (place) {
    const lat = place.lat.toFixed(COORDINATE_DECIMALS);
    const lng = place.lng.toFixed(COORDINATE_DECIMALS);
    return `${MAPS_SEARCH_URL}${encodeURIComponent(query)}/@${lat},${lng},${MAPS_ZOOM_LEVEL}z`;
  }
  const searchText = areaText ? `${query} in ${areaText}` : query;
  return `${MAPS_SEARCH_URL}${encodeURIComponent(searchText)}`;
}

/** @returns {boolean} true for a latitude and longitude on Earth */
const isValidPlace = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/** @returns {{category: string, amount: number} | undefined} the venue row of a plan, if it has one */
const findVenueRow = (rows) => rows.find(({ category }) => VENUE_CATEGORY.test(category));

export {
  amazonSearchUrl,
  buildShoppingLinks,
  formatPlace,
  mapsSearchUrl,
  isValidPlace,
  findVenueRow,
};
