import { Design, DesignCategory, DesignColor, Product } from "@/types/product";

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
export const DESIGN_CATEGORIES_OBJ = DESIGN_CATEGORIES.reduce((acc, category) => {
  const { id, ...rest } = category;
  return { ...acc, [id]: rest };
}, {} as Record<DesignCategory, Omit<(typeof DESIGN_CATEGORIES)[number], "id">>);

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
export const DESIGN_COLOR_OBJ = DESIGN_COLORS.reduce((acc, color) => {
  const { id, ...rest } = color;
  return { ...acc, [id]: rest };
}, {} as Record<DesignColor, Omit<(typeof DESIGN_COLORS)[number], "id">>);

export const DESIGNS: Design[] = [
  {
    id: "gimme-some-space",
    name: "Gimme Some Space",
    colors: ["green", "purple", "black"],
    category: "character",
    tags: [],
  },
  {
    id: "awestruck",
    name: "Awestruck",
    colors: ["red", "black"],
    category: "pattern",
    tags: [],
  },
  {
    id: "meow-meow",
    name: "Meow Meow!!",
    colors: ["white", "green", "red", "orange"],
    category: "character",
    tags: [],
  },
  {
    id: "mooshi-mooshi",
    name: "Mooshi Mooshi",
    colors: ["red", "black", "white"],
    category: "texture",
    tags: [],
  },
  {
    id: "chai-pila-do",
    name: "Chai Pilaaa Doo",
    colors: ["yellow", "brown"],
    category: "pattern",
    tags: [],
  },
  {
    id: "psychedelic-chaos",
    name: "Psychedelic Chaos",
    colors: ["green", "black", "blue", "red", "yellow"],
    category: "graffiti",
    tags: [],
  },
  {
    id: "holy-funk",
    name: "Holy Funk",
    colors: ["blue", "orange", "pink", "black", "purple", "white"],
    category: "abstract",
    tags: [],
  },
  {
    id: "soda-lightful",
    name: "Soda-lightful",
    colors: ["red", "white"],
    category: "pattern",
    tags: [],
  },
  {
    id: "un-boo-lievable",
    name: "Un-Boo-lievable",
    colors: ["white", "black", "purple"],
    category: "pattern",
    tags: [],
  },
  {
    id: "tick-tick-boom",
    name: "Tick Tick Boom",
    colors: ["red", "yellow", "blue", "black", "orange"],
    category: "graphic",
    tags: [],
  },
  {
    id: "fin-tastic",
    name: "Fin-tastic",
    colors: ["blue", "white", "gray"],
    category: "pattern",
    tags: [],
  },
  {
    id: "out-of-words",
    name: "Out of Words",
    colors: ["black", "white", "gray"],
    category: "abstract",
    tags: [],
  },
  {
    id: "dolphin-ately-cool",
    name: "Dolphin-ately Cool",
    colors: ["blue", "white", "black"],
    category: "pattern",
    tags: [],
  },
  {
    id: "only-confusion",
    name: "Only Confusion",
    colors: ["red", "black", "white"],
    category: "character",
    tags: [],
  },
  {
    id: "another-one-iykyk",
    name: "Another One!!! (IYKYK)",
    colors: ["blue", "yellow", "white"],
    category: "pattern",
    tags: [],
  },
  {
    id: "do-the-doodle-do",
    name: "Do The Doodle Do",
    colors: ["blue", "green", "yellow", "red", "white", "pink", "black"],
    category: "graffiti",
    tags: [],
  },
  {
    id: "sketchy-business",
    name: "Sketchy Business",
    colors: ["white", "black", "yellow", "red", "blue", "orange", "pink"],
    category: "graffiti",
    tags: [],
  },
  {
    id: "dont-egg-nore-this",
    name: "Don't Egg-nore This",
    colors: ["yellow", "white", "black"],
    category: "pattern",
    tags: [],
  },
  {
    id: "ichiban-penguins",
    name: "Ichiban Penguins",
    colors: ["black", "pink", "blue", "yellow"],
    category: "pattern",
    tags: [],
  },
  {
    id: "akatsuki-allure",
    name: "Akatsuki Allure",
    colors: ["red", "black"],
    category: "anime",
    tags: [],
  },
  {
    id: "comic-craze",
    name: "Comic Craze",
    colors: ["red", "yellow", "blue", "black", "green", "brown"],
    category: "character",
    tags: [],
  },
  {
    id: "looks-fishy",
    name: "Looks Fishy",
    colors: ["red", "white"],
    category: "pattern",
    tags: [],
  },
  {
    id: "zero-g-style",
    name: "Zero-G Style",
    colors: ["red", "yellow", "blue", "white", "black"],
    category: "pattern",
    tags: [],
  },
  {
    id: "similie-metaphorically",
    name: "Similie Metaphorically",
    colors: ["yellow", "black", "blue"],
    category: "pattern",
    tags: [],
  },
  {
    id: "frog-it-about-it",
    name: "Frog-it about it",
    colors: ["green", "blue", "yellow", "black"],
    category: "pattern",
    tags: [],
  },
  {
    id: "tou-can-do-it",
    name: "Tou-Can Do It",
    colors: ["black", "pink", "yellow", "white"],
    category: "pattern",
    tags: [],
  },
];
export const DESIGNS_OBJ = DESIGNS.reduce((acc, product) => {
  const { id, ...rest } = product;
  return { ...acc, [id]: rest };
}, {} as Record<string, Omit<(typeof DESIGNS)[number], "id">>);


export const PRODUCTS: Product[] = [
  {
    id: "bandana",
    name: "Bandana",
    description: "A tube bandana fabric that can be worn around the neck or head.",
    basePrice: 300,
    sizes: ["one-size"],
    material: "4 Way Quick-Dri DryFit Fabric",
    dimensions: '9.5" x 20"',
  },
  {
    id: "balaclava",
    name: "Balaclava",
    description: "A balaclava is a mask bandana fabric that can be worn",
    basePrice: 600,
    sizes: ["one-size"],
    material: "4 Way Quick-Dri DryFit Fabric",
    dimensions: '9.5" x 20"',
  },
];
export const PRODUCTS_OBJ = PRODUCTS.reduce((acc, product) => {
  const { id, ...rest } = product;
  return { ...acc, [id]: rest };
}, {} as Record<string, Omit<(typeof PRODUCTS)[number], "id">>);
