-- CreateTable
CREATE TABLE "Works" (
    "id" SERIAL NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Works_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Works" ADD CONSTRAINT "Works_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
