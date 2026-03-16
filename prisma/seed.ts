import { PrismaClient, UserRole } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
    // Cleanup in reverse dependency order
    await prisma.orderItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();

    // Admin
    await prisma.user.create({
        data: {
            name: "ADMIN",
            email: "admin@pixelmarket.com",
            role: UserRole.ADMIN,
        },
    });

    // Sellers
    async function createSeller(productCategory: string, storeName: string) {
        return prisma.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                role: UserRole.USER,
                stores: {
                    create: {
                        name: storeName,
                        products: {
                            create: Array.from({ length: 10 }, () => ({
                                name: faker.commerce.productName(),
                                price: parseInt(faker.commerce.price({ min: 1000, max: 5000 })),
                                description: faker.commerce.productDescription(),
                                category: productCategory,
                                stock: faker.number.int({ min: 5, max: 50 }),
                                images: [faker.image.url({ width: 300, height: 300 })],
                            })),
                        },
                    },
                },
            },
            include: { stores: { include: { products: true } } },
        });
    }

    const seller1 = await createSeller("Tech", "The Gadget Cave");
    const seller2 = await createSeller("Design", "Creative Assets Co");

    const store1 = seller1.stores[0];
    const store2 = seller2.stores[0];

    // Buyer
    const buyer = await prisma.user.create({
        data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            role: UserRole.USER,
        },
    });

    // Orders — each order is tied to a specific store
    const store1Products = store1.products.slice(0, 3);
    const store2Products = store2.products.slice(0, 2);

    await prisma.order.create({
        data: {
            userId: buyer.id,
            storeId: store1.id,
            storeName: store1.name,
            isPaid: true,
            totalPrice: store1Products.reduce((sum, p) => sum + p.price, 0),
            orderItems: {
                create: store1Products.map((p) => ({
                    price: p.price,
                    productName: p.name,
                    quantity: 1,
                    product: { connect: { id: p.id } },
                })),
            },
        },
    });

    await prisma.order.create({
        data: {
            userId: buyer.id,
            storeId: store2.id,
            storeName: store2.name,
            isPaid: false,
            totalPrice: store2Products.reduce((sum, p) => sum + p.price, 0),
            orderItems: {
                create: store2Products.map((p) => ({
                    price: p.price,
                    productName: p.name,
                    quantity: 1,
                    product: { connect: { id: p.id } },
                })),
            },
        },
    });

    // Reviews — buyer reviews the purchased products from store 1
    for (const product of store1Products) {
        await prisma.review.create({
            data: {
                userId: buyer.id,
                productId: product.id,
                rating: faker.number.int({ min: 3, max: 5 }),
                comment: faker.lorem.sentence(),
            },
        });
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());