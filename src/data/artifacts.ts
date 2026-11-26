export type ZoneId = 'treehouse' | 'egypt' | 'nile';

export type ArtifactShape =
  | 'compass' | 'map' | 'lantern' | 'journal'
  | 'scarab' | 'ankh' | 'papyrus' | 'canopic'
  | 'ammonite' | 'crocodile' | 'trilobite' | 'tooth'
  | 'bastet' | 'stela' | 'mapTable';

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
  /** Optional image in public/assets/ shown beside the field note, aspect ratio preserved. */
  inspectImage?: string;
  /** Pedestal/table height under the artifact (default 0.75). Use 0 for objects that stand on the ground. */
  standHeight?: number;
  /** Large set-piece discoveries stay still instead of spinning/bobbing. */
  static?: boolean;
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
  /** Optional environment reference image (flat, not a panorama) in public/assets/references/. */
  reference?: string;
  /** Optional equirectangular 360° backdrop (2:1) in public/assets/panoramas/. */
  panorama?: string;
  /** Degrees to turn the panorama so its best view faces the portals (forward from spawn). */
  panoramaYaw?: number;
}

export const ZONES: Record<ZoneId, Zone> = {
  treehouse: {
    id: 'treehouse',
    name: 'Clubhouse',
    subtitle: 'Base camp for every Time Explorer',
    sky: 0x87c5e8,
    ground: 0x4f7a3a,
    fog: 0xa8d4ec,
    reference: 'references/treehouse_hub_reference.png',
    panorama: 'panoramas/treehouse_hub_360.jpg',
    panoramaYaw: 0, // painted portal faces the game's portals
  },
  egypt: {
    id: 'egypt',
    name: 'Ancient Egypt Arrival',
    subtitle: 'Along the Nile, about 1500 BCE',
    sky: 0xf2c27b,
    ground: 0xd9b26f,
    fog: 0xf5d39a,
    reference: 'references/egypt_arrival_reference.png',
    panorama: 'panoramas/egypt_marketplace_portal_360.jpg',
    panoramaYaw: 0,
  },
  nile: {
    id: 'nile',
    name: 'Nile Fossil Exhibit',
    subtitle: 'Ancient life along the river',
    panorama: 'panoramas/nile_fossil_marketplace_360.jpg',
    panoramaYaw: 0,
    sky: 0x2c3e50,
    ground: 0x6b5a45,
    fog: 0x34495e,
  },
};

export const ARTIFACTS: Artifact[] = [
  // ---------- Tree House Hub ----------
  {
    id: 'explorer-compass', name: "Explorer's Compass", zone: 'treehouse', shape: 'compass',
    cutout: 'explorer-compass.png', position: [-0.75, 1.0, -1.05], color: 0xc9a227, standHeight: 0,
    fieldNote: 'A compass needle is a tiny magnet. It lines up with Earth\'s magnetic field and points toward magnetic north, helping explorers find their way.',
    quiz: { question: 'Why does a compass needle point north?', options: ['It is pulled by the Sun', 'It is a magnet lining up with Earth\'s magnetic field', 'Wind pushes it'], answerIndex: 1 },
  },
  {
    id: 'time-map', name: 'Time Map', zone: 'treehouse', shape: 'map',
    cutout: 'time-map.png', position: [0.75, 1.0, -1.05], color: 0xe8d5a3, standHeight: 0,
    fieldNote: 'Maps use a scale, a legend and a compass rose. Our Time Map adds one more thing: when each place existed in history.',
    quiz: { question: 'What part of a map explains its symbols?', options: ['The legend', 'The border', 'The title'], answerIndex: 0 },
  },
  {
    id: 'oil-lantern', name: 'Oil Lantern', zone: 'treehouse', shape: 'lantern',
    cutout: 'oil-lantern.png', position: [-0.38, 1.0, -0.55], color: 0xff9f43, standHeight: 0,
    fieldNote: 'Before electric lights, lanterns burned oil through a cloth wick. Glass sides kept the flame safe from wind.',
    quiz: { question: 'What did old lanterns burn to make light?', options: ['Batteries', 'Oil soaked into a wick', 'Ice'], answerIndex: 1 },
  },
  {
    id: 'field-journal', name: 'Field Journal', zone: 'treehouse', shape: 'journal',
    cutout: 'field-journal.png', position: [0.38, 1.0, -0.55], color: 0x8e5a2b, standHeight: 0,
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
  {
    id: 'bastet-statue', name: 'Bastet Cat Statue', zone: 'egypt', shape: 'bastet',
    cutout: 'bastet-statue.png', position: [-5.6, 0.95, -0.6], color: 0x1c1c22, static: true,
    inspectImage: 'inspection/egypt_bastet_statue.png',
    fieldNote: 'Bastet was an Egyptian goddess shown as a cat or a woman with a cat\'s head. She protected homes and families. Egyptians loved cats because they kept mice and snakes away from stored grain.',
    quiz: { question: 'Why did ancient Egyptians value cats so much?', options: ['They pulled carts', 'They protected grain from mice and snakes', 'They guarded the pyramids at night'], answerIndex: 1 },
  },
  {
    id: 'hieroglyphic-tablet', name: 'Hieroglyphic Tablet', zone: 'egypt', shape: 'stela',
    cutout: 'hieroglyphic-tablet.png', position: [5.6, 0.95, -0.6], color: 0xd9b77a, standHeight: 0.4, static: true,
    inspectImage: 'inspection/egypt_hieroglyphic_tablet.png',
    fieldNote: 'A carved stone slab like this is called a stela. Egyptians used stelae to honor gods and people and to record events. Hieroglyphs can run left, right or down. You read toward the faces of the people and animals.',
    quiz: { question: 'How do you know which way to read hieroglyphs?', options: ['Always right to left', 'Read toward the faces of people and animals', 'Start from the bottom'], answerIndex: 1 },
  },
  {
    id: 'nile-discovery', name: 'Nile Scroll Map', zone: 'egypt', shape: 'mapTable',
    cutout: 'nile-discovery.png', position: [0, 0, -3.4], color: 0xe2cc93, standHeight: 0, static: true,
    inspectImage: 'inspection/egypt_nile_discovery.png',
    fieldNote: 'Every summer the Nile flooded its banks. When the water went down it left rich black mud that was perfect for farming. Egyptians called their land Kemet, the Black Land, after that soil.',
    quiz: { question: 'Why was the Nile\'s yearly flood so important?', options: ['It left rich soil for growing crops', 'It washed away the pyramids', 'It made the desert colder'], answerIndex: 0 },
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

/** Non-quiz points of interest: signs and reference posters. Inspecting shows the image + text. */
export interface InfoPoint {
  id: string;
  zone: ZoneId;
  kind: 'sign' | 'poster' | 'jar' | 'board';
  title: string;
  body: string;
  image?: string;
  position: [number, number, number];
}

export const INFO_POINTS: InfoPoint[] = [
  {
    id: 'egypt-welcome', zone: 'egypt', kind: 'sign', title: 'Welcome, Time Explorer!',
    body: 'You\'ve traveled to Ancient Egypt, about 1500 BCE. Find the glowing artifacts, answer their questions and fill your backpack. Look for the Bastet statue, the hieroglyphic tablet and the scroll map by the Nile.',
    image: 'inspection/egypt_welcome_sign.png', position: [-2.0, 0, 0.4],
  },
  {
    id: 'how-to-play', zone: 'treehouse', kind: 'board', title: 'How to Play',
    body: '1. Walk and look around. 2. Find the glowing artifacts. 3. Select one and answer its question. 4. Every right answer goes in your backpack. 5. Step into a portal to travel to Ancient Egypt or the Nile Fossil Exhibit. Collect all 15 to become a Master Time Explorer!',
    image: 'props/how-to-play-sign.png', position: [-3.6, 0, 2.6],
  },
  {
    id: 'egypt-guide', zone: 'egypt', kind: 'poster', title: 'Ancient Egypt Field Guide',
    body: 'Along the Nile you\'ll find markets, temples, the Sphinx and the pyramids. There are seven artifacts to discover here, including three special discoveries in the market and by the river.',
    image: 'references/egypt_arrival_reference.png', position: [5.4, 0, 3.4],
  },
];

INFO_POINTS.push({
  id: 'mission-jar', zone: 'treehouse', kind: 'jar', title: 'Mission Jar',
  body: 'Your missions, Time Explorer: 1) Collect the 4 explorer tools here in the Clubhouse. 2) Travel to Ancient Egypt and find 7 artifacts, including the Bastet statue, the hieroglyphic tablet and the Nile scroll map. 3) Visit the Nile Fossil Exhibit and find 4 fossils. Answer each question to fill your backpack!',
  position: [0, 0, -1.2],
});

/** Decorative cut-out props (transparent PNGs in public/assets/props/). Heights in metres. */
export interface Prop {
  image: string;
  zone: ZoneId;
  position: [number, number, number];
  height: number;
  /** Lies flat on the floor (rugs). Height is then the width. */
  flat?: boolean;
  /** Fixed facing toward the spawn point instead of turning to face the player. */
  fixed?: boolean;
}

export const PROPS: Prop[] = [
  // Clubhouse: round table scene from the original concept art
  { zone: 'treehouse', image: 'compass-rug', position: [0, 0.012, -1.2], height: 4.4, flat: true },
  { zone: 'treehouse', image: 'tree-stump', position: [-1.5, 0, -0.4], height: 0.5 },
  { zone: 'treehouse', image: 'tree-stump', position: [1.5, 0, -0.4], height: 0.5 },
  { zone: 'treehouse', image: 'tree-stump', position: [0, 0, 0.5], height: 0.5 },
  { zone: 'treehouse', image: 'tree-stump', position: [-1.35, 0, -2.3], height: 0.5 },
  { zone: 'treehouse', image: 'tree-stump', position: [1.35, 0, -2.3], height: 0.5 },
  { zone: 'treehouse', image: 'sealed-scroll', position: [0.0, 0.81, -0.35], height: 0.2 },
  { zone: 'treehouse', image: 'time-key', position: [0.45, 0.81, -1.8], height: 0.22 },
  // Cozy corner and room edges
  { zone: 'treehouse', image: 'purple-blanket', position: [-5.2, 0, 1.2], height: 0.7 },
  { zone: 'treehouse', image: 'compass-pillow', position: [-4.7, 0, 1.6], height: 0.45 },
  { zone: 'treehouse', image: 'telescope', position: [-5.0, 0, -0.6], height: 1.5 },
  { zone: 'treehouse', image: 'potted-plant', position: [5.4, 0, -2.2], height: 1.2 },
  { zone: 'treehouse', image: 'potted-plant', position: [-3.6, 0, -4.9], height: 1.1 },
  { zone: 'treehouse', image: 'basket-1', position: [5.2, 0, 1.6], height: 0.55 },
  { zone: 'treehouse', image: 'basket-2', position: [4.6, 0, 2.4], height: 0.6 },
  { zone: 'treehouse', image: 'cauldron', position: [4.2, 0, -4.6], height: 0.85 },
  { zone: 'treehouse', image: 'owl-statue', position: [3.0, 0, -5.4], height: 0.9 },
  { zone: 'treehouse', image: 'hourglass-medallion', position: [0, 4.5, -6.6], height: 0.8, fixed: true },
  { zone: 'treehouse', image: 'treehouse-name-sign', position: [0, 2.85, -6.6], height: 1.5, fixed: true },
  // Egypt
  { zone: 'egypt', image: 'pharaoh-plaque', position: [-5.2, 0, -3.6], height: 1.4 },
];

export const propsInZone = (zone: ZoneId) => PROPS.filter((p) => p.zone === zone);

export const infoPointsInZone = (zone: ZoneId) => INFO_POINTS.filter((p) => p.zone === zone);

export const artifactsInZone = (zone: ZoneId) => ARTIFACTS.filter((a) => a.zone === zone);
