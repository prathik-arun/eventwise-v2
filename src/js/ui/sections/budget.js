'use strict';

/** The budget breakdown: donut chart, planned amounts and a spending tracker. */
Eventwise.ui.budget = (() => {
  const { CHART_COLORS } = Eventwise.content;
  const { clampMoney, summarizeSpending } = Eventwise.budget;
  const { formatINR } = Eventwise.format;
  const { el, labelledSection } = Eventwise.dom;
  const { spentKey } = Eventwise.history;
  const storage = Eventwise.storage;

  const TABLE_COLUMNS = ['Category', 'Share', 'Planned', 'Spent (₹)', 'Left'];

  const colorAt = (index) => CHART_COLORS[index % CHART_COLORS.length];

  function buildDonut(rows, total) {
    let covered = 0;
    const slices = rows.map((row, index) => {
      const start = covered;
      covered += row.percent;
      return `${colorAt(index)} ${start}% ${covered}%`;
    });
    const donut = el(
      'div',
      { class: 'donut', 'aria-hidden': 'true' },
      el('span', { class: 'donut-hole' }, formatINR(total)),
    );
    donut.style.setProperty('--donut-fill', `conic-gradient(${slices.join(',')})`);
    return donut;
  }

  /** Category name with a colour swatch and a bar showing its share. */
  function buildCategoryHeader(row, index) {
    const swatch = el('span', { class: 'swatch', 'aria-hidden': 'true' });
    const bar = el('span', { class: 'bar', 'aria-hidden': 'true' });
    for (const element of [swatch, bar]) {
      element.style.setProperty('--color', colorAt(index));
    }
    bar.style.width = `${Math.min(100, row.percent)}%`;
    return el('th', { scope: 'row' }, swatch, row.category, bar);
  }

  /** Text for a "Left" cell: the amount remaining, or how far over budget it is. */
  const describeLeft = ({ left, over }) => (over ? `Over by ${formatINR(-left)}` : formatINR(left));

  function setLeftCell(cell, status) {
    cell.textContent = describeLeft(status);
    cell.classList.toggle('over-budget', status.over);
  }

  /**
   * Keeps the "Spent" inputs, the "Left" cells and the usage message in step
   * with each other, and saves what the user types.
   */
  function createSpendingTracker({ request, rows }) {
    const storageKey = spentKey(request.id);
    const spent = storage.readRecord(storageKey);
    const leftCells = new Map(rows.map(({ category }) => [category, el('td', { class: 'num' })]));
    const totalSpentCell = el('td', { class: 'num' });
    const totalLeftCell = el('td', { class: 'num' });
    const usage = el('p', { class: 'ok usage', 'aria-live': 'polite' });

    function refresh() {
      const summary = summarizeSpending(rows, spent, request.budget);
      for (const status of summary.categories) {
        setLeftCell(leftCells.get(status.category), status);
      }
      totalSpentCell.textContent = formatINR(summary.totalSpent);
      setLeftCell(totalLeftCell, summary.total);
      usage.textContent = summary.totalSpent
        ? `${Math.round((summary.totalSpent / request.budget) * 100)}% of your budget is spent.`
        : 'Enter what you have spent to track your budget.';
    }

    function buildSpentInput(category) {
      const input = el('input', {
        type: 'number',
        min: '0',
        step: '1',
        inputmode: 'numeric',
        class: 'spent',
        'aria-label': `Amount spent on ${category}`,
        value: spent[category] ? String(clampMoney(spent[category])) : '',
      });
      input.addEventListener('input', () => {
        spent[category] = clampMoney(input.value);
        storage.write(storageKey, spent);
        refresh();
      });
      return input;
    }

    return { usage, leftCells, totalSpentCell, totalLeftCell, buildSpentInput, refresh };
  }

  function buildCategoryRow(row, index, tracker) {
    return el(
      'tr',
      {},
      buildCategoryHeader(row, index),
      el('td', {}, `${row.percent.toFixed(1)}%`),
      el('td', { class: 'num' }, formatINR(row.amount)),
      el('td', {}, tracker.buildSpentInput(row.category)),
      tracker.leftCells.get(row.category),
    );
  }

  function buildTotalRow(budget, tracker) {
    return el(
      'tr',
      {},
      el('th', { scope: 'row' }, 'Total'),
      el('td', {}, '100%'),
      el('td', { class: 'num' }, formatINR(budget)),
      tracker.totalSpentCell,
      tracker.totalLeftCell,
    );
  }

  function buildTable({ request, rows }, tracker) {
    const headings = TABLE_COLUMNS.map((name) => el('th', { scope: 'col' }, name));
    const table = el(
      'table',
      {},
      el('caption', { class: 'visually-hidden' }, 'Budget allocation by category'),
      el('thead', {}, el('tr', {}, ...headings)),
      el('tbody', {}, ...rows.map((row, index) => buildCategoryRow(row, index, tracker))),
      el('tfoot', {}, buildTotalRow(request.budget, tracker)),
    );
    return el(
      'div',
      { class: 'scroll', tabindex: '0', role: 'region', 'aria-label': 'Budget table' },
      table,
    );
  }

  function buildBudgetSection(plan) {
    const tracker = createSpendingTracker(plan);
    const section = labelledSection(
      'budget-heading',
      'Budget breakdown',
      buildDonut(plan.rows, plan.request.budget),
      buildTable(plan, tracker),
      tracker.usage,
    );
    section.classList.add('budget-section');
    tracker.refresh();
    return section;
  }

  return { buildBudgetSection };
})();
