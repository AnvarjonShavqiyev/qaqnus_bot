-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "isRegistrationEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
