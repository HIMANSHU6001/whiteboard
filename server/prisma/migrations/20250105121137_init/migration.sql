/*
  Warnings:

  - You are about to drop the column `userEmail` on the `Whiteboard` table. All the data in the column will be lost.
  - Added the required column `user_email` to the `Whiteboard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Whiteboard" DROP CONSTRAINT "Whiteboard_userEmail_fkey";

-- AlterTable
ALTER TABLE "Whiteboard" DROP COLUMN "userEmail",
ADD COLUMN     "user_email" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
