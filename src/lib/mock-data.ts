import type { Product } from '@/types';

const products: Product[] = [
  {
    id: "prod_001",
    image: "https://placehold.co/600x600.png",
    price: "₵150",
    description: "Men's Classic Leather Sneakers",
    sellerId: "233123456789",
  },
  {
    id: "prod_002",
    image: "https://placehold.co/600x600.png",
    price: "₵250",
    description: "Wireless Noise-Cancelling Headphones",
    sellerId: "233123456789",
  },
  {
    id: "prod_003",
    image: "https://placehold.co/600x600.png",
    price: "₵80",
    description: "Handwoven Kente Cloth Scarf",
    sellerId: "233123456789",
  },
  {
    id: "prod_004",
    image: "https://placehold.co/600x600.png",
    price: "₵450",
    description: "Smart Fitness Watch with GPS",
    sellerId: "233123456789",
  },
  {
    id: "prod_005",
    image: "https://placehold.co/600x600.png",
    price: "₵120",
    description: "Organic Shea Butter Body Cream",
    sellerId: "233123456789",
  },
  {
    id: "prod_006",
    image: "https://placehold.co/600x600.png",
    price: "₵300",
    description: "Portable Bluetooth Speaker",
    sellerId: "233123456789",
  },
  {
    id: "prod_007",
    image: "https://placehold.co/600x600.png",
    price: "₵95",
    description: "Stylish Ankara Print Backpack",
    sellerId: "233123456789",
  },
  {
    id: "prod_008",
    image: "https://placehold.co/600x600.png",
    price: "₵220",
    description: "Modern Stainless Steel Water Bottle",
    sellerId: "233123456789",
  },
];

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return products.filter(product => product.sellerId === sellerId);
}
