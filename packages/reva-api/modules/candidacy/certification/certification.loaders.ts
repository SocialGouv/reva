import { getCertificationsByCandidacyIds } from "./features/getCertificationsByCandidacyIds";

export const candidacyCertificationLoaders = {
  Candidacy: {
    certification: async (queries: { obj: { id: string } }[]) => {
      const candidacyIds: string[] = queries.map(({ obj }) => obj.id);
      const certifications = await getCertificationsByCandidacyIds({
        candidacyIds,
      });
      return candidacyIds.map((cid) =>
        certifications.find(
          (c) => c.candidaciesAndRegions[0].candidacyId === cid,
        ),
      );
    },
  },
};
