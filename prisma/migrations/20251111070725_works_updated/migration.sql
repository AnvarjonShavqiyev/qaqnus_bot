/*
  Warnings:

  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Works" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "Settings";
