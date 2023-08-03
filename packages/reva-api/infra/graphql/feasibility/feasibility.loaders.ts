import { getCandidaciesByIds } from "./feasibility.features";

export const feasibilityLoaders = {
  Feasibility: {
    candidacy: async (queries: { obj: { candidacyId: string } }[]) => {
      const candidacyIds: string[] = queries.map(({ obj }) => obj.candidacyId);
      const candidacies = await getCandidaciesByIds({ candidacyIds });
      return candidacyIds.map((cid) => candidacies.find((c) => c.id === cid));
    },
  },
};
