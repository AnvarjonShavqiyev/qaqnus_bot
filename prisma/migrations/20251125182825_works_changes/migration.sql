/*
  Warnings:

  - You are about to drop the `Works` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Works" DROP CONSTRAINT "Works_userId_fkey";

-- DropTable
DROP TABLE "Works";

-- CreateTable
CREATE TABLE "Performers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Performers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Performers" ADD CONSTRAINT "Performers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
