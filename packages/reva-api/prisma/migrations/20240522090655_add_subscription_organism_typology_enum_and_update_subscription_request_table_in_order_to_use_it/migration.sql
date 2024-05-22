-- CreateEnum
CREATE TYPE "SubscriptionOrganismTypology" AS ENUM ('generaliste', 'expertFiliere', 'expertBranche');

-- AlterTable
ALTER TABLE "subscription_request"
ADD COLUMN "new_typology" "SubscriptionOrganismTypology" NOT NULL DEFAULT 'generaliste';

UPDATE "subscription_request"
SET
  "new_typology" = 
  CASE "typology"
    WHEN 'expertFiliere' THEN 'expertFiliere'::"SubscriptionOrganismTypology"
    WHEN 'expertBranche' THEN 'expertBranche'::"SubscriptionOrganismTypology"
    ELSE 'generaliste'::"SubscriptionOrganismTypology"
  END;
  
  -- AlterTable
ALTER TABLE "subscription_request"
DROP COLUMN "typology";

ALTER TABLE "subscription_request"
RENAME COLUMN "new_typology" TO "typology";

ALTER TABLE "subscription_request"
ALTER COLUMN "typology"
DROP default;