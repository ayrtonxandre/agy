/**
 * Event Model & Normalization
 * 
 * Maps raw multi-calendar events (Google, Outlook ICS, iCloud, ATHX) into
 * the clean, standardized Meeting Hub domain model.
 */

export class EventModel {
  static normalize(raw) {
    const id = raw.id || '';
    const summary = (raw.summary || raw.title || '(Untitled)').trim();
    const source = raw.source || '';
    const desc = raw.description || '';
    const location = raw.location || '';
    const isAllDay = Boolean(raw.isAllDay || raw.is_all_day);

    // Extract start and end times
    let date = raw.date || '';
    let start = raw.start || raw.startTime || '00:00';
    let end = raw.end || raw.endTime || '00:00';

    if (typeof start === 'string' && start.includes('T')) {
      date = start.slice(0, 10);
      start = start.slice(11, 16);
    }
    if (typeof end === 'string' && end.includes('T')) {
      end = end.slice(11, 16);
    }

    const durationMin = raw.durationMin !== undefined ? raw.durationMin : EventModel.calculateDuration(start, end);
    const { stream, client, isTraining } = EventModel.detectStreamAndClient(summary, source, desc, location, raw.attendees, raw.organizer);
    const series = raw.series || EventModel.extractSeriesId(id, summary);
    const tags = raw.tags || EventModel.extractTags(`${summary} ${desc}`);
    const attendees = Array.isArray(raw.attendees) ? EventModel.formatAttendees(raw.attendees) : [];
    const videoUrl = raw.videoUrl || raw.video_link || raw.videoLink || '';
    const link = raw.link || EventModel.detectVideoPlatform(videoUrl);
    const docMatch = (desc + ' ' + (Array.isArray(raw.attachments) ? raw.attachments.map(a => a.fileUrl || '').join(' ') : '')).match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
    const googleDocUrl = raw.googleDocUrl || (docMatch ? docMatch[0] : '');

    return {
      id,
      date,
      start,
      end,
      durationMin,
      title: summary,
      stream,
      client,
      series,
      attendees,
      tags,
      link,
      videoUrl,
      googleDocUrl,
      isAllDay,
      isTraining,
      location,
      description: desc,
      source
    };
  }

  static calculateDuration(start, end) {
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 1440;
      return diff;
    } catch {
      return 0;
    }
  }

  static detectStreamAndClient(summary, source, desc, location, attendees = [], organizer = {}) {
    const orgEmail = (organizer && organizer.email) || '';
    const attEmails = Array.isArray(attendees) ? attendees.map(a => (typeof a === 'string' ? a : a.email || '')).join(' ') : '';
    const corpus = `${summary} ${source} ${desc} ${location} ${orgEmail} ${attEmails}`.toLowerCase();

    if (corpus.includes('athx') || corpus.includes('training') || corpus.includes('wod') || corpus.includes('crossfit')) {
      return { stream: 'life', client: 'ATHX', isTraining: true };
    }
    if (corpus.includes('clariane') || corpus.includes('inicea') || corpus.includes('estela') || corpus.includes('@clariane.fr')) {
      return { stream: 'work', client: 'Clariane', isTraining: false };
    }
    if (corpus.includes('personal') || corpus.includes('ma vie') || corpus.includes('icloud')) {
      return { stream: 'life', client: 'Personal', isTraining: false };
    }
    return { stream: 'work', client: 'Artefact', isTraining: false };
  }

  static extractSeriesId(id, summary) {
    // Google Calendar recurrence format: <base_id>_<timestamp>
    const match = id.match(/^(.*)_(\d{8}(?:T\d+Z)?)$/);
    if (match) {
      return match[1];
    }
    // Clean recurring summary as fallback series key
    const clean = summary
      .replace(/\[.*?\]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '');
    return clean ? `series-${clean}` : `series-${id}`;
  }

  static extractTags(text) {
    const tags = new Set();
    const lower = text.toLowerCase();
    const keywords = [
      'f360', 'invoicing', 'hdj', 'anomalies', 'netsoins', 'palantir',
      'crossfit', 'wod', 'run', 'planning', 'staffing', 'eom', 'knowledge',
      'roadmap', 'data-quality', 'training', 'sprint'
    ];
    for (const kw of keywords) {
      if (lower.includes(kw)) tags.add(kw);
    }
    // Bracketed tokens e.g. [INVOICING], [PLANNING HDJ]
    const brackets = text.match(/\[(.*?)\]/g) || [];
    for (const b of brackets) {
      const clean = b.slice(1, -1).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (clean && clean.length > 2) tags.add(clean);
    }
    return Array.from(tags).sort();
  }

  static formatAttendees(attendees) {
    return attendees.map(a => {
      if (typeof a === 'string') return a;
      const name = a.name || (a.email ? a.email.split('@')[0] : '');
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0]} ${parts[1][0]}.`;
      }
      return name;
    }).filter(Boolean);
  }

  static detectVideoPlatform(url) {
    if (!url) return '';
    if (url.includes('teams.microsoft.com')) return 'Teams';
    if (url.includes('meet.google.com')) return 'Meet';
    if (url.includes('zoom.us')) return 'Zoom';
    return 'Video';
  }
}
