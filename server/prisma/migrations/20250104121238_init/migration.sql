/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_whiteboardId_fkey";

-- DropTable
DROP TABLE "Session";

-- CreateTable
CREATE TABLE "_WhiteboardMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WhiteboardMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WhiteboardMembers_B_index" ON "_WhiteboardMembers"("B");

-- CreateIndex
CREATE INDEX "Whiteboard_title_idx" ON "Whiteboard"("title");

-- AddForeignKey
ALTER TABLE "_WhiteboardMembers" ADD CONSTRAINT "_WhiteboardMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WhiteboardMembers" ADD CONSTRAINT "_WhiteboardMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
