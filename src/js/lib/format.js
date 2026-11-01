/** Display formatting for dates, rupee amounts and counts. */
const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** @param {Date} date @returns {string} e.g. "12 Dec 2026" */
const formatDate = (date) =>
  date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** @param {number} amount @returns {string} e.g. "₹5,00,000" */
const formatINR = (amount) => rupees.format(amount);

/** @returns {string} e.g. "1 day", "3 days" */
const pluralize = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export { formatDate, formatINR, pluralize };
