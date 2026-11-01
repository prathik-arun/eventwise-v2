import { CONTINGENCY } from '../data/constants.js';
import { VIBES } from '../data/content.js';
import { PROFILES } from '../data/events/index.js';
import { toISODate } from '../lib/dates.js';
import { $, $$, el } from '../lib/dom.js';

/** The "Tell us about your event" form: filling it, reading it and showing errors. */

/** Form fields that can show a validation error. */
const VALIDATED_FIELDS = ['type', 'date', 'guests', 'budget'];

/** Priority checkboxes depend on the chosen event type. */
function renderPriorityOptions() {
  const categories = Object.keys(PROFILES[$('#type').value].allocation);
  const options = categories
    .filter((category) => category !== CONTINGENCY)
    .map((category) =>
      el(
        'label',
        {},
        el('input', { type: 'checkbox', name: 'priority', value: category }),
        category,
      ),
    );
  $('#priority-options').replaceChildren(...options);
}

function populateChoices() {
  const typeOptions = Object.entries(PROFILES).map(([id, { icon, label }]) =>
    el('option', { value: id }, `${icon} ${label}`),
  );
  $('#type').replaceChildren(...typeOptions);
  $('#vibe').replaceChildren(...Object.keys(VIBES).map((name) => el('option', {}, name)));
}

/** Shows an error under each invalid field and clears the others. */
function showErrors(errors) {
  for (const field of VALIDATED_FIELDS) {
    const input = $(`#${field}`);
    const message = $(`#error-${field}`);
    const text = errors[field];
    message.hidden = !text;
    message.textContent = text ?? '';
    if (text) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }
}

function focusFirstError() {
  $('#plan-form [aria-invalid="true"]')?.focus();
}

/** @returns {object} the raw (unvalidated) values typed into the form */
function readValues(form) {
  const data = new FormData(form);
  return {
    type: data.get('type'),
    name: data.get('name'),
    date: data.get('date'),
    guests: data.get('guests'),
    budget: data.get('budget'),
    vibe: data.get('vibe'),
    requests: data.get('requests'),
    priorities: data.getAll('priority'),
  };
}

/** Fills the form from a saved plan so it can be adjusted and reused. */
function fillFrom(entry, { keepDate }) {
  $('#type').value = entry.type;
  renderPriorityOptions();
  $$('#plan-form input[name="priority"]').forEach((checkbox) => {
    checkbox.checked = entry.priorities.includes(checkbox.value);
  });
  $('#name').value = entry.name;
  $('#date').value = keepDate ? entry.date : '';
  $('#guests').value = entry.guests;
  $('#budget').value = entry.budget;
  $('#vibe').value = entry.vibe;
  $('#requests').value = entry.requests;
  showErrors({});
  $('#name').focus();
}

/** Sets up the choices and wires the form's own events. */
function init({ today, onSubmit }) {
  populateChoices();
  $('#date').min = toISODate(today);
  renderPriorityOptions();
  $('#type').addEventListener('change', renderPriorityOptions);
  $('#plan-form').addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit(readValues(event.currentTarget));
  });
}

export { init, showErrors, focusFirstError, fillFrom };
