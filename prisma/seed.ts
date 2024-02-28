import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker/locale/ar";
import inquirer from "inquirer";

const prisma = new PrismaClient({ log: ["query"] });

const seed = async () => {
  const answers = (await inquirer.prompt([
    {
      type: "number",
      name: "stores",
      message: "How many stores do you want to add?",
      default: 2,
    },
    {
      type: "number",
      name: "categories",
      message: "How many categories do you want to add?",
      default: 20,
    },
    {
      type: "number",
      name: "products",
      message: "How many products do you want to add? (for each store)",
      default: 100,
    },
    {
      type: "input",
      name: "password",
      message: "Enter the defualt password for all users: ",
      default: "19451945",
    },
  ])) as {
    stores: number;
    categories: number;
    products: number;
    password: string;
  };

  await prisma.$transaction(
    async (tx) => {
      const hashedPassword = await hash("19451945", 10);
      const { id: adminId } = await tx.user.create({
        data: {
          email: "admin@value.app",
          name: "admin",
          password: hashedPassword,
          userType: "ADMIN",
        },
      });

      await tx.account.create({
        data: {
          userId: adminId,
          type: "credentials",
          provider: "credentials",
          providerAccountId: adminId,
        },
      });

      const { id: userId } = await tx.user.create({
        data: {
          email: "user@value.app",
          name: "user",
          password: hashedPassword,
          userType: "USER",
          addresses: {
            createMany: {
              data: [
                {
                  city: faker.location.city(),
                  lat: "" + faker.location.latitude(),
                  lng: "" + faker.location.longitude(),
                },
                {
                  city: faker.location.city(),
                  lat: "" + faker.location.latitude(),
                  lng: "" + faker.location.longitude(),
                },
              ],
            },
          },
        },
      });

      await tx.account.create({
        data: {
          userId: userId,
          type: "credentials",
          provider: "credentials",
          providerAccountId: userId,
        },
      });

      const { id: driverUserId } = await tx.user.create({
        data: {
          email: "driver@value.app",
          name: "driver",
          password: hashedPassword,
          userType: "DRIVER",
        },
      });

      await tx.account.create({
        data: {
          userId: driverUserId,
          type: "credentials",
          provider: "credentials",
          providerAccountId: driverUserId,
        },
      });

      const { id: driverId } = await tx.driver.create({
        data: {
          name: faker.person.firstName() + " " + faker.person.lastName(),
          carModel: faker.vehicle.model(),
          carPlate: faker.vehicle.vrm(),
          phoneNumber: faker.phone.number(),
        },
      });

      const categories: string[] = [];

    for (let i = 0; i < answers.categories; i++) {
  categories.push(
    (
      await tx.category.create({
        data: {
          name: faker.commerce.department(),
          categoryType: 'FARM', // Or 'REGULAR', depending on your logic
        },
      })
    ).id,
  );
}


      for (let j = 0; j < answers.stores; j++) {
        const { id: sellerId } = await tx.user.create({
          data: {
            email: `seller${j + 1}@value.app`,
            name: "seller",
            password: hashedPassword,
            userType: "SELLER",
          },
        });

        await tx.account.create({
          data: {
            userId: sellerId,
            type: "credentials",
            provider: "credentials",
            providerAccountId: sellerId,
          },
        });

        const { id: storeId } = await tx.store.create({
          data: {
            name: faker.company.name(),
            address: faker.location.streetAddress(),
            lat: "" + faker.location.latitude(),
            lng: "" + faker.location.longitude(),
            sellerId: sellerId,
            Logo: faker.image.url(),
          },
        });

        for (let i = 0; i < answers.products; i++) {
          await tx.product.create({
            data: {
              name: faker.commerce.productName(),
              description: faker.commerce.productDescription(),
              price: Number(faker.commerce.price()),
              storeId: storeId,
              categories: {
                connect: {
                  id: categories[Math.floor(Math.random() * categories.length)],
                },
              },
              images: {
                createMany: {
                  data: [
                    { url: faker.image.url() },
                    { url: faker.image.url() },
                    { url: faker.image.url() },
                    { url: faker.image.url() },
                    { url: faker.image.url() },
                  ],
                },
              },
            },
          });
        }

        const adress = await tx.address.findFirst({
          where: {
            userId: userId,
          },
        });
        const product = await tx.product.findFirst({
          where: {
            storeId: storeId,
          },
        });
        if (!adress || !product) {
          throw new Error("Address not found");
        }
        await tx.order.create({
          data: {
            userId: userId,
            addressId: adress.id,
            deliveryAmount: 10,
            products: {
              connect: {
                id: product.id,
              },
            },
            status: "DELIVERED",
            totalAmount: product.price + 10,
            driverId: driverId,
          },
        });
      }
    },
    { timeout: 1000000, maxWait: 1000000 },
  );
};

void seed();
