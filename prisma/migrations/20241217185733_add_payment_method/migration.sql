-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYPAL');

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_userId_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "paymentError" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod";
