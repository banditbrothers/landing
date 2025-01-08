export type Product = {
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

export const products: Product[] = [
  {
    id: "abstract",
    name: "Be Colour - Fool",
    description:
      "A vibrant explosion of colors featuring playful animated characters dancing across the fabric.",
    image: "/products/abstract.webp",
    price: 250,
  },
  {
    id: "alien",
    name: "Gimme some space",
    description: "Alien",
    image: "/products/alien.webp",
    price: 250,
  },
  {
    id: "bolt",
    name: "Awestruck",
    description: "Bolt",
    image: "/products/bolt.webp",
    price: 250,
  },
  {
    id: "cat-trippy",
    name: "Meow meow!!",
    description: "Cat Trippy",
    image: "/products/cat-trippy.webp",
    price: 250,
  },
  {
    id: "ghost",
    name: "Un - Boo - lievable",
    description: "Ghost",
    image: "/products/ghost.webp",
    price: 250,
  },
  {
    id: "japanese",
    name: "Moushi Moushi",
    description: "Japanese",
    image: "/products/japanese.webp",
    price: 250,
  },
  {
    id: "tea",
    name: "Chai Pilaaa doo",
    description: "Tea",
    image: "/products/tea.webp",
    price: 250,
  },
];
