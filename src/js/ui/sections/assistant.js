import { announce, state } from '../state.js';
import * as ai from '../../assistant/ai.js';
import { offlineAnswer, quickAdvice } from '../../assistant/offline.js';
import { LIMITS } from '../../data/constants.js';
import { QUICK_QUESTIONS, VIBES } from '../../data/content.js';
import { PROFILES } from '../../data/events/index.js';
import { button, el, labelledSection, onEnter } from '../../lib/dom.js';

/** "Ideas for you" (starter and AI-generated) and the "Ask Eventwise" question box. */

const IDEAS_UNAVAILABLE_HINT = 'AI ideas need the Claude viewer; starter ideas are shown instead.';
const OFFLINE_NOTICE = '(Built-in logic answer. Full AI replies work in the Claude viewer.)';

/** Updates the "Generate AI ideas" controls; set while an ideas section is on screen. */
let refreshIdeaControls = () => {};

function buildIdeaItems(ideas) {
  return ideas.map(({ title, detail }) => el('li', {}, el('strong', {}, title), ': ', detail));
}

function buildIdeasSection({ request }) {
  const heading = el('p', { class: 'hint' });
  const list = el('ul', { class: 'plain-list' });
  const hint = el('p', { class: 'hint' });
  let pending = null; // AbortController of the request in flight, if any

  const showIdeas = (ideas, label) => {
    heading.textContent = label;
    list.replaceChildren(...buildIdeaItems(ideas));
  };

  const generate = async () => {
    if (!ai.isAvailable() || pending) {
      return;
    }
    pending = new AbortController();
    refreshIdeaControls();
    announce('Generating ideas…');
    try {
      showIdeas(await ai.generateIdeas(request, pending.signal), 'AI-generated ideas');
      announce('AI ideas ready.');
    } catch (error) {
      announce(ai.describeIdeasError(error));
    } finally {
      pending = null;
      refreshIdeaControls();
    }
  };

  const generateButton = button('Generate AI ideas', generate);
  refreshIdeaControls = () => {
    generateButton.disabled = !ai.isAvailable() || pending !== null;
    hint.textContent = ai.isAvailable() ? '' : IDEAS_UNAVAILABLE_HINT;
  };

  const starterIdeas = [
    ...PROFILES[request.type].ideas,
    { title: `${request.vibe} touch`, detail: VIBES[request.vibe] },
  ];
  showIdeas(starterIdeas, 'Starter ideas');
  refreshIdeaControls();
  return labelledSection('ideas-heading', 'Ideas for you', heading, list, generateButton, hint);
}

/** Called once the AI runtime has been looked for, so an open plan can enable its button. */
const refreshAvailability = () => refreshIdeaControls();

function appendMessage(log, author, text) {
  const label = author === 'you' ? 'You: ' : 'Eventwise: ';
  log.append(el('p', { class: `message ${author}` }, el('strong', {}, label), text));
}

/** The assistant's reply: the AI's if available, otherwise (or on failure) the built-in logic. */
async function composeReply(plan, question) {
  if (!ai.isAvailable()) {
    return `${offlineAnswer(question, plan)} ${OFFLINE_NOTICE}`;
  }
  try {
    return (await ai.answer(plan, state.chat, question)) || quickAdvice(plan);
  } catch (error) {
    return `${ai.describeChatError(error)} ${offlineAnswer(question, plan)}`;
  }
}

/** The conversation log, the question box and the logic that answers and records each question. */
function createChat(plan) {
  const log = el('div', { class: 'chat-log', role: 'log', 'aria-live': 'polite' });
  const input = el('input', {
    id: 'question',
    type: 'text',
    maxlength: String(LIMITS.questionLength),
    autocomplete: 'off',
    placeholder: 'e.g. How can I cut costs without losing the wow?',
  });
  const askButton = button('Ask', () => submitTyped(), { id: 'ask-button' });

  function setBusy(busy) {
    state.chatBusy = busy;
    askButton.disabled = busy;
  }

  async function ask(text) {
    const question = String(text ?? '')
      .trim()
      .slice(0, LIMITS.questionLength);
    if (!question || state.chatBusy) {
      return;
    }
    appendMessage(log, 'you', question);
    setBusy(true);
    const reply = await composeReply(plan, question);
    if (state.plan !== plan) {
      return;
    } // a different plan was opened while waiting
    state.chat = [...state.chat, { q: question, a: reply }].slice(-LIMITS.chatEntries);
    appendMessage(log, 'ai', reply);
    setBusy(false);
  }

  function submitTyped() {
    const text = input.value;
    input.value = '';
    return ask(text);
  }

  onEnter(input, submitTyped);
  return { log, input, askButton, ask };
}

function buildChatSection(plan) {
  const chat = createChat(plan);
  const quickQuestions = QUICK_QUESTIONS.map((text) =>
    el(
      'li',
      {},
      button(text, () => chat.ask(text), { class: 'alt' }),
    ),
  );
  const section = labelledSection(
    'chat-heading',
    'Ask Eventwise',
    el(
      'p',
      { class: 'hint' },
      'Ask about your plan: savings, risks, what to do next, or a draft invitation.',
    ),
    el('ul', { class: 'chips', role: 'list' }, ...quickQuestions),
    chat.log,
    el('label', { for: 'question' }, 'Your question'),
    el('div', { class: 'input-row' }, chat.input, chat.askButton),
  );
  section.classList.add('no-print');
  return section;
}

export { buildIdeasSection, buildChatSection, refreshAvailability };
