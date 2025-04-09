import { getCohorteVAECollectiveByCodeInscription } from "./features/getCohorteVAECollectiveByCodeInscription";
import { vaeCollectiveResolversSecurityMap } from "./vae-collective.security";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { getCohorteVAECollectiveById } from "./features/getCohorteVAECollectiveById";
import { getCommanditaireVaeCollectiveById } from "./features/getCommanditaireVaeCollectiveById";
import { getProjetVaeCollectiveById } from "./features/getProjetVaeCollectiveById";

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
  },
};

export const vaeCollectiveResolvers = composeResolvers(
  unsafeResolvers,
  vaeCollectiveResolversSecurityMap,
);
