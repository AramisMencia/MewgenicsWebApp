/*
  Warnings:

  - Added the required column `worldId` to the `Cat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cat" ADD COLUMN     "worldId" TEXT NOT NULL;
