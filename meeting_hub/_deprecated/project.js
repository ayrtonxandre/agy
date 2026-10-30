/**
 * Project Model & Configuration Schema
 * 
 * Defines the generic project contract:
 * { id, name, clientMatch[], docSources[], workstreams[], parserHints[] }
 * 
 * Fully decouples domain-specific knowledge (workstreams, clinical terms,
 * decision triggers, entity tags) into per-project data/config.
 */

export const DEFAULT_CLARIANE_PROJECT = {
  id: 'clariane',
  name: 'HDJ Planning Manager (Inicea / Clariane)',
  clientMatch: ['[planning hdj]', '[planning manager]', 'planning hdj', 'planning manager', 'hdj', 'arbelles', 'mariena', 'mariénia', 'mariéna'],
  docSources: [
    '1eLUVhYG6hwiqOzauSEDZoGJHu_B9jQuC5Pmbg-8bd_8',
    '1jDunJURx26Di9c6k4vjhmA84w3Hh_zCCmCxnU0kcFjY'
  ],
  workstreams: [
    {
      id: 'ws-admission',
      title: 'Flux Annonces & Processus d’Admission',
      badge: 'HM → Foundry',
      status: 'En déploiement',
      summary: 'Basculement de la gestion des listes d’attente papier vers le statut "Annonce" dans Hôpital Manager dès accord médical pour alimenter la disponibilité Foundry.',
      facilities: ['Les Arbelles', 'Mariéna'],
      tags: ['annonces', 'admission'],
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
      tags: ['modeling', 'parcours'],
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
      tags: ['hm-sync', 'vacations'],
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
      tags: ['analytics', 'alerting'],
      keyRules: [
        'Indicateur budgétaire case mix (tarifs de journée différenciés par segment)',
        'Alerte automatique si un patient est positionné simultanément sur deux vacations'
      ]
    }
  ],
  parserHints: {
    tools: [
      { name: 'Foundry (Palantir)', keywords: ['foundry'], type: 'Data & Engine Platform' },
      { name: 'Hôpital Manager (HM)', keywords: ['hm', 'hôpital manager', 'hopital manager'], type: 'SIH / Dossier Patient' },
      { name: 'rTMS / tDCS', keywords: ['rtms', 'tdcs'], type: 'Protocole Thérapeutique' },
      { name: 'Balnéothérapie', keywords: ['balnéo', 'balneo'], type: 'Plateau Technique' },
      { name: 'Kinésithérapie', keywords: ['kiné', 'kine'], type: 'Soin Rééducation' },
      { name: 'Ergothérapie', keywords: ['ergo'], type: 'Soin Rééducation' }
    ],
    concepts: [
      { name: 'Flux Annonces', keywords: ['annonce'], desc: 'Gestion des pré-admissions et patients potentiels dans HM vers Foundry' },
      { name: 'Politique Zéro Temps Mort', keywords: ['zéro temps mort', 'zero temps mort'], desc: 'Optimisation continue sans temps d’attente inter-séances pour les patients' },
      { name: 'Analytique Case Mix', keywords: ['case mix'], desc: 'Répartition de l’activité Neuro vs Locomoteur pour le pilotage budgétaire' },
      { name: 'Gestion Surbooking & Forçage', keywords: ['surbooking', 'forcer'], desc: 'Remplacement manuel et dépassement de capacité contrôlé' },
      { name: 'Vue Vacations & Disponibilité', keywords: ['vacation'], desc: 'Planification centralisée par salle, soignant et créneau' }
    ],
    facilities: ['Mariéna', 'Les Arbelles', 'Glanum', 'Inicea', 'Clariane'],
    decisionTriggers: [
      { pattern: 'workflow\\s+de\\s+validation\\s*:\\s*(.+)', label: 'Workflow de Validation' },
      { pattern: 'la\\s+solution\\s+retenue\\s+est\\s+(.+)', label: 'Solution Retenue' },
      { pattern: 'politique\\s+z[ée]ro\\s+temps\\s+mort\\s*:\\s*(.+)', label: 'Politique Zéro Temps Mort' },
      { pattern: 'il\\s+a\\s+[ée]t[ée]\\s+propos[ée]\\s+de\\s+(.+)', label: 'Processus Validé' },
      { pattern: 'les\\s+bilans\\s+d\'entr[ée]e\\s+et\\s+de\\s+sortie\\s+se\\s+font\\s+en\\s+individuel', label: 'Règle Bilans' },
      { pattern: 'd[ée]monstration\\s+de\\s+la\\s+fonctionnalit[ée]\\s+permettant\\s+de\\s+"forcer"\\s+un\\s+placement', label: 'Règle Surbooking & Forçage' },
      { pattern: 'l\'outil\\s+a\\s+[ée]t[ée]\\s+adapt[ée]\\s+avec\\s+un\\s+onglet\\s+permettant\\s+d\'inclure\\s+ou\\s+d\'exclure', label: 'Filtre Annonces / Pré-admissions' },
      { pattern: 'à\\s+terme,\\s+l\'outil\\s+pourrait\\s+offrir\\s+un\\s+accès\\s+en\\s+lecture\\s+seule', label: 'Visibilité Praticiens' }
    ],
    tagRules: [
      { tag: 'hm-sync', keywords: ['hm', 'hôpital manager', 'hopital manager'] },
      { tag: 'foundry', keywords: ['foundry'] },
      { tag: 'vacations', keywords: ['vacation'] },
      { tag: 'annonces', keywords: ['annonce'] },
      { tag: 'modeling', keywords: ['modélis', 'parcours'] },
      { tag: 'alerting', keywords: ['alerte', 'alerting'] },
      { tag: 'analytics', keywords: ['case mix', 'budget'] }
    ],
    ownerOrgRules: [
      { org: 'Artefact', keywords: ['artefact', 'ayrton', 'benjamin'] },
      { org: 'Les Arbelles', keywords: ['arbelles', 'fabien', 'delphine'] },
      { org: 'Mariéna', keywords: ['mariena', 'mariéna', 'claire'] },
      { org: 'Client', keywords: ['clariane', 'inicea'] }
    ]
  }
};

export const MO_PROJECT = {
  id: 'clariane-mo',
  name: 'Molécules Onéreuses (Clariane)',
  clientMatch: ['[molécules onéreuses]', '[mo]', 'molécules onéreuses', 'molecules onereuses', 'mo -', 'mo:', 'passation molécules', 'point tests mo', 'questions mo'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-mo-copil',
      title: 'Pilotage & COPIL Déploiement',
      badge: 'COPIL',
      status: 'Actif',
      summary: 'Gouvernance, validation des jalons et coordination du déploiement opérationnel.',
      facilities: ['Clariane'],
      tags: ['copil', 'pilotage'],
      keyRules: ['Suivi hebdomadaire des indicateurs de déploiement']
    },
    {
      id: 'ws-mo-anomalies',
      title: 'Suivi Anomalies & Évolutions',
      badge: 'Run & MCO',
      status: 'En cours',
      summary: 'Traitement des anomalies de remontée et suivi des évolutions applicatives.',
      facilities: ['Clariane'],
      tags: ['anomalies', 'run'],
      keyRules: ['Priorisation des tickets bloquants sur les flux']
    },
    {
      id: 'ws-mo-formation',
      title: 'Formation & Accompagnement Pilotes',
      badge: 'Change',
      status: 'En déploiement',
      summary: 'Organisation des vagues de formation (options 1 & 2) et sessions pilotes.',
      facilities: ['Clariane'],
      tags: ['formation', 'pilotes'],
      keyRules: ['Validation des acquis avant bascule en production']
    },
    {
      id: 'ws-mo-passation',
      title: 'Passation & Transition Opérationnelle',
      badge: 'Transition',
      status: 'Planifié',
      summary: 'Documentation, transfert de compétences et kick-off de passation.',
      facilities: ['Clariane'],
      tags: ['passation', 'kick-off'],
      keyRules: ['Livrables de transition signés']
    }
  ],
  parserHints: {
    tools: [
      { name: 'Palantir Foundry', keywords: ['foundry'], type: 'Plateforme Data' },
      { name: 'Netsoins', keywords: ['netsoins'], type: 'SIH Établissements' },
      { name: 'Traçabilité Palantir', keywords: ['tracabilité', 'traçabilité'], type: 'Module SI' }
    ],
    concepts: [
      { name: 'Molécules Onéreuses', keywords: ['molécules onéreuses', 'mo'], desc: 'Gestion et facturation des molécules à statut onéreux' },
      { name: 'Vagues de Formation', keywords: ['vague 1', 'vague 2', 'formation'], desc: 'Déploiement progressif auprès des utilisateurs' }
    ],
    facilities: ['Clariane'],
    decisionTriggers: [
      { pattern: 'validation\\s+du\\s+copil\\s*:\\s*(.+)', label: 'Décision COPIL' },
      { pattern: 'la\\s+date\\s+de\\s+bascule\\s+est\\s+(.+)', label: 'Calendrier Déploiement' }
    ],
    tagRules: [
      { tag: 'copil', keywords: ['copil'] },
      { tag: 'anomalies', keywords: ['anomalie'] },
      { tag: 'formation', keywords: ['formation'] }
    ],
    ownerOrgRules: [
      { org: 'Artefact', keywords: ['artefact', 'ayrton'] },
      { org: 'Clariane', keywords: ['clariane'] }
    ]
  }
};

export const INVOICING_PROJECT = {
  id: 'clariane-invoicing',
  name: 'Invoicing & Facturation (Clariane)',
  clientMatch: ['[invoicing]', 'invoicing', 'facturation'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-weekly-facturation',
      title: 'Weekly Facturation x Data',
      badge: 'Facturation',
      status: 'Actif',
      summary: 'Alignement hebdomadaire sur le traitement des flux de facturation et rapprochements.',
      facilities: ['Clariane'],
      tags: ['invoicing', 'facturation'],
      keyRules: ['Contrôle qualité des flux de facturation']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Facturation x Data', keywords: ['facturation', 'invoicing'], desc: 'Suivi des données de facturation' }],
    facilities: ['Clariane'],
    decisionTriggers: [],
    tagRules: [{ tag: 'invoicing', keywords: ['invoicing', 'facturation'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }, { org: 'Clariane', keywords: ['clariane'] }]
  }
};

export const F360_PROJECT = {
  id: 'clariane-f360',
  name: 'F360 Médical (Clariane)',
  clientMatch: ['[f360', 'f360'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-dashboard-v2',
      title: 'Revue Dashboard Médical V2',
      badge: 'Dashboard',
      status: 'Actif',
      summary: 'Itération et retours RS sur le tableau de bord médical F360.',
      facilities: ['Clariane'],
      tags: ['dashboard', 'médical'],
      keyRules: ['Intégration des retours médecins et soignants']
    }
  ],
  parserHints: {
    tools: [{ name: 'F360', keywords: ['f360'], type: 'Plateforme Médicale' }],
    concepts: [{ name: 'Dashboard Médical', keywords: ['dashboard', 'médical'], desc: 'Pilotage de l’activité médicale' }],
    facilities: ['Clariane'],
    decisionTriggers: [],
    tagRules: [{ tag: 'f360', keywords: ['f360'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }, { org: 'Clariane', keywords: ['clariane'] }]
  }
};

export const CLARIANE_DATA_PROJECT = {
  id: 'clariane-data',
  name: 'Clariane Data & Coproj',
  clientMatch: ['[coproj data inicea]', 'coproj', '[clariane] - weekly sync', 'équipe parisienne', 'connexion mensuel ordinateur', '[artefact team] - bi-weekly'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-coproj-inicea',
      title: 'Coproj Data Inicea',
      badge: 'Coproj',
      status: 'Actif',
      summary: 'Comité de projet data transverse Inicea / Clariane.',
      facilities: ['Clariane'],
      tags: ['coproj', 'inicea'],
      keyRules: ['Suivi transverse du portefeuille de projets data']
    },
    {
      id: 'ws-equipe-sync',
      title: 'Weekly Sync & Vie d’Équipe',
      badge: 'Équipe',
      status: 'Actif',
      summary: 'Synchronisation d’équipe parisienne et alignement bimensuel Artefact.',
      facilities: ['Clariane'],
      tags: ['sync', 'équipe'],
      keyRules: ['Partage d’informations et coordination']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Coproj Data', keywords: ['coproj'], desc: 'Gouvernance data Inicea' }],
    facilities: ['Clariane'],
    decisionTriggers: [],
    tagRules: [{ tag: 'coproj', keywords: ['coproj'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }, { org: 'Clariane', keywords: ['clariane'] }]
  }
};

export const GE_UC_WIZARD_PROJECT = {
  id: 'ge-uc-wizard',
  name: 'GE Enterprise / UC Wizard (Artefact)',
  clientMatch: ['ge enterprise', 'uc wizard', 'datastore ge drive'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-ge-sync',
      title: 'GE Enterprise Stream',
      badge: 'GE',
      status: 'Actif',
      summary: 'Synchronisation hebdomadaire et architecture datastore GE Drive.',
      facilities: ['Artefact'],
      tags: ['ge-enterprise'],
      keyRules: ['Alignement hebdomadaire']
    },
    {
      id: 'ws-uc-wizard',
      title: 'UC Wizard Development',
      badge: 'UC Wizard',
      status: 'Actif',
      summary: 'Catchup et sprint sync pour l’application UC Wizard.',
      facilities: ['Artefact'],
      tags: ['uc-wizard'],
      keyRules: ['Revue des use cases et avancement technique']
    }
  ],
  parserHints: {
    tools: [{ name: 'GE Drive', keywords: ['ge drive'], type: 'Storage' }],
    concepts: [{ name: 'UC Wizard', keywords: ['uc wizard'], desc: 'Wizard de cadrage des cas d’usage' }],
    facilities: ['Artefact'],
    decisionTriggers: [],
    tagRules: [{ tag: 'ge', keywords: ['ge enterprise'] }, { tag: 'uc-wizard', keywords: ['uc wizard'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }]
  }
};

export const HEALTHCARE_PROJECT = {
  id: 'healthcare-mandate',
  name: 'Healthcare Mandate & Care Dispensing',
  clientMatch: ['[care dispensing]', 'care dispensing', 'healthoween', 'healthcare'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-care-dispensing',
      title: 'Care Dispensing Framework',
      badge: 'Care Dispensing',
      status: 'Actif',
      summary: 'Sessions hebdomadaires le vendredi sur la conception des supports et de l’offre Care Dispensing.',
      facilities: ['Artefact'],
      tags: ['care-dispensing'],
      keyRules: ['Livrables hebdomadaires de présentation']
    },
    {
      id: 'ws-healthcare-team',
      title: 'Healthcare Mandate & Community',
      badge: 'Mandat',
      status: 'Actif',
      summary: 'Animation de la communauté santé Artefact et événements dédiés (Healthoween).',
      facilities: ['Artefact'],
      tags: ['healthcare', 'mandat'],
      keyRules: ['Renforcement de la culture santé interne']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Care Dispensing', keywords: ['care dispensing'], desc: 'Offre et processus de dispensation des soins' }],
    facilities: ['Artefact'],
    decisionTriggers: [],
    tagRules: [{ tag: 'care-dispensing', keywords: ['care dispensing'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }]
  }
};

export const PRIDEFACT_PROJECT = {
  id: 'pridefact',
  name: 'PrideFact - Mandat RSE (Artefact)',
  clientMatch: ['[pridefact]', 'pridefact', 'mandat rse', 'women@artefact'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-pridefact-synchro',
      title: 'Synchro Mandat RSE',
      badge: 'Mandat RSE',
      status: 'Actif',
      summary: 'Coordination bimensuelle des actions RSE et inclusion.',
      facilities: ['Artefact'],
      tags: ['rse', 'inclusion'],
      keyRules: ['Suivi des engagements RSE']
    },
    {
      id: 'ws-pridefact-travail',
      title: 'Sessions de Travail & Événements',
      badge: 'Ateliers',
      status: 'Actif',
      summary: 'Ateliers de travail, intégration avec Women@Artefact et sensibilisation.',
      facilities: ['Artefact'],
      tags: ['ateliers', 'sensibilisation'],
      keyRules: ['Préparation des livrables de communication interne']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Mandat RSE', keywords: ['rse', 'pridefact'], desc: 'Engagement sociétal et inclusion' }],
    facilities: ['Artefact'],
    decisionTriggers: [],
    tagRules: [{ tag: 'pridefact', keywords: ['pridefact'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }]
  }
};

export const COUNSELING_PROJECT = {
  id: 'counseling',
  name: 'Counseling & Talent Review (Artefact)',
  clientMatch: ['[itw]', 'counselling', 'counseling', 'counselor', 'comités d\'évaluation', 'eval h2', 'peer selection', 'self & peer review'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-eval-h2',
      title: 'Comités d’Évaluation & Peer Reviews',
      badge: 'Évaluations H2',
      status: 'Actif',
      summary: 'Campagne d’évaluation H2 2026, comités d’arbitrage et sélection des pairs.',
      facilities: ['Artefact'],
      tags: ['evaluations', 'comites'],
      keyRules: ['Respect des échéances de recueil des feedbacks']
    },
    {
      id: 'ws-counseling-1to1',
      title: 'Counseling & Accompagnement Carrière',
      badge: 'Counseling',
      status: 'Actif',
      summary: 'Entretiens réguliers de counseling et suivi du plan de développement.',
      facilities: ['Artefact'],
      tags: ['counseling', '1to1'],
      keyRules: ['Suivi des objectifs semestriels']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Counseling', keywords: ['counseling', 'counselling'], desc: 'Accompagnement et mentorat RH' }],
    facilities: ['Artefact'],
    decisionTriggers: [],
    tagRules: [{ tag: 'counseling', keywords: ['counseling', 'counselling'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }]
  }
};

export const DEFAULT_PROJECTS = [
  DEFAULT_CLARIANE_PROJECT,
  MO_PROJECT,
  INVOICING_PROJECT,
  F360_PROJECT,
  CLARIANE_DATA_PROJECT,
  GE_UC_WIZARD_PROJECT,
  HEALTHCARE_PROJECT,
  PRIDEFACT_PROJECT,
  COUNSELING_PROJECT
];

export class ProjectModel {
  static createDefault(name, clientMatch = []) {
    const slug = (name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const clientList = clientMatch.length > 0 ? clientMatch : [name];
    return {
      id: slug || `proj-${Date.now()}`,
      name: name || 'New Project',
      clientMatch: clientList,
      docSources: [],
      workstreams: [],
      parserHints: {
        tools: [],
        concepts: [],
        facilities: [],
        decisionTriggers: [],
        tagRules: [],
        ownerOrgRules: []
      }
    };
  }

  static validate(project) {
    if (!project || typeof project !== 'object') return false;
    if (!project.id || typeof project.id !== 'string') return false;
    if (!project.name || typeof project.name !== 'string') return false;
    if (!Array.isArray(project.clientMatch)) project.clientMatch = [];
    if (!Array.isArray(project.docSources)) project.docSources = [];
    if (!Array.isArray(project.workstreams)) project.workstreams = [];
    if (!project.parserHints || typeof project.parserHints !== 'object') {
      project.parserHints = {
        tools: [],
        concepts: [],
        facilities: [],
        decisionTriggers: [],
        tagRules: [],
        ownerOrgRules: []
      };
    }
    return true;
  }
}
