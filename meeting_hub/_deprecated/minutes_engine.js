/**
 * Meeting Minutes Intelligence Engine
 * 
 * Generic high-precision parser for structured meeting minutes.
 * Decoupled from any domain knowledge or client-specific vocabulary.
 * All clinical/business concepts, tools, workstream tags, and decision triggers
 * are driven dynamically by the project configuration.
 */

export class MinutesEngine {
  /**
   * Main parsing entry point.
   * @param {string} rawText Raw plain text or markdown from Google Doc / notes
   * @param {object} meta Optional contextual metadata (e.g. event summary, date, meetingId)
   * @param {object} projectConfig Optional Project configuration object containing parserHints
   * @returns {object} Structured minutes intelligence
   */
  static parseMinutes(rawText, meta = {}, projectConfig = null) {
    if (!rawText || typeof rawText !== 'string') {
      return {
        title: meta.title || 'Untitled Meeting',
        date: meta.date || '',
        facility: meta.facility || '',
        meetingId: meta.meetingId || '',
        participants: [],
        topics: [],
        actions: [],
        decisions: [],
        knowledge: { tools: [], concepts: [], facilities: [] },
        rawLength: 0
      };
    }

    // Normalize text: remove BOM, normalize line endings
    const cleanText = rawText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n');

    const hints = projectConfig?.parserHints || {};
    const date = MinutesEngine.extractDate(cleanText, meta.date);
    const facility = MinutesEngine.extractFacility(cleanText, meta.title, hints.facilities);
    const title = MinutesEngine.extractTitle(cleanText, meta.title);
    const participants = MinutesEngine.extractParticipants(lines, hints.ownerOrgRules);
    const topics = MinutesEngine.extractTopics(lines);
    const actions = MinutesEngine.extractActions(lines, date, hints, meta);
    const decisions = MinutesEngine.extractDecisions(cleanText, topics, hints, meta);
    const knowledge = MinutesEngine.extractKnowledge(cleanText, facility, hints);

    return {
      title,
      date,
      facility,
      meetingId: meta.meetingId || '',
      participants,
      topics,
      actions,
      decisions,
      knowledge,
      rawLength: cleanText.length
    };
  }

  /* ================= Metadata Extraction ================= */

  static extractDate(text, fallbackDate = '') {
    const match = text.match(/Date\s*[:|]\s*([^\n\r]+)/i);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
    const frDateMatch = text.match(/\b(\d{1,2})\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})\b/i);
    if (frDateMatch) {
      return frDateMatch[0];
    }
    const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (isoMatch) {
      return isoMatch[1];
    }
    return fallbackDate || '';
  }

  static extractFacility(text, fallbackTitle = '', configuredFacilities = []) {
    const combined = `${text.slice(0, 600)} ${fallbackTitle}`.toLowerCase();
    
    // Check against configured project facilities
    if (Array.isArray(configuredFacilities) && configuredFacilities.length > 0) {
      for (const fac of configuredFacilities) {
        if (fac && combined.includes(fac.toLowerCase())) {
          return fac;
        }
      }
    }

    return '';
  }

  static extractTitle(text, fallbackTitle = '') {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (/compte\s*rendu|minutes|ordre\s+du\s+jour|meeting|reunion|réunion|atelier/i.test(line)) {
        return line.replace(/^#+\s*/, '').trim();
      }
    }
    return fallbackTitle || (lines[0] ? lines[0].replace(/^#+\s*/, '').trim() : 'Meeting Minutes');
  }

  /* ================= Participants Extraction ================= */

  static extractParticipants(lines, ownerOrgRules = []) {
    const participants = [];
    let inSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/^#*\s*(Participants|Attendees|Présents|Presences|Présences)\b/i.test(line)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // Break out on next major header
        if (/^#*\s*(Points\s+abord[ée]s|Prochaines\s+[ée]tapes|Actions|Ordre\s+du\s+jour|Agenda|Minutes|Next\s+steps)/i.test(line)) {
          break;
        }

        if (/^[*\-•]/.test(line)) {
          const raw = line.replace(/^[*\-•]\s*/, '').trim();
          let name = raw;
          let role = '';
          let org = '';

          if (raw.includes('|')) {
            const parts = raw.split('|').map(p => p.trim());
            name = parts[0];
            role = parts[1] || '';
          } else if (raw.includes(':')) {
            const parts = raw.split(':').map(p => p.trim());
            name = parts[0];
            role = parts[1] || '';
          } else if (raw.includes('(') && raw.includes(')')) {
            const m = raw.match(/^(.*?)\((.*?)\)$/);
            if (m) {
              name = m[1].trim();
              role = m[2].trim();
            }
          }

          // Classify organization from rules
          const lowerRole = role.toLowerCase();
          const lowerName = name.toLowerCase();
          if (Array.isArray(ownerOrgRules)) {
            for (const rule of ownerOrgRules) {
              const kws = rule.keywords || rule.match || [];
              if (kws.some(k => lowerRole.includes(k.toLowerCase()) || lowerName.includes(k.toLowerCase()))) {
                org = rule.org;
                break;
              }
            }
          }

          participants.push({ name, role, org, raw });
        }
      }
    }

    return participants;
  }

  /* ================= Topics Extraction ================= */

  static extractTopics(lines) {
    const topics = [];
    let inSection = false;
    let currentTopic = null;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      if (/^#*\s*(Points\s+abord[ée]s|Discussion|Topics|Ordre\s+du\s+jour|Notes)/i.test(trimmed)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // Stop on next steps / actions header
        if (/^#*\s*((?:Les\s+)?prochaines\s+[ée]tapes|Actions|Next\s+Steps)/i.test(trimmed)) {
          break;
        }

        const isBullet = /^[*\-•]/.test(trimmed);
        const hasColonEnd = /:\s*$/.test(trimmed);
        const indentLevel = rawLine.search(/\S|$/);

        if ((!isBullet && trimmed.length < 80 && !trimmed.endsWith('.')) ||
            (isBullet && hasColonEnd && indentLevel <= 2) ||
            /^#{2,4}\s+/.test(trimmed)) {
          
          if (currentTopic) {
            topics.push(currentTopic);
          }

          const topicTitle = trimmed
            .replace(/^#+\s*/, '')
            .replace(/^[*\-•]\s*/, '')
            .replace(/:\s*$/, '')
            .trim();

          currentTopic = {
            title: topicTitle,
            points: []
          };
          continue;
        }

        if (currentTopic) {
          const cleanPoint = trimmed.replace(/^[*\-•]\s*/, '').trim();
          if (cleanPoint) {
            currentTopic.points.push(cleanPoint);
          }
        } else if (trimmed) {
          currentTopic = {
            title: 'General',
            points: [trimmed.replace(/^[*\-•]\s*/, '').trim()]
          };
        }
      }
    }

    if (currentTopic) {
      topics.push(currentTopic);
    }

    return topics;
  }

  /* ================= Actions Extraction ================= */

  static extractActions(lines, contextDate = '', hints = {}, meta = {}) {
    const actions = [];
    let inSection = false;
    const meetingLink = meta.meetingId ? `#/meeting/${encodeURIComponent(meta.meetingId)}` : '';

    const tagRules = hints.tagRules || [];
    const ownerOrgRules = hints.ownerOrgRules || [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/^#*\s*((?:Les\s+)?prochaines\s+[ée]tapes|Actions|Next\s+Steps)/i.test(line)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // Stop if hitting a major new section
        if (/^#+\s+[A-Z]/.test(line) && !line.includes('étape') && !line.includes('action')) {
          break;
        }

        if (/^[*\-•]/.test(line)) {
          let raw = line.replace(/^[*\-•]\s*/, '').trim();
          let isDone = false;

          // Strip checkbox markdown if present: [ ] or [x] or [X]
          if (/^\[([ xX])\]\s*/.test(raw)) {
            const cbMatch = raw.match(/^\[([ xX])\]\s*/);
            if (cbMatch[1].toLowerCase() === 'x') isDone = true;
            raw = raw.replace(/^\[([ xX])\]\s*/, '').trim();
          }

          let owner = 'Team';
          let text = raw;
          let dueDate = '';

          // Look for "Owner : Action" or "Owner | Action"
          const colonMatch = raw.match(/^([A-Za-zÀ-ÿ0-9\s/.'-]+)\s*[:|]\s*(.+)$/);
          if (colonMatch) {
            const potentialOwner = colonMatch[1].trim();
            const actionText = colonMatch[2].trim();

            if (potentialOwner.toLowerCase().includes('prochain point') || potentialOwner.toLowerCase().includes('suivi') || potentialOwner.toLowerCase().includes('next sync')) {
              owner = 'Team';
              text = `${potentialOwner} : ${actionText}`;
              dueDate = actionText;
            } else {
              owner = potentialOwner;
              text = actionText;
            }
          }

          // Due timing inference
          const contextYear = contextDate ? (contextDate.match(/\b(\d{4})\b/) ? contextDate.match(/\b(\d{4})\b/)[1] : new Date().getFullYear()) : new Date().getFullYear();
          const isoDateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
          const slashDateMatch = text.match(/(?:avant le|pour le|le|by|due|before)?\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/i);

          if (isoDateMatch) {
            dueDate = isoDateMatch[1];
          } else if (slashDateMatch) {
            const d = slashDateMatch[1].padStart(2, '0');
            const m = slashDateMatch[2].padStart(2, '0');
            const y = slashDateMatch[3] ? (slashDateMatch[3].length === 2 ? `20${slashDateMatch[3]}` : slashDateMatch[3]) : contextYear;
            dueDate = `${y}-${m}-${d}`;
          }

          if (!dueDate) {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('mardi matin') || lowerText.includes('semaine prochaine') || lowerText.includes('next week')) {
              dueDate = 'Next week';
            } else if (lowerText.includes('dans la semaine') || lowerText.includes('this week')) {
              dueDate = 'This week';
            } else if (lowerText.includes('dès que') || lowerText.includes('urgent') || lowerText.includes('prioritaire')) {
              dueDate = 'Priority';
            }
          }

          // Dynamic workstream tags from project parser hints
          const tags = [];
          const lowerText = text.toLowerCase();
          for (const rule of tagRules) {
            const kws = rule.keywords || rule.match || [];
            if (kws.some(k => lowerText.includes(k.toLowerCase()))) {
              tags.push(rule.tag);
            }
          }

          // Dynamic owner organization from project parser hints
          let ownerOrg = 'Team';
          const lowerOwner = owner.toLowerCase();
          for (const rule of ownerOrgRules) {
            const kws = rule.keywords || rule.match || [];
            if (kws.some(k => lowerOwner.includes(k.toLowerCase()) || lowerText.includes(k.toLowerCase()))) {
              ownerOrg = rule.org;
              break;
            }
          }

          actions.push({
            id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            owner,
            ownerOrg,
            text,
            dueDate,
            tags,
            done: isDone,
            source: 'minutes',
            quote: line,
            meetingLink
          });
        }
      }
    }

    return actions;
  }

  /* ================= Decisions Extraction ================= */

  static extractDecisions(cleanText, topics = [], hints = {}, meta = {}) {
    const decisions = [];
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    const meetingLink = meta.meetingId ? `#/meeting/${encodeURIComponent(meta.meetingId)}` : '';

    // Project-configured decision triggers
    const configuredTriggers = (hints.decisionTriggers || []).map(t => {
      try {
        if (typeof t === 'string') {
          const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return { regex: new RegExp(`(?:\\b${escaped}\\b)\\s*[:|]?\\s*(.+)`, 'i'), label: t };
        }
        return { regex: new RegExp(t.pattern, 'i'), label: t.label || 'Decision' };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    // Generic fallback triggers if none configured or alongside
    const genericTriggers = [
      { regex: /(?:\bdécision\b|\bdecision\b)\s*[:|]\s*(.+)/i, label: 'Decision' },
      { regex: /(?:\bdécidé\s+que\b|\bdecided\s+that\b|\bconvenu\s+de\b|\bagreed\s+to\b)\s+(.+)/i, label: 'Agreement' },
      { regex: /(?:\bsolution\s+retenue\b|\bsolution\s+adoptée\b)\s*[:|]?\s*(.+)/i, label: 'Adopted Solution' }
    ];

    const decisionTriggers = configuredTriggers.length > 0
      ? [...configuredTriggers, ...genericTriggers]
      : genericTriggers;

    for (const line of lines) {
      // Skip section headers like "Décisions prises:" or "Décisions :"
      if (/^(?:#+\s*)?(?:décisions?(?:\s+prises)?|decisions?)\s*:\s*$/i.test(line)) {
        continue;
      }

      for (const trigger of decisionTriggers) {
        if (trigger.regex.test(line)) {
          const statement = line.replace(/^[*\-•]\s*/, '').trim();
          decisions.push({
            id: `dec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            label: trigger.label,
            statement,
            context: MinutesEngine.findContextTopic(line, topics),
            quote: line,
            meetingLink
          });
          break;
        }
      }
    }

    return decisions;
  }

  static findContextTopic(line, topics) {
    for (const t of topics) {
      if (t.points.some(p => p.includes(line) || line.includes(p))) {
        return t.title;
      }
    }
    return 'General';
  }

  /* ================= Knowledge Extraction ================= */

  static extractKnowledge(text, facility = '', hints = {}) {
    const lower = text.toLowerCase();
    const tools = [];
    const concepts = [];
    const facilities = [];

    // Driven dynamically by project parser hints
    const configuredTools = hints.tools || [];
    for (const t of configuredTools) {
      const name = typeof t === 'string' ? t : t.name;
      const keywords = typeof t === 'string' ? [t.toLowerCase()] : (t.keywords || [t.name.toLowerCase()]);
      if (keywords.some(k => lower.includes(k.toLowerCase()))) {
        tools.push({ name, type: (typeof t === 'object' && t.type) || 'Tool' });
      }
    }

    const configuredConcepts = hints.concepts || [];
    for (const c of configuredConcepts) {
      const name = typeof c === 'string' ? c : c.name;
      const keywords = typeof c === 'string' ? [c.toLowerCase()] : (c.keywords || [c.name.toLowerCase()]);
      if (keywords.some(k => lower.includes(k.toLowerCase()))) {
        concepts.push({ name, desc: (typeof c === 'object' && c.desc) || '' });
      }
    }

    const configuredFacilities = hints.facilities || [];
    for (const f of configuredFacilities) {
      if (lower.includes(f.toLowerCase())) {
        facilities.push(f);
      }
    }
    if (facility && !facilities.includes(facility)) {
      facilities.push(facility);
    }

    return {
      tools: Array.from(new Map(tools.map(t => [t.name, t])).values()),
      concepts: Array.from(new Map(concepts.map(c => [c.name, c])).values()),
      facilities: Array.from(new Set(facilities))
    };
  }

  /* ================= Formatting & Conversion ================= */

  /**
   * Converts extracted actions and decisions into Meeting Hub item models.
   */
  static toMeetingItems(parsed) {
    const items = [];

    // Actions
    if (Array.isArray(parsed.actions)) {
      for (const act of parsed.actions) {
        items.push({
          id: act.id || `item-act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          kind: 'action',
          text: act.text,
          owner: act.owner || '',
          ownerOrg: act.ownerOrg || '',
          dueDate: act.dueDate || '',
          done: false,
          tags: act.tags || [],
          source: 'minutes',
          quote: act.quote || '',
          meetingLink: act.meetingLink || ''
        });
      }
    }

    // Decisions
    if (Array.isArray(parsed.decisions)) {
      for (const dec of parsed.decisions) {
        items.push({
          id: dec.id || `item-dec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          kind: 'decision',
          text: `[${dec.label}] ${dec.statement}`,
          label: dec.label,
          statement: dec.statement,
          context: dec.context,
          source: 'minutes',
          quote: dec.quote || '',
          meetingLink: dec.meetingLink || ''
        });
      }
    }

    return items;
  }
}
