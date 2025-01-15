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
    id: "gimme-some-space",
    name: "Gimme Some Space",
    description:
      "Beam me up, but make it stylish! This print features a cheeky UFOs cruising through a galaxy of twinkling stars, ready to abduct your sense of humor. A quirky cosmic vibe that's truly out of this world!",
    image: "/designs/gimme-some-space.webp",
    price: 250,
  },
  {
    id: "awestruck",
    name: "Awestruck",
    description:
      "Feel the power of Awestruck! This thundering print brings bold red lightning bolts crackling, igniting energy with every glance. Perfect for those who live life on full charge!",
    image: "/designs/awestruck.webp",
    price: 250,
  },
  {
    id: "meow-meow",
    name: "Meow Meow!!",
    description:
      "Get whiskered away with this trippy feline vibe! A funky cat design with hypnotic colors, perfect for those who love a dose of quirky cool. Meow-some style guaranteed!",
    image: "/designs/meow-meow.webp",
    price: 250,
  },
  {
    id: "mooshi-mooshi",
    name: "Mooshi Mooshi",
    description:
      "Unleash your inner ninja with this fiery red head-wrap that screams stealth and style! Perfect for your next mission—whether it's braving the wild or dodging your neighbor's questions about your weekend. This isn't just a piece of fabric; it's your passport to awesomeness. Wear it like a ninja, own it like a bandit!",
    image: "/designs/mooshi-mooshi.webp",
    price: 250,
  },
  {
    id: "chai-pila-do",
    name: "Chai Pilaaa Doo",
    description:
      "As refreshing as your first sip, this print brews the timeless joy of tea with a splash of style. Perfect for tea lovers who wear their chai pride!",
    image: "/designs/chai-pila-do.webp",
    price: 250,
  },
  {
    id: "psychedelic-chaos",
    name: "Psychedelic Chaos",
    description:
      "A swirling vortex of vivid colors and abstract patterns, this design screams energy and boldness. Perfect for making a vibrant and unique statement!",
    image: "/designs/psychedelic-chaos.webp",
    price: 250,
  },
  {
    id: "holy-funk",
    name: "Holy Funk",
    description:
      "Dive into a vibrant maze of liquid neon trails, oozing with quirky charm. Each swirl feels like a dance of funky energy on black. Perfect for anyone who loves bold, standout vibes!",
    image: "/designs/holy-funk.webp",
    price: 250,
  },
  {
    id: "soda-lightful",
    name: "Soda-lightful",
    description:
      "Quench your style thirst with this fizzy explosion of soda bottles! A bubbly, fun design perfect for those who bring the pop to every party. Stay cool, stay comfy, stay carbonated!",
    image: "/designs/soda-lightful.webp",
    price: 250,
  },
  {
    id: "un-boo-lievable",
    name: "Un-Boo-lievable",
    description:
      "Say hello to Un-boo-lievable! Adorably spooked ghosts bring a playful, haunting charm. A ghostly design that' frightfully fun!",
    image: "/designs/un-boo-lievable.webp",
    price: 250,
  },
  {
    id: "tick-tick-boom",
    name: "Tick Tick Boom",
    description:
      "A quirky mix of speed and chaos, this neck gaiter revs up your style with explosive flair. Fun, bold, and utterly unique—it's the perfect gear for thrill junkies!",
    image: "/designs/tick-tick-boom.webp",
    price: 250,
  },
  {
    id: "fin-tastic",
    name: "Fin-tastic",
    description:
      "Make waves with this shark fin inspired bandana! Featuring sleek fins slicing through the waters, it's perfect for bold adventurers. Dive into style with Bandit Brothers' ultimate neckwear!",
    image: "/designs/fin-tastic.webp",
    price: 250,
  },
  {
    id: "out-of-words",
    name: "Out of Words",
    description:
      "A bold, chaotic blend of grunge textures and rebellious scribbles. Cryptic phrases collide in layered graffiti-style mayhem. Perfect for those who embrace edgy, unapologetic individuality.",
    image: "/designs/out-of-words.webp",
    price: 250,
  },
  {
    id: "dolphin-ately-cool",
    name: "Dolphin-ately Cool",
    description:
      "Make a splash with this dolphin-inspired bandana! Featuring playful oceanic swirls and sleek dolphins riding the waves, it's like carrying the spirit of the sea wherever you go. Dive into adventure with Bandit Brothers' unique style!",
    image: "/designs/dolphin-ately-cool.webp",
    price: 250,
  },
  {
    id: "only-confusion",
    name: "Only Confusion",
    description:
      "Unleash your inner detective with this fiery red bandana, riddled with question marks and a mysterious bat-eared silhouette. It's a puzzle for your face, perfect for those who thrive on intrigue and style. Rock it like a superhero solving fashion crimes!",
    image: "/designs/only-confusion.webp",
    price: 250,
  },
  {
    id: "another-one",
    name: "Another One",
    description:
      "Cheers to style! Party-ready and playful! This quirky bandana screams fun. Perfect for the bold and unique!",
    image: "/designs/another-one.webp",
    price: 250,
  },
  {
    id: "do-the-doodle-do",
    name: "Do The Doodle Do",
    description:
      "Wrap yourself in chaos with this doodle-packed bandana, bursting with wacky characters and funky colors! It's a wearable masterpiece that screams personality and charm. Perfect for turning heads and sparking conversations wherever you go!",
    image: "/designs/do-the-doodle-do.webp",
    price: 250,
  },
];

export const designsObject = designs.reduce((acc, product) => {
  const { id, ...rest } = product;
  return { ...acc, [id]: rest };
}, {} as Record<string, Omit<(typeof designs)[number], "id">>);
