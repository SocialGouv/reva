import { Organism, OrganismInformationsCommerciales } from "@prisma/client";
import mercurius from "mercurius";

import { getAccountByKeycloakId } from "../account/features/getAccountByKeycloakId";
import { getDepartmentById } from "../referential/features/getDepartmentById";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import { createOrganismAgency } from "./features/createOrganismAgency";
import { createOrUpdateInformationsCommerciales } from "./features/createOrUpdateInformationsCommerciales";
import { getAgencesByGestionnaireAccountId } from "./features/getAgencesByGestionnaireAccountId";
import { getMaisonMereAAPByGestionnaireAccountId } from "./features/getMaisonMereAAPByGestionnaireAccountId";
import { getMaisonMereAAPOnDepartments } from "./features/getMaisonMereAAPDepartmentsAndRegions";
import { getMaisonMereAAPById } from "./features/getMaisonMereAAPId";
import { getOrganismById } from "./features/getOrganism";
import { updateFermePourAbsenceOuConges } from "./features/updateFermePourAbsenceOuConges";
import { updateOrganismById } from "./features/updateOrganism";
import { CreateOrganismAgencyDataRequest } from "./organism.types";

export const resolvers = {
  Account: {
    agences: ({ id: accountId }: { id: string }) =>
      getAgencesByGestionnaireAccountId({ gestionnaireAccountId: accountId }),
    maisonMereAAP: ({ id: accountId }: { id: string }) =>
      getMaisonMereAAPByGestionnaireAccountId({
        gestionnaireAccountId: accountId,
      }),
  },
  Organism: {
    maisonMereAAP: (organism: Organism) => {
      if (!organism.maisonMereAAPId) {
        return null;
      }
      return getMaisonMereAAPById({
        id: organism.maisonMereAAPId,
      });
    },
  },
  MaisonMereAAP: {
    maisonMereAAPOnDepartements: ({ id }: { id: string }) =>
      getMaisonMereAAPOnDepartments({ maisonMereAAPId: id }),
  },
  MaisonMereAAPOnDepartment: {
    departement: ({ departementId }: { departementId: string }) =>
      getDepartmentById({ id: departementId }),
  },
  Mutation: {
    organism_updateOrganism: async (
      _parent: unknown,
      params: {
        organismId: string;
        organismData: {
          label: string;
          contactAdministrativeEmail: string;
          contactAdministrativePhone: string | null;
          website: string | null;
          isActive: boolean;
        };
      },
      context: GraphqlContext
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized"
          );
        }

        return updateOrganismById(
          {
            hasRole: context.auth.hasRole,
          },
          params
        );
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    organism_createOrUpdateInformationsCommerciales: (
      _parent: unknown,
      params: {
        informationsCommerciales: OrganismInformationsCommerciales & {
          id: string | null;
        };
      }
    ) =>
      createOrUpdateInformationsCommerciales({
        informationsCommerciales: params.informationsCommerciales,
      }),

    organism_updateFermePourAbsenceOuConges: async (
      _parent: unknown,
      {
        organismId,
        fermePourAbsenceOuConges,
      }: {
        organismId: string;
        fermePourAbsenceOuConges: boolean;
      },
      context: GraphqlContext
    ) => {
      const account = await getAccountByKeycloakId({
        keycloakId: context.auth.userInfo?.sub || "",
      });

      if (account?.organismId !== organismId) {
        throw new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Not authorized"
        );
      }
      return updateFermePourAbsenceOuConges({
        organismId,
        fermePourAbsenceOuConges,
      });
    },
    organism_createOrganismWithMaisonMereAAP: async (
      _parent: unknown,
      params: {
        organismData: CreateOrganismAgencyDataRequest;
      },
      context: GraphqlContext
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized"
          );
        }

        if (!context.auth.hasRole("admin")) {
          throw new Error("Utilisateur non autorisé");
        }
        const keycloakAdmin = await context.app.getKeycloakAdmin();
        const keycloakId = context.auth.userInfo.sub;

        return createOrganismAgency({ keycloakAdmin, params, keycloakId });
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
  },
  Query: {
    organism_getOrganism: async (
      _parent: unknown,
      params: {
        id: string;
      },
      context: GraphqlContext
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized"
          );
        }

        if (!context.auth.hasRole("admin")) {
          throw new Error("Utilisateur non autorisé");
        }

        return getOrganismById({ organismId: params.id });
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
  },
};
