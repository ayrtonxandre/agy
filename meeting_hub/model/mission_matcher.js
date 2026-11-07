/**
 * Mission ↔ Meeting Matcher
 * 
 * Pure function that resolves which mission an event belongs to.
 * Priority:
 * 1. Bracket title tags (e.g. [MANDAT GE], [CARE DISPENSING], [PrideFact], [HDJ], [MO])
 * 2. Visual Calendar Color Tags (e.g. [MAIN MISSION], [COUNSELING/HR], Team Work / [GE], [HEALTHCARE], [PRIDEFACT])
 * 3. clientMatch entries from missions.yaml against title, tags, or client field
 * 4. Attendee overlap with the mission's contacts
 * Ambiguous matches return confidence: 'ambiguous'.
 */

export const CALENDAR_COLOR_TAGS = {
  '1': '[ARTEFACT INTERNAL]',
  '2': '[COUNSELING/HR]',
  '3': '[ARTEFACT INTERNAL]',
  '4': '[PRIDEFACT]',
  '5': '[HEALTHCARE]',
  '6': 'Team Work',
  '7': '[MAIN MISSION]',
  '8': 'Me-time',
  '9': '[ARTEFACT INTERNAL]',
  '10': '[COUNSELING/HR]',
  '11': '[PRIDEFACT]'
};

export function matchMission(event, registry) {
  if (!event) return null;
  const missions = Array.isArray(registry) ? registry : (registry?.missions || []);
  if (!missions.length) return null;

  const rawTitle = (event.title || event.summary || '').trim();
  const title = rawTitle.toLowerCase();
  const client = (event.client || '').toLowerCase().trim();
  const tags = (Array.isArray(event.tags) ? event.tags : []).map(t => String(t).toLowerCase().trim());
  const attendees = (Array.isArray(event.attendees) ? event.attendees : []).map(a => {
    if (typeof a === 'string') return a.toLowerCase().trim();
    return (a.name || a.email || '').toLowerCase().trim();
  });

  // 0. Priority 0: Explicit mission/project ID on event
  if (event.projectId || event.missionId) {
    const explicitId = (event.projectId || event.missionId).toLowerCase().trim();
    const explicitMission = missions.find(m => m.id.toLowerCase() === explicitId);
    if (explicitMission) {
      return {
        missionId: explicitMission.id,
        confidence: 'high',
        reason: `Explicit mission assignment (${explicitMission.id})`
      };
    }
  }

  // 1. First priority: Bracket title tags (e.g. [MANDAT GE], [CARE DISPENSING], [PrideFact], [HDJ], [MO])
  const bracketMatches = rawTitle.match(/\[(.*?)\]/g) || [];
  if (bracketMatches.length > 0) {
    const bracketHits = [];
    for (const rawBracket of bracketMatches) {
      const bracketClean = rawBracket.toLowerCase().trim();
      const bracketInner = bracketClean.replace(/[\[\]]/g, '').trim();
      for (const m of missions) {
        const patterns = (m.clientMatch || [m.name, m.id]).map(s => String(s).toLowerCase().trim());
        if (patterns.some(pattern => {
          const cleanPat = pattern.replace(/[\[\]]/g, '').trim();
          return pattern === bracketClean || pattern === bracketInner || cleanPat === bracketInner;
        })) {
          bracketHits.push({ mission: m, tag: rawBracket });
        }
      }
    }

    if (bracketHits.length === 1) {
      return {
        missionId: bracketHits[0].mission.id,
        confidence: 'high',
        reason: `Bracket tag "${bracketHits[0].tag}" matched mission "${bracketHits[0].mission.name}"`
      };
    } else if (bracketHits.length > 1) {
      const uniqueMissionIds = [...new Set(bracketHits.map(h => h.mission.id))];
      if (uniqueMissionIds.length === 1) {
        return {
          missionId: uniqueMissionIds[0],
          confidence: 'high',
          reason: `Bracket tag matched mission "${bracketHits[0].mission.name}"`
        };
      } else {
        return {
          missionId: bracketHits[0].mission.id,
          confidence: 'ambiguous',
          reason: `Ambiguous bracket tags matched multiple missions: ${uniqueMissionIds.join(', ')}`
        };
      }
    }
  }

  // 2. Second priority: Calendar Color Tag (visual color assigned in Google Calendar)
  const colorId = event.colorId !== undefined && event.colorId !== null ? String(event.colorId) : '';
  const colorTag = (event.colorTag || (colorId && CALENDAR_COLOR_TAGS[colorId]) || '').trim();
  if (colorTag) {
    const colorClean = colorTag.toLowerCase().trim();
    const colorInner = colorClean.replace(/[\[\]]/g, '').trim();
    const colorHits = [];

    for (const m of missions) {
      const patterns = (m.clientMatch || [m.name, m.id]).map(s => String(s).toLowerCase().trim());
      if (patterns.some(pattern => {
        const cleanPat = pattern.replace(/[\[\]]/g, '').trim();
        return pattern === colorClean || pattern === colorInner || cleanPat === colorInner;
      })) {
        colorHits.push(m);
      }
    }

    // Check if title explicitly specifies a different client/mission (e.g. "Échange mission Leclerc" miscolored)
    const titleOverrides = [];
    for (const m of missions) {
      const patterns = (m.clientMatch || [m.name, m.id]).map(s => String(s).toLowerCase().trim());
      for (const pat of patterns) {
        const cleanPat = pat.replace(/[\[\]]/g, '').trim();
        if (cleanPat && cleanPat.length >= 4 && !cleanPat.startsWith('main mission') && !cleanPat.startsWith('team work')) {
          // Check whole word or clear substring in title
          if (title.includes(cleanPat)) {
            titleOverrides.push(m);
            break;
          }
        }
      }
    }

    if (colorHits.length === 1) {
      if (titleOverrides.length === 1 && titleOverrides[0].id !== colorHits[0].id) {
        return {
          missionId: titleOverrides[0].id,
          confidence: 'high',
          reason: `Title keyword match "${titleOverrides[0].name}" overrides calendar color tag "${colorTag}"`
        };
      }
      return {
        missionId: colorHits[0].id,
        confidence: 'high',
        reason: `Calendar color tag "${colorTag}" (colorId ${colorId}) matched mission "${colorHits[0].name}"`
      };
    } else if (colorHits.length > 1) {
      const uniqueIds = [...new Set(colorHits.map(m => m.id))];
      if (uniqueIds.length === 1) {
        if (titleOverrides.length === 1 && titleOverrides[0].id !== uniqueIds[0]) {
          return {
            missionId: titleOverrides[0].id,
            confidence: 'high',
            reason: `Title keyword match "${titleOverrides[0].name}" overrides calendar color tag "${colorTag}"`
          };
        }
        return {
          missionId: uniqueIds[0],
          confidence: 'high',
          reason: `Calendar color tag "${colorTag}" matched mission "${colorHits[0].name}"`
        };
      }
    }
  }

  // 3. Third priority: clientMatch entries, title match, event tags, client field
  const scoredMissions = [];
  for (const m of missions) {
    let score = 0;
    const matchReasons = [];
    const patterns = (m.clientMatch || [m.name, m.id]).map(s => String(s).toLowerCase().trim());

    for (const pat of patterns) {
      const cleanPat = pat.replace(/[\[\]]/g, '').trim();
      if (!cleanPat) continue;

      // Exact phrase in title
      if (title.includes(pat) || title.includes(cleanPat)) {
        score += 10;
        matchReasons.push(`Title matches "${pat}"`);
      }
      // Tag match
      if (tags.some(t => t === pat || t === cleanPat || t.includes(cleanPat))) {
        score += 6;
        matchReasons.push(`Tag matches "${pat}"`);
      }
      // Client field match
      if (client && (client === pat || client === cleanPat || client.includes(cleanPat))) {
        score += 5;
        matchReasons.push(`Client field matches "${pat}"`);
      }
    }

    if (score > 0) {
      scoredMissions.push({
        mission: m,
        score,
        reason: matchReasons.join(', ')
      });
    }
  }

  if (scoredMissions.length > 0) {
    scoredMissions.sort((a, b) => b.score - a.score);
    const top = scoredMissions[0];
    const runnerUp = scoredMissions[1];

    if (runnerUp && runnerUp.score === top.score && runnerUp.mission.id !== top.mission.id) {
      return {
        missionId: top.mission.id,
        confidence: 'ambiguous',
        reason: `Ambiguous match between "${top.mission.name}" and "${runnerUp.mission.name}"`
      };
    }

    return {
      missionId: top.mission.id,
      confidence: top.score >= 10 ? 'high' : 'medium',
      reason: top.reason
    };
  }

  // 4. Fourth priority: Attendee overlap with mission contacts if available
  for (const m of missions) {
    const contactNames = (m.contacts || []).map(c => (typeof c === 'string' ? c : c.name || '').toLowerCase().trim());
    const matchedContacts = attendees.filter(att => 
      contactNames.some(c => c && (att.includes(c) || c.includes(att)))
    );
    if (matchedContacts.length > 0) {
      return {
        missionId: m.id,
        confidence: 'medium',
        reason: `Attendee overlap matched: ${matchedContacts.join(', ')}`
      };
    }
  }

  return null;
}
