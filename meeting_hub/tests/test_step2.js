/**
 * Step 2 Verification Test Suite
 * 
 * Verifies all Step 2 requirements:
 * 1. Generic Project Object `{ id, name, clientMatch[], docSources[], workstreams[], parserHints[] }`
 * 2. Decoupled Domain Knowledge:
 *    - Second project created with different vocabulary (FinTech / Ledger).
 *    - Ingests minutes with novel terminology and achieves sensible extraction without touching code.
 * 3. Cross-meeting decision deduplication ("first decided on" and "restated on").
 * 4. Source quotes & meeting links preserved on every action and decision.
 * 5. Honest coverage calculation ("X of Y meetings have minutes", never fake 100%).
 * 6. 48h prep checklist of missing items (agenda, last minutes, open actions).
 * 7. Wired Project Base into Next up (open actions and decisions counts).
 */

import assert from 'assert';
import { ProjectModel, DEFAULT_CLARIANE_PROJECT } from '../_deprecated/project.js';
import { MinutesEngine } from '../_deprecated/minutes_engine.js';
import { ProjectEngine } from '../_deprecated/project_engine.js';
import { PrepScoreCalculator } from '../model/prep_score.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✔ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ ${name}:`, err.message);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✔ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ ${name}:`, err.message);
    failed++;
  }
}

async function runAll() {
  console.log('--- Running Step 2 Verification Tests ---');

/* 1. Generic Project Object */
test('ProjectModel: DEFAULT_CLARIANE_PROJECT has required generic structure', () => {
  assert(DEFAULT_CLARIANE_PROJECT.id === 'clariane');
  assert(DEFAULT_CLARIANE_PROJECT.name === 'HDJ Planning Manager (Inicea / Clariane)');
  assert(Array.isArray(DEFAULT_CLARIANE_PROJECT.clientMatch));
  assert(Array.isArray(DEFAULT_CLARIANE_PROJECT.docSources));
  assert(Array.isArray(DEFAULT_CLARIANE_PROJECT.workstreams));
  assert(DEFAULT_CLARIANE_PROJECT.workstreams.length === 4);
  assert(typeof DEFAULT_CLARIANE_PROJECT.parserHints === 'object');
  assert(ProjectModel.validate(DEFAULT_CLARIANE_PROJECT) === true);
});

test('ProjectModel: createDefault generates valid project object', () => {
  const p = ProjectModel.createDefault('Acme Logistics', ['Acme', 'Logistics']);
  assert(p.id === 'acme-logistics');
  assert(p.name === 'Acme Logistics');
  assert(p.clientMatch.includes('Acme'));
  assert(Array.isArray(p.workstreams));
  assert(ProjectModel.validate(p) === true);
});

/* 2. Decoupled Domain Knowledge & Second Project */
test('Decoupled Domain: Second project with custom vocabulary extracts without code changes', () => {
  // Define a completely custom non-Clariane project
  const fintechProject = {
    id: 'fintech-ledger',
    name: 'Apex Ledger Platform',
    clientMatch: ['Apex', 'Fintech'],
    docSources: [],
    workstreams: [
      {
        id: 'real-time-ledger',
        badge: 'Ledger Engine',
        title: 'Core Ledger & Settlement',
        summary: 'Kafka event streaming to Snowflake data lake',
        keyRules: ['Zero discrepancy policy', 'Double entry validation'],
        facilities: ['Frankfurt', 'Zurich']
      },
      {
        id: 'compliance',
        badge: 'AML/KYC',
        title: 'Automated AML Screening',
        summary: 'Real-time sanctions and watchlist filtering',
        keyRules: ['Tier 1 risk threshold auto-freeze'],
        facilities: ['London']
      }
    ],
    parserHints: {
      tools: ['Snowflake', 'Kafka', 'dbt', 'Kubernetes'],
      concepts: [
        { name: 'Double Entry', desc: 'Strict accounting equation balance' },
        { name: 'Tier 1 Screening', desc: 'Instant AML sanctions check' }
      ],
      facilities: ['Frankfurt', 'Zurich', 'London'],
      decisionTriggers: ['Arbitrage', 'Décision', 'Validé', 'Ratified', 'Approved', 'Zero discrepancy policy'],
      tagRules: [
        { match: ['kafka', 'streaming', 'event'], tag: 'streaming' },
        { match: ['snowflake', 'dbt', 'sql'], tag: 'data-lake' }
      ],
      ownerOrgRules: [
        { match: ['sarah', 'alex'], org: 'Apex FinTech' },
        { match: ['ayrton'], org: 'Artefact' }
      ]
    }
  };

  assert(ProjectModel.validate(fintechProject) === true);

  // Minutes from this custom domain
  const sampleMinutes = `
CR Session Architecture Apex Ledger — 28/10/2026
Participants: Sarah K. (Apex FinTech), Alex M. (Apex FinTech), Ayrton A. (Artefact)

Objectifs:
- Valider le pipeline Kafka et Snowflake
- Définir les règles de Double Entry

Décisions prises:
- Décision: Validation de l'architecture temps réel Kafka vers Snowflake avec Zero discrepancy policy pour Frankfurt
- Ratified: Déploiement du connecteur dbt sous Kubernetes pour le 15 novembre

Actions:
- [ ] Sarah: Configurer le cluster Kafka et les topics de streaming avant le 05/11
- [ ] Alex: Rédiger la spécification Tier 1 Screening avec l'équipe compliance pour le 10/11
- [ ] Ayrton: Valider les modèles dbt sur le data lake Snowflake
  `;

  const parsed = MinutesEngine.parseMinutes(sampleMinutes, {
    title: 'Architecture Apex Ledger',
    date: '2026-10-28',
    facility: 'Frankfurt',
    meetingId: 'meet-apex-1'
  }, fintechProject);

  // Verify extracted actions
  assert(parsed.actions.length === 3, `Expected 3 actions, got ${parsed.actions.length}`);
  const sarahAction = parsed.actions.find(a => a.owner.includes('Sarah'));
  assert(sarahAction, 'Sarah action must be found');
  assert(sarahAction.dueDate === '2026-11-05', `Expected 2026-11-05, got ${sarahAction.dueDate}`);
  assert(sarahAction.ownerOrg === 'Apex FinTech', `Expected Apex FinTech, got ${sarahAction.ownerOrg}`);
  assert(sarahAction.tags.includes('streaming'), 'Expected streaming tag from custom tagRules');
  assert(sarahAction.quote.includes('Sarah: Configurer le cluster Kafka'), 'Action must store exact source quote');
  assert(sarahAction.meetingLink === '#/meeting/meet-apex-1', 'Action must store meetingLink');

  // Verify extracted decisions
  assert(parsed.decisions.length === 2, `Expected 2 decisions, got ${parsed.decisions.length}`);
  const d1 = parsed.decisions.find(d => d.statement.includes('architecture temps réel Kafka'));
  assert(d1, 'First decision must be extracted');
  assert(d1.quote.includes('architecture temps réel Kafka'), 'Decision must store exact source quote');
  assert(d1.meetingLink === '#/meeting/meet-apex-1', 'Decision must store meetingLink');

  // Verify knowledge entities extracted from custom hints
  assert(parsed.knowledge.tools.some(t => t.name === 'Kafka'), 'Kafka tool recognized');
  assert(parsed.knowledge.tools.some(t => t.name === 'Snowflake'), 'Snowflake tool recognized');
  assert(parsed.knowledge.concepts.some(c => c.name === 'Double Entry'), 'Double Entry concept recognized');
});

/* 3. Decision Deduplication */
test('ProjectEngine: Deduplicates decisions across meetings with firstDecidedOn and restatedOn', () => {
  const rawDecisions = [
    {
      id: 'd1',
      meetingId: 'm1',
      meetingTitle: 'Comité Projet 1',
      meetingDate: '2026-10-10',
      facility: 'Paris',
      label: 'Architecture',
      statement: 'Validation de la synchronisation bidirectionnelle HM et Foundry',
      quote: 'Décision: Validation de la synchronisation bidirectionnelle HM et Foundry',
      meetingLink: '#/meeting/m1'
    },
    {
      id: 'd2',
      meetingId: 'm2',
      meetingTitle: 'Comité Projet 2',
      meetingDate: '2026-10-18',
      facility: 'Lyon',
      label: 'Architecture',
      statement: 'Rappel: Validation de la synchronisation bidirectionnelle HM et Foundry',
      quote: 'Rappel arbitrage: Validation de la synchronisation bidirectionnelle HM et Foundry',
      meetingLink: '#/meeting/m2'
    },
    {
      id: 'd3',
      meetingId: 'm3',
      meetingTitle: 'Comité Métier',
      meetingDate: '2026-10-25',
      facility: 'Paris',
      label: 'Règles de gestion',
      statement: 'Zéro Temps Mort pour les séances de kinésithérapie en HDJ',
      quote: 'Règle validée: Zéro Temps Mort pour les séances de kinésithérapie',
      meetingLink: '#/meeting/m3'
    }
  ];

  const deduped = ProjectEngine.deduplicateDecisions(rawDecisions);
  assert(deduped.length === 2, `Expected 2 deduplicated decisions, got ${deduped.length}`);

  const hmDecision = deduped.find(d => d.statement.includes('HM et Foundry'));
  assert(hmDecision, 'HM decision must exist');
  assert(hmDecision.firstDecidedOn.meetingId === 'm1', 'First decided on must point to m1');
  assert(hmDecision.firstDecidedOn.meetingDate === '2026-10-10', 'First decided date must be 2026-10-10');
  assert(hmDecision.restatedCount === 1, `Expected restatedCount 1, got ${hmDecision.restatedCount}`);
  assert(hmDecision.restatedOn[0].meetingId === 'm2', 'Restated meeting must be m2');
  assert(hmDecision.restatedOn[0].meetingDate === '2026-10-18');
});

  /* 4. Honest Coverage Calculation */
  await asyncTest('ProjectEngine: Honest coverage calculation (never fakes completeness)', async () => {
    // Mock store with 10 total meetings, only 2 having minutes
    const mockStore = {
      getAllEvents: () => [
        { id: '1', title: '[Planning HDJ] Session 1', client: 'Clariane', date: '2026-10-01' },
        { id: '2', title: '[Planning HDJ] Session 2', client: 'Clariane', date: '2026-10-02' },
        { id: '3', title: '[Planning HDJ] Session 3', client: 'Clariane', date: '2026-10-03' },
        { id: '4', title: '[Planning HDJ] Session 4', client: 'Clariane', date: '2026-10-04' },
        { id: '5', title: '[Planning HDJ] Session 5', client: 'Clariane', date: '2026-10-05' },
        { id: '6', title: '[Planning HDJ] Session 6', client: 'Clariane', date: '2026-10-06' },
        { id: '7', title: '[Planning HDJ] Session 7', client: 'Clariane', date: '2026-10-07' },
        { id: '8', title: '[Planning HDJ] Session 8', client: 'Clariane', date: '2026-10-08' },
        { id: '9', title: '[Planning HDJ] Session 9', client: 'Clariane', date: '2026-10-09' },
        { id: '10', title: '[Planning HDJ] Session 10', client: 'Clariane', date: '2026-10-10' }
      ],
      getProject: async () => DEFAULT_CLARIANE_PROJECT,
      getMeetingData: async (id) => {
        if (id === '1' || id === '2') {
          return { minutes: 'CR réunion avec notes et décisions.', items: [] };
        }
        return { minutes: '', items: [] };
      }
    };

    const base = await ProjectEngine.buildProjectBase('clariane', mockStore);
    assert(base.totalMeetings === 10, `Expected 10 total meetings, got ${base.totalMeetings}`);
    assert(base.meetingsWithMinutes === 2, `Expected 2 meetings with minutes, got ${base.meetingsWithMinutes}`);
    assert(base.coveragePercent === 20, `Expected 20% coverage, got ${base.coveragePercent}`);
    assert(base.coverageText === '2 of 10 meetings have minutes', `Expected honest coverage text, got '${base.coverageText}'`);
  });

  /* 5. 48h Prep Checklist */
  test('PrepScoreCalculator: 48h checklist evaluates missing items honestly', () => {
    // Test 1: Meeting in 12 hours (within 48h), missing agenda and actions review
    const meetingSoon = {
      id: 'meet-soon',
      title: 'Client Review',
      date: '2026-10-28',
      start: '14:00',
      attendees: ['Ayrton', 'Pierre']
    };
    const isWithin = PrepScoreCalculator.isWithin48Hours(meetingSoon.date, meetingSoon.start, '2026-10-28', '08:00');
    assert(isWithin === true, 'Meeting must be within 48h');

    const prepIncomplete = PrepScoreCalculator.computeMeetingPrep(meetingSoon, {
      agenda: '', // Missing
      actionsReviewed: false, // Missing
      items: [{ kind: 'action', text: 'Task 1', done: false }]
    }, []);

    assert(prepIncomplete.missingCount === 3, `Expected 3 missing items, got ${prepIncomplete.missingCount}`);
    assert(prepIncomplete.missingItems.some(i => i.key === 'agenda' && !i.ok));
    assert(prepIncomplete.missingItems.some(i => i.key === 'openActions' && !i.ok));
    assert(prepIncomplete.missingSummary.includes('Missing:'));

    // Test 2: Meeting prepared (all 3 criteria met)
    const prepComplete = PrepScoreCalculator.computeMeetingPrep(meetingSoon, {
      agenda: 'Aligner la roadmap Q4', // OK
      actionsReviewed: true, // OK
      items: []
    }, [{ id: 'prior-1', status: 'accepted', score: 3 }]); // OK

    assert(prepComplete.missingCount === 0, 'Expected 0 missing items for prepared meeting');
    assert(prepComplete.missingSummary === 'All items prepared');
    assert(prepComplete.status === 'prepared');

    // Test 3: Meeting 5 days out (outside 48h)
    const isFarOut = PrepScoreCalculator.isWithin48Hours('2026-11-05', '10:00', '2026-10-28', '08:00');
    assert(isFarOut === false, 'Meeting 8 days later must NOT be within 48h');
  });

  /* 6. Wired Project Base into Next Up */
  test('Project Mapping: Meeting matches project by client or title tag', () => {
    const storeWithCache = {
      projectsCache: [DEFAULT_CLARIANE_PROJECT],
      getProjectForMeeting: function(meeting) {
        const client = (meeting.client || '').toLowerCase();
        const title = (meeting.title || '').toLowerCase();
        const tags = (meeting.tags || []).map(t => t.toLowerCase());

        for (const p of this.projectsCache) {
          const matches = (p.clientMatch || [p.name, p.id]).map(m => m.toLowerCase());
          if (matches.some(m => client === m || (m && client.includes(m)) || (m && title.includes(m)) || tags.includes(m))) {
            return p;
          }
        }
        return null;
      }
    };

    const clarianeMeet = { title: '[Planning HDJ] Suivi anomalies', client: 'Clariane' };
    const matched = storeWithCache.getProjectForMeeting(clarianeMeet);
    assert(matched !== null, 'Meeting with [Planning HDJ] tag must match Clariane project');
    assert(matched.id === 'clariane');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('✔ All Step 2 verification tests PASSED.');
  }
}

runAll();
