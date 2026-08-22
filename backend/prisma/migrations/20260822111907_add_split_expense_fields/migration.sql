-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "splitCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "splitParticipants" TEXT;
