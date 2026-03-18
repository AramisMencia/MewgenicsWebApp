-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'unknown');

-- CreateEnum
CREATE TYPE "Orientation" AS ENUM ('hetero', 'homo', 'bi');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('alive', 'retired', 'dead');

-- CreateTable
CREATE TABLE "Cat" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "orientation" "Orientation" NOT NULL,
    "inbreeding_level" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatStats" (
    "id" SERIAL NOT NULL,
    "cat_id" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "dexterity" INTEGER NOT NULL,
    "constitution" INTEGER NOT NULL,
    "inteligence" INTEGER NOT NULL,
    "agility" INTEGER NOT NULL,
    "charisma" INTEGER NOT NULL,
    "luck" INTEGER NOT NULL,

    CONSTRAINT "CatStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ability" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatAbility" (
    "cat_id" INTEGER NOT NULL,
    "ability_id" INTEGER NOT NULL,

    CONSTRAINT "CatAbility_pkey" PRIMARY KEY ("cat_id","ability_id")
);

-- CreateTable
CREATE TABLE "CatParent" (
    "child_id" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,

    CONSTRAINT "CatParent_pkey" PRIMARY KEY ("child_id","parent_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatStats_cat_id_key" ON "CatStats"("cat_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ability_name_key" ON "Ability"("name");

-- AddForeignKey
ALTER TABLE "CatStats" ADD CONSTRAINT "CatStats_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatAbility" ADD CONSTRAINT "CatAbility_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatAbility" ADD CONSTRAINT "CatAbility_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "Ability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatParent" ADD CONSTRAINT "CatParent_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatParent" ADD CONSTRAINT "CatParent_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Cat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
