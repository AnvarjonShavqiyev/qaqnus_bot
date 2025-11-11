-- DropForeignKey
ALTER TABLE "Spectators" DROP CONSTRAINT "Spectators_userId_fkey";

-- DropForeignKey
ALTER TABLE "Works" DROP CONSTRAINT "Works_userId_fkey";

-- AddForeignKey
ALTER TABLE "Spectators" ADD CONSTRAINT "Spectators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Works" ADD CONSTRAINT "Works_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
