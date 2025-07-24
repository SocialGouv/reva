import { updateCandidacyLastActivityDateToNow } from "@/modules/feasibility/features/updateCandidacyLastActivityDateToNow";

import { getCandidacyIsCaduque } from "./getCandidacyIsCaduque";

export const updateCandidacyLastActivityIfNotAlreadyCaduque = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacyCaduque = await getCandidacyIsCaduque({ candidacyId });

  if (!candidacyCaduque) {
    await updateCandidacyLastActivityDateToNow({ candidacyId });
  }
};
