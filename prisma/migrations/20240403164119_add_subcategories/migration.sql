-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_A_fkey";
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_B_fkey";

-- AlterTable to add subcategoryId column, initially allowing NULL
ALTER TABLE "Product" ADD COLUMN "subcategoryId" TEXT;

-- (You will need to insert a default subcategory in the Subcategory table first and use that ID here)
-- Replace 'default_subcategory_id' with an actual subcategory ID from your database
UPDATE "Product" SET "subcategoryId" = 'default_subcategory_id';

-- Now alter the subcategoryId column to NOT NULL
ALTER TABLE "Product" ALTER COLUMN "subcategoryId" SET NOT NULL;

-- DropTable
DROP TABLE "_CategoryToProduct";

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_name_categoryId_key" ON "Subcategory"("name", "categoryId");

-- AddForeignKey for Subcategory to Category
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey for Product to Subcategory
ALTER TABLE "Product" ADD CONSTRAINT "Product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
