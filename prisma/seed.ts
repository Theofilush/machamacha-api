import { prisma } from "../src/lib/prisma";
import { dataProducts } from "../src/modules/products/data";

async function main() {
  for (const product of dataProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });

    console.log(`🍵 ${product.name}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
