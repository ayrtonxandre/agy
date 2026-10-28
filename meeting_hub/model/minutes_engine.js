/**
 * Meeting Minutes Intelligence Engine
 * 
 * High-precision parser for structured meeting minutes (such as Google Docs notes).
 * Extracts:
 * - Metadata (Date, Title, Facility/Site)
 * - Participants (Name, Role, Organization)
 * - Discussion Topics & Sub-points
 * - Action Items with Owner, Due Timing, and Tags
 * - Architecture & Operational Decisions
 * - Domain Knowledge Entities & Tools
 */

export class MinutesEngine {
  /**
   * Main parsing entry point.
   * @param {string} rawText Raw plain text or markdown from Google Doc / notes
   * @param {object} meta Optional contextual metadata (e.g. event summary, date)
   * @returns {object} Structured minutes intelligence
   */
  static parseMinutes(rawText, meta = {}) {
    if (!rawText || typeof rawText !== 'string') {
      return {
        title: meta.title || 'Untitled Meeting',
        date: meta.date || '',
        facility: meta.facility || '',
        participants: [],
        topics: [],
        actions: [],
        decisions: [],
        knowledge: { tools: [], concepts: [], facilities: [] }
      };
    }

    // Normalize text: remove BOM, normalize line endings
    const cleanText = rawText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n');

    const date = MinutesEngine.extractDate(cleanText, meta.date);
    const facility = MinutesEngine.extractFacility(cleanText, meta.title);
    const title = MinutesEngine.extractTitle(cleanText, meta.title);
    const participants = MinutesEngine.extractParticipants(lines);
    const topics = MinutesEngine.extractTopics(lines);
    const actions = MinutesEngine.extractActions(lines, date);
    const decisions = MinutesEngine.extractDecisions(cleanText, topics);
    const knowledge = MinutesEngine.extractKnowledge(cleanText, facility);

    return {
      title,
      date,
      facility,
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
    // Check "Date | 26 Octobre 2026" or "Date : 21/10/2026"
    const match = text.match(/Date\s*[:|]\s*([^\n\r]+)/i);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
    // Check regex for date in French format
    const frDateMatch = text.match(/\b(\d{1,2})\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})\b/i);
    if (frDateMatch) {
      return frDateMatch[0];
    }
    return fallbackDate || '';
  }

  static extractFacility(text, fallbackTitle = '') {
    const combined = `${text.slice(0, 500)} ${fallbackTitle}`.toLowerCase();
    if (combined.includes('mariénia') || combined.includes('marienia')) return 'Mariéna';
    if (combined.includes('arbelles') || combined.includes('les arbelles')) return 'Les Arbelles';
    if (combined.includes('glanum')) return 'Glanum';
    if (combined.includes('inicea')) return 'Inicea';
    if (combined.includes('clariane')) return 'Clariane';
    return '';
  }

  static extractTitle(text, fallbackTitle = '') {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    // Find lines before horizontal separator or greeting
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (line.includes('HDJ Planning Manager') || line.includes('Paramétrage') || line.includes('Atelier') || line.includes('Compte Rendu')) {
        return line.replace(/^#+\s*/, '').trim();
      }
    }
    return fallbackTitle || (lines[0] || 'Meeting Minutes');
  }

  /* ================= Participants Extraction ================= */

  static extractParticipants(lines) {
    const participants = [];
    let inSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/^#*\s*Participants\b/i.test(line)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // If we reach the next header, break out
        if (/^#*\s*(Points\s+abord[ée]s|(?:Les\s+)?prochaines\s+[ée]tapes|Actions|Ordre\s+du\s+jour|Agenda|Minutes)/i.test(line)) {
          break;
        }

        // Parse bullet participant line
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

          // Detect organization
          const lowerRole = role.toLowerCase();
          if (lowerRole.includes('marienia') || lowerRole.includes('mariéna')) org = 'Mariéna';
          else if (lowerRole.includes('arbelles')) org = 'Les Arbelles';
          else if (lowerRole.includes('artefact') || lowerRole.includes('data analyst')) org = 'Artefact';
          else if (lowerRole.includes('clariane')) org = 'Clariane';

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

      if (/^#*\s*Points\s+abord[ée]s/i.test(trimmed)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // Stop if we hit Next steps or footer
        if (/^#*\s*((?:Les\s+)?prochaines\s+[ée]tapes|Actions|Next\s+Steps)/i.test(trimmed)) {
          break;
        }

        // Determine if line is a new topic header
        // Examples:
        // "Contexte et Approche du projet" (no bullet, or markdown header)
        // "* Vue Vacations et Visibilité :"
        // "* Processus d'Admission et flux "Annonce" :"
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

        // Otherwise it's a point inside current topic
        if (currentTopic) {
          const cleanPoint = trimmed.replace(/^[*\-•]\s*/, '').trim();
          if (cleanPoint) {
            currentTopic.points.push(cleanPoint);
          }
        } else if (trimmed) {
          // Fallback initial topic
          currentTopic = {
            title: 'Points Principaux',
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

  static extractActions(lines, contextDate = '') {
    const actions = [];
    let inSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/^#*\s*((?:Les\s+)?prochaines\s+[ée]tapes|Actions|Next\s+Steps)/i.test(line)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // Stop if hitting a new major header
        if (/^#+\s+[A-Z]/.test(line) && !line.includes('étape') && !line.includes('action')) {
          break;
        }

        if (/^[*\-•]/.test(line)) {
          const raw = line.replace(/^[*\-•]\s*/, '').trim();
          let owner = 'Équipe';
          let text = raw;
          let dueDate = '';

          // Look for "Owner : Action" or "Owner | Action"
          const colonMatch = raw.match(/^([A-Za-zÀ-ÿ0-9\s/]+)\s*[:|]\s*(.+)$/);
          if (colonMatch) {
            const potentialOwner = colonMatch[1].trim();
            const actionText = colonMatch[2].trim();

            if (potentialOwner.toLowerCase().includes('prochain point') || potentialOwner.toLowerCase().includes('suivi')) {
              owner = 'Équipe';
              text = `Prochain point de suivi : ${actionText}`;
              dueDate = actionText;
            } else {
              owner = potentialOwner;
              text = actionText;
            }
          }

          // Due date inference
          const lowerText = text.toLowerCase();
          if (lowerText.includes('mardi matin') || lowerText.includes('semaine prochaine')) {
            dueDate = 'Semaine prochaine';
          } else if (lowerText.includes('dans la semaine')) {
            dueDate = 'Cette semaine';
          } else if (lowerText.includes('dès que') || lowerText.includes('urgent')) {
            dueDate = 'Prioritaire';
          }

          // Identify workstream tag
          const tags = [];
          if (lowerText.includes('hm') || lowerText.includes('hôpital manager')) tags.push('hm-sync');
          if (lowerText.includes('foundry')) tags.push('foundry');
          if (lowerText.includes('vacation')) tags.push('vacations');
          if (lowerText.includes('annonce')) tags.push('annonces');
          if (lowerText.includes('modélis') || lowerText.includes('parcours')) tags.push('modeling');
          if (lowerText.includes('alerte') || lowerText.includes('alerting')) tags.push('alerting');
          if (lowerText.includes('case mix') || lowerText.includes('budget')) tags.push('analytics');

          // Infer owner organization
          let ownerOrg = 'Transversal';
          const lowerOwner = owner.toLowerCase();
          if (lowerOwner.includes('artefact') || lowerOwner.includes('ayrton') || lowerOwner.includes('benjamin')) {
            ownerOrg = 'Artefact';
          } else if (lowerOwner.includes('arbelles') || lowerOwner.includes('mariena') || lowerOwner.includes('mariéna') || lowerOwner.includes('claire') || lowerOwner.includes('fabien') || lowerOwner.includes('delphine') || lowerOwner.includes('clariane')) {
            ownerOrg = 'Client';
          }

          actions.push({
            id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            owner,
            ownerOrg,
            text,
            dueDate,
            tags,
            done: false,
            source: 'minutes'
          });
        }
      }
    }

    return actions;
  }

  /* ================= Decisions Extraction ================= */

  static extractDecisions(cleanText, topics = []) {
    const decisions = [];
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

    // Heuristic patterns for decisions in French meeting minutes
    const decisionTriggers = [
      { regex: /workflow\s+de\s+validation\s*:\s*(.+)/i, label: 'Workflow de Validation' },
      { regex: /la\s+solution\s+retenue\s+est\s+(.+)/i, label: 'Solution Retenue' },
      { regex: /politique\s+z[ée]ro\s+temps\s+mort\s*:\s*(.+)/i, label: 'Politique Zéro Temps Mort' },
      { regex: /il\s+a\s+[ée]t[ée]\s+propos[ée]\s+de\s+(.+)/i, label: 'Processus Validé' },
      { regex: /les\s+bilans\s+d'entr[ée]e\s+et\s+de\s+sortie\s+se\s+font\s+en\s+individuel/i, label: 'Règle Bilans' },
      { regex: /d[ée]monstration\s+de\s+la\s+fonctionnalit[ée]\s+permettant\s+de\s+"forcer"\s+un\s+placement/i, label: 'Règle Surbooking & Forçage' },
      { regex: /l'outil\s+a\s+[ée]t[ée]\s+adapt[ée]\s+avec\s+un\s+onglet\s+permettant\s+d'inclure\s+ou\s+d'exclure/i, label: 'Filtre Annonces / Pré-admissions' },
      { regex: /à\s+terme,\s+l'outil\s+pourrait\s+offrir\s+un\s+accès\s+en\s+lecture\s+seule/i, label: 'Visibilité Praticiens' }
    ];

    for (const line of lines) {
      for (const trigger of decisionTriggers) {
        if (trigger.regex.test(line)) {
          const match = line.match(trigger.regex);
          const statement = line.replace(/^[*\-•]\s*/, '').trim();
          decisions.push({
            id: `dec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            label: trigger.label,
            statement,
            context: MinutesEngine.findContextTopic(line, topics)
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
    return 'Général';
  }

  /* ================= Knowledge Extraction ================= */

  static extractKnowledge(text, facility = '') {
    const lower = text.toLowerCase();
    const tools = [];
    const concepts = [];
    const facilities = [];

    // Tools & Systems
    if (lower.includes('foundry')) tools.push({ name: 'Foundry (Palantir)', type: 'Data & Engine Platform' });
    if (lower.includes('hm') || lower.includes('hôpital manager')) tools.push({ name: 'Hôpital Manager (HM)', type: 'SIH / Dossier Patient' });
    if (lower.includes('rtms') || lower.includes('tdcs')) tools.push({ name: 'rTMS / tDCS', type: 'Protocole Thérapeutique' });
    if (lower.includes('balnéo') || lower.includes('balneo')) tools.push({ name: 'Balnéothérapie', type: 'Plateau Technique' });
    if (lower.includes('kiné') || lower.includes('kine')) tools.push({ name: 'Kinésithérapie', type: 'Soin Rééducation' });
    if (lower.includes('ergo')) tools.push({ name: 'Ergothérapie', type: 'Soin Rééducation' });

    // Concepts
    if (lower.includes('annonce')) concepts.push({ name: 'Flux Annonces', desc: 'Gestion des pré-admissions et patients potentiels dans HM vers Foundry' });
    if (lower.includes('zéro temps mort') || lower.includes('zero temps mort')) concepts.push({ name: 'Politique Zéro Temps Mort', desc: 'Optimisation continue sans temps d’attente inter-séances pour les patients' });
    if (lower.includes('case mix')) concepts.push({ name: 'Analytique Case Mix', desc: 'Répartition de l’activité Neuro vs Locomoteur pour le pilotage budgétaire' });
    if (lower.includes('surbooking') || lower.includes('forcer')) concepts.push({ name: 'Gestion Surbooking & Forçage', desc: 'Remplacement manuel et dépassement de capacité contrôlé' });
    if (lower.includes('vacation')) concepts.push({ name: 'Vue Vacations & Disponibilité', desc: 'Planification centralisée par salle, soignant et créneau' });

    // Facilities
    if (facility) facilities.push(facility);
    if (lower.includes('mariénia') || lower.includes('marienia')) facilities.push('Mariéna');
    if (lower.includes('arbelles')) facilities.push('Les Arbelles');
    if (lower.includes('glanum')) facilities.push('Glanum');

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
          dueDate: act.dueDate || '',
          done: false,
          tags: act.tags || [],
          source: 'minutes'
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
          context: dec.context,
          source: 'minutes'
        });
      }
    }

    return items;
  }
}
