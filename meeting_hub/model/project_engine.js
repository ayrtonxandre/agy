/**
 * Project Base & Minutes Synthesis Engine
 * 
 * Aggregates meeting minutes, decisions, actions, and connected documents across
 * a client or project initiative (e.g. Clariane HDJ Planning Manager).
 * 
 * Provides:
 * - Cumulative Decision Register
 * - Cross-Meeting Action Matrix (filtered by Owner & Status)
 * - Stakeholder Directory across facilities & teams
 * - Living Executive Context & Active Workstreams
 * - Connected Docs & Artifacts Library
 */

import { MinutesEngine } from './minutes_engine.js';

export class ProjectEngine {
  /**
   * Builds the comprehensive Project Base for a given client / project.
   * @param {string} clientId e.g. 'Clariane'
   * @param {object} store The MeetingHubStore instance
   * @returns {Promise<object>} Consolidated Project Base data
   */
  static async buildProjectBase(clientId = 'Clariane', store) {
    const allEvents = store.getAllEvents ? store.getAllEvents() : [];
    
    // Filter events for this client or project
    const projectEvents = allEvents.filter(e => {
      const matchClient = (e.client || '').toLowerCase() === clientId.toLowerCase();
      const matchTitle = (e.title || '').toLowerCase().includes(clientId.toLowerCase());
      const matchTags = Array.isArray(e.tags) && e.tags.some(t => t.toLowerCase() === clientId.toLowerCase() || t === 'hdj');
      return matchClient || matchTitle || matchTags;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    // Collect all meeting_data for these events
    const meetingDataList = [];
    for (const evt of projectEvents) {
      const mData = await store.getMeetingData(evt.id);
      meetingDataList.push({
        event: evt,
        data: mData
      });
    }

    // 1. Compile Actions Matrix
    const actionMatrix = [];
    // 2. Compile Decision Register
    const decisionRegister = [];
    // 3. Compile Stakeholders
    const stakeholderMap = new Map();
    // 4. Compile Connected Docs
    const connectedDocs = [];
    // 5. Compile Knowledge Entities
    const toolSet = new Set();
    const conceptSet = new Map();

    for (const item of meetingDataList) {
      const { event, data } = item;
      const rawMinutes = data.minutes || '';

      // Parse minutes if present or extract from items
      let parsed = null;
      if (rawMinutes.trim()) {
        parsed = MinutesEngine.parseMinutes(rawMinutes, {
          title: event.title,
          date: event.date,
          facility: event.facility
        });
      }

      // Check for attached Google Doc in event or data
      const docUrl = data.googleDocUrl || event.googleDocUrl || ProjectEngine.findDocUrl(event.description || '');
      if (docUrl) {
        const docIdMatch = docUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const docId = docIdMatch ? docIdMatch[1] : '';
        connectedDocs.push({
          id: docId || event.id,
          title: (parsed && parsed.title) || event.title,
          meetingId: event.id,
          meetingDate: event.date,
          facility: (parsed && parsed.facility) || event.facility || ProjectEngine.detectFacility(event.title),
          url: docUrl,
          hasMinutes: Boolean(rawMinutes.trim()),
          minutesLength: rawMinutes.length
        });
      }

      // Collect items (actions & decisions) from saved data.items first
      const savedItems = Array.isArray(data.items) ? data.items : [];
      
      // If no saved items but parsed minutes exist, synthesize them for the matrix
      const effectiveActions = savedItems.filter(i => i.kind === 'action').length > 0
        ? savedItems.filter(i => i.kind === 'action')
        : (parsed ? parsed.actions : []);

      const effectiveDecisions = savedItems.filter(i => i.kind === 'decision').length > 0
        ? savedItems.filter(i => i.kind === 'decision')
        : (parsed ? parsed.decisions : []);

      // Register actions
      for (const act of effectiveActions) {
        const owner = act.owner || 'Équipe';
        const ownerOrg = ProjectEngine.classifyOwnerOrg(owner);
        actionMatrix.push({
          id: act.id || `act-${Math.random().toString(36).substr(2, 6)}`,
          meetingId: event.id,
          meetingTitle: event.title,
          meetingDate: event.date,
          facility: (parsed && parsed.facility) || ProjectEngine.detectFacility(event.title),
          owner,
          ownerOrg,
          text: act.text || act.title || '',
          dueDate: act.dueDate || '',
          done: Boolean(act.done),
          tags: act.tags || [],
          source: act.source || 'meeting'
        });
      }

      // Register decisions
      for (const dec of effectiveDecisions) {
        const statement = dec.statement || dec.text || '';
        const label = dec.label || ProjectEngine.deriveDecisionLabel(statement);
        decisionRegister.push({
          id: dec.id || `dec-${Math.random().toString(36).substr(2, 6)}`,
          meetingId: event.id,
          meetingTitle: event.title,
          meetingDate: event.date,
          facility: (parsed && parsed.facility) || ProjectEngine.detectFacility(event.title),
          label,
          statement: statement.replace(/^\[.*?\]\s*/, ''),
          context: dec.context || 'Général'
        });
      }

      // Register stakeholders from parsed participants or event attendees
      if (parsed && Array.isArray(parsed.participants)) {
        for (const p of parsed.participants) {
          if (!p.name) continue;
          const key = p.name.toLowerCase();
          if (!stakeholderMap.has(key)) {
            stakeholderMap.set(key, {
              name: p.name,
              role: p.role || 'Participant',
              org: p.org || ProjectEngine.classifyOwnerOrg(p.role || p.name),
              meetingCount: 1,
              lastSeen: event.date
            });
          } else {
            const existing = stakeholderMap.get(key);
            existing.meetingCount += 1;
            if (event.date > existing.lastSeen) existing.lastSeen = event.date;
          }
        }
      }

      // Register knowledge entities
      if (parsed && parsed.knowledge) {
        (parsed.knowledge.tools || []).forEach(t => toolSet.add(t.name));
        (parsed.knowledge.concepts || []).forEach(c => {
          if (!conceptSet.has(c.name)) conceptSet.set(c.name, c.desc);
        });
      }
    }

    // Sort decision register chronologically (latest first)
    decisionRegister.sort((a, b) => (b.meetingDate || '').localeCompare(a.meetingDate || ''));

    // Sort action matrix: open first, then date
    actionMatrix.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (b.meetingDate || '').localeCompare(a.meetingDate || '');
    });

    // Stakeholders list sorted by organization and name
    const stakeholders = Array.from(stakeholderMap.values()).sort((a, b) => {
      if (a.org !== b.org) return a.org.localeCompare(b.org);
      return a.name.localeCompare(b.name);
    });

    // Action counts breakdown
    const openActions = actionMatrix.filter(a => !a.done);
    const closedActions = actionMatrix.filter(a => a.done);
    const artefactActions = openActions.filter(a => a.ownerOrg === 'Artefact');
    const clientActions = openActions.filter(a => a.ownerOrg !== 'Artefact');

    // Strategic Workstreams Synthesis for Clariane / Project
    const workstreams = ProjectEngine.generateWorkstreams(clientId, decisionRegister, actionMatrix);

    return {
      clientId,
      projectName: clientId === 'Clariane' ? 'HDJ Planning Manager (Inicea / Clariane)' : `${clientId} Project Base`,
      totalMeetings: projectEvents.length,
      meetingsWithMinutes: meetingDataList.filter(m => (m.data.minutes || '').trim()).length,
      actionStats: {
        total: actionMatrix.length,
        open: openActions.length,
        closed: closedActions.length,
        artefactOpen: artefactActions.length,
        clientOpen: clientActions.length
      },
      decisionStats: {
        total: decisionRegister.length
      },
      workstreams,
      actionMatrix,
      decisionRegister,
      stakeholders,
      connectedDocs,
      tools: Array.from(toolSet),
      concepts: Array.from(conceptSet.entries()).map(([name, desc]) => ({ name, desc })),
      lastUpdated: new Date().toISOString()
    };
  }

  /* ================= Helper Utilities ================= */

  static findDocUrl(text) {
    if (!text) return '';
    const match = text.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
    return match ? match[0] : '';
  }

  static detectFacility(title = '') {
    const lower = title.toLowerCase();
    if (lower.includes('mariénia') || lower.includes('marienia')) return 'Mariéna';
    if (lower.includes('arbelles')) return 'Les Arbelles';
    if (lower.includes('glanum')) return 'Glanum';
    return 'Transversal';
  }

  static classifyOwnerOrg(owner = '') {
    const lower = owner.toLowerCase();
    if (lower.includes('artefact') || lower.includes('ayrton') || lower.includes('benjamin')) return 'Artefact';
    if (lower.includes('mariénia') || lower.includes('marienia') || lower.includes('claire')) return 'Mariéna';
    if (lower.includes('arbelles') || lower.includes('fabien') || lower.includes('delphine')) return 'Les Arbelles';
    if (lower.includes('glanum')) return 'Glanum';
    return 'Client / Équipe';
  }

  static deriveDecisionLabel(statement = '') {
    const lower = statement.toLowerCase();
    if (lower.includes('workflow') || lower.includes('validation')) return 'Workflow de Validation';
    if (lower.includes('temps mort')) return 'Politique Zéro Temps Mort';
    if (lower.includes('annonce')) return 'Processus Annonces HM';
    if (lower.includes('bilan')) return 'Règle Bilans';
    if (lower.includes('surbooking') || lower.includes('forcer')) return 'Surbooking & Forçage';
    if (lower.includes('solution')) return 'Solution Retenue';
    return 'Décision Structurante';
  }

  static generateWorkstreams(clientId, decisions, actions) {
    if (clientId.toLowerCase() === 'clariane') {
      return [
        {
          id: 'ws-admission',
          title: 'Flux Annonces & Processus d’Admission',
          badge: 'HM → Foundry',
          status: 'En déploiement',
          summary: 'Basculement de la gestion des listes d’attente papier vers le statut "Annonce" dans Hôpital Manager dès accord médical pour alimenter la disponibilité Foundry.',
          facilities: ['Les Arbelles', 'Mariéna'],
          openActionsCount: actions.filter(a => a.tags.includes('annonces') && !a.done).length,
          keyRules: [
            'Saisie directe des patients au statut Annonce dans HM pour remonter dans Foundry',
            'Onglet dédié dans l’outil pour filtrer et isoler les annonces HDJ vs HC'
          ]
        },
        {
          id: 'ws-parcours',
          title: 'Modélisation des Programmes Thérapeutiques',
          badge: 'Moteur & Contraintes',
          status: 'Actif',
          summary: 'Paramétrage des programmes standardisés (Dos, Parkinson) et parcours complexes (Neuro, rTMS aux 3 semaines, séances ponctuelles de Diététique/Neuropsy).',
          facilities: ['Les Arbelles', 'Mariéna', 'Glanum'],
          openActionsCount: actions.filter(a => a.tags.includes('modeling') && !a.done).length,
          keyRules: [
            'Politique zéro temps mort : aucun trou inter-séance sans attente',
            'Bilans d’entrée et de sortie isolés en séances individuelles',
            'Séances espacées (rTMS) modélisées avec des vacations dédiées à fréquence 3 semaines'
          ]
        },
        {
          id: 'ws-sync',
          title: 'Synchronisation SIH & Circuit de Validation',
          badge: 'Foundry ↔ HM',
          status: 'En cours',
          summary: 'Boucle de validation bilatérale : proposition de circuit dans Foundry -> statut "En attente HM" -> saisie créneau HM -> rapprochement automatique en statut "Réel".',
          facilities: ['Transversal'],
          openActionsCount: actions.filter(a => (a.tags.includes('hm-sync') || a.tags.includes('vacations')) && !a.done).length,
          keyRules: [
            'Circuit Foundry passe en "En attente HM" puis réconciliation en "Réel"',
            'Résolution du connecteur pour la remontée des vacations collectives (Kiné, Balnéo, Ergo)'
          ]
        },
        {
          id: 'ws-analytics',
          title: 'Analytique, Alerting & Case Mix',
          badge: 'Reporting & Pilotage',
          status: 'Planifié',
          summary: 'Extraction du case mix réel (% Neuro vs Locomoteur) pour la construction budgétaire et développement du module d’alerting pour double positionnement de patient.',
          facilities: ['Les Arbelles', 'Mariéna'],
          openActionsCount: actions.filter(a => (a.tags.includes('analytics') || a.tags.includes('alerting')) && !a.done).length,
          keyRules: [
            'Indicateur budgétaire case mix (tarifs de journée différenciés par segment)',
            'Alerte automatique si un patient est positionné simultanément sur deux vacations'
          ]
        }
      ];
    }

    // Default generic workstreams
    return [
      {
        id: 'ws-core',
        title: 'Core Delivery & Synchronization',
        badge: 'Transversal',
        status: 'Actif',
        summary: `Suivi d’avancement et exécution des actions pour ${clientId}.`,
        facilities: ['Global'],
        openActionsCount: actions.filter(a => !a.done).length,
        keyRules: ['Exécution des engagements bilatéraux', 'Documentation systématique des décisions']
      }
    ];
  }
}
