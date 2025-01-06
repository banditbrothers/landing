export type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export const products: Product[] = [
  {
    id: "abstract",
    name: "Be Colour - Fool",
    description: "Abstract",
    image: "/products/abstract.webp",
  },
  {
    id: "alien",
    name: "Gimme some space",
    description: "Alien",
    image: "/products/alien.webp",
  },
  {
    id: "bolt",
    name: "Awestruck",
    description: "Bolt",
    image: "/products/bolt.webp",
  },
  {
    id: "cat-trippy",
    name: "Meow meow!!",
    description: "Cat Trippy",
    image: "/products/cat-trippy.webp",
  },
  {
    id: "ghost",
    name: "Un - Boo - lievable",
    description: "Ghost",
    image: "/products/ghost.webp",
  },
  {
    id: "japanese",
    name: "Moushi Moushi",
    description: "Japanese",
    image: "/products/japanese.webp",
  },
  {
    id: "tea",
    name: "Chai Pilaaa doo",
    description: "Tea",
    image: "/products/tea.webp",
  },
];
