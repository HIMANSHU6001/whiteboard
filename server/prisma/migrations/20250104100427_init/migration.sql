-- CreateTable
CREATE TABLE "WhiteboardSession" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "participants" TEXT[],

    CONSTRAINT "WhiteboardSession_pkey" PRIMARY KEY ("id")
);
