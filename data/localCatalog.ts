import Items from "../components/Util/Items";
import { apiProductsType, itemType } from "../context/cart/cart-types";

const localImages = [
  "/bg-img/curly_hair_girl-1.jpg",
  "/bg-img/curly_hair_white-1.jpg",
  "/bg-img/monigote.jpg",
  "/bg-img/curly_hair_girl-1_mobile.jpg",
];

const categoryForProduct = (id: number) => {
  if (id <= 8) return "women";
  if (id <= 16) return "men";
  return "bags";
};

export const products: apiProductsType[] = (Items as itemType[]).map(
  (item, index) => ({
    ...item,
    image1: localImages[index % localImages.length],
    image2: localImages[(index + 1) % localImages.length],
    img1: localImages[index % localImages.length],
    img2: localImages[(index + 1) % localImages.length],
    detail: `${item.name} made for everyday wear with a comfortable, easy fit.`,
    categoryName: categoryForProduct(item.id),
    category: { name: categoryForProduct(item.id) },
    createdAt: new Date(2024, 0, 24 - index).toISOString(),
  })
);

export const toItem = (product: apiProductsType): itemType => ({
  id: product.id,
  name: product.name,
  price: product.price,
  detail: product.detail,
  img1: product.img1 || product.image1,
  img2: product.img2 || product.image2,
  categoryName: product.categoryName || product.category?.name,
});

export const findProduct = (id: string) =>
  products.find((product) => product.id === Number(id));

export const productsForCategory = (category: string) => {
  if (category === "new-arrivals") return products.slice(0, 10);
  return products.filter((product) => product.categoryName === category);
};

export const searchProducts = (query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  return products.filter((product) =>
    product.name.toLowerCase().includes(normalizedQuery)
  );
};
