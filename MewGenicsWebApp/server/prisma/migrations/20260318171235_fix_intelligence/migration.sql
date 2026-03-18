/*
  Warnings:

  - You are about to drop the column `inteligence` on the `CatStats` table. All the data in the column will be lost.
  - Added the required column `intelligence` to the `CatStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CatStats" DROP COLUMN "inteligence",
ADD COLUMN     "intelligence" INTEGER NOT NULL;
