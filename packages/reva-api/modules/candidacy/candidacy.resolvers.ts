import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  CandidacyTypeAccompagnement,
  CandidateTypology,
  FinanceModule,
} from "@prisma/client";
import mercurius from "mercurius";

import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { logCandidacyAuditEvent } from "../candidacy-log/features/logCandidacyAuditEvent";
import { getCandidateById } from "../candidate/features/getCandidateById";
import { getOrganismById } from "../organism/features/getOrganism";
import { getReorientationReasonById } from "../referential/features/getReorientationReasonById";

import {
  ArchiveCandidacyParams,
  Candidacy,
  CandidacyBusinessEvent,
  CandidacySortByFilter,
  CandidacyStatusFilter,
  SearchOrganismFilter,
} from "./candidacy.types";
import { sendCandidacyArchivedEmailToCertificateur } from "./emails/sendCandidacyArchivedEmailToCertificateur";
import { sendCandidacyDropOutEmailToCandidate } from "./emails/sendCandidacyDropOutEmailToCandidate";
import { sendCandidacyDropOutEmailToCertificateur } from "./emails/sendCandidacyDropOutEmailToCertificateur";
import { cancelDropOutCandidacyEvent } from "./events/cancel-drop-out.audit-event";
import { addExperienceToCandidacy } from "./features/addExperienceToCandidacy";
import { archiveCandidacy } from "./features/archiveCandidacy";
import { canAccessCandidacy } from "./features/canAccessCandidacy";
import { cancelDropOutCandidacy } from "./features/cancelDropOutCandidacy";
import { dropOutCandidacy } from "./features/dropOutCandidacy";
import { getCandidacies } from "./features/getCandicacies";
import { getCandidacy } from "./features/getCandidacy";
import { getCandidacyCcns } from "./features/getCandidacyCcns";
import { getCandidacyCertificationAuthorityLocalAccounts } from "./features/getCandidacyCertificationAuthorityLocalAccounts";
import { getCandidacyConventionCollectiveById } from "./features/getCandidacyConventionCollectiveById";
import { getCandidacyCountByStatus } from "./features/getCandidacyCountByStatus";
import { getCandidacyDropOutByCandidacyId } from "./features/getCandidacyDropOutByCandidacyId";
import { getCandidacyFinancingMethodById } from "./features/getCandidacyFinancingMethodById";
import { getCandidacyGoals } from "./features/getCandidacyGoals";
import { getCandidacyOnCandidacyFinancingMethodsByCandidacyId } from "./features/getCandidacyOnCandidacyFinancingMethodsByCandidacyId";
import { getCandidacyStatusesByCandidacyId } from "./features/getCandidacyStatusesByCandidacyId";
import { getDropOutReasonById } from "./features/getDropOutReasonById";
import { getExperiencesByCandidacyId } from "./features/getExperiencesByCandidacyId";
import { searchOrganismsForCandidacy } from "./features/searchOrganismsForCandidacy";
import { searchOrganismsForCandidacyAsAdmin } from "./features/searchOrganismsForCandidacyAsAdmin";
import { selectOrganismForCandidacy } from "./features/selectOrganismForCandidacy";
import { selectOrganismForCandidacyAsAdmin } from "./features/selectOrganismForCandidacyAsAdmin";
import { setReadyForJuryEstimatedAt } from "./features/setReadyForJuryEstimatedAt";
import { submitCandidacy } from "./features/submitCandidacy";
import { submitEndAccompagnement } from "./features/submitEndAccompagnement";
import { takeOverCandidacy } from "./features/takeOverCandidacy";
import { unarchiveCandidacy } from "./features/unarchiveCandidacy";
import { updateAppointmentInformations } from "./features/updateAppointmentInformations";
import { updateCandidacyFinanceModule } from "./features/updateCandidacyFinanceModule";
import { updateCandidacyInactifDecision } from "./features/updateCandidacyInactifDecision";
import { updateCandidacyTypeAccompagnement } from "./features/updateCandidacyTypeAccompagnement";
import { updateCandidacyTypologyAndCcn } from "./features/updateCandidacyTypologyAndCcn";
import { updateCandidateCandidacyDropoutDecision } from "./features/updateCandidateCandidacyDropoutDecision";
import { updateContactOfCandidacy } from "./features/updateContactOfCandidacy";
import { updateExperienceOfCandidacy } from "./features/updateExperienceOfCandidacy";
import { updateGoalsOfCandidacy } from "./features/updateGoalsOfCandidacy";
import { validateDropOutCandidacy } from "./features/validateDropOutCandidacy";
import { logCandidacyEvent } from "./logCandidacyEvent";
import { resolversSecurityMap } from "./security/security";

const unsafeResolvers = {
  Candidacy: {
    goals: async ({ id: candidacyId }: Candidacy) =>
      getCandidacyGoals({ candidacyId }),
    experiences: async ({ id: candidacyId }: Candidacy) =>
      getExperiencesByCandidacyId({ candidacyId }),
    candidate: async ({ candidateId }: { candidateId: string }) =>
      getCandidateById({ candidateId }),
    organism: ({ organismId }: { organismId: string }) =>
      getOrganismById({ organismId }),
    candidacyStatuses: ({ id: candidacyId }: Candidacy) =>
      getCandidacyStatusesByCandidacyId({ candidacyId }),
    reorientationReason: ({
      reorientationReasonId,
    }: {
      reorientationReasonId: string;
    }) => getReorientationReasonById({ reorientationReasonId }),
    conventionCollective: ({ ccnId }: { ccnId: string }) =>
      getCandidacyConventionCollectiveById({ ccnId }),
    candidacyDropOut: ({ id: candidacyId }: Candidacy) =>
      getCandidacyDropOutByCandidacyId({ candidacyId }),
    candidacyOnCandidacyFinancingMethods: ({ id: candidacyId }: Candidacy) =>
      getCandidacyOnCandidacyFinancingMethodsByCandidacyId({ candidacyId }),
    certificationAuthorityLocalAccounts: ({ id: candidacyId }: Candidacy) =>
      getCandidacyCertificationAuthorityLocalAccounts({ candidacyId }),
  },
  CandidacyOnCandidacyFinancingMethod: {
    candidacyFinancingMethod: ({
      candidacyFinancingMethodId,
    }: {
      candidacyFinancingMethodId: string;
    }) => getCandidacyFinancingMethodById({ candidacyFinancingMethodId }),
  },
  CandidacyDropOut: {
    dropOutReason: ({ dropOutReasonId }: { dropOutReasonId: string }) =>
      getDropOutReasonById({ dropOutReasonId }),
  },
  Query: {
    getCandidacyById: async (_: unknown, { id }: { id: string }) =>
      getCandidacy({ candidacyId: id }),
    getCandidacies: async (
      _parent: unknown,
      _params: {
        limit?: number;
        offset?: number;
        statusFilter?: CandidacyStatusFilter;
        searchFilter?: string;
        sortByFilter?: CandidacySortByFilter;
        maisonMereAAPId?: string;
        cohorteVaeCollectiveId?: string;
      },
      context: GraphqlContext,
    ) => {
      try {
        return getCandidacies({
          hasRole: context.auth.hasRole,
          iAMId: context.auth?.userInfo?.sub || "",
          ..._params,
        });
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    getRandomOrganismsForCandidacy: async (
      _: unknown,
      {
        candidacyId,
        searchFilter,
        searchText,
      }: {
        candidacyId: string;
        searchFilter: SearchOrganismFilter;
        searchText?: string;
      },
    ) =>
      searchOrganismsForCandidacy({
        candidacyId,
        searchFilter,
        searchText,
      }),
    candidacy_searchOrganismsForCandidacyAsAdmin: async (
      _: unknown,
      payload: {
        candidacyId: string;
        offset?: number;
        limit?: number;
        searchText?: string;
      },
    ) => searchOrganismsForCandidacyAsAdmin(payload),
    candidacy_candidacyCountByStatus: async (
      _: unknown,
      _params: {
        searchFilter?: string;
        maisonMereAAPId?: string;
      },
      context: GraphqlContext,
    ) =>
      getCandidacyCountByStatus({
        hasRole: context.auth!.hasRole,
        IAMId: context.auth!.userInfo!.sub,
        ..._params,
      }),
    candidacy_getCandidacyCcns: async (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        searchFilter?: string;
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

        return getCandidacyCcns(
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
    candidacy_canAccessCandidacy: async (
      _: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext,
    ) =>
      canAccessCandidacy({
        candidacyId,
        keycloakId: context.auth.userInfo?.sub || "",
        roles: context.auth.userInfo?.realm_access?.roles || [],
      }),
  },
  Mutation: {
    candidacy_submitCandidacy: async (
      _: unknown,
      payload: { candidacyId: string },
      context: GraphqlContext,
    ) => {
      const result = await submitCandidacy({
        candidacyId: payload.candidacyId,
      });

      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.SUBMITTED_CANDIDACY,
        context,
        result: result as Record<string, any>,
      });
      await logCandidacyAuditEvent({
        candidacyId: payload.candidacyId,
        eventType: "CANDIDACY_SUBMITTED",
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      return result;
    },

    candidacy_addExperience: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) =>
      addExperienceToCandidacy({
        candidacyId: payload.candidacyId,
        experience: payload.experience,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),

    candidacy_updateExperience: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) =>
      updateExperienceOfCandidacy({
        candidacyId: payload.candidacyId,
        experienceId: payload.experienceId,
        experience: payload.experience,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),

    candidacy_updateGoals: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) => {
      const result = await updateGoalsOfCandidacy({
        candidacyId: payload.candidacyId,
        goals: payload.goals,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.UPDATED_GOALS,
        context,
        result: { updatedGoalsCount: result },
      });
      return result;
    },

    candidacy_updateContact: async (
      _: unknown,
      params: {
        candidateId: string;
        candidateData: {
          firstname: string;
          lastname: string;
          phone: string;
          email: string;
        };
      },
      context: GraphqlContext,
    ) => {
      try {
        const result = await updateContactOfCandidacy(params);

        const candidacies = await prismaClient.candidacy.findMany({
          where: { candidateId: params.candidateId },
          select: { id: true },
        });

        await Promise.all(
          candidacies.map(async (c) =>
            logCandidacyAuditEvent({
              candidacyId: c.id,
              eventType: "CONTACT_INFO_UPDATED",
              userKeycloakId: context.auth.userInfo?.sub,
              userEmail: context.auth.userInfo?.email,
              userRoles: context.auth.userInfo?.realm_access?.roles || [],
            }),
          ),
        );

        return result;
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },

    candidacy_archiveById: async (
      _: unknown,
      payload: ArchiveCandidacyParams,
      context: GraphqlContext,
    ) => {
      const candidacy = await archiveCandidacy(payload);

      sendCandidacyArchivedEmailToCertificateur(candidacy.id);

      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        context,
        result: candidacy,
        eventType: CandidacyBusinessEvent.ARCHIVED_CANDIDACY,
      });

      await logCandidacyAuditEvent({
        candidacyId: payload.candidacyId,
        eventType: "CANDIDACY_ARCHIVED",
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      return candidacy;
    },
    candidacy_unarchiveById: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) => {
      const result = await unarchiveCandidacy({
        candidacyId: payload.candidacyId,
      });
      logCandidacyEvent({
        context,
        result,
        eventType: CandidacyBusinessEvent.UNARCHIVED_CANDIDACY,
      });
      await logCandidacyAuditEvent({
        candidacyId: payload.candidacyId,
        eventType: "CANDIDACY_UNARCHIVED",
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      return result;
    },
    candidacy_updateAppointmentInformations: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) => {
      try {
        const result = await updateAppointmentInformations({
          candidacyId: payload.candidacyId,
          appointmentInformations: payload.appointmentInformations,
        });
        logCandidacyEvent({
          candidacyId: payload.candidacyId,
          eventType: CandidacyBusinessEvent.UPDATED_APPOINTMENT_INFO,
          extraInfo: { ...payload.appointmentInformations },
          context,
          result,
        });
        await logCandidacyAuditEvent({
          candidacyId: payload.candidacyId,
          eventType: "APPOINTMENT_INFO_UPDATED",
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
          details: {
            firstAppointmentOccuredAt:
              payload.appointmentInformations.firstAppointmentOccuredAt,
          },
        });
        return result;
      } catch (error) {
        logger.error(error);
        return new Error(
          `Impossible de mettre à jour la date du rendez-vous pédagogique: ${error}`,
        );
      }
    },

    candidacy_takeOver: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) => {
      const result = await takeOverCandidacy({
        candidacyId: payload.candidacyId,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.TOOK_OVER_CANDIDACY,
        context,
        result,
      });
      return result;
    },

    candidacy_selectOrganism: async (
      _: unknown,
      payload: any,
      context: GraphqlContext,
    ) => {
      const result = await selectOrganismForCandidacy({
        candidacyId: payload.candidacyId,
        organismId: payload.organismId,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });

      return result;
    },
    candidacy_selectOrganismAsAdmin: async (
      _: unknown,
      payload: {
        candidacyId: string;
        organismId: string;
      },
      context: GraphqlContext,
    ) => {
      const result = await selectOrganismForCandidacyAsAdmin({
        candidacyId: payload.candidacyId,
        organismId: payload.organismId,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });

      return result;
    },
    candidacy_submitTypologyForm: async (
      _: unknown,
      payload: {
        candidacyId: string;
        typology: CandidateTypology;
        additionalInformation?: string;
        ccnId?: string;
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

        await updateCandidacyTypologyAndCcn(context.auth, payload);
        return getCandidacy({ candidacyId: payload.candidacyId });
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },

    candidacy_dropOut: async (
      _: unknown,
      payload: {
        candidacyId: string;
        dropOut: {
          dropOutReasonId: string;
          otherReasonContent?: string;
        };
      },
      context: GraphqlContext,
    ) => {
      const candidacy = await dropOutCandidacy({
        candidacyId: payload.candidacyId,
        dropOutReasonId: payload.dropOut.dropOutReasonId,
        otherReasonContent: payload.dropOut.otherReasonContent,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });

      if (candidacy?.candidate?.email) {
        sendCandidacyDropOutEmailToCandidate(candidacy.candidate.email);
      }

      if (candidacy?.id) {
        sendCandidacyDropOutEmailToCertificateur(candidacy.id);
      }

      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.DROPPED_OUT_CANDIDACY,
        extraInfo: { ...payload.dropOut },
        context,
        result: candidacy,
      });

      await logCandidacyAuditEvent({
        candidacyId: payload.candidacyId,
        eventType: "CANDIDACY_DROPPED_OUT",
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      return candidacy;
    },
    candidacy_validateDropOut: async (
      _: unknown,
      payload: {
        candidacyId: string;
      },
      context: GraphqlContext,
    ) => {
      const candidacy = await validateDropOutCandidacy({
        candidacyId: payload.candidacyId,
      });

      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.VALIDATED_DROPPED_OUT_CANDIDACY,
        context,
        result: candidacy,
      });

      await logCandidacyAuditEvent({
        candidacyId: payload.candidacyId,
        eventType: "CANDIDACY_DROP_OUT_VALIDATED",
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      return candidacy;
    },
    candidacy_cancelDropOutById: async (
      _: unknown,
      payload: {
        candidacyId: string;
      },
      context: GraphqlContext,
    ) => {
      const result = await cancelDropOutCandidacy({
        candidacyId: payload.candidacyId,
      });

      // Save candidacyDropOut as AuditEvent
      const accountId = context.auth.userInfo?.sub;

      const candidacyDropOut = result.candidacyDropOut;

      if (accountId && candidacyDropOut) {
        await cancelDropOutCandidacyEvent(accountId, candidacyDropOut);
      }

      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.CANCELED_DROPPED_OUT_CANDIDACY,
        extraInfo: { candidacyDropOut },
        context,
        result,
      });

      await logCandidacyAuditEvent({
        candidacyId: payload.candidacyId,
        eventType: "CANDIDACY_DROP_OUT_CANCELED",
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });

      return result;
    },
    candidacy_setReadyForJuryEstimatedAt: async (
      _parent: unknown,
      params: {
        candidacyId: string;
        readyForJuryEstimatedAt: Date;
      },
      context: GraphqlContext,
    ) => {
      const result = await setReadyForJuryEstimatedAt(params);
      await logCandidacyAuditEvent({
        candidacyId: params.candidacyId,
        eventType: "READY_FOR_JURY_ESTIMATED_DATE_UPDATED",
        userKeycloakId: context.auth.userInfo?.sub,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
        userEmail: context.auth.userInfo?.email,
        details: { readyForJuryEstimatedAt: params.readyForJuryEstimatedAt },
      });
      return result;
    },
    candidacy_updateTypeAccompagnement: async (
      _parent: unknown,
      {
        candidacyId,
        typeAccompagnement,
        reason,
      }: {
        candidacyId: string;
        typeAccompagnement: CandidacyTypeAccompagnement;
        reason?: string;
      },
      context: GraphqlContext,
    ) => {
      const result = await updateCandidacyTypeAccompagnement({
        candidacyId,
        typeAccompagnement,
        userIsAdmin: context.auth.hasRole("admin"),
      });
      await logCandidacyAuditEvent({
        candidacyId,
        eventType: "TYPE_ACCOMPAGNEMENT_UPDATED",
        userKeycloakId: context.auth.userInfo?.sub,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
        userEmail: context.auth.userInfo?.email,
        details: { typeAccompagnement, reason },
      });
      return result;
    },
    candidacy_updateCandidateCandidacyDropoutDecision: async (
      _parent: unknown,
      input: {
        candidacyId: string;
        dropOutConfirmed: Date;
      },
      context: GraphqlContext,
    ) =>
      updateCandidateCandidacyDropoutDecision({
        ...input,
        userInfo: {
          userKeycloakId: context.auth.userInfo?.sub,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
          userEmail: context.auth.userInfo?.email,
        },
      }),
    candidacy_updateFinanceModule: async (
      _parent: unknown,
      input: {
        candidacyId: string;
        financeModule: FinanceModule;
        reason?: string;
      },
      context: GraphqlContext,
    ) =>
      updateCandidacyFinanceModule({
        ...input,
        userInfo: {
          userKeycloakId: context.auth.userInfo?.sub,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
          userEmail: context.auth.userInfo?.email,
        },
      }),
    candidacy_updateCandidacyInactifDecision: async (
      _parent: unknown,
      input: {
        candidacyId: string;
        continueCandidacy: boolean;
      },
      context: GraphqlContext,
    ) =>
      updateCandidacyInactifDecision({
        candidacyId: input.candidacyId,
        continueCandidacy: input.continueCandidacy,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),
    candidacy_submitEndAccompagnement: async (
      _parent: unknown,
      input: {
        candidacyId: string;
        endAccompagnementDate: Date;
      },
      context: GraphqlContext,
    ) =>
      submitEndAccompagnement({
        ...input,
        userKeycloakId: context.auth.userInfo?.sub || "",
        userEmail: context.auth?.userInfo?.email || "",
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),
  },
};

export const candidacyResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
