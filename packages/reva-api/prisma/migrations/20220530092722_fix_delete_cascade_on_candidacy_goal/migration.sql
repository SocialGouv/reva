-- DropForeignKey
ALTER TABLE "candidacy_goal" DROP CONSTRAINT "candidacy_goal_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy_goal" DROP CONSTRAINT "candidacy_goal_goal_id_fkey";

-- AddForeignKey
ALTER TABLE "candidacy_goal" ADD CONSTRAINT "candidacy_goal_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_goal" ADD CONSTRAINT "candidacy_goal_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
