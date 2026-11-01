'use strict';

/** Splitting the budget between categories and tracking what has been spent. */
Eventwise.budget = (() => {
  const { CONTINGENCY, LIMITS, PRIORITY_WEIGHT } = Eventwise.constants;

  const PERCENT = 100;

  /** Relative weight of a category: its base share, boosted when it is a priority. */
  const weightOf = (category, share, priorities) =>
    priorities.includes(category) ? share * PRIORITY_WEIGHT : share;

  /** Gives the contingency its fixed share and spreads the rest by weight. */
  function roundedAmounts(allocation, total, priorities) {
    const contingencyShare = allocation[CONTINGENCY];
    const others = Object.entries(allocation).filter(([category]) => category !== CONTINGENCY);
    const weights = others.map(([category, share]) => weightOf(category, share, priorities));
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    const sharedPercent = PERCENT - contingencyShare;

    const rows = others.map(([category], index) => ({
      category,
      amount: Math.round((total * (weights[index] / weightSum) * sharedPercent) / PERCENT),
    }));
    rows.push({ category: CONTINGENCY, amount: Math.round((total * contingencyShare) / PERCENT) });
    return rows;
  }

  /** Rounding can leave the rows a few rupees off, so the largest row absorbs the difference. */
  function absorbRoundingError(rows, total) {
    const difference = total - rows.reduce((sum, row) => sum + row.amount, 0);
    const largest = rows.reduce((max, row) => (row.amount > max.amount ? row : max));
    largest.amount += difference;
  }

  /**
   * Splits `total` rupees across the categories of an event type. The rows
   * always add up to exactly `total`.
   * @param {string} type event type id
   * @param {number} total budget in rupees
   * @param {string[]} [priorities] categories that get a bigger share
   * @returns {{category: string, amount: number, percent: number}[]}
   */
  function allocateBudget(type, total, priorities = []) {
    const rows = roundedAmounts(Eventwise.profiles[type].allocation, total, priorities);
    absorbRoundingError(rows, total);
    return rows.map((row) => ({ ...row, percent: (row.amount / total) * PERCENT }));
  }

  /** Turns any input into a whole, non-negative rupee amount within the budget limit. */
  function clampMoney(value) {
    const amount = Math.floor(Number(value));
    if (!Number.isFinite(amount)) {
      return 0;
    }
    return Math.min(Math.max(amount, 0), LIMITS.maxBudget);
  }

  /** @returns {{left: number, over: boolean}} how much of `planned` remains, and whether it is exceeded */
  const spendStatus = (planned, spent) => ({ left: planned - spent, over: spent > planned });

  /**
   * Compares what has been spent with the plan.
   * @param {{category: string, amount: number}[]} rows planned budget
   * @param {Record<string, unknown>} spent amount spent per category (untrusted)
   * @param {number} budget the total budget
   */
  function summarizeSpending(rows, spent, budget) {
    const categories = rows.map(({ category, amount }) => ({
      category,
      ...spendStatus(amount, clampMoney(spent[category])),
    }));
    const totalSpent = rows.reduce((sum, { category }) => sum + clampMoney(spent[category]), 0);
    return { categories, totalSpent, total: spendStatus(budget, totalSpent) };
  }

  return { allocateBudget, clampMoney, spendStatus, summarizeSpending };
})();
