import { PrismaClient, UserRole } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
    faker.seed(42);

    // Cleanup in reverse dependency order
    await prisma.orderItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.verificationToken.deleteMany();

    const admin = await prisma.user.create({
        data: {
            name: "ADMIN",
            email: "admin@pixelmarket.com",
            role: UserRole.ADMIN,
        },
    });

    const seller = await prisma.user.create({
        data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            role: UserRole.USER,
            stores: {
                create: {
                    name: "The Gadget Cave",
                    products: {
                        create: [
                            {
                                name: "Wireless Headphones",
                                price: 3999,
                                description: "Comfortable wireless headphones with noise isolation.",
                                category: "Tech",
                                stock: 24,
                                images: [faker.image.url({ width: 300, height: 300 })],
                            },
                            {
                                name: "Portable Speaker",
                                price: 2499,
                                description: "Compact Bluetooth speaker with rich sound.",
                                category: "Tech",
                                stock: 18,
                                images: [faker.image.url({ width: 300, height: 300 })],
                            },
                        ],
                    },
                },
            },
        },
        include: { stores: { include: { products: true } } },
    });

    const store = seller.stores[0];
    const [firstProduct, secondProduct] = store.products;

    const buyer = await prisma.user.create({
        data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress({ useFullAddress: true }),
            role: UserRole.USER,
        },
    });

    const order = await prisma.order.create({
        data: {
            userId: buyer.id,
            storeId: store.id,
            storeName: store.name,
            isPaid: true,
            phone: buyer.phone ?? "",
            address: buyer.address ?? "",
            totalPrice: firstProduct.price + secondProduct.price,
            orderItems: {
                create: [
                    {
                        price: firstProduct.price,
                        productName: firstProduct.name,
                        quantity: 1,
                        productId: firstProduct.id,
                    },
                    {
                        price: secondProduct.price,
                        productName: secondProduct.name,
                        quantity: 1,
                        productId: secondProduct.id,
                    },
                ],
            },
        },
    });

    await prisma.review.create({
        data: {
            userId: buyer.id,
            productId: firstProduct.id,
            rating: 5,
            comment: "Great sound quality and fast delivery.",
        },
    });

    console.log({
        adminId: admin.id,
        sellerId: seller.id,
        buyerId: buyer.id,
        storeId: store.id,
        orderId: order.id,
    });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());