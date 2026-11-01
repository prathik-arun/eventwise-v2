'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { bootApp, findButton, isoDateIn, settle, submitPlanForm } = require('../helpers/boot-app');

const text = (window, selector) => window.document.querySelector(selector).textContent;
const all = (window, selector) => [...window.document.querySelectorAll(selector)];

/** The "Planned" column of the budget table, as numbers. */
const plannedAmounts = (window) =>
  all(window, '#results tbody tr td:nth-child(3)').map((cell) =>
    Number(cell.textContent.replace(/\D/g, '')),
  );

describe('creating a plan', () => {
  it('shows accessible errors and no plan for an empty form', () => {
    const window = bootApp();
    const { document } = window;
    document
      .querySelector('#plan-form')
      .dispatchEvent(new window.Event('submit', { cancelable: true }));

    assert.equal(document.querySelector('#results').hidden, true);
    assert.equal(document.querySelector('#date').getAttribute('aria-invalid'), 'true');
    assert.equal(document.querySelector('#error-guests').hidden, false);
    assert.equal(document.activeElement.id, 'date', 'focus moves to the first invalid field');
    assert.match(text(window, '#status'), /fix the highlighted fields/);
  });

  it('clears errors once the input is fixed', () => {
    const window = bootApp();
    const { document } = window;
    document
      .querySelector('#plan-form')
      .dispatchEvent(new window.Event('submit', { cancelable: true }));
    submitPlanForm(window);
    assert.equal(document.querySelector('#date').hasAttribute('aria-invalid'), false);
    assert.equal(document.querySelector('#error-date').hidden, true);
    assert.equal(document.querySelector('#results').hidden, false);
  });

  it('builds every section in order', () => {
    const window = bootApp();
    submitPlanForm(window, { name: 'Meera and Arjun' });
    const headings = all(window, '#results > section').map((s) =>
      s.getAttribute('aria-labelledby'),
    );
    assert.deepEqual(headings, [
      'plan-title',
      'insights-heading',
      'budget-heading',
      'timeline-heading',
      'checklist-heading',
      'venues-heading',
      'shopping-heading',
      'ideas-heading',
      'chat-heading',
    ]);
    assert.match(text(window, '#plan-title'), /Meera and Arjun plan/);
    assert.equal(window.document.activeElement.id, 'plan-title');
  });

  it('builds a plan whose budget adds up exactly for every event type', () => {
    const window = bootApp();
    const types = all(window, '#type option').map((option) => option.value);
    assert.equal(types.length, 8);
    for (const type of types) {
      submitPlanForm(window, { type, budget: '400000' });
      const total = plannedAmounts(window).reduce((sum, amount) => sum + amount, 0);
      assert.equal(total, 400000, type);
    }
  });

  it('shows priority options that follow the chosen event type', () => {
    const window = bootApp();
    const { document } = window;
    document.querySelector('#type').value = 'community';
    document.querySelector('#type').dispatchEvent(new window.Event('change'));
    const options = all(window, '#priority-options input').map((input) => input.value);
    assert.ok(options.includes('Venue & permits'));
    assert.ok(!options.includes('Contingency'));
  });

  it('never parses user text as HTML', () => {
    const window = bootApp();
    submitPlanForm(window, { name: '<img src=x onerror=alert(1)>' });
    assert.equal(window.document.querySelector('#results img'), null);
    assert.match(text(window, '#plan-title'), /<img/);
  });

  it('copies the plan as text, and reports when copying is impossible', async () => {
    const window = bootApp();
    submitPlanForm(window, { name: 'Copy me' });
    findButton(window, /Copy plan/).click();
    await settle();
    assert.match(text(window, '#status'), /Copy failed/);

    let copied = '';
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: async (value) => (copied = value) },
    });
    findButton(window, /Copy plan/).click();
    await settle();
    assert.match(copied, /^Copy me \(Wedding\), /);
    assert.match(copied, /BUDGET[\s\S]+TIMELINE/);
    assert.match(text(window, '#status'), /copied/);
  });
});

describe('tracking spending and vendor tasks', () => {
  it('shows what is left and flags overspending', () => {
    const window = bootApp();
    submitPlanForm(window, { budget: '1000000' });
    const [venueInput] = all(window, '#results .spent');
    const planned = plannedAmounts(window)[0];

    venueInput.value = String(planned + 500);
    venueInput.dispatchEvent(new window.Event('input'));
    const leftCell = window.document.querySelector('#results tbody tr td:nth-child(5)');
    assert.match(leftCell.textContent, /Over by ₹500/);
    assert.ok(leftCell.classList.contains('over-budget'));
    assert.match(text(window, '.usage'), /% of your budget is spent/);
  });

  it('remembers spending and ticked tasks when the plan is reopened', () => {
    const window = bootApp();
    submitPlanForm(window, { name: 'Remember me' });
    const [venueInput] = all(window, '#results .spent');
    venueInput.value = '12345';
    venueInput.dispatchEvent(new window.Event('input'));
    const [firstTask] = all(window, '#results .checks input');
    firstTask.checked = true;
    firstTask.dispatchEvent(new window.Event('change'));
    assert.match(text(window, '#checklist-heading + p'), /^1 of \d+ vendor tasks done$/);

    window.document.querySelector('#history-list li button').click();
    assert.equal(all(window, '#results .spent')[0].value, '12345');
    assert.equal(all(window, '#results .checks input')[0].checked, true);
  });
});

describe('past plans', () => {
  it('are saved, reopened and deleted', () => {
    const window = bootApp();
    const { document } = window;
    submitPlanForm(window, { name: 'Test party', type: 'birthday' });
    assert.equal(all(window, '#history-list li').length, 1);
    assert.equal(document.querySelector('#history-empty').hidden, true);

    document.querySelector('#history-list li button').click();
    assert.match(text(window, '#plan-title'), /Test party/);
    assert.match(text(window, '#status'), /Plan opened/);

    all(window, '#history-list li button')
      .find((b) => /Delete/.test(b.textContent))
      .click();
    assert.equal(all(window, '#history-list li').length, 0);
    assert.equal(document.querySelector('#history-empty').hidden, false);
  });

  it('can be reused to fill the form again', () => {
    const window = bootApp();
    const { document } = window;
    submitPlanForm(window, { name: 'Again', type: 'corporate', guests: '75', budget: '900000' });
    document.querySelector('#name').value = '';
    document.querySelector('#guests').value = '';

    all(window, '#history-list li button')
      .find((b) => /Reuse/.test(b.textContent))
      .click();
    assert.equal(document.querySelector('#name').value, 'Again');
    assert.equal(document.querySelector('#type').value, 'corporate');
    assert.equal(document.querySelector('#guests').value, '75');
    assert.equal(document.querySelector('#budget').value, '900000');
    assert.equal(document.activeElement.id, 'name');
  });

  it('are cleared only after a second press of "Clear all"', () => {
    const window = bootApp();
    const clear = window.document.querySelector('#clear-history');
    submitPlanForm(window);
    clear.click();
    assert.equal(all(window, '#history-list li').length, 1, 'first press only asks');
    assert.match(clear.textContent, /again to confirm/);

    clear.click();
    assert.equal(all(window, '#history-list li').length, 0);
    assert.equal(clear.textContent, 'Clear all');
    assert.equal(clear.hidden, true);
  });

  it('ignore saved entries that are corrupt', () => {
    const window = bootApp();
    window.localStorage.setItem(
      'ew:history',
      JSON.stringify([{ id: 'x', type: 'constructor' }, 7]),
    );
    submitPlanForm(window, { name: 'Fresh' });
    assert.equal(all(window, '#history-list li').length, 1);
  });
});

describe('venues and location', () => {
  const position = { coords: { latitude: 12.97163, longitude: 77.59456 } };

  it('"Use my location" fills the box and builds map links around it', async () => {
    const window = bootApp({ geolocation: { getCurrentPosition: (ok) => ok(position) } });
    submitPlanForm(window);
    findButton(window, /Use my location/).click();
    await settle();
    const firstLink = () => window.document.querySelector('#results .chips a').href;

    assert.equal(window.document.querySelector('#area').value, '12.97, 77.59');
    assert.equal(
      firstLink(),
      'https://www.google.com/maps/search/Banquet%20Halls/@12.97,77.59,13z',
    );

    findButton(window, /Search this area/).click();
    assert.match(firstLink(), /@12\.97,77\.59,13z$/, 'an unchanged box keeps the coordinates');

    window.document.querySelector('#area').value = 'Indiranagar, Bengaluru';
    findButton(window, /Search this area/).click();
    assert.match(firstLink(), /Banquet%20Halls%20in%20Indiranagar%2C%20Bengaluru$/);
  });

  it('explains a denied location request', async () => {
    const window = bootApp({
      geolocation: { getCurrentPosition: (_ok, fail) => fail({ code: 1 }) },
    });
    submitPlanForm(window);
    findButton(window, /Use my location/).click();
    await settle();
    assert.match(text(window, '#status'), /denied/);
    assert.equal(window.document.querySelector('#area').value, '');
  });

  it('explains when location is not available at all', () => {
    const window = bootApp();
    submitPlanForm(window);
    findButton(window, /Use my location/).click();
    assert.match(text(window, '#status'), /not available here/);
  });

  it('opens every external link safely in a new tab', () => {
    const window = bootApp();
    submitPlanForm(window, { requests: 'flowers', type: 'birthday' });
    const external = all(window, '#results a[href^="http"]');
    assert.ok(external.length > 5);
    for (const link of external) {
      assert.equal(link.target, '_blank');
      assert.match(link.rel, /noopener/);
      assert.match(link.rel, /noreferrer/);
    }
  });

  it('skips venue links for a housewarming but keeps local vendors', () => {
    const window = bootApp();
    submitPlanForm(window, { type: 'housewarming' });
    const headings = all(window, '#venues-heading ~ div h4').map((h) => h.textContent);
    assert.deepEqual(headings, ['Local vendors']);
  });
});

describe('the assistant', () => {
  const ask = async (window, question) => {
    window.document.querySelector('#question').value = question;
    window.document.querySelector('#ask-button').click();
    await settle();
  };
  const answers = (window) => all(window, '.message.ai').map((m) => m.textContent);

  it('answers with the AI when it is available', async () => {
    const claude = {
      use: async () =>
        Object.assign(async () => ({ text: 'Cut 10 guests.' }), { json: async () => [] }),
    };
    const window = bootApp({ claude });
    await settle();
    submitPlanForm(window);
    await ask(window, 'How to save?');
    assert.match(answers(window)[0], /Cut 10 guests/);
    assert.equal(window.document.querySelector('#question').value, '', 'the box is cleared');
  });

  it('falls back to built-in answers without AI', async () => {
    const window = bootApp();
    submitPlanForm(window);
    await ask(window, 'How to save?');
    assert.match(answers(window)[0], /biggest costs/);
    assert.match(answers(window)[0], /Built-in logic answer/);
  });

  it('falls back when the AI fails', async () => {
    const failing = Object.assign(
      async () => {
        throw Object.assign(new Error('denied'), { code: 'not_granted' });
      },
      { json: async () => [] },
    );
    const window = bootApp({ claude: { use: async () => failing } });
    await settle();
    submitPlanForm(window);
    await ask(window, 'What could go wrong?');
    assert.match(answers(window)[0], /permission was not granted\. Common risks/);
  });

  it('ignores empty questions and answers quick questions on click', async () => {
    const window = bootApp();
    submitPlanForm(window);
    await ask(window, '   ');
    assert.equal(all(window, '.message').length, 0);

    findButton(window, /invitation message/).click();
    await settle();
    assert.match(answers(window)[0], /warmly invited/);
  });

  it('starts a fresh conversation for each plan', async () => {
    const window = bootApp();
    submitPlanForm(window);
    await ask(window, 'What could go wrong?');
    submitPlanForm(window, { name: 'Second' });
    assert.equal(all(window, '.message').length, 0);
  });

  it('generates AI ideas, or keeps the starter ideas on failure', async () => {
    const ideas = [{ title: 'Lantern walk', detail: 'Guests carry paper lanterns at dusk.' }];
    const working = Object.assign(async () => ({ text: '' }), { json: async () => ideas });
    const window = bootApp({ claude: { use: async () => working } });
    await settle();
    submitPlanForm(window);
    const generate = findButton(window, /Generate AI ideas/);
    assert.equal(generate.disabled, false);
    assert.match(text(window, '#ideas-heading ~ ul'), /Regional food counters/);

    generate.click();
    await settle();
    assert.match(text(window, '#ideas-heading ~ ul'), /Lantern walk/);
    assert.match(text(window, '#status'), /AI ideas ready/);

    const offline = bootApp();
    submitPlanForm(offline);
    assert.equal(findButton(offline, /Generate AI ideas/).disabled, true);
    assert.match(text(offline, '#ideas-heading ~ p:last-of-type'), /need the Claude viewer/);
  });
});

describe('page basics', () => {
  it('sets a minimum date of today and uses real dates in the form', () => {
    const window = bootApp();
    assert.equal(window.document.querySelector('#date').min, isoDateIn(0));
  });

  it('offers a skip link, a live status region and labelled fields', () => {
    const window = bootApp();
    const { document } = window;
    assert.equal(document.querySelector('.skip').getAttribute('href'), '#main');
    assert.equal(document.querySelector('#status').getAttribute('role'), 'status');
    for (const input of all(window, 'input:not([type=checkbox]), select')) {
      if (input.closest('#results')) {
        continue;
      }
      assert.ok(document.querySelector(`label[for="${input.id}"]`), `label for ${input.id}`);
    }
  });
});
