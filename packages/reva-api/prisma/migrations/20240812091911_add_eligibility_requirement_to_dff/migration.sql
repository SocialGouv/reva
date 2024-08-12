-- CreateEnum
CREATE TYPE "DFFEligibilityRequirement" AS ENUM ('FULL_ELIGIBILITY_REQUIREMENT', 'PARTIAL_ELIGIBILITY_REQUIREMENT');

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ADD COLUMN     "eligibility_requirement" "DFFEligibilityRequirement";
