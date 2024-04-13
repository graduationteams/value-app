-- CreateEnum
CREATE TYPE "ProductGroupBuyStatus" AS ENUM ('OPEN', 'FINISHED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "group_buy_end" TIMESTAMP(3),
ADD COLUMN     "group_buy_status" "ProductGroupBuyStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "is_group_buy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "required_qty" INTEGER;
