import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker/locale/ar";
import inquirer from "inquirer";

const prisma = new PrismaClient({ log: ["query"] });

// we need this to make sure that the random lang lat is in the area of Burydah to make it easier to test the map
const BURYDAH_LANG_LAT_AREA = [
  [43.85729725328529, 26.391841766523566],
  [43.9184087034806, 26.247823472840608],
  [44.03307850328529, 26.312469212908553],
  [43.958234142933726, 26.428740662093183],
] as [number, number][];

function getRandomLangLat() {
  // to get a random lang lat in the area we will get a random number between min lang and max lang and a random number between min lat and max lat
  const minLang = Math.min(...BURYDAH_LANG_LAT_AREA.map((x) => x[0]));
  const maxLang = Math.max(...BURYDAH_LANG_LAT_AREA.map((x) => x[0]));
  const minLat = Math.min(...BURYDAH_LANG_LAT_AREA.map((x) => x[1]));
  const maxLat = Math.max(...BURYDAH_LANG_LAT_AREA.map((x) => x[1]));
  return [
    Math.random() * (maxLang - minLang) + minLang,
    Math.random() * (maxLat - minLat) + minLat,
  ];
}

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
      type: "number",
      name: "orders",
      message: "How many orders do you want to add?",
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
    orders: number;
  };
  const hashedPassword = await hash(answers.password, 10);
  const categories: string[] = [];

  await prisma.$transaction(
    async (tx) => {
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
      const address1 = getRandomLangLat();
      const address2 = getRandomLangLat();
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
                  lat: "" + address1[1],
                  lng: "" + address1[0],
                },
                {
                  city: faker.location.city(),
                  lat: "" + address2[1],
                  lng: "" + address2[0],
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

      const { userId: driverId } = await tx.driver.create({
        data: {
          userId: driverUserId,
          name: faker.person.firstName() + " " + faker.person.lastName(),
          carModel: faker.vehicle.model(),
          carPlate: faker.vehicle.vrm(),
          phoneNumber: faker.phone.number(),
        },
      });

      for (let i = 0; i < answers.categories; i++) {
        categories.push(
          (
            await tx.category.create({
              data: {
                name: faker.commerce.department(),
                categoryType: Math.random() > 0.5 ? "FARM" : "REGULAR",
              },
            })
          ).id,
        );
      }

      const adress = await tx.address.findFirst({
        where: {
          userId: userId,
        },
      });
      if (!adress) {
        throw new Error("no address found");
      }
    },
    { timeout: 1000000, maxWait: 1000000 },
  );

  await prisma.$transaction(
    async (tx) => {
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
        const storeLangLat = getRandomLangLat();
        const { id: storeId } = await tx.store.create({
          data: {
            name: faker.company.name(),
            address: faker.location.streetAddress(),
            lat: "" + storeLangLat[1],
            lng: "" + storeLangLat[0],
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
      }
    },
    { timeout: 1000000, maxWait: 1000000 },
  );

  await prisma.$transaction(
    async (tx) => {
      const { id: userId } = await tx.user.findFirstOrThrow({
        where: {
          userType: "USER",
        },
      });
      const adress = await tx.address.findFirst({
        where: {
          userId: userId,
        },
      });
      if (!adress) {
        throw new Error("no address found");
      }
      const { id: driverId } = await tx.user.findFirstOrThrow({
        where: {
          userType: "DRIVER",
        },
      });

      const productsCount = await tx.product.count();
      for (let i = 0; i < answers.orders; i++) {
        const productsOrderRandom = faker.number.int({ min: 2, max: 10 });

        const products = await tx.product.findMany({
          take: productsOrderRandom,
          skip: faker.number.int({
            min: 0,
            max: productsCount - productsOrderRandom,
          }),
        });
        const productsOrder = products.map((product) => ({
          price: product.price,
          quantity: faker.number.int({ min: 1, max: 5 }),
          productId: product.id,
        }));
        const IsDelivered = Math.random() > 0.5;
        await tx.order.create({
          data: {
            createdAt: faker.date.past(),
            userId: userId,
            addressId: adress.id,
            deliveryAmount: 30,
            productOrder: {
              createMany: {
                data: productsOrder,
              },
            },
            status: IsDelivered ? "DELIVERED" : "CONFIRMED",
            totalAmount: productsOrder.reduce(
              (acc, product) => acc + product.price * product.quantity,
              30,
            ),
            driverId: IsDelivered ? driverId : null,
          },
        });
      }
    },
    { timeout: 1000000, maxWait: 1000000 },
  );
};

void seed();
