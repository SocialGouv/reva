import { getCohorteVAECollectiveByCodeInscription } from "./features/getCohorteVAECollectiveByCodeInscription";
import { vaeCollectiveResolversSecurityMap } from "./vae-collective.security";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { getCohorteVAECollectiveById } from "./features/getCohorteVAECollectiveById";
import { getCommanditaireVaeCollectiveById } from "./features/getCommanditaireVaeCollectiveById";
import { getProjetVaeCollectiveById } from "./features/getProjetVaeCollectiveById";
import { getCohortesVaeCollectivesForConnectedAap } from "./features/getCohortesVaeCollectivesForConnectedAap";
import { getCohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount } from "./features/getCohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount";

const unsafeResolvers = {
  CohorteVaeCollective: {
    projetVaeCollective: async ({
      projetVaeCollectiveId,
    }: {
      projetVaeCollectiveId: string;
    }) => getProjetVaeCollectiveById({ projetVaeCollectiveId }),
  },
  ProjetVaeCollective: {
    commanditaireVaeCollective: async ({
      commanditaireVaeCollectiveId,
    }: {
      commanditaireVaeCollectiveId: string;
    }) => getCommanditaireVaeCollectiveById({ commanditaireVaeCollectiveId }),
  },
  Candidacy: {
    cohorteVaeCollective: async ({
      cohorteVaeCollectiveId,
    }: {
      cohorteVaeCollectiveId?: string;
    }) => getCohorteVAECollectiveById({ cohorteVaeCollectiveId }),
  },
  Query: {
    cohorteVaeCollective: async (
      _parent: unknown,
      { codeInscription }: { codeInscription: string },
    ) =>
      getCohorteVAECollectiveByCodeInscription({
        codeInscription,
      }),
    cohortesVaeCollectivesForConnectedAap: async (
      _parent: unknown,
      _args: unknown,
      context: GraphqlContext,
    ) =>
      getCohortesVaeCollectivesForConnectedAap({
        userKeycloakId: context.auth.userInfo?.sub || "",
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),
    cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount:
      async (_parent: unknown, _args: unknown, context: GraphqlContext) =>
        getCohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount(
          {
            userKeycloakId: context.auth.userInfo?.sub || "",
            userRoles: context.auth.userInfo?.realm_access?.roles || [],
          },
        ),
  },
};

export const vaeCollectiveResolvers = composeResolvers(
  unsafeResolvers,
  vaeCollectiveResolversSecurityMap,
);
