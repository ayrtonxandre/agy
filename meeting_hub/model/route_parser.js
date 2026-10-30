/**
 * Meeting Hub Route Parser
 * 
 * Pure function parsing and formatting application routes for the Project-Centric Cockpit.
 * Handles both new Archetype A routes and legacy aliases.
 * 
 * Supported Routes:
 * - #/                                -> Root landing (resolves to last or first active mission)
 * - #/p/<missionId>                   -> Project hub, drawer closed
 * - #/p/<missionId>/m/<eventId>       -> Project hub + drawer on that meeting
 * - #/p/<missionId>/<tab>             -> Project hub with knowledge tab open (workstreams, decisions, actions, contacts, brief)
 * - #/inbox                           -> Cross-mission inbox
 * - #/my-actions                      -> Cross-mission actions
 * - #/calendar                        -> Calendar today view
 * - #/calendar/<tab>                  -> Calendar tab (week, meetings, series)
 * - #/calendar[/<tab>]/m/<eventId>    -> Calendar with drawer on that meeting
 * 
 * Legacy Aliases:
 * - #/meeting/<eventId>               -> Legacy meeting (resolves to mission or calendar)
 * - #/today, #/week, #/meetings, #/series -> Calendar views
 * - #/actions                         -> My actions
 * - #/projects                        -> Project root redirect
 */

const KNOWLEDGE_TABS = ['workstreams', 'decisions', 'actions', 'contacts', 'brief'];
const CALENDAR_TABS = ['today', 'week', 'meetings', 'series'];

export function parseRoute(hash) {
  const result = {
    view: 'root',
    missionId: null,
    eventId: null,
    tab: null,
    isLegacy: false,
    redirectTo: null
  };

  if (!hash || typeof hash !== 'string') {
    return result;
  }

  // Strip query parameters and trim
  const clean = hash.replace(/\?.*$/, '').trim();

  // Normalize: remove leading # and leading/trailing slashes
  let path = clean;
  if (path.startsWith('#')) path = path.slice(1);
  if (path.startsWith('/')) path = path.slice(1);
  path = path.replace(/\/+$/, '');

  // 1. Root route: '' or '/'
  if (!path) {
    result.view = 'root';
    return result;
  }

  // 2. Project routes: p/:missionId...
  if (path.startsWith('p/')) {
    result.view = 'mission';
    const parts = path.slice(2).split('/');
    result.missionId = decodeURIComponent(parts[0]);

    if (parts.length === 1) {
      // #/p/:missionId
      return result;
    }

    if (parts[1] === 'm' && parts.length >= 3) {
      // #/p/:missionId/m/:eventId
      // Join remaining parts in case eventId had unencoded slashes
      result.eventId = decodeURIComponent(parts.slice(2).join('/'));
      return result;
    }

    if (KNOWLEDGE_TABS.includes(parts[1])) {
      // #/p/:missionId/:tab
      result.tab = parts[1];
      return result;
    }

    // Default fallback for unknown sub-segment
    result.tab = parts[1];
    return result;
  }

  // 3. Cross-mission Inbox
  if (path === 'inbox') {
    result.view = 'inbox';
    return result;
  }

  // 4. Cross-mission My Actions
  if (path === 'my-actions') {
    result.view = 'my-actions';
    return result;
  }

  // 5. Calendar routes: calendar...
  if (path === 'calendar' || path.startsWith('calendar/')) {
    result.view = 'calendar';
    const parts = path.split('/');

    if (parts.length === 1) {
      // #/calendar
      result.tab = 'today';
      return result;
    }

    // Check for #/calendar/m/:eventId
    if (parts[1] === 'm' && parts.length >= 3) {
      result.tab = 'today';
      result.eventId = decodeURIComponent(parts.slice(2).join('/'));
      return result;
    }

    // Check for #/calendar/:tab[/m/:eventId]
    if (CALENDAR_TABS.includes(parts[1])) {
      result.tab = parts[1];
      if (parts[2] === 'm' && parts.length >= 4) {
        result.eventId = decodeURIComponent(parts.slice(3).join('/'));
      }
      return result;
    }

    result.tab = parts[1] || 'today';
    return result;
  }

  // 6. Legacy meeting route: #/meeting/:eventId
  if (path.startsWith('meeting/')) {
    result.view = 'legacy-meeting';
    result.eventId = decodeURIComponent(path.slice(8));
    result.isLegacy = true;
    return result;
  }

  // 7. Legacy calendar aliases
  if (path === 'today') {
    result.view = 'calendar';
    result.tab = 'today';
    result.isLegacy = true;
    result.redirectTo = '#/calendar';
    return result;
  }

  if (path === 'week') {
    result.view = 'calendar';
    result.tab = 'week';
    result.isLegacy = true;
    result.redirectTo = '#/calendar/week';
    return result;
  }

  if (path === 'meetings') {
    result.view = 'calendar';
    result.tab = 'meetings';
    result.isLegacy = true;
    result.redirectTo = '#/calendar/meetings';
    return result;
  }

  if (path === 'series') {
    result.view = 'calendar';
    result.tab = 'series';
    result.isLegacy = true;
    result.redirectTo = '#/calendar/series';
    return result;
  }

  // 8. Legacy actions alias
  if (path === 'actions') {
    result.view = 'my-actions';
    result.isLegacy = true;
    result.redirectTo = '#/my-actions';
    return result;
  }

  // 9. Legacy projects alias
  if (path === 'projects') {
    result.view = 'projects-legacy';
    result.isLegacy = true;
    result.redirectTo = '#/';
    return result;
  }

  // Default fallback for any unrecognized hash
  result.view = 'root';
  return result;
}

export function formatRoute({ view, missionId, eventId, tab }) {
  if (view === 'mission' && missionId) {
    if (eventId) {
      return `#/p/${encodeURIComponent(missionId)}/m/${encodeURIComponent(eventId)}`;
    }
    if (tab && KNOWLEDGE_TABS.includes(tab)) {
      return `#/p/${encodeURIComponent(missionId)}/${encodeURIComponent(tab)}`;
    }
    return `#/p/${encodeURIComponent(missionId)}`;
  }

  if (view === 'inbox') {
    return '#/inbox';
  }

  if (view === 'my-actions') {
    return '#/my-actions';
  }

  if (view === 'calendar') {
    const sub = tab && tab !== 'today' ? `/${tab}` : '';
    if (eventId) {
      return `#/calendar${sub}/m/${encodeURIComponent(eventId)}`;
    }
    return `#/calendar${sub}`;
  }

  return '#/';
}
