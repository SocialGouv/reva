import { DematerializedFeasibilityFile, Feasibility } from "@/graphql/generated/graphql";

export type FeasibilityEntity = Partial<
  Omit<Feasibility, "dematerializedFeasibilityFile">
> & {
  dematerializedFeasibilityFile?: Partial<DematerializedFeasibilityFile> | null;
};

export const createFeasibilityEntity = (
  options?: FeasibilityEntity,
): FeasibilityEntity => {
  const {
    decision,
    feasibilityFormat,
    decisionSentAt,
    feasibilityFileSentAt,
    history,
    dematerializedFeasibilityFile,
  } = options || {};

  return {
    id: "1",
    decision: decision || "DRAFT",
    feasibilityFormat: feasibilityFormat || "DEMATERIALIZED",
    decisionSentAt: decisionSentAt || null,
    feasibilityFileSentAt: feasibilityFileSentAt || null,
    history: history || [],
    dematerializedFeasibilityFile: dematerializedFeasibilityFile ?? null,
  };
};
