-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "areaId" INTEGER;

-- AlterTable
ALTER TABLE "public"."AttendanceArea" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "areaId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."AttendanceArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."AttendanceArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
