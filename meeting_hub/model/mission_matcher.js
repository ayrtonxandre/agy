/**
 * Mission ↔ Meeting Matcher
 * 
 * Pure function that resolves which mission an event belongs to.
 * Priority:
 * 1. Bracket title tags (e.g. [MANDAT GE], [CARE DISPENSING], [PrideFact], [HDJ], [MO])
 * 2. clientMatch entries from missions.yaml against title, tags, or client field
 * 3. Attendee overlap with the mission's contacts
 * Ambiguous matches return confidence: 'ambiguous'.
 */

export function matchMission(event, registry) {
  if (!event) return null;
  const missions = Array.isArray(registry) ? registry : (registry?.missions || []);
  if (!missions.length) return null;

  const rawTitle = (event.title || '').trim();
  const title = rawTitle.toLowerCase();
  const client = (event.client || '').toLowerCase().trim();
  const tags = (Array.isArray(event.tags) ? event.tags : []).map(t => String(t).toLowerCase().trim());
  const attendees = (Array.isArray(event.attendees) ? event.attendees : []).map(a => String(a).toLowerCase().trim());

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

  // 2. Second priority: clientMatch entries, title match, event tags, client field
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

  // 3. Third priority: Attendee overlap with mission contacts if available
  for (const m of missions) {
    const contactNames = (m.contacts || []).map(c => (typeof c === 'string' ? c : c.name || '').toLowerCase().trim());
    if (m.id === 'counseling') {
      contactNames.push('roland juilhard', 'jamila nasri', 'roland j.', 'jamila n.');
    }
    if (m.id === 'ge-enterprise') {
      contactNames.push('louis bechu', 'edward toulemonde', 'paul bouche', 'camille kugler');
    }
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
