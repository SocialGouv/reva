import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { resolversSecurityMap } from "./dematerialized-feasibility-file.security";
import { getDematerializedFeasibilityFileByCandidacyId } from "./features/getDematerializedFeasibilityFileByCandidacyId";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput } from "./dematerialized-feasibility-file.types";
import { createOrUpdateCertificationInfo } from "./features/createOrUpdateCertificationInfo";

export const unsafeResolvers = {
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
