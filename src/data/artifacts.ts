export type ZoneId = 'treehouse' | 'egypt' | 'nile';

export type ArtifactShape =
  | 'compass' | 'map' | 'lantern' | 'journal'
  | 'scarab' | 'ankh' | 'papyrus' | 'canopic'
  | 'ammonite' | 'crocodile' | 'trilobite' | 'tooth';

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Artifact {
  id: string;
  name: string;
  zone: ZoneId;
  shape: ArtifactShape;
  /** Optional transparent PNG in public/assets/cutouts/. Falls back to a 3D model if missing. */
  cutout: string;
  position: [number, number, number];
  color: number;
  fieldNote: string;
  quiz: QuizQuestion;
}

export interface Zone {
  id: ZoneId;
  name: string;
  subtitle: string;
  sky: number;
  ground: number;
  fog: number;
  /** Optional reference image in public/assets/references/ shown in the inspection panel. */
  reference: string;
}

export const ZONES: Record<ZoneId, Zone> = {
  treehouse: {
    id: 'treehouse',
    name: 'Tree House Hub',
    subtitle: 'Base camp for every Time Explorer',
    sky: 0x87c5e8,
    ground: 0x4f7a3a,
    fog: 0xa8d4ec,
    reference: 'treehouse-hub.png',
  },
  egypt: {
    id: 'egypt',
    name: 'Ancient Egypt Arrival',
    subtitle: 'Giza Plateau, about 2560 BCE',
    sky: 0xf2c27b,
    ground: 0xd9b26f,
    fog: 0xf5d39a,
    reference: 'egypt-arrival.png',
  },
  nile: {
    id: 'nile',
    name: 'Nile Fossil Exhibit',
    subtitle: 'Ancient life along the river',
    sky: 0x2c3e50,
    ground: 0x6b5a45,
    fog: 0x34495e,
    reference: 'nile-fossil-exhibit.png',
  },
};

export const ARTIFACTS: Artifact[] = [
  // ---------- Tree House Hub ----------
  {
    id: 'explorer-compass', name: "Explorer's Compass", zone: 'treehouse', shape: 'compass',
    cutout: 'explorer-compass.png', position: [-2.2, 1.0, -2.4], color: 0xc9a227,
    fieldNote: 'A compass needle is a tiny magnet. It lines up with Earth\'s magnetic field and points toward magnetic north, helping explorers find their way.',
    quiz: { question: 'Why does a compass needle point north?', options: ['It is pulled by the Sun', 'It is a magnet lining up with Earth\'s magnetic field', 'Wind pushes it'], answerIndex: 1 },
  },
  {
    id: 'time-map', name: 'Time Map', zone: 'treehouse', shape: 'map',
    cutout: 'time-map.png', position: [2.2, 1.0, -2.4], color: 0xe8d5a3,
    fieldNote: 'Maps use a scale, a legend and a compass rose. Our Time Map adds one more thing: when each place existed in history.',
    quiz: { question: 'What part of a map explains its symbols?', options: ['The legend', 'The border', 'The title'], answerIndex: 0 },
  },
  {
    id: 'oil-lantern', name: 'Oil Lantern', zone: 'treehouse', shape: 'lantern',
    cutout: 'oil-lantern.png', position: [-2.8, 1.0, 1.2], color: 0xff9f43,
    fieldNote: 'Before electric lights, lanterns burned oil through a cloth wick. Glass sides kept the flame safe from wind.',
    quiz: { question: 'What did old lanterns burn to make light?', options: ['Batteries', 'Oil soaked into a wick', 'Ice'], answerIndex: 1 },
  },
  {
    id: 'field-journal', name: 'Field Journal', zone: 'treehouse', shape: 'journal',
    cutout: 'field-journal.png', position: [2.8, 1.0, 1.2], color: 0x8e5a2b,
    fieldNote: 'Scientists record observations in field journals: drawings, measurements, dates and questions. Good notes let others check your discoveries.',
    quiz: { question: 'Why do explorers keep field journals?', options: ['To record observations others can check', 'To press flowers only', 'To keep secrets from scientists'], answerIndex: 0 },
  },

  // ---------- Ancient Egypt Arrival ----------
  {
    id: 'golden-scarab', name: 'Golden Scarab Amulet', zone: 'egypt', shape: 'scarab',
    cutout: 'golden-scarab.png', position: [-3, 1.0, -3], color: 0x1abc9c,
    fieldNote: 'Egyptians saw the scarab beetle rolling dung balls and linked it to the god Khepri rolling the Sun across the sky. Scarab amulets stood for rebirth.',
    quiz: { question: 'What did the scarab symbolize in ancient Egypt?', options: ['War', 'Rebirth and the rising Sun', 'Rain'], answerIndex: 1 },
  },
  {
    id: 'ankh', name: 'Ankh', zone: 'egypt', shape: 'ankh',
    cutout: 'ankh.png', position: [3, 1.0, -3], color: 0xf1c40f,
    fieldNote: 'The ankh is the hieroglyph for "life". Gods are often shown holding it out to pharaohs.',
    quiz: { question: 'The ankh hieroglyph means…', options: ['Life', 'Water', 'King'], answerIndex: 0 },
  },
  {
    id: 'papyrus-scroll', name: 'Papyrus Scroll', zone: 'egypt', shape: 'papyrus',
    cutout: 'papyrus-scroll.png', position: [-3.5, 1.0, 2], color: 0xdcc48e,
    fieldNote: 'Papyrus paper was made from reeds that grew along the Nile. Strips were laid crosswise, pressed and dried into sheets.',
    quiz: { question: 'Papyrus paper was made from…', options: ['Tree bark', 'Nile river reeds', 'Animal skin'], answerIndex: 1 },
  },
  {
    id: 'canopic-jar', name: 'Canopic Jar', zone: 'egypt', shape: 'canopic',
    cutout: 'canopic-jar.png', position: [3.5, 1.0, 2], color: 0xbfa77a,
    fieldNote: 'During mummification, organs were stored in four canopic jars, each protected by one of the four Sons of Horus.',
    quiz: { question: 'How many canopic jars were usually used?', options: ['Two', 'Four', 'Ten'], answerIndex: 1 },
  },

  // ---------- Nile Fossil Exhibit ----------
  {
    id: 'ammonite', name: 'Ammonite Fossil', zone: 'nile', shape: 'ammonite',
    cutout: 'ammonite.png', position: [-3, 1.1, -2.5], color: 0xc0884f,
    fieldNote: 'Ammonites were sea creatures with spiral shells, related to today\'s octopus and nautilus. Their fossils show that seas once covered parts of Egypt.',
    quiz: { question: 'Ammonites are related to which living animal?', options: ['Snails only', 'Octopus and nautilus', 'Crabs'], answerIndex: 1 },
  },
  {
    id: 'croc-skull', name: 'Ancient Crocodile Skull', zone: 'nile', shape: 'crocodile',
    cutout: 'croc-skull.png', position: [3, 1.1, -2.5], color: 0xd6cbb0,
    fieldNote: 'Crocodile ancestors have lived for over 200 million years. Ancient Egyptians honored the crocodile god Sobek along the Nile.',
    quiz: { question: 'Which Egyptian god had a crocodile head?', options: ['Sobek', 'Ra', 'Anubis'], answerIndex: 0 },
  },
  {
    id: 'trilobite', name: 'Trilobite', zone: 'nile', shape: 'trilobite',
    cutout: 'trilobite.png', position: [-3, 1.1, 2.5], color: 0x7f8c8d,
    fieldNote: 'Trilobites were among the first animals with complex eyes. They crawled on ocean floors for nearly 300 million years before going extinct.',
    quiz: { question: 'Trilobites lived…', options: ['In deserts', 'On ancient ocean floors', 'In trees'], answerIndex: 1 },
  },
  {
    id: 'whale-tooth', name: 'Basilosaurus Tooth', zone: 'nile', shape: 'tooth',
    cutout: 'whale-tooth.png', position: [3, 1.1, 2.5], color: 0xecf0f1,
    fieldNote: 'Egypt\'s Wadi Al-Hitan ("Valley of the Whales") holds fossils of early whales like Basilosaurus that still had tiny back legs.',
    quiz: { question: 'What surprising feature did early whale Basilosaurus have?', options: ['Wings', 'Tiny back legs', 'A shell'], answerIndex: 1 },
  },
];

export const artifactsInZone = (zone: ZoneId) => ARTIFACTS.filter((a) => a.zone === zone);
