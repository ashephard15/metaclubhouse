export type ZoneId = 'treehouse' | 'egypt' | 'nile' | 'river' | 'pyramid' | 'tomb';

export type ArtifactShape =
  | 'compass' | 'map' | 'lantern' | 'journal'
  | 'scarab' | 'ankh' | 'papyrus' | 'canopic'
  | 'ammonite' | 'crocodile' | 'trilobite' | 'tooth'
  | 'bastet' | 'stela' | 'mapTable'
  | 'oar' | 'nilometer' | 'shaduf' | 'reeds' | 'net'
  | 'block' | 'chisel' | 'cubit' | 'pyramidion' | 'chest';

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
  /** Height in metres of the cutout picture in the world (default 0.45). */
  cutoutHeight?: number;
  /** Lies flat on the table (e.g. an unrolled map). cutoutHeight is then its width. */
  lieFlat?: boolean;
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
    panorama: 'panoramas/treehouse_hub_360.png',
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
    panorama: 'panoramas/egypt_marketplace_portal_360.png',
    panoramaYaw: 0,
  },
  nile: {
    id: 'nile',
    name: 'Nile Fossil Exhibit',
    subtitle: 'Ancient life along the river',
    panorama: 'panoramas/nile_fossil_marketplace_360.png',
    panoramaYaw: 0,
    sky: 0x2c3e50,
    ground: 0x6b5a45,
    fog: 0x34495e,
  },
  river: {
    id: 'river',
    name: 'Nile River Voyage',
    subtitle: 'Sailing the Nile, about 1500 BCE',
    sky: 0x9fd4f0,
    ground: 0x8e5a2b,
    fog: 0xcfe6f2,
    panorama: 'panoramas/nile_river_voyage_360.png',
    panoramaYaw: 0,
  },
  pyramid: {
    id: 'pyramid',
    name: 'Great Pyramid of Giza',
    subtitle: 'Built for Pharaoh Khufu, about 2560 BCE',
    sky: 0x8fc8ee,
    ground: 0xd9b26f,
    fog: 0xf2dcae,
    panorama: 'panoramas/great_pyramid_360.png',
    panoramaYaw: 0,
  },
  tomb: {
    id: 'tomb',
    name: 'Pharaoh\'s Tomb',
    subtitle: 'Deep inside the Great Pyramid',
    sky: 0x3a2410,
    ground: 0xc9a676,
    fog: 0x3a2410,
    panorama: 'panoramas/pharaoh_tomb_360.png',
    panoramaYaw: 0,
  },
};

export const ARTIFACTS: Artifact[] = [
  // ---------- Tree House Hub ----------
  {
    id: 'explorer-compass', name: "Explorer's Compass", zone: 'treehouse', shape: 'compass',
    cutout: 'explorer-compass.png', position: [-0.1, 1.03, 1.25], color: 0xc9a227, standHeight: 0, cutoutHeight: 0.45,
    fieldNote: 'A compass needle is a tiny magnet. It lines up with Earth\'s magnetic field and points toward magnetic north, helping explorers find their way.',
    quiz: { question: 'Why does a compass needle point north?', options: ['It is pulled by the Sun', 'It is a magnet lining up with Earth\'s magnetic field', 'Wind pushes it'], answerIndex: 1 },
  },
  {
    id: 'time-map', name: 'Time Map', zone: 'treehouse', shape: 'map',
    cutout: 'time-map.png', position: [0.42, 0.82, 2.24], color: 0xe8d5a3, standHeight: 0, cutoutHeight: 0.75, lieFlat: true,
    fieldNote: 'Maps use a scale, a legend and a compass rose. Our Time Map adds one more thing: when each place existed in history.',
    quiz: { question: 'What part of a map explains its symbols?', options: ['The legend', 'The border', 'The title'], answerIndex: 0 },
  },
  {
    id: 'oil-lantern', name: 'Oil Lantern', zone: 'treehouse', shape: 'lantern',
    cutout: 'oil-lantern.png', position: [-0.59, 1.1, 1.49], color: 0xff9f43, standHeight: 0, cutoutHeight: 0.6,
    fieldNote: 'Before electric lights, lanterns burned oil through a cloth wick. Glass sides kept the flame safe from wind.',
    quiz: { question: 'What did old lanterns burn to make light?', options: ['Batteries', 'Oil soaked into a wick', 'Ice'], answerIndex: 1 },
  },
  {
    id: 'field-journal', name: 'Field Journal', zone: 'treehouse', shape: 'journal',
    cutout: 'field-journal.png', position: [1.35, 1.08, 1.71], color: 0x8e5a2b, standHeight: 0, cutoutHeight: 0.55,
    fieldNote: 'Scientists record observations in field journals: drawings, measurements, dates and questions. Good notes let others check your discoveries.',
    quiz: { question: 'Why do explorers keep field journals?', options: ['To record observations others can check', 'To press flowers only', 'To keep secrets from scientists'], answerIndex: 0 },
  },

  // ---------- Ancient Egypt Arrival ----------
  {
    id: 'golden-scarab', name: 'Golden Scarab Amulet', zone: 'egypt', shape: 'scarab',
    cutout: 'golden-scarab.png', position: [-3.22, 1.4, -0.9], color: 0x1abc9c, standHeight: 1.0, cutoutHeight: 0.7,
    fieldNote: 'Egyptians saw the scarab beetle rolling dung balls and linked it to the god Khepri rolling the Sun across the sky. Scarab amulets stood for rebirth.',
    quiz: { question: 'What did the scarab symbolize in ancient Egypt?', options: ['War', 'Rebirth and the rising Sun', 'Rain'], answerIndex: 1 },
  },
  {
    id: 'ankh', name: 'Ankh', zone: 'egypt', shape: 'ankh',
    cutout: 'ankh.png', position: [3.22, 1.4, -0.9], color: 0xf1c40f, standHeight: 1.0, cutoutHeight: 0.7,
    fieldNote: 'The ankh is the hieroglyph for "life". Gods are often shown holding it out to pharaohs.',
    quiz: { question: 'The ankh hieroglyph means…', options: ['Life', 'Water', 'King'], answerIndex: 0 },
  },
  {
    id: 'papyrus-scroll', name: 'Papyrus Scroll', zone: 'egypt', shape: 'papyrus',
    cutout: 'papyrus-scroll.png', position: [-3.07, 1.4, 2.16], color: 0xdcc48e, standHeight: 1.0, cutoutHeight: 0.7,
    fieldNote: 'Papyrus paper was made from reeds that grew along the Nile. Strips were laid crosswise, pressed and dried into sheets.',
    quiz: { question: 'Papyrus paper was made from…', options: ['Tree bark', 'Nile river reeds', 'Animal skin'], answerIndex: 1 },
  },
  {
    id: 'canopic-jar', name: 'Canopic Jar', zone: 'egypt', shape: 'canopic',
    cutout: 'canopic-jar.png', position: [3.07, 1.4, 2.16], color: 0xbfa77a, standHeight: 1.0, cutoutHeight: 0.7,
    fieldNote: 'During mummification, organs were stored in four canopic jars, each protected by one of the four Sons of Horus.',
    quiz: { question: 'How many canopic jars were usually used?', options: ['Two', 'Four', 'Ten'], answerIndex: 1 },
  },
  {
    id: 'bastet-statue', name: 'Bastet Cat Statue', zone: 'egypt', shape: 'bastet',
    cutout: 'bastet-statue.png', position: [-4.51, 1.5, 0.63], color: 0x1c1c22, standHeight: 1.0, cutoutHeight: 1.0, static: true,
    inspectImage: 'inspection/egypt_bastet_statue.png',
    fieldNote: 'Bastet was an Egyptian goddess shown as a cat or a woman with a cat\'s head. She protected homes and families. Egyptians loved cats because they kept mice and snakes away from stored grain.',
    quiz: { question: 'Why did ancient Egyptians value cats so much?', options: ['They pulled carts', 'They protected grain from mice and snakes', 'They guarded the pyramids at night'], answerIndex: 1 },
  },
  {
    id: 'hieroglyphic-tablet', name: 'Hieroglyphic Tablet', zone: 'egypt', shape: 'stela',
    cutout: 'hieroglyphic-tablet.png', position: [4.51, 1.15, 0.63], color: 0xd9b77a, standHeight: 0.5, cutoutHeight: 1.3, static: true,
    inspectImage: 'inspection/egypt_hieroglyphic_tablet.png',
    fieldNote: 'A carved stone slab like this is called a stela. Egyptians used stelae to honor gods and people and to record events. Hieroglyphs can run left, right or down. You read toward the faces of the people and animals.',
    quiz: { question: 'How do you know which way to read hieroglyphs?', options: ['Always right to left', 'Read toward the faces of people and animals', 'Start from the bottom'], answerIndex: 1 },
  },
  {
    id: 'nile-discovery', name: 'Nile Scroll Map', zone: 'egypt', shape: 'mapTable',
    cutout: 'nile-discovery.png', position: [3.3, 0.65, 1.0], color: 0xe2cc93, standHeight: 0, cutoutHeight: 1.3, static: true,
    inspectImage: 'inspection/egypt_nile_discovery.png',
    fieldNote: 'Every summer the Nile flooded its banks. When the water went down it left rich black mud that was perfect for farming. Egyptians called their land Kemet, the Black Land, after that soil.',
    quiz: { question: 'Why was the Nile\'s yearly flood so important?', options: ['It left rich soil for growing crops', 'It washed away the pyramids', 'It made the desert colder'], answerIndex: 0 },
  },

  // ---------- Nile Fossil Exhibit ----------
  {
    id: 'ammonite', name: 'Ammonite Fossil', zone: 'nile', shape: 'ammonite',
    cutout: 'ammonite.png', position: [-2.42, 1.35, -1.14], color: 0xc0884f, standHeight: 1.0, cutoutHeight: 0.6,
    fieldNote: 'Ammonites were sea creatures with spiral shells, related to today\'s octopus and nautilus. Their fossils show that seas once covered parts of Egypt.',
    quiz: { question: 'Ammonites are related to which living animal?', options: ['Snails only', 'Octopus and nautilus', 'Crabs'], answerIndex: 1 },
  },
  {
    id: 'croc-skull', name: 'Ancient Crocodile Skull', zone: 'nile', shape: 'crocodile',
    cutout: 'croc-skull.png', position: [2.42, 1.35, -1.14], color: 0xd6cbb0, standHeight: 1.0, cutoutHeight: 0.6,
    fieldNote: 'Crocodile ancestors have lived for over 200 million years. Ancient Egyptians honored the crocodile god Sobek along the Nile.',
    quiz: { question: 'Which Egyptian god had a crocodile head?', options: ['Sobek', 'Ra', 'Anubis'], answerIndex: 0 },
  },
  {
    id: 'trilobite', name: 'Trilobite', zone: 'nile', shape: 'trilobite',
    cutout: 'trilobite.png', position: [-2.42, 1.35, 2.89], color: 0x7f8c8d, standHeight: 1.0, cutoutHeight: 0.6,
    fieldNote: 'Trilobites were among the first animals with complex eyes. They crawled on ocean floors for nearly 300 million years before going extinct.',
    quiz: { question: 'Trilobites lived…', options: ['In deserts', 'On ancient ocean floors', 'In trees'], answerIndex: 1 },
  },
  {
    id: 'whale-tooth', name: 'Basilosaurus Tooth', zone: 'nile', shape: 'tooth',
    cutout: 'whale-tooth.png', position: [2.42, 1.35, 2.89], color: 0xecf0f1, standHeight: 1.0, cutoutHeight: 0.6,
    fieldNote: 'Egypt\'s Wadi Al-Hitan ("Valley of the Whales") holds fossils of early whales like Basilosaurus that still had tiny back legs.',
    quiz: { question: 'What surprising feature did early whale Basilosaurus have?', options: ['Wings', 'Tiny back legs', 'A shell'], answerIndex: 1 },
  },

  // ---------- Nile River Voyage ----------
  {
    id: 'steering-oar', name: 'Steering Oar', zone: 'river', shape: 'oar',
    cutout: 'steering-oar.png', position: [0.0, 1.3, -1.55], color: 0x8e5a2b, standHeight: 0, cutoutHeight: 2.6, static: true,
    fieldNote: 'The Nile flows north to the sea, but the wind usually blows from the north. So boats raised their sails to travel south and lowered them to float north with the current. The hieroglyph for "travel south" even shows a boat with its sail up!',
    quiz: { question: 'How did boats travel SOUTH on the Nile?', options: ['They floated with the current', 'They raised their sails to catch the north wind', 'Animals pulled them from the bank'], answerIndex: 1 },
  },
  {
    id: 'nilometer', name: 'Nilometer', zone: 'river', shape: 'nilometer',
    cutout: 'nilometer.png', position: [-1.61, 1.0, -0.26], color: 0xc9a25a, standHeight: 0, cutoutHeight: 2.0, static: true,
    fieldNote: 'A nilometer was a set of marks or steps carved in stone to measure how high the Nile rose each year. Too little water meant hunger; too much meant floods. Officials used it to predict the harvest and decide how much tax farmers would pay.',
    quiz: { question: 'What was a nilometer used for?', options: ['Measuring how high the Nile rose', 'Catching fish', 'Telling the time at night'], answerIndex: 0 },
  },
  {
    id: 'shaduf', name: 'Shaduf', zone: 'river', shape: 'shaduf',
    cutout: 'shaduf.png', position: [1.69, 1.0, -0.26], color: 0x7a4f2a, standHeight: 0, cutoutHeight: 2.0, static: true,
    fieldNote: 'A shaduf is a long pole with a bucket on one end and a heavy weight on the other. Farmers dipped the bucket in the river and the weight helped swing the water up into canals that watered their fields, even after the flood was gone.',
    quiz: { question: 'What did farmers use a shaduf for?', options: ['Grinding wheat', 'Lifting water from the river to their fields', 'Steering boats'], answerIndex: 1 },
  },
  {
    id: 'papyrus-reeds', name: 'Papyrus Reeds', zone: 'river', shape: 'reeds',
    cutout: 'papyrus-reeds.png', position: [-1.77, 0.85, 1.83], color: 0x6f8f3a, standHeight: 0, cutoutHeight: 1.7, static: true,
    fieldNote: 'Papyrus reeds grew thick along the Nile. Egyptians tied bundles of them together to make light boats, and also used papyrus for rope, sandals, baskets, mats and paper.',
    quiz: { question: 'Which of these could Egyptians make from papyrus reeds?', options: ['Iron tools', 'Glass windows', 'Small boats and rope'], answerIndex: 2 },
  },
  {
    id: 'fishing-net', name: 'Fishing Net', zone: 'river', shape: 'net',
    cutout: 'fishing-net.png', position: [1.77, 0.7, 1.83], color: 0xd9c08a, standHeight: 0, cutoutHeight: 1.4, static: true,
    fieldNote: 'Fish from the Nile were an everyday food, along with bread and vegetables. Fishermen used nets, hooks and spears from small boats. They had to watch out for hippos: hippos were among the most dangerous animals on the river!',
    quiz: { question: 'Which river animal was one of the most dangerous to Egyptian fishermen?', options: ['The hippopotamus', 'The frog', 'The duck'], answerIndex: 0 },
  },
  // ---------- Great Pyramid of Giza ----------
  {
    id: 'limestone-block', name: 'Limestone Block', zone: 'pyramid', shape: 'block',
    cutout: 'limestone-block.png', position: [-2.09, 0.4, -0.58], color: 0xd8c39a, standHeight: 0, cutoutHeight: 0.8, static: true,
    fieldNote: 'The Great Pyramid is made of about 2.3 million stone blocks. On average each one weighs around 2.5 tonnes, as much as a big car, and some granite blocks inside weigh far more.',
    quiz: { question: 'About how many stone blocks make up the Great Pyramid?', options: ['About 2,300', 'About 2.3 million', 'About 23'], answerIndex: 1 },
  },
  {
    id: 'copper-chisel', name: 'Copper Chisel', zone: 'pyramid', shape: 'chisel',
    cutout: 'copper-chisel.png', position: [2.09, 1.35, -0.58], color: 0xb87333, standHeight: 1.0, cutoutHeight: 0.6,
    fieldNote: 'Workers shaped stone with copper chisels, stone hammers and wooden sledges. Archaeologists found the village where pyramid builders lived and the tombs where they were buried. They were organised, paid workers fed with bread and beer, not slaves.',
    quiz: { question: 'Who built the Great Pyramid?', options: ['Organised teams of paid workers', 'Aliens', 'A single pharaoh by himself'], answerIndex: 0 },
  },
  {
    id: 'cubit-rod', name: 'Cubit Rod', zone: 'pyramid', shape: 'cubit',
    cutout: 'cubit-rod.png', position: [-2.26, 1.3, 1.83], color: 0x8e5a2b, standHeight: 1.0, cutoutHeight: 0.4,
    fieldNote: 'Egyptian builders measured with a cubit rod, about the length from elbow to fingertip (roughly 52 cm). They were so precise that the pyramid\'s four sides face almost exactly north, south, east and west.',
    quiz: { question: 'Which directions do the Great Pyramid\'s sides face?', options: ['They point in random directions', 'Toward the Nile only', 'Almost exactly north, south, east and west'], answerIndex: 2 },
  },
  {
    id: 'casing-stone', name: 'White Casing Stone', zone: 'pyramid', shape: 'block',
    cutout: 'casing-stone.png', position: [2.26, 1.35, 1.83], color: 0xf4efe2, standHeight: 1.0, cutoutHeight: 0.6,
    fieldNote: 'When it was new, the pyramid was covered in smooth, polished white limestone casing stones that gleamed in the sun. Most were taken away long ago to build other things, which is why it looks stepped and rough today.',
    quiz: { question: 'What did the Great Pyramid look like when it was new?', options: ['Painted bright red', 'Covered in smooth, shining white limestone', 'Covered in grass'], answerIndex: 1 },
  },
  {
    id: 'pyramidion', name: 'Pyramidion Capstone', zone: 'pyramid', shape: 'pyramidion',
    cutout: 'pyramidion.png', position: [0.0, 1.35, -1.87], color: 0xd4af37, standHeight: 1.0, cutoutHeight: 0.6,
    fieldNote: 'At about 146 metres (481 feet) tall, the Great Pyramid was the tallest building made by people for around 3,800 years. It is the oldest of the Seven Wonders of the Ancient World, and the only one still standing.',
    quiz: { question: 'Which of the Seven Wonders of the Ancient World is still standing?', options: ['The Great Pyramid of Giza', 'The Colossus of Rhodes', 'The Hanging Gardens of Babylon'], answerIndex: 0 },
  },
  // ---------- Pharaoh's Tomb (inside the Great Pyramid) ----------
  {
    id: 'sarcophagus', name: 'Golden Sarcophagus', zone: 'tomb', shape: 'chest',
    cutout: 'sarcophagus.png', position: [0, 0.6, 1.6], color: 0xd4af37, standHeight: 0, cutoutHeight: 1.2, static: true,
    fieldNote: 'A pharaoh\'s mummy was placed in nested coffins, often shaped like the king with arms crossed holding a crook and flail, the symbols of royal power. These went inside a huge stone box called a sarcophagus. Khufu\'s own sarcophagus is made of red granite and still sits inside the Great Pyramid.',
    quiz: { question: 'What did the pharaoh hold on his coffin as symbols of power?', options: ['A sword and shield', 'A crook and flail', 'A bow and arrow'], answerIndex: 1 },
  },
  {
    id: 'canopic-set', name: 'Four Canopic Jars', zone: 'tomb', shape: 'canopic',
    cutout: 'canopic-jars.png', position: [-2.4, 0.4, 2.6], color: 0xd9b77a, standHeight: 0, cutoutHeight: 0.8, static: true,
    fieldNote: 'Each canopic jar was protected by one of the four Sons of Horus: human-headed Imsety guarded the liver, baboon-headed Hapy the lungs, jackal-headed Duamutef the stomach, and falcon-headed Qebehsenuef the intestines.',
    quiz: { question: 'Which Son of Horus had the head of a baboon?', options: ['Imsety', 'Hapy', 'Qebehsenuef'], answerIndex: 1 },
  },
  {
    id: 'offering-table', name: 'Offering Table', zone: 'tomb', shape: 'mapTable',
    cutout: 'offering-table.png', position: [2.4, 0.5, 2.6], color: 0xd9b77a, standHeight: 0, cutoutHeight: 1.0, static: true,
    fieldNote: 'Egyptians believed the spirit, called the ka, still needed food in the afterlife. Families and priests left bread, fruit, beer and other offerings, and pictures of food carved on tomb walls were thought to keep feeding the spirit forever.',
    quiz: { question: 'Why did Egyptians leave food in tombs?', options: ['To feed the spirit (ka) in the afterlife', 'For the workers\' lunch', 'To attract animals'], answerIndex: 0 },
  },
  {
    id: 'treasure-chest', name: 'Treasure Chest', zone: 'tomb', shape: 'chest',
    cutout: 'treasure-chest.png', position: [-2.6, 0.4, 4.6], color: 0xd4af37, standHeight: 0, cutoutHeight: 0.8, static: true,
    fieldNote: 'Pharaohs were buried with everything they might need in the afterlife: furniture, clothes, jewellery, games and chariots. Sadly, almost every pyramid was robbed in ancient times, which is why later pharaohs were buried in hidden tombs in the Valley of the Kings.',
    quiz: { question: 'Why did later pharaohs stop building pyramids for their tombs?', options: ['They ran out of stone', 'Pyramids were easy targets for tomb robbers', 'Pyramids were too small'], answerIndex: 1 },
  },
  {
    id: 'pharaoh-statue', name: 'Pharaoh Statue', zone: 'tomb', shape: 'stela',
    cutout: 'pharaoh-statue.png', position: [2.6, 1.1, 4.6], color: 0xc9a25a, standHeight: 0, cutoutHeight: 2.2, static: true,
    fieldNote: 'Statues of the pharaoh were made as a home for his ka, his life force, in case anything happened to his mummy. The striped headcloth is called a nemes, and the rearing cobra on his forehead, the uraeus, showed he was king.',
    quiz: { question: 'What is the striped royal headcloth called?', options: ['A nemes', 'A toga', 'A turban'], answerIndex: 0 },
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
  /** Sign picture (transparent PNG under public/assets/). Without one a parchment sign is drawn. */
  signImage?: string;
  position: [number, number, number];
}

export const INFO_POINTS: InfoPoint[] = [
  {
    id: 'egypt-welcome', zone: 'egypt', kind: 'sign', title: 'Welcome, Time Explorer!',
    body: 'You\'ve traveled to Ancient Egypt, about 1500 BCE. Find the glowing artifacts, answer their questions and fill your backpack. Look for the Bastet statue, the hieroglyphic tablet and the scroll map by the Nile.',
    image: 'inspection/egypt_welcome_sign.png', signImage: 'props/egypt-welcome-sign.png', position: [-2.4, 0, 3.3],
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
  position: [0.4, 0, 1.63],
});

/** Decorative cut-out props (transparent PNGs in public/assets/props/). Heights in metres. */
export interface Prop {
  /** Optional id so a scene layout can position it. */
  id?: string;
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
  // Clubhouse: exactly the concept picture's centre (rug, round table, four stumps). Everything else is painted in the room.
  { zone: 'treehouse', image: 'compass-rug', position: [0.4, 0.012, 1.63], height: 4.6, flat: true },
  { zone: 'treehouse', image: 'tree-stump', position: [-0.76, 0, 2.73], height: 0.7 },
  { zone: 'treehouse', image: 'tree-stump', position: [1.22, 0, 3.01], height: 0.7 },
  { zone: 'treehouse', image: 'tree-stump', position: [-1.13, 0, 1.06], height: 0.7 },
  { zone: 'treehouse', image: 'tree-stump', position: [2.04, 0, 1.5], height: 0.7 },
  // Nile River Voyage props are added when their pictures arrive
  // Tomb
  { id: 'dark-statue', zone: 'tomb', image: 'pharaoh-statue-dark', position: [-2.7, 0, 0.4], height: 2.2 },
  // Nile
  { id: 'dig-basket', zone: 'nile', image: 'dig-basket', position: [-4.4, 0, 0.6], height: 0.65 },
  { zone: 'nile', image: 'potted-plant', position: [5.2, 0, 0.2], height: 1.1 },
  { zone: 'nile', image: 'potted-plant', position: [-5.2, 0, 0.2], height: 1.1 },
  // Egypt
  { zone: 'egypt', image: 'pharaoh-plaque', position: [-5.2, 0, -3.6], height: 1.4 },
];

export const propsInZone = (zone: ZoneId) => PROPS.filter((p) => p.zone === zone);

INFO_POINTS.push({
  id: 'river-welcome', zone: 'river', kind: 'sign', title: 'Welcome Aboard!',
  body: 'You are sailing on the Nile, one of the longest rivers in the world: about 6,650 km (4,130 miles). Almost everyone in Ancient Egypt lived close to its banks, because the land beyond was desert. Here is a twist: Upper Egypt is in the SOUTH and Lower Egypt is in the NORTH, because the Nile flows from south to north. Find the five glowing objects on deck to learn more!',
  position: [-2.3, 0, 3.4],
});

INFO_POINTS.push({
  id: 'pyramid-welcome', zone: 'pyramid', kind: 'sign', title: 'The Great Pyramid',
  body: 'Welcome to the Great Pyramid of Giza, built as a tomb for Pharaoh Khufu around 2560 BCE. Here is something amazing: by 1500 BCE, when the rest of this adventure takes place, the pyramid was already about 1,000 years old! Even Ancient Egyptians thought of it as ancient. Find the five glowing objects to learn how it was built, then step through the doorway at the foot of the pyramid to explore the pharaoh\'s tomb inside!',
  position: [-2.3, 0, 3.4],
});

export const infoPointsInZone = (zone: ZoneId) => INFO_POINTS.filter((p) => p.zone === zone);

export const artifactsInZone = (zone: ZoneId) => ARTIFACTS.filter((a) => a.zone === zone);
