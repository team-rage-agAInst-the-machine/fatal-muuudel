-- CreateEnum
CREATE TYPE "CowProtectionLevel" AS ENUM ('EXTRAVIADA', 'CAMPESTRE', 'VEDETE', 'ELITE', 'SAGRADA', 'DIVINA');

-- AlterTable
ALTER TABLE "Cow" ADD COLUMN     "desprevenida" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "flightRisk" INTEGER,
ADD COLUMN     "papelNoRebanho" TEXT,
ADD COLUMN     "personality" TEXT,
ADD COLUMN     "protectionLevel" "CowProtectionLevel" NOT NULL DEFAULT 'CAMPESTRE',
ADD COLUMN     "signoGalactico" TEXT,
ADD COLUMN     "temperamento" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "abductionStyle" TEXT,
ADD COLUMN     "maxCargoKg" INTEGER,
ADD COLUMN     "mooPreference" INTEGER,
ADD COLUMN     "objetivoDaMissao" TEXT,
ADD COLUMN     "signoGalactico" TEXT,
ADD COLUMN     "temperamento" TEXT;
