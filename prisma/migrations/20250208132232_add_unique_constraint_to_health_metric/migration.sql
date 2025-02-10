/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `HealthMetric` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "HealthMetric_bloodPressureStartTimeNanos_key";

-- DropIndex
DROP INDEX "HealthMetric_nutritionStartTimeNanos_key";

-- DropIndex
DROP INDEX "HealthMetric_weightStartTimeNanos_key";

-- CreateIndex
CREATE UNIQUE INDEX "HealthMetric_userId_date_key" ON "HealthMetric"("userId", "date");
