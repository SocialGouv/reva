import { Feasibility } from "@/graphql/generated/graphql";

export const createFeasibilityEntity = (
  options?: Partial<Feasibility>,
): Partial<Feasibility> => {
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
    dematerializedFeasibilityFile: dematerializedFeasibilityFile || null,
  };
};
