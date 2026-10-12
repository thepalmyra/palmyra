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
    id: "jersey",
    name: "Palmyra Sports Jersey",
    price: 799,
    category: "Sportswear",
    description:
      "A sports-inspired jersey designed for movement and everyday style.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Red"],
  },
  {
    id: "headband-scarf",
    name: "Palmyra Headband / Scarf",
    price: 299,
    category: "Accessories",
    description:
      "A versatile accessory for sports, workouts and everyday styling.",
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=85",
    ],
    sizes: ["One Size"],
    colors: ["Black"],
  },
];