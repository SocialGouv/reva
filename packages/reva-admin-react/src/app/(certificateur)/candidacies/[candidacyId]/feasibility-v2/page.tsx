"use client";

import { DematerializedFeasibility } from "./_components/dematerialized-feasibility/DematerializedFeasibility";
import { FeasibilityUploadedPdf } from "./_components/feasibility-uploaded-pdf/FeasibilityUploadedPdf";
import { useFeasibilityPageLogic } from "./_components/feasibilityPage.hook";

const FeasibilityPage = () => {
  const { feasibilityFormat } = useFeasibilityPageLogic();
  if (!feasibilityFormat) {
    return null;
  }
  const isDematerializedFeasibilityFile =
    feasibilityFormat === "DEMATERIALIZED";

  return isDematerializedFeasibilityFile ? (
    <DematerializedFeasibility />
  ) : (
    <FeasibilityUploadedPdf />
  );
};

export default FeasibilityPage;
