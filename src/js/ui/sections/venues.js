'use strict';

/** Venue and vendor map links (optionally near the user), and shopping links. */
Eventwise.ui.venues = (() => {
  const { announce, state } = Eventwise.ui;
  const { GEOLOCATION_OPTIONS, LIMITS } = Eventwise.constants;
  const { VENDOR_SEARCHES } = Eventwise.content;
  const { formatINR } = Eventwise.format;
  const { button, el, labelledSection, onEnter } = Eventwise.dom;
  const { findVenueRow, formatPlace, isValidPlace, mapsSearchUrl } = Eventwise.links;

  const PERMISSION_DENIED = 1; // GeolocationPositionError.PERMISSION_DENIED
  const LOCATION_PRIVACY_NOTE =
    'Links open Google Maps. Your location stays in this browser and is only used to build the map links, rounded to about 1 km.';

  function buildMapLink(query) {
    const link = el(
      'a',
      {
        href: mapsSearchUrl(query, state.place, state.area),
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      query,
      el('span', { class: 'visually-hidden' }, ' on Google Maps (opens in a new tab)'),
    );
    return el('li', {}, link);
  }

  function buildLinkGroup(title, queries) {
    if (!queries.length) {
      return '';
    }
    return el(
      'div',
      {},
      el('h4', {}, title),
      el('ul', { class: 'chips', role: 'list' }, ...queries.map(buildMapLink)),
    );
  }

  function describeVenueBudget({ request, rows }, hasVenueSearches) {
    const venueRow = findVenueRow(rows);
    if (!hasVenueSearches || !venueRow) {
      return 'Your plan has no separate venue cost; these links find local services.';
    }
    const perGuest = formatINR(venueRow.amount / request.guests);
    return `Venue budget in your plan: ${formatINR(venueRow.amount)} (about ${perGuest} per guest).`;
  }

  function describeSearchArea() {
    if (state.place) {
      return 'Searching around your current location.';
    }
    if (state.area) {
      return `Searching in ${state.area}.`;
    }
    return 'Add your location or an area for local results.';
  }

  /** Asks the browser for the user's location; reports the outcome through the callbacks. */
  function requestLocation({ onFound }) {
    if (!navigator.geolocation) {
      announce('Location is not available here. Type your area instead.');
      return;
    }
    announce('Requesting your location…');
    const onPosition = ({ coords: { latitude, longitude } }) => {
      if (!isValidPlace(latitude, longitude)) {
        announce('Could not read your location. Type your area instead.');
        return;
      }
      onFound({ lat: latitude, lng: longitude });
    };
    const onFailure = (error) =>
      announce(
        error.code === PERMISSION_DENIED
          ? 'Location permission was denied. You can type your area instead.'
          : 'Could not get your location. You can type your area instead.',
      );
    try {
      navigator.geolocation.getCurrentPosition(onPosition, onFailure, GEOLOCATION_OPTIONS);
    } catch {
      announce('Could not get your location. You can type your area instead.');
    }
  }

  /** The area box, the link list and the messages that depend on where the user wants to search. */
  function createAreaSearch(plan) {
    const { venueSearches } = Eventwise.profiles[plan.request.type];
    const links = el('div');
    const venueHint = el('p', { class: 'hint' });
    const note = el('p', { class: 'ok' });
    const areaInput = el('input', {
      id: 'area',
      type: 'text',
      maxlength: String(LIMITS.areaLength),
      placeholder: 'Type an area or city, or tap Use my location',
      autocomplete: 'off',
      value: state.area || (state.place ? formatPlace(state.place) : ''),
    });

    function refreshLinks() {
      links.replaceChildren(
        buildLinkGroup('Venues', venueSearches),
        buildLinkGroup('Local vendors', VENDOR_SEARCHES),
      );
      venueHint.textContent = describeVenueBudget(plan, venueSearches.length > 0);
      note.textContent = describeSearchArea();
    }

    function useTypedArea() {
      const typed = areaInput.value.trim().slice(0, LIMITS.areaLength);
      if (state.place && typed === formatPlace(state.place)) {
        refreshLinks();
        announce('Searching around your current location.');
        return;
      }
      state.area = typed;
      state.place = null;
      refreshLinks();
      announce(state.area ? `Searching in ${state.area}.` : 'Area cleared.');
    }

    function useSharedLocation(place) {
      state.place = place;
      state.area = '';
      areaInput.value = formatPlace(place);
      refreshLinks();
      announce(`Location found (${formatPlace(place)}). Venue links now search around you.`);
    }

    onEnter(areaInput, useTypedArea);
    refreshLinks();
    return { links, venueHint, note, areaInput, useTypedArea, useSharedLocation };
  }

  function buildVenueSection(plan) {
    const search = createAreaSearch(plan);
    return labelledSection(
      'venues-heading',
      'Venues and local vendors',
      el('p', { class: 'hint' }, LOCATION_PRIVACY_NOTE),
      search.venueHint,
      el('label', { for: 'area' }, 'Area or city'),
      el(
        'div',
        { class: 'input-row no-print' },
        button('📍 Use my location', () => requestLocation({ onFound: search.useSharedLocation })),
        search.areaInput,
        button('Search this area', search.useTypedArea, { class: 'alt' }),
      ),
      search.note,
      search.links,
    );
  }

  /** Amazon.in search links, or null when the plan has none. */
  function buildShoppingSection({ shoppingLinks }) {
    if (!shoppingLinks.length) {
      return null;
    }
    const items = shoppingLinks.map(({ label, url }) =>
      el(
        'li',
        {},
        el(
          'a',
          { href: url, target: '_blank', rel: 'noopener noreferrer nofollow' },
          `${label} on Amazon.in`,
          el('span', { class: 'visually-hidden' }, ' (opens in a new tab)'),
        ),
      ),
    );
    return labelledSection(
      'shopping-heading',
      'Shopping suggestions',
      el(
        'p',
        { class: 'hint' },
        'These open Amazon.in searches for decor and accessories. Fresh cakes and flowers are usually best ordered from a local vendor.',
      ),
      el('ul', { class: 'plain-list' }, ...items),
    );
  }

  return { buildVenueSection, buildShoppingSection };
})();
