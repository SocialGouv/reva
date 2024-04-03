import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { resolversSecurityMap } from "./dematerialized-feasibility-file.security";
import { getDematerializedFeasibilityFileByCandidacyId } from "./features/getDematerializedFeasibilityFileByCandidacyId";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput } from "./dematerialized-feasibility-file.types";
import { createOrUpdateCertificationInfo } from "./features/createOrUpdateCertificationInfo";
import { getBlocsDeCompetencesByDFFId } from "./features/getBlocsDeCompetencesByDFFId";

export const unsafeResolvers = {
  DematerializedFeasibilityFile: {
    blocsDeCompetences: ({
      id: dematerializedFeasibilityFileId,
    }: {
      id: string;
    }) => getBlocsDeCompetencesByDFFId({ dematerializedFeasibilityFileId }),
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
