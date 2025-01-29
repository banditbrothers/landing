export const standardDescription = {
  Dimension: `9" x 20"`,
  Material: "4 Way Quick-Dri DryFit Fabric",
};

export type Design = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  isBestSeller: boolean;
  colors: DesignColor[];
  category: DesignCategory;
  tags: string[];
};

export const DESIGN_COLORS = [
  {
    id: "red",
    name: "Red",
    hex: "#FF6B6B",
  },
  {
    id: "blue",
    name: "Blue",
    hex: "#4A90E2",
  },
  {
    id: "green",
    name: "Green",
    hex: "#50C878",
  },
  {
    id: "yellow",
    name: "Yellow",
    hex: "#FFD93D",
  },
  {
    id: "purple",
    name: "Purple",
    hex: "#9B6B9E",
  },
  {
    id: "pink",
    name: "Pink",
    hex: "#FFB5C5",
  },
  {
    id: "orange",
    name: "Orange",
    hex: "#FFA07A",
  },
  {
    id: "black",
    name: "Black",
    hex: "#444444",
  },
  {
    id: "white",
    name: "White",
    hex: "#FAFAFA",
  },
  {
    id: "brown",
    name: "Brown",
    hex: "#8B4513",
  },
  {
    id: "gray",
    name: "Gray",
    hex: "#9E9E9E",
  },
] as const;
export type DesignColor = (typeof DESIGN_COLORS)[number]["id"];
export const DESIGN_COLOR_OBJ = DESIGN_COLORS.reduce((acc, color) => {
  const { id, ...rest } = color;
  return { ...acc, [id]: rest };
}, {} as Record<DesignColor, Omit<(typeof DESIGN_COLORS)[number], "id">>);

export const DESIGN_CATEGORIES = [
  {
    id: "texture",
    name: "Texture",
  },
  {
    id: "pattern",
    name: "Pattern",
  },
  {
    id: "abstract",
    name: "Abstract",
  },
  {
    id: "graffiti",
    name: "Graffiti",
  },
  {
    id: "character",
    name: "Character",
  },
  {
    id: "anime",
    name: "Anime",
  },
  {
    id: "graphic",
    name: "Graphic",
  },
] as const;
export type DesignCategory = (typeof DESIGN_CATEGORIES)[number]["id"];
export const DESIGN_CATEGORIES_OBJ = DESIGN_CATEGORIES.reduce((acc, category) => {
  const { id, ...rest } = category;
  return { ...acc, [id]: rest };
}, {} as Record<DesignCategory, Omit<(typeof DESIGN_CATEGORIES)[number], "id">>);

export const DESIGNS: Design[] = [
  {
    id: "gimme-some-space",
    name: "Gimme Some Space",
    description:
      "Beam me up, but make it stylish! This print features a cheeky UFOs cruising through a galaxy of twinkling stars, ready to abduct your sense of humor. A quirky cosmic vibe that's truly out of this world!",
    image: "/designs/gimme-some-space.webp",
    price: 300,
    colors: ["green", "purple", "black"],
    category: "character",
    isBestSeller: true,
    tags: [],
  },
  {
    id: "awestruck",
    name: "Awestruck",
    description:
      "Feel the power of Awestruck! This thundering print brings bold red lightning bolts crackling, igniting energy with every glance. Perfect for those who live life on full charge!",
    image: "/designs/awestruck.webp",
    price: 300,
    colors: ["red", "black"],
    category: "pattern",
    isBestSeller: true,
    tags: [],
  },
  {
    id: "meow-meow",
    name: "Meow Meow!!",
    description:
      "Get whiskered away with this trippy feline vibe! A funky cat design with hypnotic colors, perfect for those who love a dose of quirky cool. Meow-some style guaranteed!",
    image: "/designs/meow-meow.webp",
    price: 300,
    colors: ["white", "green", "red", "orange"],
    category: "character",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "mooshi-mooshi",
    name: "Mooshi Mooshi",
    description:
      "Unleash your inner ninja with this fiery red head-wrap that screams stealth and style! Perfect for your next mission—whether it's braving the wild or dodging your neighbor's questions about your weekend. This isn't just a piece of fabric; it's your passport to awesomeness. Wear it like a ninja, own it like a bandit!",
    image: "/designs/mooshi-mooshi.webp",
    price: 300,
    colors: ["red", "black", "white"],
    category: "texture",
    isBestSeller: true,
    tags: [],
  },
  {
    id: "chai-pila-do",
    name: "Chai Pilaaa Doo",
    description:
      "As refreshing as your first sip, this print brews the timeless joy of tea with a splash of style. Perfect for tea lovers who wear their chai pride!",
    image: "/designs/chai-pila-do.webp",
    price: 300,
    colors: ["yellow", "brown"],
    category: "pattern",
    isBestSeller: true,
    tags: [],
  },
  {
    id: "psychedelic-chaos",
    name: "Psychedelic Chaos",
    description:
      "A swirling vortex of vivid colors and abstract patterns, this design screams energy and boldness. Perfect for making a vibrant and unique statement!",
    image: "/designs/psychedelic-chaos.webp",
    price: 300,
    colors: ["green", "black", "blue", "red", "yellow"],
    category: "graffiti",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "holy-funk",
    name: "Holy Funk",
    description:
      "Dive into a vibrant maze of liquid neon trails, oozing with quirky charm. Each swirl feels like a dance of funky energy on black. Perfect for anyone who loves bold, standout vibes!",
    image: "/designs/holy-funk.webp",
    price: 300,
    colors: ["blue", "orange", "pink", "black", "purple", "white"],
    category: "abstract",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "soda-lightful",
    name: "Soda-lightful",
    description:
      "Quench your style thirst with this fizzy explosion of soda bottles! A bubbly, fun design perfect for those who bring the pop to every party. Stay cool, stay comfy, stay carbonated!",
    image: "/designs/soda-lightful.webp",
    price: 300,
    colors: ["red", "white"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "un-boo-lievable",
    name: "Un-Boo-lievable",
    description:
      "Say hello to Un-boo-lievable! Adorably spooked ghosts bring a playful, haunting charm. A ghostly design that' frightfully fun!",
    image: "/designs/un-boo-lievable.webp",
    price: 300,
    colors: ["white", "black", "purple"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "tick-tick-boom",
    name: "Tick Tick Boom",
    description:
      "A quirky mix of speed and chaos, this bandana revs up your style with explosive flair. Fun, bold, and utterly unique—it's the perfect gear for thrill junkies!",
    image: "/designs/tick-tick-boom.webp",
    price: 300,
    colors: ["red", "yellow", "blue", "black", "orange"],
    category: "graphic",
    isBestSeller: true,
    tags: [],
  },
  {
    id: "fin-tastic",
    name: "Fin-tastic",
    description:
      "Make waves with this shark fin inspired bandana! Featuring sleek fins slicing through the waters, it's perfect for bold adventurers. Dive into style with Bandit Brothers' ultimate bandana!",
    image: "/designs/fin-tastic.webp",
    price: 300,
    colors: ["blue", "white", "gray"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "out-of-words",
    name: "Out of Words",
    description:
      "A bold, chaotic blend of grunge textures and rebellious scribbles. Cryptic phrases collide in layered graffiti-style mayhem. Perfect for those who embrace edgy, unapologetic individuality.",
    image: "/designs/out-of-words.webp",
    price: 300,
    colors: ["black", "white", "gray"],
    category: "abstract",
    isBestSeller: true,
    tags: [],
  },
  {
    id: "dolphin-ately-cool",
    name: "Dolphin-ately Cool",
    description:
      "Make a splash with this dolphin-inspired bandana! Featuring playful oceanic swirls and sleek dolphins riding the waves, it's like carrying the spirit of the sea wherever you go. Dive into adventure with Bandit Brothers' unique style!",
    image: "/designs/dolphin-ately-cool.webp",
    price: 300,
    colors: ["blue", "white", "black"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "only-confusion",
    name: "Only Confusion",
    description:
      "Unleash your inner detective with this fiery red bandana, riddled with question marks and a mysterious bat-eared silhouette. It's a puzzle for your face, perfect for those who thrive on intrigue and style. Rock it like a superhero solving fashion crimes!",
    image: "/designs/only-confusion.webp",
    price: 300,
    colors: ["red", "black", "white"],
    category: "character",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "another-one-iykyk",
    name: "Another One!!! (IYKYK)",
    description:
      "Cheers to style! Party-ready and playful! This quirky bandana screams fun. Perfect for the bold and unique!",
    image: "/designs/another-one-iykyk.webp",
    price: 300,
    colors: ["blue", "yellow", "white"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "do-the-doodle-do",
    name: "Do The Doodle Do",
    description:
      "Wrap yourself in chaos with this doodle-packed bandana, bursting with wacky characters and funky colors! It's a wearable masterpiece that screams personality and charm. Perfect for turning heads and sparking conversations wherever you go!",
    image: "/designs/do-the-doodle-do.webp",
    price: 300,
    colors: ["blue", "green", "yellow", "red", "white", "pink", "black"],
    category: "graffiti",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "sketchy-business",
    name: "Sketchy Business",
    description:
      "Wrap your face in a fiesta of fun with this zany, maze-crazy bandana! Perfect for when you want to stay incognito but still loud and proud. It's not just a Bandana—it's wearable art with attitude. Stay bold, stay bandit!",
    image: "/designs/sketchy-business.webp",
    price: 300,
    colors: ["white", "black", "yellow", "red", "blue", "orange", "pink"],
    category: "graffiti",
    isBestSeller: true,
    tags: [],
  },
  {
    id: "dont-egg-nore-this",
    name: "Don't Egg-nore This",
    description:
      "Start your day sunny-side up with this egg-cellent design! Perfect for cracking jokes or frying up some style—because you're too cool to scramble under pressure.",
    image: "/designs/dont-egg-nore-this.webp",
    price: 300,
    colors: ["yellow", "white", "black"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "ichiban-penguins",
    name: "Ichiban Penguins",
    description:
      "Dive into the chill with this penguin party bandana! A flock of funky, beaked buddies will keep you cool while looking ice-cold fabulous. Waddle you wear if not this?",
    image: "/designs/ichiban-penguins.webp",
    price: 300,
    colors: ["black", "pink", "blue", "yellow"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "akatsuki-allure",
    name: "Akatsuki Allure",
    description:
      "Channel your inner rogue ninja with this sleek, dark bandana featuring a pattern of iconic red clouds. Perfect for stealth missions, fandom pride, or just keeping the chill at bay in ultimate ninja style.",
    image: "/designs/akatsuki-allure.webp",
    price: 300,
    colors: ["red", "black"],
    category: "anime",
    isBestSeller: true,
    tags: [],
  },
  {
    id: "comic-craze",
    name: "Comic Craze",
    description:
      "Unleash your inner superhero with this action-packed, comic-inspired bandana! With bold characters and chaotic energy, it's your ultimate style power-up for every mission—heroic or mundane.",
    image: "/designs/comic-craze.webp",
    price: 300,
    colors: ["red", "yellow", "blue", "black", "green", "brown"],
    category: "character",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "looks-fishy",
    name: "Looks Fishy",
    description:
      "Dive into style with this jaw-some bandana! Featuring a frenzy of red shark silhouettes swimming across a crisp white sea, it's the perfect catch for any outfit. Shark your look up and stay fin-tastic all day long!",
    image: "/designs/looks-fishy.webp",
    price: 300,
    colors: ["red", "white"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "zero-g-style",
    name: "Zero-G Style",
    description:
      "Blast off in style with this stellar bandana! Featuring astronauts floating in a galaxy of fun, it's your ticket to space-age swagger. Perfect for keeping your vibe cosmic and your look out-of-this-world. 🚀✨",
    image: "/designs/zero-g-style.webp",
    price: 300,
    colors: ["red", "yellow", "blue", "white", "black"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "similie-metaphorically",
    name: "Similie Metaphorically",
    description:
      "Brighten your day with this smile-packed bandana! Overflowing with yellow grins and a splash of playful personality, it's your ticket to happiness on the go. Keep your vibe cheery and stay grin-stoppable!",
    image: "/designs/similie-metaphorically.webp",
    price: 300,
    colors: ["yellow", "black", "blue"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "frog-it-about-it",
    name: "Frog-it about it",
    description:
      "Let the design do all your thinking. Let your knees rest. Get ready to frog-et all your worries with this hilarious thinking frog bandana! It's a toad-ally fun way to show off your pondering side. 🐸",
    image: "/designs/frog-it-about-it.webp",
    price: 300,
    colors: ["green", "blue", "yellow", "black"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
  {
    id: "tou-can-do-it",
    name: "Tou-Can Do It",
    description:
      "Turn heads with this tou-can't-miss design! Perfect for adding a little tropical flair to your everyday adventures. Two can always play this stylish game!",
    image: "/designs/tou-can-do-it.webp",
    price: 300,
    colors: ["black", "pink", "yellow", "white"],
    category: "pattern",
    isBestSeller: false,
    tags: [],
  },
];

export const DESIGNS_OBJ = DESIGNS.reduce((acc, product) => {
  const { id, ...rest } = product;
  return { ...acc, [id]: rest };
}, {} as Record<string, Omit<(typeof DESIGNS)[number], "id">>);
