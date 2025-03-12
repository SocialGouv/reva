import {
  MaisonMereAAPLegalInformationDocumentsDecisionEnum,
  Organism,
  StatutValidationInformationsJuridiquesMaisonMereAAP,
} from "@prisma/client";
import mercurius from "mercurius";

import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { getAccountById } from "../account/features/getAccount";
import { getAccountByKeycloakId } from "../account/features/getAccountByKeycloakId";
import { getConventionCollectiveById } from "../referential/features/getConventionCollectiveById";
import { getDegreeById } from "../referential/features/getDegreeByid";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import {
  sendLegalInformationDocumentsApprovalEmail,
  sendLegalInformationDocumentsUpdateNeededEmail,
} from "./emails/sendLegalInformationDocumentsDecisionEmail";
import { acceptCgu } from "./features/acceptCgu";
import { adminCreateMaisonMereAAPLegalInformationValidationDecision } from "./features/adminCreateMaisonMereAAPLegalInformationValidationDecision";
import { adminUpdateLegalInformationValidationStatus } from "./features/adminUpdateMaisonMereAAP";
import { createLieuAccueilInfo } from "./features/createLieuAccueilInfo";
import { createOrganismAccount } from "./features/createOrganismAccount";
import { findOrganismOnDegreeByOrganismId } from "./features/findOrganismOnDegreeByOrganismId";
import { getAccountsByOrganismId } from "./features/getAccountsByOrganismId";
import { getAgencesByGestionnaireAccountId } from "./features/getAgencesByGestionnaireAccountId";
import { getLastProfessionalCgu } from "./features/getLastProfessionalCgu";
import { getMaisonMereAAPByGestionnaireAccountId } from "./features/getMaisonMereAAPByGestionnaireAccountId";
import { getMaisonMereAAPById } from "./features/getMaisonMereAAPId";
import { getMaisonMereAAPLegalInformationDocumentFileNameUrlAndMimeType } from "./features/getMaisonMereAAPLegalInformationDocumentFileNameUrlAndMimeType";
import { getMaisonMereAAPLegalInformationDocuments } from "./features/getMaisonMereAAPLegalInformationDocuments";
import { getMaisonMereAAPLegalInformationDocumentsDecisionsByMaisonMereAAPIdAndDecision } from "./features/getMaisonMereAAPLegalInformationDocumentsDecisionsByMaisonMereAAPIdAndDecision";
import { getMaisonMereAAPOnConventionCollectives } from "./features/getMaisonMereAAPOnConventionCollectives";
import { getMaisonMereAAPs } from "./features/getMaisonMereAAPs";
import { getOrganismById } from "./features/getOrganism";
import { getOrganismCcnsByOrganismId } from "./features/getOrganismCcnsByOrganismId";
import { getOrganismFormacodesByOrganismId } from "./features/getOrganismFormacodesByOrganismId";
import { getOrganismsByMaisonAAPId } from "./features/getOrganismsByMaisonAAPId";
import { getRemoteZonesByOrganismId } from "./features/getRemoteZonesByOrganismId";
import { isOrganismVisibleInCandidateSearchResults } from "./features/isOrganismVisibleInCandidateSearchResults";
import { isUserGestionnaireMaisonMereAAPOfOrganism } from "./features/isUserGestionnaireMaisonMereAAPOfOrganism";
import { isUserOwnerOfOrganism } from "./features/isUserOwnerOfOrganism";
import { updateFermePourAbsenceOuConges } from "./features/updateFermePourAbsenceOuConges";
import { updateMaisonMereAccountSetup } from "./features/updateMaisonMereAccountSetup";
import { updateMaisonMereIsSignalized } from "./features/updateMaisonMereIsSignalized";
import { updateMaisonMereLegalInformation } from "./features/updateMaisonMereLegalInformation";
import { updateMaisonMereOrganismsIsActive } from "./features/updateMaisonMereOrganismsIsActive";
import { updateOrganismAccount } from "./features/updateOrganismAccount";
import { updateOrganismAccountAndOrganism } from "./features/updateOrganismAccountAndOrganism";
import { updateOrganismDegreesAndFormacodes } from "./features/updateOrganismDegreesAndFormacodes";
import { resolversSecurityMap } from "./organism.security";
import {
  CreateLieuAccueilInfoInput,
  CreateOrganismAccountInput,
  RemoteZone,
  UpdateMaisonMereAAPLegalValidationInput,
  UpdateMaisonMereLegalInformationInput,
  UpdateOrganimsAccountAndOrganismInput,
  UpdateOrganismAccountInput,
  OrganismInformationsCommerciales,
} from "./organism.types";
import { updateMaisonMereAAPFinancingMethods } from "./features/updateMaisonMereAAPFinancingMethods";
import { createOrUpdateOnSiteOrganismGeneralInformation } from "./features/createOrUpdateOnSiteOrganismGeneralInformation";
import { createOrUpdateRemoteOrganismGeneralInformation } from "./features/createOrUpdateRemoteOrganismGeneralInformation";
import { buildAAPAuditLogUserInfoFromContext } from "../aap-log/features/logAAPAuditEvent";

const unsafeResolvers = {
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
    accounts: ({ id: organismId }: Organism) =>
      getAccountsByOrganismId({
        organismId,
      }),
    formacodes: ({ id: organismId }: Organism) =>
      getOrganismFormacodesByOrganismId({
        organismId,
      }),
    conventionCollectives: ({ id: organismId }: Organism) =>
      getOrganismCcnsByOrganismId({
        organismId,
      }),
    remoteZones: async ({ id: organismId }: Organism) =>
      (
        await getRemoteZonesByOrganismId({
          organismId,
        })
      ).map((r) => r.remoteZone),
    isVisibleInCandidateSearchResults: async ({ id: organismId }: Organism) =>
      await isOrganismVisibleInCandidateSearchResults({
        organismId,
      }),
    isMaisonMereMCFCompatible: async ({ maisonMereAAPId }: Organism) =>
      (
        await getMaisonMereAAPById({
          id: maisonMereAAPId || "",
        })
      )?.isMCFCompatible,
  },
  OrganismOnDegree: {
    degree: (organismOnDegree: { degreeId: string }) =>
      getDegreeById({ degreeId: organismOnDegree.degreeId }),
  },
  MaisonMereAAP: {
    maisonMereAAPOnConventionCollectives: ({ id }: { id: string }) =>
      getMaisonMereAAPOnConventionCollectives({ maisonMereAAPId: id }),
    organisms: ({ id: maisonMereAAPId }: { id: string }) =>
      getOrganismsByMaisonAAPId({ maisonMereAAPId }),
    gestionnaire: ({
      gestionnaireAccountId,
    }: {
      gestionnaireAccountId: string;
    }) => getAccountById({ id: gestionnaireAccountId }),
    legalInformationDocumentsDecisions: (
      { id }: { id: string },
      {
        input,
      }: {
        input?: {
          decision?: MaisonMereAAPLegalInformationDocumentsDecisionEnum;
        };
      },
    ) =>
      getMaisonMereAAPLegalInformationDocumentsDecisionsByMaisonMereAAPIdAndDecision(
        {
          maisonMereAAPId: id,
          decision: input?.decision,
        },
      ),
    legalInformationDocuments: ({ id: maisonMereAAPId }: { id: string }) =>
      getMaisonMereAAPLegalInformationDocuments({
        maisonMereAAPId,
      }),
    cgu: async ({
      cguVersion,
      cguAcceptedAt,
    }: {
      cguVersion: number;
      cguAcceptedAt?: Date;
    }) => ({
      version: cguVersion,
      acceptedAt: cguAcceptedAt,
      isLatestVersion: (await getLastProfessionalCgu())?.version == cguVersion,
    }),
  },
  MaisonMereAAPLegalInformationDocuments: {
    attestationURSSAFFile: async (
      { maisonMereAAPId }: { maisonMereAAPId: string },
      _: unknown,
    ) =>
      getMaisonMereAAPLegalInformationDocumentFileNameUrlAndMimeType({
        maisonMereAAPId,
        fileType: "attestationURSSAFFile",
      }),
    justificatifIdentiteDirigeantFile: async (
      {
        maisonMereAAPId,
      }: {
        maisonMereAAPId: string;
      },
      _: unknown,
    ) =>
      getMaisonMereAAPLegalInformationDocumentFileNameUrlAndMimeType({
        maisonMereAAPId,
        fileType: "justificatifIdentiteDirigeantFile",
      }),
    lettreDeDelegationFile: async (
      {
        maisonMereAAPId,
      }: {
        maisonMereAAPId: string;
      },
      _: unknown,
    ) =>
      getMaisonMereAAPLegalInformationDocumentFileNameUrlAndMimeType({
        maisonMereAAPId,
        fileType: "lettreDeDelegationFile",
      }),
    justificatifIdentiteDelegataireFile: async (
      {
        maisonMereAAPId,
      }: {
        maisonMereAAPId: string;
      },
      _: unknown,
    ) =>
      getMaisonMereAAPLegalInformationDocumentFileNameUrlAndMimeType({
        maisonMereAAPId,
        fileType: "justificatifIdentiteDelegataireFile",
      }),
  },
  MaisonMereAAPOnConventionCollective: {
    ccn: ({ ccnId }: { ccnId: string }) =>
      getConventionCollectiveById({ ccnId }),
  },
  Mutation: {
    organism_createOrUpdateRemoteOrganismGeneralInformation: async (
      _parent: unknown,
      params: {
        organismId: string;
        informationsCommerciales: {
          nomPublic: string | null;
          telephone: string | null;
          siteInternet: string | null;
          emailContact: string | null;
        };
        remoteZones: RemoteZone[];
      },
    ) => createOrUpdateRemoteOrganismGeneralInformation(params),

    organism_createOrUpdateOnSiteOrganismGeneralInformation: async (
      _parent: unknown,
      params: {
        organismId: string;
        informationsCommerciales: OrganismInformationsCommerciales;
      },
    ) => createOrUpdateOnSiteOrganismGeneralInformation(params),

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

      const maisonMereAAP = await getMaisonMereAAPByGestionnaireAccountId({
        gestionnaireAccountId: account?.id || "",
      });

      // Pour pouvoir mettre à jour l'agence, il faut remplir au moins une condition parmi :
      // - Être admin
      // - Être le gestionnaire de l'agence
      // - Être le gestionnaire de la maison mere
      if (
        !context.auth.hasRole("admin") &&
        account?.organismId !== organismId &&
        !maisonMereAAP
      ) {
        throw new Error("Utilisateur non autorisé");
      }

      return updateFermePourAbsenceOuConges({
        organismId,
        fermePourAbsenceOuConges,
      });
    },
    organism_createLieuAccueilInfo: async (
      _parent: unknown,
      {
        data,
      }: {
        data: CreateLieuAccueilInfoInput;
      },
      context: GraphqlContext,
    ) => {
      if (context.auth.userInfo?.sub == undefined) {
        throw new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Not authorized",
        );
      }

      const result = await createLieuAccueilInfo({
        params: data,
        keycloakId: context.auth.userInfo.sub,
      });
      return result;
    },

    organism_acceptCgu: async (
      _parent: unknown,
      _: any,
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }

        return acceptCgu({
          hasRole: context.auth.hasRole,
          keycloakId: context.auth.userInfo?.sub,
        });
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    organism_updateOrganismDegreesAndFormacodes: async (
      _parent: unknown,
      params: {
        data: {
          organismId: string;
          degreeIds: string[];
          formacodeIds: string[];
        };
      },
    ) =>
      updateOrganismDegreesAndFormacodes({
        organismId: params.data.organismId,
        degreeIds: params.data.degreeIds,
        formacodeIds: params.data.formacodeIds,
      }),
    organism_createAccount: async (
      _parent: unknown,
      {
        data,
      }: {
        data: CreateOrganismAccountInput;
      },
    ) => createOrganismAccount(data),
    organism_updateAccountAndOrganism: async (
      _parent: unknown,
      {
        data,
      }: {
        data: UpdateOrganimsAccountAndOrganismInput;
      },
    ) => updateOrganismAccountAndOrganism(data),
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
    organism_updateLegalInformationValidationDecision: async (
      _parent: unknown,
      params: {
        data: UpdateMaisonMereAAPLegalValidationInput;
      },
      context: GraphqlContext,
    ) => {
      if (context.auth.userInfo?.sub == undefined) {
        throw new Error("Utilisateur non autorisé");
      }

      const statutValidationInformationsJuridiquesMaisonMereAAP =
        params.data.decision === "VALIDE" ? "A_JOUR" : "A_METTRE_A_JOUR";

      const decision =
        await adminCreateMaisonMereAAPLegalInformationValidationDecision(
          params.data.maisonMereAAPId,
          {
            decision: params.data.decision,
            internalComment: params.data.internalComment ?? "",
            aapComment: params.data.aapComment ?? "",
            aapUpdatedDocumentsAt: params.data.aapUpdatedDocumentsAt,
          },
        );
      const maisonMereAAP = await adminUpdateLegalInformationValidationStatus({
        maisonMereAAPId: params.data.maisonMereAAPId,
        maisonMereAAPData: {
          statutValidationInformationsJuridiquesMaisonMereAAP,
        },
      });

      if (params.data.decision === "DEMANDE_DE_PRECISION") {
        await sendLegalInformationDocumentsUpdateNeededEmail({
          email: maisonMereAAP.gestionnaire.email,
          managerName: `${maisonMereAAP.gestionnaire.firstname} ${maisonMereAAP.gestionnaire.lastname}`,
          aapComment: decision.aapComment,
        });
      } else if (params.data.decision === "VALIDE") {
        await sendLegalInformationDocumentsApprovalEmail({
          email: maisonMereAAP.gestionnaire.email,
          managerName: `${maisonMereAAP.gestionnaire.firstname} ${maisonMereAAP.gestionnaire.lastname}`,
        });
      }

      return decision;
    },
    organism_updateMaisonMereAccountSetup: async (
      _parent: unknown,
      params: {
        data: {
          maisonMereAAPId: string;
          showAccountSetup: boolean;
        };
      },
      context: GraphqlContext,
    ) => {
      if (context.auth.userInfo?.sub == undefined) {
        throw new Error("Utilisateur non autorisé");
      }

      const isGestionaire = context.auth.hasRole("gestion_maison_mere_aap");
      const isAdmin = context.auth.hasRole("admin");

      if (!isGestionaire && !isAdmin) {
        throw new Error("Utilisateur non autorisé");
      }

      return updateMaisonMereAccountSetup(params.data);
    },
    organism_updateMaisonMereOrganismsIsActive: async (
      _parent: unknown,
      params: {
        data: {
          maisonMereAAPId: string;
          isActive: boolean;
        };
      },
      context: GraphqlContext,
    ) =>
      updateMaisonMereOrganismsIsActive({
        ...params.data,
        userInfo: buildAAPAuditLogUserInfoFromContext(context),
      }),
    organism_updateMaisonMereIsSignalized: async (
      _parent: unknown,
      params: {
        data: {
          maisonMereAAPId: string;
          isSignalized: boolean;
        };
      },
      context: GraphqlContext,
    ) =>
      updateMaisonMereIsSignalized({
        ...params.data,
        userInfo: buildAAPAuditLogUserInfoFromContext(context),
      }),
    organism_updateMaisonMereLegalInformation: async (
      _parent: unknown,
      params: {
        data: UpdateMaisonMereLegalInformationInput;
      },
      context: GraphqlContext,
    ) =>
      updateMaisonMereLegalInformation({
        ...params.data,
        userInfo: buildAAPAuditLogUserInfoFromContext(context),
      }),
    organism_updateMaisonMereAAPFinancingMethods: async (
      _parent: unknown,
      params: { maisonMereAAPId: string; isMCFCompatible: boolean },
      context: GraphqlContext,
    ) =>
      updateMaisonMereAAPFinancingMethods({
        ...params,
        userInfo: buildAAPAuditLogUserInfoFromContext(context),
      }),
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

        if (!organism) {
          return null;
        }

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
          //if user is a "aap" he can access his own organism
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
    ) => getMaisonMereAAPById({ id: params.maisonMereAAPId }),
  },
};

export const organismResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
