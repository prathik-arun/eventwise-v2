'use strict';

/** The "Your past plans" list. */
Eventwise.ui.historyView = (() => {
  const { daysBetween, parseISODate, startOfDay } = Eventwise.dates;
  const { formatDate, formatINR, pluralize } = Eventwise.format;
  const { $, button, el } = Eventwise.dom;

  function buildRow(entry, today, { onView, onReuse, onDelete }) {
    const profile = Eventwise.profiles[entry.type];
    const title = entry.name || profile.label;
    const date = parseISODate(entry.date);
    const action = (label, handler) =>
      button(label, () => handler(entry), {
        class: 'alt small',
        'aria-label': `${label} ${title}`,
      });

    const summary = [
      profile.label,
      formatDate(date),
      pluralize(entry.guests, 'guest'),
      formatINR(entry.budget),
    ].join(' · ');

    return el(
      'li',
      {},
      el(
        'div',
        {},
        el('strong', {}, `${profile.icon} ${title}`),
        el('span', { class: 'badge' }, daysBetween(today, date) < 0 ? 'Past' : 'Upcoming'),
        el('br'),
        summary,
      ),
      el(
        'div',
        { class: 'row-actions' },
        action('View', onView),
        action('Reuse', onReuse),
        action('Delete', onDelete),
      ),
    );
  }

  /**
   * Redraws the list.
   * @param {object[]} entries clean history entries
   * @param {{onView: Function, onReuse: Function, onDelete: Function}} handlers each gets the entry
   */
  function render(entries, handlers) {
    const today = startOfDay(new Date());
    $('#history-list').replaceChildren(...entries.map((entry) => buildRow(entry, today, handlers)));
    $('#history-empty').hidden = entries.length > 0;
    $('#clear-history').hidden = entries.length === 0;
  }

  /**
   * Makes "Clear all" ask for a second press before it deletes anything.
   * The confirmation is cancelled when the button loses focus.
   */
  function bindClearAll(onConfirm) {
    const clearButton = $('#clear-history');
    let armed = false;
    const disarm = () => {
      armed = false;
      clearButton.textContent = 'Clear all';
    };

    clearButton.addEventListener('blur', disarm);
    clearButton.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        clearButton.textContent = 'Click again to confirm';
        Eventwise.ui.announce('Press again to delete all past plans.');
        return;
      }
      disarm();
      onConfirm();
    });
  }

  return { render, bindClearAll };
})();
