import { Organism, OrganismInformationsCommerciales, StatutValidationInformationsJuridiquesMaisonMereAAP } from "@prisma/client";
import mercurius from "mercurius";

import { getAccountById } from "../account/features/getAccount";
import { getAccountByKeycloakId } from "../account/features/getAccountByKeycloakId";
import { getConventionCollectiveById } from "../referential/features/getConventionCollectiveById";
import { getDegreeById } from "../referential/features/getDegreeByid";
import { getDepartmentById } from "../referential/features/getDepartmentById";
import { getDomaineById } from "../referential/features/getDomaineById";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import { adminUpdateMaisonMereAAP } from "./features/adminUpdateMaisonMereAAP";
import { createOrganismWithMaisonMereAAP } from "./features/createOrganismWithMaisonMereAAP";
import { createOrUpdateInformationsCommerciales } from "./features/createOrUpdateInformationsCommerciales";
import { createOrUpdateOrganismOnDegrees } from "./features/createOrUpdateOrganismOnDegrees";
import { findOrganismOnDegreeByOrganismId } from "./features/findOrganismOnDegreeByOrganismId";
import { getAccountByOrganismId } from "./features/getAccountByOrganismId";
import { getAgencesByGestionnaireAccountId } from "./features/getAgencesByGestionnaireAccountId";
import { getLLToEarthFromZip } from "./features/getLLToEarthFromZip";
import { getMaisonMereAAPByGestionnaireAccountId } from "./features/getMaisonMereAAPByGestionnaireAccountId";
import { getMaisonMereAAPOnDepartments } from "./features/getMaisonMereAAPDepartmentsAndRegions";
import { getMaisonMereAAPById } from "./features/getMaisonMereAAPId";
import { getMaisonMereAAPOnConventionCollectives } from "./features/getMaisonMereAAPOnConventionCollectives";
import { getMaisonMereAAPOnDomaines } from "./features/getMaisonMereAAPOnDomaines";
import { getMaisonMereAAPs } from "./features/getMaisonMereAAPs";
import { getOrganismById } from "./features/getOrganism";
import { getOrganismsByMaisonAAPId } from "./features/getOrganismsByMaisonAAPId";
import { isUserGestionnaireMaisonMereAAPOfOrganism } from "./features/isUserGestionnaireMaisonMereAAPOfOrganism";
import { isUserOwnerOfOrganism } from "./features/isUserOwnerOfOrganism";
import { updateFermePourAbsenceOuConges } from "./features/updateFermePourAbsenceOuConges";
import { updateOrganismById } from "./features/updateOrganism";
import { updateOrganismAccount } from "./features/updateOrganismAccount";
import { updateOrganismInterventionZone } from "./features/updateOrganismInterventionZone";
import { updateOrganismLLToEarth } from "./features/updateOrganismLLToEarth";
import { updateOrganismWithMaisonMereAAPById } from "./features/updateOrganismWithMaisonMereAAPById";
import {
  CreateOrUpdateOrganismWithMaisonMereAAPDataRequest,
  UpdateOrganismAccountInput,
  UpdateOrganismInterventionZoneInput,
} from "./organism.types";

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
    managedDegrees: (organism: Organism) =>
      findOrganismOnDegreeByOrganismId({ organismId: organism.id }),
    organismOnAccount: ({ id: organismId }: Organism) =>
      getAccountByOrganismId({
        organismId,
      }),
  },
  OrganismOnDegree: {
    degree: (organismOnDegree: { degreeId: string }) =>
      getDegreeById({ degreeId: organismOnDegree.degreeId }),
  },
  MaisonMereAAP: {
    maisonMereAAPOnDepartements: ({ id }: { id: string }) =>
      getMaisonMereAAPOnDepartments({ maisonMereAAPId: id }),
    maisonMereAAPOnDomaines: ({ id }: { id: string }) =>
      getMaisonMereAAPOnDomaines({ maisonMereAAPId: id }),
    maisonMereAAPOnConventionCollectives: ({ id }: { id: string }) =>
      getMaisonMereAAPOnConventionCollectives({ maisonMereAAPId: id }),
    organisms: ({ id: maisonMereAAPId }: { id: string }) =>
      getOrganismsByMaisonAAPId({ maisonMereAAPId }),
    gestionnaire: ({
      gestionnaireAccountId,
    }: {
      gestionnaireAccountId: string;
    }) => getAccountById({ id: gestionnaireAccountId }),
  },
  MaisonMereAAPOnDomaine: {
    domaine: ({ domaineId }: { domaineId: string }) =>
      getDomaineById({ domaineId }),
  },
  MaisonMereAAPOnConventionCollective: {
    ccn: ({ ccnId }: { ccnId: string }) =>
      getConventionCollectiveById({ ccnId }),
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
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }

        return updateOrganismById(
          {
            hasRole: context.auth.hasRole,
          },
          params,
        );
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    organism_adminUpdateMaisonMereAAP: async (
      _parent: unknown,
      params: {
        maisonMereAAPId: string;
        maisonMereAAPData: {
          zoneIntervention: {
            departmentId: string;
            isOnSite: boolean;
            isRemote: boolean;
          }[];
        };
      },
      context: GraphqlContext,
    ) => {
      if (
        context.auth.userInfo?.sub == undefined ||
        !context.auth.hasRole("admin")
      ) {
        throw new Error("Utilisateur non autorisé");
      }

      return adminUpdateMaisonMereAAP(params);
    },
    organism_createOrUpdateInformationsCommerciales: async (
      _parent: unknown,
      params: {
        informationsCommerciales: OrganismInformationsCommerciales & {
          id: string | null;
        };
      },
    ) => {
      const organismUpdated = await createOrUpdateInformationsCommerciales({
        informationsCommerciales: params.informationsCommerciales,
      });

      const llToEarth = await getLLToEarthFromZip({
        zip: organismUpdated.adresseCodePostal,
      });

      if (llToEarth) {
        await updateOrganismLLToEarth({
          organismId: params.informationsCommerciales.organismId,
          llToEarth,
        });
      }

      return organismUpdated;
    },

    organism_updateFermePourAbsenceOuConges: async (
      _parent: unknown,
      {
        organismId,
        fermePourAbsenceOuConges,
      }: {
        organismId: string;
        fermePourAbsenceOuConges: boolean;
      },
      context: GraphqlContext,
    ) => {
      const account = await getAccountByKeycloakId({
        keycloakId: context.auth.userInfo?.sub || "",
      });

      if (account?.organismId !== organismId) {
        throw new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Not authorized",
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
        organismData: CreateOrUpdateOrganismWithMaisonMereAAPDataRequest;
      },
      context: GraphqlContext,
    ) => {
      if (context.auth.userInfo?.sub == undefined) {
        throw new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Not authorized",
        );
      }

      if (!context.auth.hasRole("gestion_maison_mere_aap")) {
        throw new Error("Utilisateur non autorisé");
      }
      const keycloakAdmin = await context.app.getKeycloakAdmin();
      const keycloakId = context.auth.userInfo.sub;

      const result = await createOrganismWithMaisonMereAAP({
        keycloakAdmin,
        params,
        keycloakId,
      });
      return result;
    },
    organism_updateOrganismWithMaisonMereAAP: async (
      _parent: unknown,
      params: {
        organismId: string;
        organismData: CreateOrUpdateOrganismWithMaisonMereAAPDataRequest;
      },
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }
        const keycloakAdmin = await context.app.getKeycloakAdmin();

        return updateOrganismWithMaisonMereAAPById(
          {
            hasRole: context.auth.hasRole,
            keycloakAdmin,
            keycloakId: context.auth.userInfo?.sub,
          },
          params,
        );
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    organism_createOrUpdateOrganismOnDegrees: async (
      _parent: unknown,
      params: {
        data: { organismId: string; degreeIds: string[] };
      },
    ) =>
      createOrUpdateOrganismOnDegrees({
        organismId: params.data.organismId,
        degreeIds: params.data.degreeIds,
      }),
    organism_updateOrganismInterventionZone: async (
      _parent: unknown,
      params: {
        data: UpdateOrganismInterventionZoneInput;
      },
      context: GraphqlContext,
    ) => {
      if (context.auth.userInfo?.sub == undefined) {
        throw new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Not authorized",
        );
      }

      const roles = context.auth.userInfo.realm_access?.roles || [];
      const userKeycloakId = context.auth.userInfo.sub;

      //admin has every rights
      if (!roles.includes("admin")) {
        //if user is a "gestionnaire maison mere aap" he can access all organisms/agencies linked to his "maison mere"
        if (
          !isUserGestionnaireMaisonMereAAPOfOrganism({
            organismId: params.data.organismId,
            userKeycloakId,
            userRoles: roles,
          })
        ) {
          throw new Error("Utilisateur non autorisé");
        }
      }

      return updateOrganismInterventionZone({ params: params.data });
    },
    organism_updateOrganismAccount: async (
      _parent: unknown,
      params: {
        data: UpdateOrganismAccountInput;
      },
      context: GraphqlContext,
    ) => {
      if (context.auth.userInfo?.sub == undefined) {
        throw new Error("Utilisateur non autorisé");
      }

      const roles = context.auth.userInfo.realm_access?.roles || [];
      const userKeycloakId = context.auth.userInfo.sub;

      if (!roles.includes("admin")) {
        //if user is a "gestionnaire maison mere aap" he can access all organisms/agencies linked to his "maison mere"
        if (
          !isUserGestionnaireMaisonMereAAPOfOrganism({
            organismId: params.data.organismId,
            userKeycloakId,
            userRoles: roles,
          })
        ) {
          throw new Error("Utilisateur non autorisé");
        }
      }
      return updateOrganismAccount({ params: params.data });
    },
  },
  Query: {
    organism_getOrganism: async (
      _parent: unknown,
      params: {
        id: string;
      },
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }

        const organism = await getOrganismById({ organismId: params.id });

        const roles = context.auth.userInfo.realm_access?.roles || [];
        const userKeycloakId = context.auth.userInfo.sub;
        //admin has every rights
        if (!roles.includes("admin")) {
          //if user is a "gestionnaire maison mere aap" he can access all organisms/agencies linked to his "maison mere"
          if (roles.includes("gestion_maison_mere_aap")) {
            if (
              !isUserGestionnaireMaisonMereAAPOfOrganism({
                organismId: organism.id,
                userKeycloakId,
                userRoles: roles,
              })
            ) {
              throw new Error("Utilisateur non autorisé");
            }
          }
          //if user is a "aap" he can access his own organism/agency
          else if (roles.includes("manage_candidacy")) {
            if (
              !isUserOwnerOfOrganism({
                organismId: organism.id,
                userKeycloakId,
                userRoles: roles,
              })
            ) {
              throw new Error("Utilisateur non autorisé");
            }
          } else {
            throw new Error("Utilisateur non autorisé");
          }
        }

        return organism;
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    organism_getMaisonMereAAPs: async (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        searchFilter?: string;
        legalValidationStatus?: StatutValidationInformationsJuridiquesMaisonMereAAP;
      },
      context: GraphqlContext,
    ) => {
      if (!context.auth.hasRole("admin")) {
        throw new Error("Utilisateur non autorisé");
      }

      return getMaisonMereAAPs(params);
    },
    organism_getMaisonMereAAPById: async (
      _parent: unknown,
      params: {
        maisonMereAAPId: string;
      },
      context: GraphqlContext,
    ) => {
      if (!context.auth.hasRole("admin")) {
        throw new Error("Utilisateur non autorisé");
      }

      return getMaisonMereAAPById({ id: params.maisonMereAAPId });
    },
  },
};
