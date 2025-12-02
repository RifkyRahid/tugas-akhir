-- CreateTable
CREATE TABLE "AppConfig" (
    "id" SERIAL NOT NULL,
    "startWorkTime" TEXT NOT NULL DEFAULT '09:00',
    "endWorkTime" TEXT NOT NULL DEFAULT '17:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);
