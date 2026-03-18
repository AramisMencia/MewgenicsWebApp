/*
  Warnings:

  - You are about to drop the `CatParent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CatParent" DROP CONSTRAINT "CatParent_child_id_fkey";

-- DropForeignKey
ALTER TABLE "CatParent" DROP CONSTRAINT "CatParent_parent_id_fkey";

-- AlterTable
ALTER TABLE "Cat" ADD COLUMN     "fatherId" INTEGER,
ADD COLUMN     "motherId" INTEGER;

-- DropTable
DROP TABLE "CatParent";

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "Cat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Cat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
