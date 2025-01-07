/*
  Warnings:

  - You are about to drop the column `userId` on the `Whiteboard` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `Whiteboard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Whiteboard" DROP CONSTRAINT "Whiteboard_userId_fkey";

-- AlterTable
ALTER TABLE "Whiteboard" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
