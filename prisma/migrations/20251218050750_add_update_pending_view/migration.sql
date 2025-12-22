-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "isPendingDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isViolation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT;
