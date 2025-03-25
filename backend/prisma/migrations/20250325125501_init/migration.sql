/*
  Warnings:

  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - The `verificationStatus` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `panProofUrl` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `aadharProofUrl` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified",
DROP COLUMN "updatedAt",
ALTER COLUMN "panProofUrl" SET NOT NULL,
ALTER COLUMN "aadharProofUrl" SET NOT NULL,
DROP COLUMN "verificationStatus",
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "VerificationStatus";
