import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { resolversSecurityMap } from "./dematerialized-feasibility-file.security";
import { getDematerializedFeasibilityFileByCandidacyId } from "./features/getDematerializedFeasibilityFileByCandidacyId";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput } from "./dematerialized-feasibility-file.types";
import { createOrUpdateCertificationInfo } from "./features/createOrUpdateCertificationInfo";
import { getBlocsDeCompetencesByDFFId } from "./features/getBlocsDeCompetencesByDFFId";
import { getCompetenceBlocsById } from "../referential/features/getCompetenceBlocsById";

export const unsafeResolvers = {
  DematerializedFeasibilityFile: {
    blocsDeCompetences: (
      {
        id: dematerializedFeasibilityFileId,
      }: {
        id: string;
      },
      { blocDeCompetencesId }: { blocDeCompetencesId?: string },
    ) =>
      blocDeCompetencesId
        ? [getCompetenceBlocsById({ competenceBlocId: blocDeCompetencesId })]
        : getBlocsDeCompetencesByDFFId({ dematerializedFeasibilityFileId }),
  },
  Candidacy: {
    dematerializedFeasibilityFile: ({ id: candidacyId }: { id: string }) =>
      getDematerializedFeasibilityFileByCandidacyId({ candidacyId }),
  },
  Mutation: {
    dematerialized_feasibility_file_createOrUpdateCertificationInfo: (
      _parent: unknown,
      params: {
        input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
      },
    ) => createOrUpdateCertificationInfo({ input: params.input }),
  },
};

export const dematerializedFeasibilityFileResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
