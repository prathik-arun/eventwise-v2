'use strict';

/** Builds the countdown of milestones leading up to the event. */
Eventwise.timeline = (() => {
  const { addDays, daysBetween } = Eventwise.dates;

  /**
   * Counts the profile's milestones back from the event date. When there is
   * less time than the ideal lead time, every milestone is moved closer to the
   * event in proportion, so no task lands in the past.
   * @param {string} type event type id
   * @param {Date} today the day the plan starts from
   * @param {Date} eventDate
   * @returns {{task: string, inDays: number, due: Date, compressed: boolean}[]} earliest first
   */
  function buildTimeline(type, today, eventDate) {
    const daysAvailable = daysBetween(today, eventDate);
    const { milestones } = Eventwise.profiles[type];
    const idealLeadTime = Math.max(...milestones.map((milestone) => milestone.daysBefore));
    const scale = Math.min(1, daysAvailable / idealLeadTime);

    return milestones
      .map(({ daysBefore, task }) => {
        const inDays = daysAvailable - Math.round(daysBefore * scale);
        return {
          task,
          inDays,
          due: addDays(today, inDays),
          compressed: scale < 1 && daysBefore > 0,
        };
      })
      .sort((a, b) => a.inDays - b.inDays);
  }

  return { buildTimeline };
})();
