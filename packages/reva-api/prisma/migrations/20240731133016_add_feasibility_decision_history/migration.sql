-- CreateTable
CREATE TABLE "feasibility_decision" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "feasibility_id" UUID NOT NULL,
    "decision" "FeasibilityStatus" NOT NULL,
    "decision_comment" TEXT,
    "decision_sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feasibility_decision_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "feasibility_decision" ADD CONSTRAINT "feasibility_decision_feasibility_id_fkey" FOREIGN KEY ("feasibility_id") REFERENCES "feasibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
