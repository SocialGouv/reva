import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";

import { getContactInformationCompletedByCandidateId } from "./getContactInformationCompletedByCandidateId";

describe("getContactInformationCompletedByCandidateId", () => {
  test("retourne false quand le candidat n'a pas de département", async () => {
    const candidate = await createCandidateHelper({ departmentId: null });

    const completed = await getContactInformationCompletedByCandidateId({
      candidateId: candidate.id,
    });

    expect(completed).toBe(false);
  });

  test("retourne true quand le candidat a un département et une adresse complète", async () => {
    const candidate = await createCandidateHelper();

    const completed = await getContactInformationCompletedByCandidateId({
      candidateId: candidate.id,
    });

    expect(completed).toBe(true);
  });
});
