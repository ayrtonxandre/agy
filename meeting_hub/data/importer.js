/**
 * One-Time Events Importer & Recurrence Collapser
 * 
 * Imports existing calendar events once into storage, collapses them
 * into series, and seeds initial meeting notes without ever overwriting user data.
 */
import { EventModel } from '../model/event.js';
import { SeriesModel } from '../model/series.js';

export class EventsImporter {
  /**
   * Performs an idempotent initial import of events.
   * @param {DatabaseAdapter} db - Active database adapter
   * @param {Object} options - { force: boolean, dataUrl: string, rawEvents: Array }
   */
  static async importInitialData(db, options = {}) {
    const existingCount = await db.count('events');
    const seedVersionMeta = await db.get('meta', 'seed_version');
    const currentSeedVersion = 3; // version 3 includes unified multi-mission calendar events and Friday Oct 30 schedule

    let rawList = options.rawEvents;
    if (!rawList && typeof window !== 'undefined' && window.INITIAL_EVENTS && Array.isArray(window.INITIAL_EVENTS)) {
      rawList = window.INITIAL_EVENTS;
    }

    // If store already has events and up-to-date seed version, skip cleanly
    if (existingCount > 0 && !options.force && seedVersionMeta && seedVersionMeta.value >= currentSeedVersion) {
      console.log(`[Importer] Store already populated with ${existingCount} events (seed v${seedVersionMeta.value}).`);
      return { skipped: true, eventCount: existingCount };
    }

    console.log('[Importer] Checking for initial calendar events import...');

    // 1. Check window.INITIAL_EVENTS (fastest, immune to file:// CORS)
    if (!rawList && typeof window !== 'undefined' && window.INITIAL_EVENTS && Array.isArray(window.INITIAL_EVENTS)) {
      rawList = window.INITIAL_EVENTS;
      console.log(`[Importer] Loaded ${rawList.length} events from window.INITIAL_EVENTS.`);
    }

    // 2. Check window.RAW_EVENTS (legacy fallback from calendar_dashboard.html)
    if (!rawList && typeof window !== 'undefined' && window.RAW_EVENTS && Array.isArray(window.RAW_EVENTS)) {
      rawList = window.RAW_EVENTS;
      console.log(`[Importer] Loaded ${rawList.length} events from window.RAW_EVENTS.`);
    }

    // 3. Attempt fetch if served via HTTP
    if (!rawList) {
      const dataUrl = options.dataUrl || 'meeting_hub/data/initial_events.json';
      try {
        const resp = await fetch(dataUrl);
        if (resp.ok) {
          rawList = await resp.json();
          console.log(`[Importer] Fetched ${rawList.length} events from ${dataUrl}.`);
        }
      } catch (err) {
        // Safe to ignore if snapshot file is retired
      }
    }

    // 4. Node environment fallback (for automated tests and SSR)
    if (!rawList && typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const fs = await import('fs');
        const candidatePaths = [
          'meeting_hub/data/initial_events.json',
          './meeting_hub/data/initial_events.json',
          '/Users/ayrtonandre/Documents/work/AGY/meeting_hub/data/initial_events.json'
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            rawList = JSON.parse(fs.readFileSync(p, 'utf8'));
            break;
          }
        }
      } catch (e) {
        // Node fallback error ignored
      }
    }

    if (!rawList || !Array.isArray(rawList)) {
      if (existingCount > 0) {
        return { skipped: true, eventCount: existingCount };
      }
      console.warn('[Importer] No snapshot events provided. Waiting for live sync or JSON import.');
      return { skipped: true, eventCount: 0 };
    }

    // 1. Normalize events
    const normalizedEvents = rawList.map(e => EventModel.normalize(e));

    // 2. Collapse into series
    const collapsedSeries = SeriesModel.collapse(normalizedEvents);

    // 3. Batch put into database
    await db.bulkPut('events', normalizedEvents);
    await db.bulkPut('series', collapsedSeries);

    // 4. Seed initial rich meeting intelligence for flagship meetings
    // ONLY IF the meeting doesn't already have user-saved notes!
    await EventsImporter._seedFlagshipNotes(db, normalizedEvents);

    // 5. Update meta
    await db.put('meta', { key: 'initial_import_done', value: true });
    await db.put('meta', { key: 'seed_version', value: currentSeedVersion });
    await db.put('meta', { key: 'last_import_timestamp', value: new Date().toISOString() });
    await db.put('meta', { key: 'event_count', value: normalizedEvents.length });
    await db.put('meta', { key: 'series_count', value: collapsedSeries.length });

    console.log(`[Importer] Import complete: ${normalizedEvents.length} events, ${collapsedSeries.length} collapsed series.`);

    return {
      skipped: false,
      eventCount: normalizedEvents.length,
      seriesCount: collapsedSeries.length,
      recurringCount: collapsedSeries.filter(s => s.isRecurring).length
    };
  }

  /**
   * Seeds demo items/agenda on key events to demonstrate the prep workflow,
   * strictly protecting existing records.
   */
  static async _seedFlagshipNotes(db, events) {
    // Find key meetings on 2026-10-28
    const moMeeting = events.find(e => e.date === '2026-10-28' && e.title.includes('MO - Suivi anomalies'));
    const invoicingMeeting = events.find(e => e.date === '2026-10-28' && e.title.includes('INVOICING'));
    const f360Past = events.find(e => e.title.includes('MO - Suivi anomalies') && e.date < '2026-10-28');

    if (moMeeting) {
      const existing = await db.get('meeting_data', moMeeting.id);
      if (!existing) {
        await db.put('meeting_data', {
          id: moMeeting.id,
          agenda: '1. Review unresolved claims and Netsoins ingestion errors\n2. Clarify ownership of GLANUM pharmacy feeds\n3. Agree on patch deployment schedule for V2',
          minutes: '',
          items: [
            { id: 'item-mo-1', kind: 'action', text: 'Send updated anomalies list to Sophie G.', owner: 'Ayrton', done: false },
            { id: 'item-mo-2', kind: 'question', text: 'Who validates the F360 schema freeze?', owner: 'Claire', done: false },
            { id: 'item-mo-3', kind: 'topic', text: 'Palantir traceability ingestion timeline', owner: '', done: false }
          ],
          linkedMeetingIds: f360Past ? [f360Past.id] : [],
          prepared: true,
          updatedAt: new Date().toISOString()
        });
      }
    }

    if (f360Past) {
      const existing = await db.get('meeting_data', f360Past.id);
      if (!existing) {
        await db.put('meeting_data', {
          id: f360Past.id,
          agenda: 'Review sprint progress on hospital data ingestion.',
          minutes: 'Reviewed data quality issues on residents referential. Agreed to freeze schema until Nov. Claire to lead validation on pharmacy endpoints.',
          items: [
            { id: 'item-p1-1', kind: 'decision', text: 'Freeze referential schema until November', owner: '', done: true },
            { id: 'item-p1-2', kind: 'action', text: 'Draft Palantir mapping documentation', owner: 'Ayrton', done: true }
          ],
          linkedMeetingIds: [],
          prepared: true,
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Seed Clariane HDJ Planning Meetings (Mariéna & Les Arbelles)
    const arbellesMeeting = events.find(e => e.date === '2026-10-21' && e.title.includes('Arbelles'));
    const marienaMeeting = events.find(e => e.date === '2026-10-26' && e.title.includes('Mariéna'));

    if (arbellesMeeting) {
      const existing = await db.get('meeting_data', arbellesMeeting.id);
      if (!existing || !existing.minutes) {
        await db.put('meeting_data', {
          id: arbellesMeeting.id,
          googleDocUrl: 'https://docs.google.com/document/d/1jDunJURx26Di9c6k4vjhmA84w3Hh_zCCmCxnU0kcFjY/edit?tab=t.0',
          agenda: '1. Présentation de la vue centralisée des vacations par salle et intervenant\n2. Cadrage du flux Annonce dans HM pour Foundry\n3. Modélisation des programmes thérapeutiques (contrainte zéro temps mort)',
          minutes: `HDJ Planning Manager\nParamétrage des programmes thérapeutiques et organisation - Les Arbelles\n________________\n\nDate | 21 Octobre 2026\n\nParticipants\n* FERRIER Fabien | Cadre de rééducation - Les Arbelles\n* CUVELIER Delphine | Agent administratif - Les Arbelles\n* DE GIROLAMO Benjamin | Data Analyst\n* ANDRE Ayrton | Data Analyst\n\nPoints abordés\n* Vue Vacations et Visibilité :\n   * Présentation de la vue centralisée des plannings par salle et par intervenant.\n   * Les noms et prénoms des patients seront bien visibles pour le personnel médical habilité.\n   * À terme, l'outil pourrait offrir un accès en lecture seule aux praticiens pour consulter spécifiquement leurs propres vacations.\n* Processus d'Admission et flux "Annonce" :\n   * Actuellement, Les Arbelles n'utilise pas les annonces dans HM ; les patients "potentiels" sont gérés au travers d'une liste d'attente sur un agenda papier.\n   * Pour maximiser l'efficacité du calcul de disponibilité dans Foundry, il a été proposé de saisir les patients au statut "Annonce" dans HM dès la confirmation de la demande.\n* Contraintes des Programmes Thérapeutiques :\n   * Les Arbelles gèrent des programmes "carrés" (Dos, Parkinson) mais font aussi du sur-mesure complexe pour la neuro et le locomoteur.\n   * Politique zéro temps mort : Par manque d'espace d'attente, les patients ne doivent avoir aucun "trou" entre leurs séances.\n   * Bilans et spécificités : Les bilans d'entrée et de sortie se font en individuel.\n* Analytique et Reporting Budgétaire :\n   * Fabien a souligné un besoin métier majeur : pouvoir extraire le case mix réel (% Neuro vs Locomoteur) pour la construction budgétaire.\n\nProchaines étapes\n   * Les Arbelles | Modéliser "sur papier" la structure de leurs différents programmes thérapeutiques pour préparer le paramétrage.\n   * Les Arbelles | Se connecter à l'outil dans la semaine pour le prendre en main et remonter les premiers retours.\n   * Artefact | Se renseigner sur les champs obligatoires minimaux requis dans HM pour créer une "Annonce".\n   * Artefact | Ajuster les filtres de la vue vacation pour bien séparer les médecins, les psychologues et les neuropsychologues.\n   * Artefact | S'assurer que la plateforme permet de modéliser facilement les séances de bilan ciblées et les séances périodiques.`,
          items: [],
          linkedMeetingIds: [],
          prepared: true,
          updatedAt: new Date().toISOString()
        });
      }
    }

    if (marienaMeeting) {
      const existing = await db.get('meeting_data', marienaMeeting.id);
      if (!existing || !existing.minutes) {
        await db.put('meeting_data', {
          id: marienaMeeting.id,
          googleDocUrl: 'https://docs.google.com/document/d/1eLUVhYG6hwiqOzauSEDZoGJHu_B9jQuC5Pmbg-8bd_8/edit?tab=t.0',
          agenda: '1. Démonstration des vues Vacations et Disponibilité Foundry\n2. Clarification du circuit de validation avec Hôpital Manager (HM)\n3. Prise en compte du flux Annonces et des séances périodiques complexes (rTMS)',
          minutes: `HDJ Planning Manager\nParamétrage des programmes thérapeutiques et organisation - Marienia\n________________\n\nDate | 26 Octobre 2026\n\nParticipants\n* GAILLET Claire | IDE - Marienia\n* DE GIROLAMO Benjamin | Data Analyst\n* ANDRE Ayrton | Data Analyst\n\nPoints Abordés\nContexte et Approche du projet\n* Rappel de l'outil et mécanisme de synchronisation\n   * Démonstration des vues "Vacations" et "Disponibilité".\n   * Clarification du workflow de validation : la validation d'un circuit sur Foundry le passe au statut "En attente HM". Une fois les créneaux saisis manuellement dans Hôpital Manager (HM), l'algorithme fait le rapprochement et valide le rendez-vous en "Réel".\n* Processus d'Admission (Flux Annonces)\n   * À Mariéna, le flux "Annonces" est utilisé pour tous les patients (HDJ et HC), et c'est le médecin qui détermine ensuite s'il s'agit d'une prise en charge HDJ.\n   * L'outil a été adapté avec un onglet permettant d'inclure ou d'exclure facilement les annonces/pré-admissions pour isoler celles concernant l'HDJ.\n* Modélisation des Parcours Thérapeutiques\n   * Gestion des imprévus de placement : démonstration de la fonctionnalité permettant de "forcer" un placement via le surbooking et du changement manuel d'intervenant.\n   * Parcours complexes (ex: Parcours Douloureux) : Analyse du cas des patients venant toutes les 3 semaines pour des séances de rTMS / tDCS le lundi. La solution retenue est de créer des vacations isolées/dédiées pour ce groupe, avec une fréquence de récurrence paramétrée à 3 semaines dans l'outil.\n* Anomalies techniques en cours de résolution\n   * Certaines vacations (Kiné, Balnéo, Ergo collective) ne remontent pas encore dans la disponibilité Foundry en raison d'un paramétrage HM en cours d'investigation.\n\nLes prochaines étapes\n   * Claire GAILLET : Modéliser sur papier ou fichier Excel les parcours thérapeutiques complexes pour préparer le paramétrage.\n   * Artefact : Résoudre le problème de remontée des vacations depuis HM (Kiné, Balnéo, Ergo) et prévenir Claire.\n   * Artefact : Développer un système d'alerte (alerting) dans l'outil pour signaler lorsqu'un patient est positionné sur deux vacations en même temps.\n   * Prochain point de suivi : Mardi matin de la semaine prochaine pour avancer sur la modélisation des parcours.`,
          items: [],
          linkedMeetingIds: arbellesMeeting ? [arbellesMeeting.id] : [],
          prepared: true,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }
}
