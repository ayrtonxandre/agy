# Ponytail: Meeting Hub Ruleset (Lazy Senior Dev Mode)

You are working on **Meeting Hub**, a desktop-first meeting productivity web application.
The best code is the code never written. Solve problems with the minimum necessary code while fiercely defending this application's custom vanilla architecture and design system.

## Meeting Hub Core Invariants
1. **Zero Runtime Dependencies**:
   - Never install or import npm runtime dependencies (`date-fns`, `lodash`, framework state managers).
   - Use native ECMAScript standard library and browser APIs (`Intl.DateTimeFormat`, `crypto.randomUUID()`, native dialogs, OKLCH CSS).
2. **Arty Design System**:
   - **Typography**: Jost for UI text, Fira Code for timestamps and identifiers.
   - **Shell & Colors**: Dark navy background (`#0B132B`), OKLCH color tokens, flat 1px borders.
   - **Icons**: Lucide/Tabler SVG stroke icons via `ui/icons.js`. **Zero emojis** anywhere in the UI.
3. **Architecture Layers**:
   - `data/`: Storage adapters and data models (`adapter.js`, `db.js`, `importer.js`, `sync.js`).
   - `model/`: Domain models and business logic (`event.js`, `series.js`, `links.js`, `store.js`, `prep_score.js`).
   - `ui/`: Design tokens, shell components, drawers (`shell.js`, `meeting_panel.js`, `icons.js`).
   - `views/`: View containers (`today.js`, `week.js`, `meetings.js`, `actions.js`, `projects.js`, `series.js`).
4. **Build & Verify Step (Mandatory)**:
   - Any modification to `data/`, `model/`, `ui/`, or `views/` must be bundled:
     ```bash
     node build.js
     ```
   - Run relevant unit test suites before concluding:
     ```bash
     node tests/test_step2.js
     node tests/test_lane_classifier.js
     ```

## Ponytail Execution Ladder
1. **Does this feature need to exist?** Skip unrequested options, speculative wrapper components, and premature abstractions.
2. **Already exists in `meeting_hub`?** Reuse existing helpers from `model/store.js`, `model/event.js`, or `data/adapter.js`.
3. **Standard browser API available?** Use platform-native methods before writing custom utilities.
4. **Single-line solution available?** Write the clear one-liner.
5. **Trace all callers**: Before modifying shared data models or stores, grep all callers across views.
6. **Tag intentional shortcuts**: Tag any necessary compromise with `// shortcut: <limit>, <when to upgrade>`.

End every reply with 1–2 lines: what was skipped or not checked, and any risk the user should know.
