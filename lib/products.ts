export type Product = {
  id: string;
  name: string;
  price: number;
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
      "A versatile sports cap for everyday wear and outdoor activities.",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85",
    ],
    sizes: ["One Size"],
    colors: ["Black", "White"],
  },
  {
id: "sports-bag",
name: "Palmyra Drawstring Bag",
price: 499,
category: "Accessories",
description:
  "Carry your essentials in the Palmyra Drawstring Bag. A lightweight, versatile bag available in five colors.",
image: "/products/green.jpg",
images: [
  "/products/green.jpg",
  "/products/tan.jpg",
  "/products/navy-blue.jpg",
  "/products/maroon.jpg",
  "/products/black.jpg",
],
sizes: ["One Size"],
colors: ["Green", "Tan", "Navy Blue", "Maroon", "Black"],
colorImages: {
  Green: "/products/green.jpg",
  Tan: "/products/tan.jpg",
  "Navy Blue": "/products/navy-blue.jpg",
  Maroon: "/products/maroon.jpg",
  Black: "/products/black.jpg",
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