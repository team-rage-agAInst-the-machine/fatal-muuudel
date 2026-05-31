/*
  Warnings:

  - You are about to drop the column `abductionStyle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `maxCargoKg` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mooPreference` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `objetivoDaMissao` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `signoGalactico` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `temperamento` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "abductionStyle",
DROP COLUMN "maxCargoKg",
DROP COLUMN "mooPreference",
DROP COLUMN "objetivoDaMissao",
DROP COLUMN "signoGalactico",
DROP COLUMN "temperamento";

-- CreateTable
CREATE TABLE "MissionConfig" (
    "id" TEXT NOT NULL,
    "alienId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "abductionStyle" TEXT,
    "objetivoDaMissao" TEXT,
    "temperamento" TEXT,
    "signoGalactico" TEXT,
    "mooPreference" INTEGER,
    "maxCargoKg" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MissionConfig_alienId_idx" ON "MissionConfig"("alienId");

-- AddForeignKey
ALTER TABLE "MissionConfig" ADD CONSTRAINT "MissionConfig_alienId_fkey" FOREIGN KEY ("alienId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Garante que apenas uma missão por ET pode estar ativa simultaneamente.
-- Safety net: a aplicação já faz updateMany antes de ativar, mas este índice
-- rejeita no banco caso algum bug contorne a transação.
CREATE UNIQUE INDEX "MissionConfig_single_active_per_alien" ON "MissionConfig"("alienId") WHERE "isActive" = true;
