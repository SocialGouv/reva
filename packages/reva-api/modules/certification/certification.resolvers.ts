import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { resolversSecurityMap } from "./certification.security";
import { getCertificationByCandidacyId } from "./features/getCertificationByCandidacyId";
import { updateCertificationOfCandidacy } from "./features/updateCertificationOfCandidacy";
import { updateCertificationWithinOrganismScope } from "./features/updateCertificationWithinOrganismScope";

const unsafeResolvers = {
  Candidacy: {
    certification: ({ id: candidacyId }: { id: string }) =>
      getCertificationByCandidacyId({ candidacyId }),
  },
  Query: {},
  Mutation: {
    certification_updateCertification: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) =>
      updateCertificationOfCandidacy({
        candidacyId: payload.candidacyId,
        certificationId: payload.certificationId,
        departmentId: payload.departmentId,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth?.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),

    certification_updateCertificationWithinOrganismScope: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) =>
      updateCertificationWithinOrganismScope({
        hasRole: context.auth.hasRole,
        candidacyId: payload.candidacyId,
        certificationId: payload.certificationId,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth?.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),
  },
};

export const certificationResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
