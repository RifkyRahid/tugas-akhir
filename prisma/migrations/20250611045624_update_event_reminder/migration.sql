/*
  Warnings:

  - The values [REMINDER] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('MEETING', 'BIRTHDAY', 'HOLIDAY', 'OTHER');
ALTER TABLE "EventReminder" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "EventReminder" ALTER COLUMN "type" TYPE "EventType_new" USING ("type"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
ALTER TABLE "EventReminder" ALTER COLUMN "type" SET DEFAULT 'OTHER';
COMMIT;

-- AlterTable
ALTER TABLE "EventReminder" ALTER COLUMN "type" SET DEFAULT 'OTHER';
