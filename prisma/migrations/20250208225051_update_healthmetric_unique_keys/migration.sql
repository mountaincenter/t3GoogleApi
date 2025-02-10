/*
  Warnings:

  - A unique constraint covering the columns `[userId,date,weightStartTimeNanos]` on the table `HealthMetric` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,date,bloodPressureStartTimeNanos]` on the table `HealthMetric` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,date,nutritionStartTimeNanos]` on the table `HealthMetric` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HealthMetric_userId_date_weightStartTimeNanos_key" ON "HealthMetric"("userId", "date", "weightStartTimeNanos");

-- CreateIndex
CREATE UNIQUE INDEX "HealthMetric_userId_date_bloodPressureStartTimeNanos_key" ON "HealthMetric"("userId", "date", "bloodPressureStartTimeNanos");

-- CreateIndex
CREATE UNIQUE INDEX "HealthMetric_userId_date_nutritionStartTimeNanos_key" ON "HealthMetric"("userId", "date", "nutritionStartTimeNanos");
