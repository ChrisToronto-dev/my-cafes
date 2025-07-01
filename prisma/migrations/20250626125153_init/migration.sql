/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Cafe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cafe_name_key" ON "Cafe"("name");
