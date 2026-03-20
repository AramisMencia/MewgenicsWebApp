-- DropForeignKey
ALTER TABLE "CatStats" DROP CONSTRAINT "CatStats_cat_id_fkey";

-- AddForeignKey
ALTER TABLE "CatStats" ADD CONSTRAINT "CatStats_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
