/**
 * Prep Score Calculator
 * 
 * Computes dynamic meeting preparedness without any hard-coded numbers.
 * Evaluates the 3 core criteria:
 * 1. Agenda written
 * 2. Last minutes found / linked
 * 3. Open actions reviewed
 */
export class PrepScoreCalculator {
  /**
   * Computes the prep score and status for a single meeting.
   * 
   * @param {Object} meeting Calendar event
   * @param {Object} meetingData Stored notes and items for this meeting
   * @param {Array} relatedLinks Suggested/linked prior meetings
   * @returns {Object} Detailed prep evaluation
   */
  static computeMeetingPrep(meeting, meetingData = {}, relatedLinks = []) {
    if (!meeting) {
      return {
        scorePercent: 0,
        metCount: 0,
        totalCount: 3,
        status: 'needs_prep',
        badgeClass: 'warn',
        badgeText: 'Needs prep',
        agenda: { ok: false, label: 'Missing', detail: 'No objectives drafted' },
        lastMinutes: { ok: false, label: 'None found', detail: 'No prior meeting found' },
        openActions: { ok: false, label: 'Missing', detail: 'Unreviewed' },
        people: { count: 0 }
      };
    }

    // 1. Agenda Criterion
    const hasAgenda = Boolean(meetingData.agenda && meetingData.agenda.trim().length > 0);
    const agenda = {
      ok: hasAgenda,
      label: hasAgenda ? 'Written' : 'Missing',
      detail: hasAgenda ? 'Objectives defined' : 'Objectives needed'
    };

    // 2. Last Minutes Criterion
    const topLink = Array.isArray(relatedLinks) && relatedLinks.length > 0 ? relatedLinks[0] : null;
    let lastMinutesOk = false;
    let lastMinutesLabel = 'None found';
    let lastMinutesDetail = 'No linked prior meetings';

    if (topLink) {
      if (topLink.linkedAt || topLink.status === 'accepted') {
        lastMinutesOk = true;
        lastMinutesLabel = 'Linked';
        lastMinutesDetail = topLink.reason || 'Connected meeting';
      } else if (topLink.lastMinutesSummary && topLink.lastMinutesSummary.trim().length > 0) {
        lastMinutesOk = true;
        lastMinutesLabel = 'Linked';
        lastMinutesDetail = topLink.reason || 'Prior minutes available';
      } else if (topLink.score >= 3) {
        lastMinutesOk = true;
        lastMinutesLabel = 'Linked';
        lastMinutesDetail = topLink.reason || 'Same series match';
      } else {
        lastMinutesOk = false;
        lastMinutesLabel = 'Needs notes';
        lastMinutesDetail = 'Linked meeting has no minutes';
      }
    } else if (!meeting.series && (!meeting.attendees || meeting.attendees.length <= 1)) {
      // First meeting or standalone session
      lastMinutesOk = true;
      lastMinutesLabel = 'First meeting';
      lastMinutesDetail = 'No prior history expected';
    } else {
      lastMinutesOk = false;
      lastMinutesLabel = 'None found';
      lastMinutesDetail = 'No previous meeting linked';
    }

    const lastMinutes = {
      ok: lastMinutesOk,
      label: lastMinutesLabel,
      detail: lastMinutesDetail,
      link: topLink
    };

    // 3. Open Actions Criterion
    const carriedOverCount = Array.isArray(relatedLinks)
      ? relatedLinks.reduce((acc, l) => acc + (l.openActionsCount || 0), 0)
      : 0;
    const meetingItems = Array.isArray(meetingData.items) ? meetingData.items : [];
    const meetingOpenActions = meetingItems.filter(i => i.kind === 'action' && !i.done).length;
    const totalOpenActions = carriedOverCount + meetingOpenActions;

    const isReviewed = Boolean(meetingData.actionsReviewed);
    const actionsOk = isReviewed;
    let actionsLabel = 'Unreviewed';
    let actionsDetail = 'Action review pending';

    if (isReviewed) {
      actionsLabel = 'Reviewed';
      actionsDetail = totalOpenActions === 0 ? 'All clear (0 open)' : `${totalOpenActions} open (reviewed)`;
    } else {
      if (totalOpenActions === 0) {
        actionsLabel = 'Unreviewed';
        actionsDetail = '0 open · Review pending';
      } else {
        actionsLabel = `${totalOpenActions} to review`;
        actionsDetail = `${totalOpenActions} open action${totalOpenActions > 1 ? 's' : ''} need review`;
      }
    }

    const openActions = {
      ok: actionsOk,
      label: actionsLabel,
      detail: actionsDetail,
      totalOpen: totalOpenActions,
      carriedOverCount,
      meetingOpenActions,
      reviewed: isReviewed
    };

    // People info
    const attendees = Array.isArray(meeting.attendees) ? meeting.attendees : [];
    const people = {
      count: attendees.length,
      label: `${attendees.length} attendee${attendees.length !== 1 ? 's' : ''}`
    };

    // Scoring computation
    const totalCount = 3;
    const metCount = (agenda.ok ? 1 : 0) + (lastMinutes.ok ? 1 : 0) + (openActions.ok ? 1 : 0);
    const scorePercent = Math.round((metCount / totalCount) * 100);

    let status = 'needs_prep';
    let badgeClass = 'warn';
    let badgeText = 'Needs prep';

    if (scorePercent === 100) {
      status = 'prepared';
      badgeClass = 'ok';
      badgeText = 'Prepared';
    } else if (metCount > 0) {
      status = 'in_progress';
      badgeClass = 'info';
      badgeText = `Prep ${metCount}/${totalCount}`;
    }

    // Missing items checklist
    const missingItems = [
      {
        key: 'agenda',
        label: 'Agenda',
        ok: agenda.ok,
        statusText: agenda.ok ? 'Agenda drafted' : 'Missing agenda',
        detail: agenda.detail
      },
      {
        key: 'lastMinutes',
        label: 'Prior minutes',
        ok: lastMinutes.ok,
        statusText: lastMinutes.ok ? 'Prior minutes connected' : 'Missing prior minutes',
        detail: lastMinutes.detail
      },
      {
        key: 'openActions',
        label: 'Open actions',
        ok: openActions.ok,
        statusText: openActions.ok ? 'Open actions reviewed' : 'Missing action review',
        detail: openActions.detail
      }
    ];

    const missingCount = missingItems.filter(i => !i.ok).length;
    const missingSummary = missingCount === 0
      ? 'All items prepared'
      : `Missing: ${missingItems.filter(i => !i.ok).map(i => i.label).join(' · ')}`;

    return {
      scorePercent,
      metCount,
      totalCount,
      status,
      badgeClass,
      badgeText,
      agenda,
      lastMinutes,
      openActions,
      people,
      missingItems,
      missingCount,
      missingSummary
    };
  }

  /**
   * Helper to check if a meeting is scheduled within the next 48 hours.
   */
  static isWithin48Hours(meetingDate, meetingStart = '00:00', refDateStr = '2026-10-28', refTimeStr = '00:00') {
    if (!meetingDate) return false;
    try {
      const meetTime = new Date(`${meetingDate}T${meetingStart || '00:00'}:00`).getTime();
      const refTime = new Date(`${refDateStr}T${refTimeStr || '00:00'}:00`).getTime();
      const diffMs = meetTime - refTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 48;
    } catch (e) {
      return true;
    }
  }

  /**
   * Computes aggregate prep metrics for a collection of meetings.
   * 
   * @param {Array} meetings List of calendar events
   * @param {Object} store Data store
   * @returns {Promise<Object>} Aggregate summary
   */
  static async computeCollectionPrep(meetings, store) {
    if (!meetings || meetings.length === 0) {
      return {
        total: 0,
        preparedCount: 0,
        partialCount: 0,
        needsPrepCount: 0,
        averagePercent: 0,
        evaluations: new Map()
      };
    }

    const evaluations = new Map();
    let preparedCount = 0;
    let partialCount = 0;
    let needsPrepCount = 0;
    let sumPercents = 0;

    for (const m of meetings) {
      const data = await store.getMeetingData(m.id);
      const links = await store.suggestLinks(m);
      const prep = this.computeMeetingPrep(m, data, links);
      evaluations.set(m.id, prep);

      sumPercents += prep.scorePercent;
      if (prep.status === 'prepared') preparedCount++;
      else if (prep.status === 'in_progress') partialCount++;
      else needsPrepCount++;
    }

    const total = meetings.length;
    const averagePercent = Math.round(sumPercents / total);

    return {
      total,
      preparedCount,
      partialCount,
      needsPrepCount,
      averagePercent,
      evaluations
    };
  }
}
