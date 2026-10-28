/**
 * Series Model & Recurrence Collapsing Engine
 * 
 * Collapses recurring instances of meetings into unified series entities
 * for lineage, minutes intelligence, and series overview.
 */

export class SeriesModel {
  /**
   * Groups a list of events into collapsed Series definitions.
   * @param {Array} events - Normalized event objects
   * @returns {Array} List of collapsed series objects
   */
  static collapse(events) {
    const seriesMap = new Map();

    for (const ev of events) {
      const sid = ev.series || `series-${ev.id}`;
      if (!seriesMap.has(sid)) {
        seriesMap.set(sid, {
          id: sid,
          title: ev.title,
          client: ev.client,
          stream: ev.stream,
          tags: new Set(),
          attendeesMap: new Map(),
          eventIds: [],
          dates: [],
          firstDate: ev.date,
          lastDate: ev.date,
        });
      }

      const s = seriesMap.get(sid);
      s.eventIds.push(ev.id);
      if (ev.date) s.dates.push(ev.date);

      // Union tags
      for (const t of (ev.tags || [])) {
        s.tags.add(t);
      }

      // Track attendee frequency
      for (const a of (ev.attendees || [])) {
        s.attendeesMap.set(a, (s.attendeesMap.get(a) || 0) + 1);
      }
    }

    const result = [];
    for (const [id, s] of seriesMap.entries()) {
      s.dates.sort();
      // Most frequent attendees
      const topAttendees = Array.from(s.attendeesMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

      result.push({
        id,
        title: s.title,
        client: s.client,
        stream: s.stream,
        tags: Array.from(s.tags),
        sampleAttendees: topAttendees,
        instanceCount: s.eventIds.length,
        isRecurring: s.eventIds.length > 1,
        eventIds: s.eventIds,
        firstDate: s.dates[0] || '',
        lastDate: s.dates[s.dates.length - 1] || ''
      });
    }

    return result.sort((a, b) => b.instanceCount - a.instanceCount);
  }

  /**
   * Given an event and all events in the same series, finds previous instances
   * that happened before this event's date.
   */
  static getPreviousInstances(currentEvent, allEvents) {
    if (!currentEvent.series) return [];
    return allEvents
      .filter(e => e.series === currentEvent.series && e.id !== currentEvent.id && e.date <= currentEvent.date)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}
