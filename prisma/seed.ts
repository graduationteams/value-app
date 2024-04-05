import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker/locale/en";
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
    products: number;
    password: string;
    orders: number;
  };
  const hashedPassword = await hash(answers.password, 10);
  const subCategory: string[] = [];

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

      await tx.driver.create({
        data: {
          userId: driverUserId,
          name: faker.person.firstName() + " " + faker.person.lastName(),
          carModel: faker.vehicle.model(),
          carPlate: faker.vehicle.vrm(),
          phoneNumber: faker.phone.number(),
        },
      });

      // TODO: add more SubCategories
      const Categories = {
        regular: [
          {
            name: "Household Supplies",
            subcategories: [
              { name: "Cleaning Supplies" },
              { name: "Kitchen Essentials" },
              { name: "Laundry Products" },
              { name: "Storage Solutions" },
              { name: "Home Decor" },
            ],
          },
          {
            name: "Food and Groceries",
            subcategories: [
              { name: "Fresh Produce" },
              { name: "Canned Goods" },
              { name: "Snacks and Beverages" },
              { name: "Baking Essentials" },
              { name: "Condiments and Spices" },
            ],
          },
          {
            name: "Personal Care and Hygiene",
            subcategories: [
              { name: "Skin Care" },
              { name: "Hair Care" },
              { name: "Oral Care" },
              { name: "Feminine Hygiene" },
              { name: "Men's Grooming" },
            ],
          },
          {
            name: "Electronics and Accessories",
            subcategories: [
              { name: "Computers and Laptops" },
              { name: "Mobile Phones and Accessories" },
              { name: "Audio and Video Equipment" },
              { name: "Gaming Devices" },
              { name: "Smart Home Devices" },
            ],
          },
          {
            name: "Medical Supplies",
            subcategories: [
              { name: "First Aid Kits" },
              { name: "Medications" },
              { name: "Medical Devices" },
              { name: "Health Monitors" },
              { name: "Mobility Aids" },
            ],
          },
        ],
        farms: [
          {
            name: "Dates",
            subcategories: [
              { name: "Fresh Dates" },
              { name: "Dried Dates" },
              { name: "Date Products" },
              { name: "Date Trees" },
              { name: "Date Palm Syrup" },
            ],
          },
          {
            name: "Fruits and Vegetables",
            subcategories: [
              { name: "Fresh Fruits" },
              { name: "Fresh Vegetables" },
              { name: "Frozen Produce" },
              { name: "Organic Produce" },
              { name: "Exotic Fruits" },
            ],
          },
          {
            name: "Dairy Products",
            subcategories: [
              { name: "Milk and Cream" },
              { name: "Cheese and Yogurt" },
              { name: "Butter and Eggs" },
              { name: "Dairy Alternatives" },
              { name: "Frozen Dairy" },
            ],
          },
          {
            name: "Processed Goods",
            subcategories: [
              { name: "Canned Foods" },
              { name: "Packaged Snacks" },
              { name: "Frozen Meals" },
              { name: "Instant Noodles" },
              { name: "Ready-to-Eat Foods" },
            ],
          },
          {
            name: "Crops and Grains",
            subcategories: [
              { name: "Wheat and Barley" },
              { name: "Rice and Corn" },
              { name: "Beans and Lentils" },
              { name: "Grain Products" },
              { name: "Flour and Baking Mixes" },
            ],
          },
        ],
      };

      for (const [categoryType, categories] of Object.entries(Categories)) {
        for (const category of categories) {
          await tx.category.create({
            data: {
              name: category.name,
              categoryType: categoryType === "regular" ? "REGULAR" : "FARM",
              subcategories: {
                createMany: {
                  data: category.subcategories.map((subCategory) => ({
                    name: subCategory.name,
                  })),
                },
              },
            },
          });
        }
      }

      subCategory.push(...(await tx.subcategory.findMany()).map((x) => x.id));

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
              subcategoryId:
                subCategory[Math.floor(Math.random() * subCategory.length)] ??
                "",
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
