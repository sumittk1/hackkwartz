// =============================================================================
// SECURE SERVER-SIDE CHALLENGE DATABASE
// Flags, hints, fragments, and verification data
// =============================================================================

const CHALLENGES = {
  1: {
    id: 'diary',
    level: 1,
    title: 'The Cursed Diary',
    artifact: "Tom Riddle's Diary",
    skill: 'HTML Source Inspection & Base64 Decoding',
    points: 50,
    epigraph: '“I solemnly swear that I am up to no good.”',
    learning: 'Web browsers render visual HTML, but the underlying source holds full structure and developer comments. Furthermore, Base64 is an encoding format, NOT encryption.',
    // Case-sensitive server validated flags
    flags: [
      'Hackwarts{kasam_se_shararat_karunga}'
    ],
    fragment: 'kasam_se_shararat_karunga',
    trollMessages: [
      'Interesting answer. The cursed diary disagrees with your ink.',
      'The archive has recorded that attempt. The archive is choosing not to comment.',
      'Have you tried viewing the source page instead of guessing?',
      'Somewhere, a very small owl is shaking its head.'
    ],
    hints: [
      { id: 1, cost: 5, text: 'The page holds secrets that your eyes cannot see.' },
      { id: 2, cost: 10, text: 'Inspect the HTML source and look for a hidden comment or encoded message.' }
    ]
  },
  2: {
    id: 'ring',
    level: 2,
    title: 'The Resurrection Ring',
    artifact: 'Gaunt Family Resurrection Ring',
    skill: 'JavaScript Logic & Code Comprehension',
    points: 75,
    epigraph: '“After all this time?” / “Always.”',
    learning: 'Code execution follows exact instructions and case-sensitive variables. Tracing assignments step-by-step reveals true run-time states.',
    flags: [
      'Hackwarts{hamesha_tumhare_saath}'
    ],
    fragment: 'hamesha_tumhare_saath',
    trollMessages: [
      'The ring has rejected your spell. It prefers correct syntax.',
      'JavaScript is case-sensitive. So is this very dramatic ring.',
      'The clue is present. Your confidence is also present. Only one is useful right now.',
      'Spelling matters in spellcraft, young witch or wizard.'
    ],
    hints: [
      { id: 1, cost: 5, text: 'Magic follows rules, and sometimes those rules are written in plain sight.' },
      { id: 2, cost: 10, text: 'Open the browser DevTools and inspect the JavaScript code for the hidden phrase.' }
    ]
  },
  3: {
    id: 'locket',
    level: 3,
    title: 'The Slytherin Locket',
    artifact: "Salazar Slytherin's Locket",
    skill: 'Browser Network Tab & JSON Inspection',
    points: 100,
    epigraph: '“The truth. It is a beautiful and terrible thing.”',
    learning: 'Modern applications use background API calls (fetch/XHR) to transfer JSON payloads. Inspecting the browser Network tab lets you observe all ongoing client-server communications.',
    flags: [
      'Hackwarts{darr_ko_harao}'
    ],
    fragment: 'darr_ko_harao',
    trollMessages: [
      'The locket has no signal. Or perhaps you are listening to the wrong channel.',
      'Did you look at the interface? Good. Now look at the network traffic behind it.',
      'The serpents hiss, but you are not inspecting their packets.',
      'Try opening Developer Tools and checking what requests fly across the wire.'
    ],
    hints: [
      { id: 1, cost: 5, text: 'The page may be silent, but the browser is talking.' },
      { id: 2, cost: 10, text: 'Open DevTools → Network → Fetch/XHR, trigger the artifact request, and inspect its response.' }
    ]
  },
  4: {
    id: 'goblet',
    level: 4,
    title: 'The Goblet of Misleading Clues',
    artifact: 'The Goblet of Fire',
    skill: 'Evidence Correlation & Decoy Filtering',
    points: 125,
    epigraph: '“The world isn’t split into good people and Death Eaters.”',
    learning: 'Real investigations often contain conflicting or decoy evidence. Verifying metadata rules against external sources ensures you do not chase false positives.',
    flags: [
      'Hackwarts{har_cheez_waisi_nahi}'
    ],
    fragment: 'har_cheez_waisi_nahi',
    trollMessages: [
      'A decoy? In a misleading-clue challenge? Truly unthinkable.',
      'Suspicious text is not automatically useful text.',
      'You trusted the first parchment you picked up from the floor. Classic rookie move.',
      'The blue flames flicker at your haste. Read the rule carefully.'
    ],
    hints: [
      { id: 1, cost: 5, text: 'Not every clue deserves your trust.' },
      { id: 2, cost: 10, text: 'Examine the provided files, compare their contents, and identify the clue that contradicts the others.' }
    ]
  },
  5: {
    id: 'diadem',
    level: 5,
    title: 'The Lost Diadem',
    artifact: "Rowena Ravenclaw's Diadem",
    skill: 'DOM Inspection & HTML Event Attributes',
    points: 150,
    epigraph: '“Help will always be given at Hogwarts to those who ask for it.”',
    learning: 'HTML elements can store hidden custom metadata in data-* attributes and possess event handlers not apparent from their visual text.',
    flags: [
      'Hackwarts{madad_maangna_jaadu_hai}'
    ],
    fragment: 'madad_maangna_jaadu_hai',
    trollMessages: [
      'The diadem is impressed by your confidence, not your answer.',
      'Right-click, inspect, and try not to start a philosophical debate with the DOM.',
      'The eagle watches as you click everything except the element inspector.',
      'Hampe to hai hi na! DevTools kholo aur scroll ke elements inspect karo.'
    ],
    hints: [
      { id: 1, cost: 5, text: 'What you see on the page is only part of the story.' },
      { id: 2, cost: 10, text: 'Inspect the HTML DOM in DevTools and look for hidden elements or custom data-* attributes.' }
    ]
  },
  6: {
    id: 'serpent',
    level: 6,
    title: 'The Serpent’s Logs',
    artifact: 'Nagini the Serpent Reliquary',
    skill: 'Structured Log Analysis & Chronology Ordering',
    points: 200,
    epigraph: '“It is our choices, Harry, that show what we truly are.”',
    learning: 'Log analysis relies on chronology and correlation: ordering events by timestamp and identifying the causal path between access attempts and subsequent actions.',
    flags: [
      'Hackwarts{hamari_pasand_hame_banati_hai}'
    ],
    fragment: 'hamari_pasand_hame_banati_hai',
    trollMessages: [
      'The logs are not judging you. The timestamps might be.',
      'Try ordering events before accusing the nearest JSON object.',
      'You picked a random event out of the stream. Nagini slithers in disappointment.',
      'Look for the exact chronological window described in the briefing.'
    ],
    hints: [
      { id: 1, cost: 5, text: 'Every event has a time, and every time has a place in the story.' },
      { id: 2, cost: 10, text: 'Sort the log entries by timestamp, follow the recovered fragments in chronological order, and ignore the marked false trail.' }
    ]
  },
  7: {
    id: 'final',
    level: 7,
    title: 'The Final Horcrux',
    artifact: 'The Chamber of the Master Fragment',
    skill: 'Meta-Puzzle Synthesis & Artifact Union',
    points: 300,
    epigraph: '“Hogwarts will always be there to welcome you home.”',
    learning: 'Security operations conclude with synthesizing all recovered artifacts into an actionable final verdict or recovery key.',
    flags: [
      'Hackwarts{hogwarts_hamesha_ghar_rahega}'
    ],
    fragment: 'hogwarts_hamesha_ghar_rahega',
    trollMessages: [
      'Six fragments, one final door, and you chose interpretive dance. Bold.',
      'The final chamber recommends reading the instructions. The final chamber is unbearable.',
      'The dark magic resists your unaligned incantation.',
      'Reflect on the sacred promise made to all students of Hogwarts.'
    ],
    hints: []
  }
};

module.exports = { CHALLENGES };
