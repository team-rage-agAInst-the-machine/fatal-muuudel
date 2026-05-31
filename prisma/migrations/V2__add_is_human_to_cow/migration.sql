-- AlterTable: marca vacas que são, na verdade, humanos disfarçados
ALTER TABLE "Cow" ADD COLUMN "isHuman" BOOLEAN NOT NULL DEFAULT false;
