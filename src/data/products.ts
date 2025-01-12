export type Design = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
};

export const standardDescription = {
  Dimension: `9" x 20"`,
  Material: "4 Way Quick-Dri DryFit Fabric",
};

export const designs: Design[] = [
  {
    id: "abstract",
    name: "Be Color - Fool",
    description:
      "An explosion of quirky fun! This print features a mash-up of vibrant animated characters that bring out your playful side. Perfect for standing out in any crowd!",
    image: "/products/abstract.webp",
    price: 250,
  },
  {
    id: "alien",
    name: "Gimme Some Space",
    description:
      "Beam me up, but make it stylish! This print features a cheeky UFOs cruising through a galaxy of twinkling stars, ready to abduct your sense of humor. A quirky cosmic vibe that's truly out of this world!",
    image: "/products/alien.webp",
    price: 250,
  },
  {
    id: "bolt",
    name: "Awestruck",
    description:
      "Feel the power of Awestruck! This thundering print brings bold red lightning bolts crackling, igniting energy with every glance. Perfect for those who live life on full charge!",
    image: "/products/fire-bolt.webp",
    price: 250,
  },
  {
    id: "cat-trippy",
    name: "Meow Meow!!",
    description:
      "Get whiskered away with this trippy feline vibe! A funky cat design with hypnotic colors, perfect for those who love a dose of quirky cool. Meow-some style guaranteed!",
    image: "/products/cat-trippy.webp",
    price: 250,
  },
  {
    id: "ghost",
    name: "Un - Boo - lievable",
    description:
      "Say hello to Un-boo-lievable! Adorably spooked ghosts bring a playful, haunting charm. A ghostly design that' frightfully fun!",
    image: "/products/ghost.webp",
    price: 250,
  },
  {
    id: "japanese",
    name: "Mooshi Mooshi",
    description:
      "Unleash your inner ninja with this fiery red head-wrap that screams stealth and style! Perfect for your next mission—whether it's braving the wild or dodging your neighbor's questions about your weekend. This isn't just a piece of fabric; it's your passport to awesomeness. Wear it like a ninja, own it like a bandit!",
    image: "/products/japanese.webp",
    price: 250,
  },
  {
    id: "tea",
    name: "Chai Pilaaa Doo",
    description:
      "As refreshing as your first sip, this print brews the timeless joy of tea with a splash of style. Perfect for tea lovers who wear their chai pride!",
    image: "/products/tea.webp",
    price: 250,
  },
  {
    id: "color-wave",
    name: "Psychedelic Chaos",
    description:
      "A swirling vortex of vivid colors and abstract patterns, this design screams energy and boldness. Perfect for making a vibrant and unique statement!",
    image: "/products/color-wave.webp",
    price: 250,
  },
];

export const designsObject = designs.reduce((acc, product) => {
  const { id, ...rest } = product;
  return { ...acc, [id]: rest };
}, {} as Record<string, Omit<(typeof designs)[number], "id">>);
