-- DropForeignKey
ALTER TABLE "Website" DROP CONSTRAINT "Website_templateId_fkey";

-- AlterTable
ALTER TABLE "Website" ALTER COLUMN "templateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
