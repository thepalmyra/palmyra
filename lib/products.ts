export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  colorImages?: Record<string, string>;
};

export const products: Product[] = [
  {
    id: "cap",
    name: "Palmyra Sports Cap",
    price: 499,
    category: "Accessories",
    description:
      "A versatile Palmyra sports cap for everyday wear, training and outdoor activities.",
    image: "/products/cap-black.jpg",
    images: [
      "/products/cap-black.jpg",
      "/products/cap-green.jpg",
      "/products/cap-maroon.jpg",
      "/products/cap-navy-blue.jpg",
      "/products/cap-red.jpg",
      "/products/cap-tan.jpg",
    ],
    sizes: ["One Size"],
    colors: ["Black", "Green", "Maroon", "Navy Blue", "Red", "Tan"],
    colorImages: {
      Black: "/products/cap-black.jpg",
      Green: "/products/cap-green.jpg",
      Maroon: "/products/cap-maroon.jpg",
      "Navy Blue": "/products/cap-navy-blue.jpg",
      Red: "/products/cap-red.jpg",
      Tan: "/products/cap-tan.jpg",
    },
  },
  {
    id: "sports-bag",
    name: "Palmyra Drawstring Bag",
    price: 499,
    originalPrice: 599,
    category: "Accessories",
    description:
      "Carry your essentials in the Palmyra Drawstring Bag. A lightweight, versatile bag available in five colors.",
    image: "/products/bag-black.jpg",
    images: [
      "/products/bag-black.jpg",
      "/products/bag-green.jpg",
      "/products/bag-maroon.jpg",
      "/products/bag-navy-blue.jpg",
      "/products/bag-tan.jpg",
    ],
    sizes: ["One Size"],
    colors: ["Black", "Green", "Maroon", "Navy Blue", "Tan"],
    colorImages: {
      Black: "/products/bag-black.jpg",
      Green: "/products/bag-green.jpg",
      Maroon: "/products/bag-maroon.jpg",
      "Navy Blue": "/products/bag-navy-blue.jpg",
      Tan: "/products/bag-tan.jpg",
    },
  },
  {
  id: "signature-raglan-tee",
  name: "Palmyra Signature Raglan Tee",
  price: 699,
  category: "Sportswear",
  description:
    "Meet the Palmyra Signature Raglan Tee. Made from 100% cotton at 180 GSM, this long-sleeve raglan features contrasting sleeves and a classic fit for everyday comfort and streetwear style. Free delivery is included in the listed price.",
  image: "/products/tshirt-black-white.jpg",
  images: [
    "/products/tshirt-black-white.jpg",
    "/products/tshirt-black-ash.jpg",
    "/products/tshirt-white-black.jpg",
  ],
  sizes: ["S", "M", "L", "XL"],
  colors: ["Black + White", "Black + Ash", "White + Black"],
  colorImages: {
    "Black + White": "/products/tshirt-black-white.jpg",
    "Black + Ash": "/products/tshirt-black-ash.jpg",
    "White + Black": "/products/tshirt-white-black.jpg",
  },
},
{
  id: "unisex-headband",
  name: "Palmyra Unisex Sports Headband",
  price: 249,
  category: "Accessories",
  description:
    "A versatile unisex sports headband designed for workouts, running and everyday wear. Finished in white for a clean, minimal Palmyra look.",
  image: "/products/headband-white.jpg",
  images: ["/products/headband-white.jpg"],
  sizes: ["One Size"],
  colors: ["White"],
},
];