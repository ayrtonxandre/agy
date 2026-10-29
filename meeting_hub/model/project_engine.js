/**
 * Project Base & Minutes Synthesis Engine
 * 
 * Aggregates meeting minutes, decisions, actions, and connected documents across
 * any configured project initiative.
 * 
 * Completely generic and driven by Project configuration:
 * - Honest coverage metrics ("X of Y meetings have minutes")
 * - Cross-meeting decision deduplication ("first decided on" & "restated on")
 * - Source quotes and meeting links on every action and decision
 * - Dynamic workstream synthesis with open action counts
 * - Stakeholder directory and connected document library
 */

import { MinutesEngine } from './minutes_engine.js';
import { ProjectModel, DEFAULT_CLARIANE_PROJECT } from './project.js';

export class ProjectEngine {
  /**
   * Builds the comprehensive Project Base for a given project ID or client name.
   * @param {string} projectIdOrClient e.g. 'clariane' or 'Clariane'
   * @param {object} store The MeetingHubStore instance
   * @returns {Promise<object>} Consolidated Project Base data
   */
  static async buildProjectBase(projectIdOrClient = 'clariane', store) {
    const allEvents = store.getAllEvents ? store.getAllEvents() : [];

    // 1. Resolve project configuration
    let project = null;
    if (store.getProject) {
      project = await store.getProject(projectIdOrClient);
    }
    if (!project && store.getAllProjects) {
      const allProjects = await store.getAllProjects();
      project = allProjects.find(p => 
        p.id.toLowerCase() === projectIdOrClient.toLowerCase() ||
        p.name.toLowerCase() === projectIdOrClient.toLowerCase() ||
        (Array.isArray(p.clientMatch) && p.clientMatch.some(m => m.toLowerCase() === projectIdOrClient.toLowerCase()))
      );
    }
    if (!project) {
      // Fallback to default Clariane if matching, else generic project
      if (projectIdOrClient.toLowerCase() === 'clariane') {
        project = DEFAULT_CLARIANE_PROJECT;
      } else {
        project = ProjectModel.createDefault(projectIdOrClient, [projectIdOrClient]);
      }
    }

    const clientMatches = (project.clientMatch || [project.name, project.id]).map(m => m.toLowerCase());

    // 2. Filter events belonging to this project
    const projectEvents = allEvents.filter(e => {
      if (store && typeof store.getProjectForMeeting === 'function') {
        const assignedProj = store.getProjectForMeeting(e);
        if (assignedProj) {
          return assignedProj.id === project.id;
        }
      }
      const client = (e.client || '').toLowerCase();
      const title = (e.title || '').toLowerCase();
      const tags = (e.tags || []).map(t => t.toLowerCase());

      return clientMatches.some(match => 
        client === match ||
        client.includes(match) ||
        title.includes(match) ||
        tags.includes(match)
      );
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    // 3. Collect meeting data for these events
    const meetingDataList = [];
    for (const evt of projectEvents) {
      const mData = await store.getMeetingData(evt.id);
      meetingDataList.push({
        event: evt,
        data: mData
      });
    }

    // 4. Compile Actions, Decisions, Stakeholders, Docs
    const actionMatrix = [];
    const rawDecisions = [];
    const stakeholderMap = new Map();
    const connectedDocs = [];
    const toolSet = new Set();
    const conceptSet = new Map();

    for (const item of meetingDataList) {
      const { event, data } = item;
      const rawMinutes = data.minutes || '';

      // Parse minutes if present
      let parsed = null;
      if (rawMinutes.trim()) {
        parsed = MinutesEngine.parseMinutes(rawMinutes, {
          title: event.title,
          date: event.date,
          facility: event.facility,
          meetingId: event.id
        }, project);
      }

      // Track attached Google Doc
      const docUrl = data.googleDocUrl || event.googleDocUrl || ProjectEngine.findDocUrl(event.description || '');
      if (docUrl) {
        const docIdMatch = docUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const docId = docIdMatch ? docIdMatch[1] : '';
        connectedDocs.push({
          id: docId || event.id,
          title: (parsed && parsed.title) || event.title,
          meetingId: event.id,
          meetingDate: event.date,
          facility: (parsed && parsed.facility) || event.facility || '',
          url: docUrl,
          hasMinutes: Boolean(rawMinutes.trim()),
          minutesLength: rawMinutes.length
        });
      }

      // Collect items from saved data.items first
      const savedItems = Array.isArray(data.items) ? data.items : [];
      
      const effectiveActions = savedItems.filter(i => i.kind === 'action').length > 0
        ? savedItems.filter(i => i.kind === 'action')
        : (parsed ? parsed.actions : []);

      const effectiveDecisions = savedItems.filter(i => i.kind === 'decision').length > 0
        ? savedItems.filter(i => i.kind === 'decision')
        : (parsed ? parsed.decisions : []);

      // Register actions with source quote and meeting link
      for (const act of effectiveActions) {
        const owner = act.owner || 'Team';
        const ownerOrg = act.ownerOrg || ProjectEngine.classifyOwnerOrg(owner, project);
        const quote = act.quote || act.text || '';
        const meetingLink = act.meetingLink || `#/meeting/${encodeURIComponent(event.id)}`;

        actionMatrix.push({
          id: act.id || `act-${Math.random().toString(36).substr(2, 6)}`,
          meetingId: event.id,
          meetingTitle: event.title,
          meetingDate: event.date,
          facility: (parsed && parsed.facility) || event.facility || '',
          owner,
          ownerOrg,
          text: act.text || act.title || '',
          dueDate: act.dueDate || '',
          done: Boolean(act.done),
          tags: act.tags || [],
          source: act.source || 'minutes',
          quote,
          meetingLink
        });
      }

      // Collect raw decisions for deduplication
      for (const dec of effectiveDecisions) {
        const statement = (dec.statement || dec.text || '').replace(/^\[.*?\]\s*/, '').trim();
        const label = dec.label || ProjectEngine.deriveDecisionLabel(statement, project);
        const quote = dec.quote || statement;
        const meetingLink = dec.meetingLink || `#/meeting/${encodeURIComponent(event.id)}`;

        rawDecisions.push({
          id: dec.id || `dec-${Math.random().toString(36).substr(2, 6)}`,
          meetingId: event.id,
          meetingTitle: event.title,
          meetingDate: event.date,
          facility: (parsed && parsed.facility) || event.facility || '',
          label,
          statement,
          context: dec.context || 'General',
          quote,
          meetingLink
        });
      }

      // Register stakeholders
      if (parsed && Array.isArray(parsed.participants) && parsed.participants.length > 0) {
        for (const p of parsed.participants) {
          if (!p.name) continue;
          const key = p.name.toLowerCase();
          if (!stakeholderMap.has(key)) {
            stakeholderMap.set(key, {
              name: p.name,
              role: p.role || 'Participant',
              org: p.org || ProjectEngine.classifyOwnerOrg(p.role || p.name, project),
              meetingCount: 1,
              lastSeen: event.date
            });
          } else {
            const existing = stakeholderMap.get(key);
            existing.meetingCount += 1;
            if (event.date > existing.lastSeen) existing.lastSeen = event.date;
          }
        }
      } else if (Array.isArray(event.attendees)) {
        for (const att of event.attendees) {
          if (!att) continue;
          const key = att.toLowerCase();
          if (!stakeholderMap.has(key)) {
            stakeholderMap.set(key, {
              name: att,
              role: 'Attendee',
              org: ProjectEngine.classifyOwnerOrg(att, project),
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

    // 5. Deduplicate decisions across meetings
    const decisionRegister = ProjectEngine.deduplicateDecisions(rawDecisions);

    // 6. Action matrix sorting
    actionMatrix.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (b.meetingDate || '').localeCompare(a.meetingDate || '');
    });

    // 7. Stakeholders sorting
    const stakeholders = Array.from(stakeholderMap.values()).sort((a, b) => {
      if (a.org !== b.org) return a.org.localeCompare(b.org);
      return a.name.localeCompare(b.name);
    });

    // 8. Workstreams compilation from project configuration
    const workstreams = ProjectEngine.synthesizeWorkstreams(project, decisionRegister, actionMatrix);

    // 9. Honest coverage calculation
    const totalMeetings = projectEvents.length;
    const meetingsWithMinutes = meetingDataList.filter(m => (m.data.minutes || '').trim().length > 0).length;
    const coveragePercent = totalMeetings > 0 ? Math.round((meetingsWithMinutes / totalMeetings) * 100) : 0;
    const coverageText = `${meetingsWithMinutes} of ${totalMeetings} meetings have minutes`;

    // Action counts breakdown
    const openActions = actionMatrix.filter(a => !a.done);
    const closedActions = actionMatrix.filter(a => a.done);
    const artefactActions = openActions.filter(a => a.ownerOrg.toLowerCase().includes('artefact'));
    const clientActions = openActions.filter(a => !a.ownerOrg.toLowerCase().includes('artefact'));

    return {
      projectId: project.id,
      projectName: project.name,
      projectConfig: project,
      totalMeetings,
      meetingsWithMinutes,
      coveragePercent,
      coverageText,
      actionStats: {
        total: actionMatrix.length,
        open: openActions.length,
        closed: closedActions.length,
        artefactOpen: artefactActions.length,
        clientOpen: clientActions.length
      },
      decisionStats: {
        total: decisionRegister.length,
        uniqueCount: decisionRegister.length,
        rawCount: rawDecisions.length
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

  /**
   * Deduplicates decisions across meetings.
   * Tracks "first decided on" and "restated on" instances.
   */
  static deduplicateDecisions(rawDecisions) {
    if (!Array.isArray(rawDecisions) || rawDecisions.length === 0) return [];

    // Sort chronologically ascending to establish initial decision first
    const sorted = [...rawDecisions].sort((a, b) => (a.meetingDate || '').localeCompare(b.meetingDate || ''));

    const deduplicated = [];

    for (const dec of sorted) {
      const normText = ProjectEngine._normalizeStatement(dec.statement);

      // Check for existing matching decision
      const match = deduplicated.find(existing => {
        const existingNorm = ProjectEngine._normalizeStatement(existing.statement);
        if (normText === existingNorm) return true;
        // Check for matching label and high text similarity
        if (existing.label && dec.label && existing.label.toLowerCase() === dec.label.toLowerCase()) {
          const overlap = ProjectEngine._calculateSimilarity(normText, existingNorm);
          if (overlap >= 0.70) return true;
        }
        return false;
      });

      if (match) {
        // Record as restated
        match.restatedOn.push({
          meetingId: dec.meetingId,
          meetingTitle: dec.meetingTitle,
          meetingDate: dec.meetingDate,
          facility: dec.facility,
          quote: dec.quote,
          meetingLink: dec.meetingLink
        });
        match.restatedCount = match.restatedOn.length;
      } else {
        // New canonical decision
        deduplicated.push({
          id: dec.id,
          label: dec.label,
          statement: dec.statement,
          context: dec.context,
          quote: dec.quote,
          meetingLink: dec.meetingLink,
          firstDecidedOn: {
            meetingId: dec.meetingId,
            meetingTitle: dec.meetingTitle,
            meetingDate: dec.meetingDate,
            facility: dec.facility,
            quote: dec.quote,
            meetingLink: dec.meetingLink
          },
          restatedOn: [],
          restatedCount: 0
        });
      }
    }

    // Sort final decision register latest first
    return deduplicated.sort((a, b) => 
      (b.firstDecidedOn.meetingDate || '').localeCompare(a.firstDecidedOn.meetingDate || '')
    );
  }

  static _normalizeStatement(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static _calculateSimilarity(s1, s2) {
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 1;
    const words1 = new Set(s1.split(' '));
    const words2 = new Set(s2.split(' '));
    let intersection = 0;
    for (const w of words1) {
      if (words2.has(w)) intersection++;
    }
    return (2.0 * intersection) / (words1.size + words2.size);
  }

  /**
   * Synthesizes workstreams from project configuration.
   */
  static synthesizeWorkstreams(project, decisions, actions) {
    const configured = project.workstreams || [];
    if (configured.length > 0) {
      return configured.map(ws => {
        const wsTags = (ws.tags || []).map(t => t.toLowerCase());
        const openActionsCount = actions.filter(a => {
          if (a.done) return false;
          if (wsTags.length > 0 && Array.isArray(a.tags) && a.tags.some(t => wsTags.includes(t.toLowerCase()))) {
            return true;
          }
          const lowerText = (a.text || '').toLowerCase();
          return wsTags.some(t => lowerText.includes(t));
        }).length;

        return {
          ...ws,
          openActionsCount
        };
      });
    }

    // Default generic workstream if none configured
    return [
      {
        id: 'ws-core',
        title: 'Core Delivery & Synchronization',
        badge: 'General',
        status: 'Active',
        summary: `Progress tracking and action execution for ${project.name}.`,
        facilities: ['All'],
        openActionsCount: actions.filter(a => !a.done).length,
        keyRules: ['Document all decisions in minutes', 'Track action items to completion']
      }
    ];
  }

  static findDocUrl(text) {
    if (!text) return '';
    const match = text.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
    return match ? match[0] : '';
  }

  static classifyOwnerOrg(owner = '', project = null) {
    const lower = (owner || '').toLowerCase();
    const rules = project?.parserHints?.ownerOrgRules || [];
    for (const rule of rules) {
      if (rule.keywords && rule.keywords.some(k => lower.includes(k.toLowerCase()))) {
        return rule.org;
      }
    }
    if (lower.includes('artefact')) return 'Artefact';
    return 'Client / Team';
  }

  static deriveDecisionLabel(statement = '', project = null) {
    const lower = (statement || '').toLowerCase();
    const triggers = project?.parserHints?.decisionTriggers || [];
    for (const tr of triggers) {
      try {
        if (new RegExp(tr.pattern, 'i').test(statement)) {
          return tr.label;
        }
      } catch (e) {}
    }
    return 'Decision';
  }
}
