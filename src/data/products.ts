import { Product } from "@/types/product";

/** Size id for products that come in one size (bandanas, square bandanas) */
export const DEFAULT_SIZE = "one-size";

export const PRODUCTS: Product[] = [
  {
    id: "bandana",
    name: "Tube Bandana",
    description: [
      "Stay stylish and protected with our premium bandanas—designed for bikers, runners, and outdoor adventurers.",
      "Made from breathable, lightweight fabric, these versatile headwraps offer UV protection, sweat absorption, and dust resistance, making them ideal for long rides and outdoor activities.",
      "Wear it as a headband, face mask, neck gaiter, wristband, or helmet liner. Quick-drying and stretchable for a comfortable fit. Perfect for bikers, cyclists, hikers, and everyday casual wear.",
    ],
    seoTitle: "Tube Bandanas for Biking, Running & Outdoors",
    about: [
      "A tube bandana is the most useful piece of gear you'll own for the road. One seamless loop of 4-way stretch Quick-Dri DryFit fabric you can wear as a face cover against dust and sun, a neck gaiter, a headband, a helmet liner, a wristband, or a beanie on cold mornings: twelve ways and counting.",
      "Riders wear ours under the helmet to keep sweat out of their eyes and dust out of their lungs on long highway stretches and Ladakh passes. Runners and cyclists use them to wick sweat and block UV on hot Indian summer mornings, and trekkers keep one around the neck for wind and sunburn. The fabric is lightweight and breathable, and dries fast.",
      'Every Bandit Brothers bandana is printed edge to edge with an original design, made in India and sized to fit most heads (9.5" x 20"). Pick a print that matches your bike, your crew or your mood, and add a balaclava or a square bandana in the same design for the full kit.',
    ],
    basePrice: 350,
    sizes: [DEFAULT_SIZE],
    sizeLabels: { [DEFAULT_SIZE]: "One Size" },
    material: "4 Way Quick-Dri DryFit Fabric",
    dimensions: { [DEFAULT_SIZE]: '9.5" (W) x 20" (L)' },
    baseImages: {
      mockup: [
        "https://bandit-brothers-s3-storage.s3.ap-south-1.amazonaws.com/bandana/shinobi-red/mockup-1750426888985.webp",
      ],
    },
  },
  {
    id: "balaclava",
    name: "Balaclava",
    description: [
      "Stay stylish and protected with our premium balaclavas — designed for bikers and outdoor adventurers.",
      "Made from breathable, lightweight fabric, these versatile headwraps offer UV protection, sweat absorption, and dust resistance, making them ideal for long rides and outdoor activities.",
      "Wear it as a headband, face mask or helmet liner. Quick-drying and stretchable for a comfortable fit. Perfect for bikers, cyclists, hikers, and everyday casual wear.",
    ],
    seoTitle: "Balaclavas for Bike Riding, Helmet Liner & Face Mask",
    about: [
      "A balaclava covers your head, face and neck in one piece, which makes it the go-to helmet liner for bike riders. It keeps the inside of your helmet clean, soaks up sweat before it reaches your eyes, and blocks dust, wind and sun on long rides.",
      "Ours are cut from the same 4-way stretch Quick-Dri DryFit fabric as our bandanas, so they stay breathable in Indian summers and light enough to layer in winter. Wear it as a full face mask, pull it down into a neck gaiter, or roll it up as a cap under the helmet.",
      "Balaclavas come in two sizes: Small for 52 to 59 cm head circumference (and helmets XS to M) and Large for 60 to 67 cm. Every print is an original Bandit Brothers design, made in India, and most come in matching tube and square bandanas.",
    ],
    basePrice: 450,
    sizes: ["small", "large"],
    sizeLabels: { small: "Small - 52 to 59cm", large: "Large - 60 to 67cm" },
    material: "4 Way Quick-Dri DryFit Fabric",
    dimensions: { small: '9" (W) x 16" (L)', large: '10.5" (W) x 16" (L)' },
    baseImages: {
      mockup: [
        "https://bandit-brothers-s3-storage.s3.ap-south-1.amazonaws.com/balaclava/out-of-words/mockup-1750364019457.webp",
      ],
    },
  },
  {
    id: "square-bandana",
    name: "Square Bandana",
    description: [
      "Add a bold twist to your look with our versatile Kerchief styled square pocket bandanas.",
      "Perfect for bikers, travelers, or everyday style, these lightweight bandanas can be worn as a headwrap, neck scarf, wrist tie, or even a mask.",
      "Made from soft, breathable fabric, they combine comfort with vibrant prints that stand out anywhere.",
    ],
    seoTitle: "Square Bandanas & Printed Kerchiefs",
    about: [
      'The square bandana is the classic kerchief: a 22" x 22" printed square you can fold into a headwrap, tie around your neck, knot on your wrist, hang from a back pocket or wear across your face on a dusty ride.',
      "We print ours on soft, breathable Quick-Dri DryFit fabric instead of stiff cotton, so they're comfortable against the skin and dry fast. They're a favourite with bikers, travellers and anyone who wants one bold piece to finish an outfit.",
      "Each square bandana carries an original Bandit Brothers print, made in India. Most designs also come as a tube bandana or balaclava if you want the whole set.",
    ],
    basePrice: 350,
    sizes: [DEFAULT_SIZE],
    sizeLabels: { [DEFAULT_SIZE]: "One Size" },
    material: "4 Way Quick-Dri DryFit Fabric",
    dimensions: { [DEFAULT_SIZE]: '22" (W) x 22" (L)' },
    baseImages: {
      mockup: [
        "https://bandit-brothers-s3-storage.s3.ap-south-1.amazonaws.com/square-bandana/featured-square-bandana.jpeg",
      ],
    },
  },
  {
    id: "jersey",
    name: "Jersey",
    description: [
      "Elevate your performance and style with our premium athletic jerseys designed for the modern athlete.",
      "Perfect for training, sports, or casual wear, these lightweight jerseys feature moisture-wicking technology to keep you cool and comfortable during any activity.",
      "Made from quick-dry DryFit fabric, they combine superior comfort with bold, eye-catching designs that make a statement on and off the field.",
    ],
    basePrice: 899,
    isActive: false,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    material: "4 Way Quick-Dri DryFit Fabric",
    dimensions: {},
    baseImages: {
      mockup: ["https://bandit-brothers-s3-storage.s3.ap-south-1.amazonaws.com/jersey/featured-jersey-image.webp"],
    },
  },
];
export const PRODUCTS_OBJ = PRODUCTS.reduce(
  (acc, product) => {
    const { id, ...rest } = product;
    return { ...acc, [id]: rest };
  },
  {} as Record<string, Omit<(typeof PRODUCTS)[number], "id">>
);

// Product types shown on the storefront. Use PRODUCTS/PRODUCTS_OBJ for lookups (old orders reference inactive ones)
export const ACTIVE_PRODUCTS = PRODUCTS.filter(p => p.isActive !== false);
export const isProductActive = (productId: string) => ACTIVE_PRODUCTS.some(p => p.id === productId);
