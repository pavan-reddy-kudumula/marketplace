import { PrismaClient, UserRole } from "@prisma/client";
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

async function main() {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
        data: {
            name: "ADMIN",
            email: "admin@pixelmarket.com",
            role: UserRole.ADMIN
        },
    })

    async function createSeller(productCategory: string, storeName: string) {
        await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                role: UserRole.USER,
                store: {
                    create: {
                        name: storeName,
                        products: {
                            create: Array.from({ length: 10 }, () => ({
                                name: faker.commerce.product(),
                                price: parseInt(faker.commerce.price({ min: 1000, max: 5000 })),
                                description: faker.commerce.productDescription(),
                                category: productCategory,
                                images: [faker.image.url({width: 300, height: 300})]
                            }))
                        }
                    }
                }
            }
        })
    }

    await createSeller("Tech", "The Gadget Cave")
    await createSeller("Design", "Creative Assets Co")

    const products = await prisma.product.findMany({ take: 6 })
    if (products.length === 0) {
        throw new Error("No products found to seed order items")
    }

    const order1Products = products.slice(0, 4)
    const order2Products = products.slice(4, 6)

    await prisma.user.create({
        data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            role: UserRole.USER,
            orders: {
                create: [
                    {
                        totalPrice: order1Products.reduce((sum, item) => sum + item.price, 0),
                        orderItems: {
                            create: order1Products.map((item) => ({
                                price: item.price,
                                quantity: 1,
                                product: {
                                    connect: { id: item.id }
                                }
                            }))
                        }
                    },
                    {
                        totalPrice: order2Products.reduce((sum, item) => sum + item.price, 0),
                        orderItems: {
                            create: order2Products.map((item) => ({
                                price: item.price,
                                quantity: 1,
                                product: {
                                    connect: { id: item.id }
                                }
                            }))
                        }
                    },
                ]
            }
        }
    })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())