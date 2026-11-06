-- AlterTable
ALTER TABLE "Category" ADD COLUMN "description" TEXT;
ALTER TABLE "Category" ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'tag';
ALTER TABLE "Category" ADD COLUMN "color" TEXT NOT NULL DEFAULT 'green';
