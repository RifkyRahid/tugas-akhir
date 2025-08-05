-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MEETING', 'BIRTHDAY', 'REMINDER');

-- CreateTable
CREATE TABLE "EventReminder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL DEFAULT 'REMINDER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventReminder_pkey" PRIMARY KEY ("id")
);
