import { SeedProducts } from "./schema";

export const dataProducts: SeedProducts = [
  {
    name: "Premium Matcha Latte",
    slug: "premium-matcha-latte",
    price: 75000,
    imageUrl: "https://example.com/images/products/premium-matcha-latte.jpg",
    description:
      "A smooth and vibrant Japanese matcha latte blend, crafted for a rich umami taste with natural sweetness. Perfect for daily energy and focus.",
    category: "matcha",
    stock: 120,
    tags: ["matcha", "latte", "premium", "healthy", "instant"],
  },
  {
    name: "Roasted Hojicha Latte",
    slug: "roasted-hojicha-latte",
    price: 70000,
    imageUrl: "https://example.com/images/products/roasted-hojicha-latte.jpg",
    description:
      "Made from roasted Japanese green tea leaves, this hojicha latte offers a nutty, earthy flavor with low caffeine—ideal for evening relaxation.",
    category: "tea",
    stock: 85,
    tags: ["hojicha", "latte", "roasted", "natural"],
  },
  {
    name: "Sakura Latte",
    slug: "sakura-latte",
    price: 80000,
    imageUrl: "https://example.com/images/products/sakura-latte.jpg",
    description:
      "A delicate blend inspired by Japanese cherry blossoms, combining floral notes with creamy latte texture for a refreshing, elegant drink.",
    category: "latte",
    stock: 60,
    tags: ["sakura", "latte", "floral", "seasonal"],
  },
  {
    name: "Taro Latte",
    slug: "taro-latte",
    price: 65000,
    imageUrl: "https://example.com/images/products/taro-latte.jpg",
    description:
      "A sweet and creamy taro latte powder, naturally purple and packed with comforting flavor. A fun twist on traditional tea lattes.",
    category: "latte",
    stock: 100,
    tags: ["taro", "latte", "sweet", "colorful"],
  },
  {
    name: "Red Velvet Latte",
    slug: "red-velvet-latte",
    price: 75000,
    imageUrl: "https://example.com/images/products/red-velvet-latte.jpg",
    description:
      "A bold and indulgent red velvet latte blend, combining cocoa richness with smooth creaminess. Perfect for dessert lovers.",
    category: "latte",
    stock: 95,
    tags: ["red velvet", "latte", "dessert", "indulgent"],
  },
];
