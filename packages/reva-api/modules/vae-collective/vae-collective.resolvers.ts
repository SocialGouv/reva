import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { getOrganismById } from "../organism/features/getOrganism";
import { getCertificationById } from "../referential/features/getCertificationById";

import { createCohorteVaeCollective } from "./features/createCohorteVaeCollective";
import { createCommanditaireVaeCollective } from "./features/createCommanditaireVaeCollective";
import { deleteCohorteVAECollective } from "./features/deleteCohorteVAECollective";
import { getCertificationCohorteOnOrganismsByCertificationCohorteId } from "./features/getCertificationCohorteOnOrganismsByCertificationCohorteId";
import { getCertificationCohortesByCohorteId } from "./features/getCertificationCohortesByCohorteId";
import { getCohortesVaeCollectivesByCommanditaireVaeCollectiveId } from "./features/getCohortesVaeCollectivesByCommanditaireVaeCollectiveId";
import { getCohortesVaeCollectivesForConnectedAap } from "./features/getCohortesVaeCollectivesForConnectedAap";
import { getCohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount } from "./features/getCohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount";
import { getCohorteVAECollectiveByCodeInscription } from "./features/getCohorteVAECollectiveByCodeInscription";
import { getCohorteVAECollectiveById } from "./features/getCohorteVAECollectiveById";
import { getCommanditaireVaeCollectiveByGestionnaireAccountId } from "./features/getCommanditaireVaeCollectiveByGestionnaireAccountId";
import { getCommanditaireVaeCollectiveById } from "./features/getCommanditaireVaeCollectiveById";
import { getCommanditaireVaeCollectives } from "./features/getCommanditaireVaeCollectives";
import { publishCohorteVAECollective } from "./features/publishCohorteVAECollective";
import { updateCohorteVAECollectiveCertification } from "./features/updateCohorteVAECollectiveCertification";
import { updateCohorteVAECollectiveOrganism } from "./features/updateCohorteVAECollectiveOrganism";
import { updateNomCohorteVaeCollective } from "./features/updateNomCohorteVaeCollective";
import { vaeCollectiveResolversSecurityMap } from "./vae-collective.security";

const unsafeResolvers = {
  Account: {
    commanditaireVaeCollective: async ({
      id: gestionnaireAccountId,
    }: {
      id: string;
    }) =>
      getCommanditaireVaeCollectiveByGestionnaireAccountId({
        gestionnaireAccountId,
      }),
  },
  CohorteVaeCollective: {
    commanditaireVaeCollective: async ({
      commanditaireVaeCollectiveId,
    }: {
      commanditaireVaeCollectiveId: string;
    }) => getCommanditaireVaeCollectiveById({ commanditaireVaeCollectiveId }),
    certificationCohorteVaeCollectives: async ({
      id: cohorteVaeCollectiveId,
    }: {
      id: string;
    }) =>
      getCertificationCohortesByCohorteId({
        cohorteVaeCollectiveId,
      }),
  },
  CertificationCohorteVaeCollective: {
    certification: async ({ certificationId }: { certificationId: string }) =>
      getCertificationById({ certificationId }),
    certificationCohorteVaeCollectiveOnOrganisms: async ({
      id: certificationCohorteVaeCollectiveId,
    }: {
      id: string;
    }) =>
      getCertificationCohorteOnOrganismsByCertificationCohorteId({
        certificationCohorteVaeCollectiveId,
      }),
  },
  CertificationCohorteVaeCollectiveOnOrganism: {
    organism: async ({ organismId }: { organismId: string }) =>
      getOrganismById({ organismId }),
  },
  Candidacy: {
    cohorteVaeCollective: async ({
      cohorteVaeCollectiveId,
    }: {
      cohorteVaeCollectiveId?: string;
    }) => getCohorteVAECollectiveById({ cohorteVaeCollectiveId }),
  },
  CommanditaireVaeCollective: {
    cohorteVaeCollectives: async (
      {
        id: commanditaireVaeCollectiveId,
      }: {
        id: string;
      },
      { offset, limit }: { offset: number; limit: number },
    ) =>
      getCohortesVaeCollectivesByCommanditaireVaeCollectiveId({
        commanditaireVaeCollectiveId,
        offset,
        limit,
      }),
  },
  Query: {
    vaeCollective_getCommanditaireVaeCollective: async (
      _parent: unknown,
      {
        commanditaireVaeCollectiveId,
      }: { commanditaireVaeCollectiveId: string },
    ) => getCommanditaireVaeCollectiveById({ commanditaireVaeCollectiveId }),
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
    vaeCollective_getCohorteVaeCollectiveById: async (
      _parent: unknown,
      { cohorteVaeCollectiveId }: { cohorteVaeCollectiveId: string },
    ) => getCohorteVAECollectiveById({ cohorteVaeCollectiveId }),
    vaeCollective_commanditaireVaeCollectives: async (
      _parent: unknown,
      {
        offset,
        limit,
        searchFilter,
      }: { offset?: number; limit?: number; searchFilter?: string },
    ) => getCommanditaireVaeCollectives({ offset, limit, searchFilter }),
  },
  Mutation: {
    vaeCollective_createCohorteVaeCollective: async (
      _parent: unknown,
      {
        commanditaireVaeCollectiveId,
        nomCohorteVaeCollective,
      }: {
        commanditaireVaeCollectiveId: string;
        nomCohorteVaeCollective: string;
      },
    ) =>
      createCohorteVaeCollective({
        commanditaireVaeCollectiveId,
        nomCohorteVaeCollective,
      }),
    vaeCollective_updateNomCohorteVaeCollective: async (
      _parent: unknown,
      {
        cohorteVaeCollectiveId,
        nomCohorteVaeCollective,
      }: {
        cohorteVaeCollectiveId: string;
        nomCohorteVaeCollective: string;
      },
    ) =>
      updateNomCohorteVaeCollective({
        cohorteVaeCollectiveId,
        nomCohorteVaeCollective,
      }),
    vaeCollective_deleteCohorteVaeCollective: async (
      _parent: unknown,
      { cohorteVaeCollectiveId }: { cohorteVaeCollectiveId: string },
    ) => deleteCohorteVAECollective({ cohorteVaeCollectiveId }),
    vaeCollective_updateCohorteVAECollectiveCertification: async (
      _parent: unknown,
      {
        cohorteVaeCollectiveId,
        certificationId,
      }: { cohorteVaeCollectiveId: string; certificationId: string },
    ) =>
      updateCohorteVAECollectiveCertification({
        cohorteVaeCollectiveId,
        certificationId,
      }),
    vaeCollective_updateCohorteVAECollectiveOrganism: async (
      _parent: unknown,
      {
        cohorteVaeCollectiveId,
        organismId,
      }: { cohorteVaeCollectiveId: string; organismId: string },
    ) =>
      updateCohorteVAECollectiveOrganism({
        cohorteVaeCollectiveId,
        organismId,
      }),
    vaeCollective_publishCohorteVAECollective: async (
      _parent: unknown,
      { cohorteVaeCollectiveId }: { cohorteVaeCollectiveId: string },
    ) => publishCohorteVAECollective({ cohorteVaeCollectiveId }),
    vaeCollective_createCommanditaireVaeCollective: async (
      _parent: unknown,
      {
        raisonSociale,
        gestionnaireEmail,
        gestionnaireFirstname,
        gestionnaireLastname,
      }: {
        raisonSociale: string;
        gestionnaireEmail: string;
        gestionnaireFirstname: string;
        gestionnaireLastname: string;
      },
    ) =>
      createCommanditaireVaeCollective({
        raisonSociale,
        gestionnaireEmail,
        gestionnaireFirstname,
        gestionnaireLastname,
      }),
  },
};

export const vaeCollectiveResolvers = composeResolvers(
  unsafeResolvers,
  vaeCollectiveResolversSecurityMap,
);
