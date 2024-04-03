-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('HIDDEN', 'VISIBLE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'VISIBLE';
