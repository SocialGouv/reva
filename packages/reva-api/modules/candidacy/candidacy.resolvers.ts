import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { CandidacyTypeAccompagnement, CandidateTypology } from "@prisma/client";
import mercurius from "mercurius";

import { prismaClient } from "../../prisma/client";
import { logCandidacyAuditEvent } from "../candidacy-log/features/logCandidacyAuditEvent";
import { getOrganismById } from "../organism/features/getOrganism";
import { getDepartmentById } from "../referential/features/getDepartmentById";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import {
  Admissibility,
  AdmissibilityFvae,
  Candidacy,
  CandidacyBusinessEvent,
  CandidacyStatusFilter,
  SearchOrganismFilter,
} from "./candidacy.types";
import { cancelDropOutCandidacyEvent } from "./events";
import { addExperienceToCandidacy } from "./features/addExperienceToCandidacy";
import { archiveCandidacy } from "./features/archiveCandidacy";
import { cancelDropOutCandidacy } from "./features/cancelDropOutCandidacy";
import { dropOutCandidacy } from "./features/dropOutCandidacy";
import { getAdmissibilityByCandidacyId } from "./features/getAdmissibilityByCandidacyId";
import { getAdmissibilityFvae } from "./features/getAdmissibilityFvae";
import { getCandidacy } from "./features/getCandidacy";
import { getCandidacyCcns } from "./features/getCandidacyCcns";
import { getCandidacyCountByStatus } from "./features/getCandidacyCountByStatus";
import { getCandidacyGoals } from "./features/getCandidacyGoals";
import { getExperiencesByCandidacyId } from "./features/getExperiencesByCandidacyId";
import { searchOrganismsForCandidacy } from "./features/searchOrganismsForCandidacy";
import { selectOrganismForCandidacy } from "./features/selectOrganismForCandidacy";
import { setReadyForJuryEstimatedAt } from "./features/setReadyForJuryEstimatedAt";
import { submitCandidacy } from "./features/submitCandidacy";
import { takeOverCandidacy } from "./features/takeOverCandidacy";
import { unarchiveCandidacy } from "./features/unarchiveCandidacy";
import { updateAdmissibility } from "./features/updateAdmissibility";
import { updateAdmissibilityFvae } from "./features/updateAdmissibilityFvae";
import { updateAppointmentInformations } from "./features/updateAppointmentInformations";
import { updateCandidacyTypologyAndCcn } from "./features/updateCandidacyTypologyAndCcn";
import { updateContactOfCandidacy } from "./features/updateContactOfCandidacy";
import { updateExperienceOfCandidacy } from "./features/updateExperienceOfCandidacy";
import { updateGoalsOfCandidacy } from "./features/updateGoalsOfCandidacy";
import { logCandidacyEvent } from "./logCandidacyEvent";
import {
  sendCandidacyArchivedEmailToCertificateur,
  sendCandidacyDropOutEmailToCandidate,
  sendCandidacyDropOutEmailToCertificateur,
} from "./mails";
import { resolversSecurityMap } from "./security/security";
import { getCandidacyStatusesByCandidacyId } from "./features/getCandidacyStatusesByCandidacyId";
import { getReorientationReasonById } from "../referential/features/getReorientationReasonById";
import { getCandidacyConventionCollectiveById } from "./features/getCandidacyConventionCollectiveById";
import { getCandidacyDropOutByCandidacyId } from "./features/getCandidacyDropOutByCandidacyId";
import { getDropOutReasonById } from "./features/getDropOutReasonById";
import { getCandidacies } from "./features/getCandicacies";
import { getCandidateById } from "../candidate/features/getCandidateById";
import { updateCandidacyTypeAccompagnement } from "./features/updateCandidacyTypeAccompagnement";
import { validateDropOutCandidacy } from "./features/validateDropOutCandidacy";

const unsafeResolvers = {
  Candidacy: {
    admissibility: ({ id: candidacyId }: Candidacy) =>
      getAdmissibilityByCandidacyId({ candidacyId }),
    admissibilityFvae: (parent: Candidacy) =>
      getAdmissibilityFvae({ candidacyId: parent.id }),
    goals: async ({ id: candidacyId }: Candidacy) =>
      getCandidacyGoals({ candidacyId }),
    experiences: async ({ id: candidacyId }: Candidacy) =>
      getExperiencesByCandidacyId({ candidacyId }),
    candidate: async ({ candidateId }: { candidateId: string }) =>
      getCandidateById({ candidateId }),
    department: ({ departmentId }: { departmentId: string }) =>
      getDepartmentById({ id: departmentId }),
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
        maisonMereAAPId?: string;
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
      payload: any,
      context: GraphqlContext,
    ) => {
      const candidacy = await archiveCandidacy({
        candidacyId: payload.candidacyId,
        reorientationReasonId: payload.reorientationReasonId,
      });

      sendCandidacyArchivedEmailToCertificateur(candidacy.id);

      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        context,
        result: candidacy,
        eventType: CandidacyBusinessEvent.ARCHIVED_CANDIDACY,
        extraInfo: {
          reorientationReasonId: payload.reorientationReasonId,
        },
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
    candidacy_updateAdmissibility: async (
      {
        candidacyId,
        admissibility,
      }: { candidacyId: string; admissibility: Admissibility },
      context: GraphqlContext,
    ) =>
      updateAdmissibility({
        candidacyId,
        admissibility,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),
    candidacy_updateAdmissibilityFvae: (
      _: unknown,
      {
        candidacyId,
        admissibility,
      }: {
        candidacyId: string;
        admissibility: AdmissibilityFvae;
      },
      context: GraphqlContext,
    ) =>
      updateAdmissibilityFvae({
        params: {
          candidacyId,
          ...admissibility,
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
        },
      }),
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
      }: {
        candidacyId: string;
        typeAccompagnement: CandidacyTypeAccompagnement;
      },
      context: GraphqlContext,
    ) => {
      const result = await updateCandidacyTypeAccompagnement({
        candidacyId,
        typeAccompagnement,
      });
      await logCandidacyAuditEvent({
        candidacyId,
        eventType: "TYPE_ACCOMPAGNEMENT_UPDATED",
        userKeycloakId: context.auth.userInfo?.sub,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
        userEmail: context.auth.userInfo?.email,
        details: { typeAccompagnement },
      });
      return result;
    },
  },
};

export const resolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
