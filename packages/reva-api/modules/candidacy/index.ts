import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { CandidateTypology, Organism } from "@prisma/client";
import mercurius from "mercurius";

import { prismaClient } from "../../prisma/client";
import { Role } from "../account/account.types";
import { generateJwt } from "../candidate/auth.helper";
import * as organismDb from "../organism/database/organisms";
import { getDropOutReasonById } from "../referential/features/getDropOutReasonById";
import { getReorientationReasonById } from "../referential/features/getReorientationReasonById";
import { sendTrainingEmail } from "../shared/email";
import { sendNewCandidacyEmail } from "../shared/email/sendNewCandidacyEmail";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import {
  Admissibility,
  Candidacy,
  CandidacyBusinessEvent,
  CandidacyStatusFilter,
  ExamInfo,
  SearchOrganismFilter,
} from "./candidacy.types";
import * as admissibilityDb from "./database/admissibility";
import * as basicSkillDb from "./database/basicSkills";
import * as candidacyDb from "./database/candidacies";
import * as examInfoDb from "./database/examInfo";
import * as experienceDb from "./database/experiences";
import * as trainingDb from "./database/trainings";
import { cancelDropOutCandidacyEvent } from "./events";
import { addExperienceToCandidacy } from "./features/addExperienceToCandidacy";
import { archiveCandidacy } from "./features/archiveCandidacy";
import { cancelDropOutCandidacy } from "./features/cancelDropOutCandidacy";
import { deleteCandidacy } from "./features/deleteCandidacy";
import { dropOutCandidacy } from "./features/dropOutCandidacy";
import { getAdmissibility } from "./features/getAdmissibility";
import { getBasicSkills } from "./features/getBasicSkills";
import { getCandidacySummaries } from "./features/getCandicacySummaries";
import { getCandidacy } from "./features/getCandidacy";
import { getCandidacyCcns } from "./features/getCandidacyCcns";
import { getCandidacyCountByStatus } from "./features/getCandidacyCountByStatus";
import { getCompanionsForCandidacy } from "./features/getCompanionsForCandidacy";
import { getExamInfo } from "./features/getExamInfo";
import { getActiveOrganismsForCandidacyWithNewTypologies } from "./features/getOrganismsForCandidacy";
import { getRandomOrganismsForCandidacyWithNewTypologies } from "./features/getRandomOrganismsForCandidacy";
import { getTrainings } from "./features/getTrainings";
import { selectOrganismForCandidacy } from "./features/selectOrganismForCandidacy";
import { submitCandidacy } from "./features/submitCandidacy";
import { submitTraining } from "./features/submitTrainingForm";
import { takeOverCandidacy } from "./features/takeOverCandidacy";
import { unarchiveCandidacy } from "./features/unarchiveCandidacy";
import { updateAdmissibility } from "./features/updateAdmissibility";
import { updateAppointmentInformations } from "./features/updateAppointmentInformations";
import { updateCandidacyTypologyAndCcn } from "./features/updateCandidacyTypologyAndCcn";
import { updateCertificationOfCandidacy } from "./features/updateCertificationOfCandidacy";
import { updateCertificationWithinOrganismScope } from "./features/updateCertificationWithinOrganismScope";
import { updateContactOfCandidacy } from "./features/updateContactOfCandidacy";
import { updateExamInfo } from "./features/updateExamInfo";
import { updateExperienceOfCandidacy } from "./features/updateExperienceOfCandidacy";
import { updateGoalsOfCandidacy } from "./features/updateGoalsOfCandidacy";
import { confirmTrainingFormByCandidate } from "./features/validateTrainingFormByCandidate";
import { logCandidacyEvent } from "./logCandidacyEvent";
import { resolversSecurityMap } from "./security";

const withBasicSkills = (c: Candidacy) => ({
  ...c,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  basicSkillIds: c.basicSkills.reduce((memo, bs) => {
    return [...memo, bs.basicSkill.id];
  }, []),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  basicSkills: c.basicSkills.map((bs) => bs.basicSkill),
});

const withMandatoryTrainings = (c: Candidacy) => ({
  ...c,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mandatoryTrainingIds: c.trainings.reduce((memo, t) => {
    return [...memo, t.training.id];
  }, []),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mandatoryTrainings: c.trainings.map((t) => t.training),
});

const unsafeResolvers = {
  Candidacy: {
    admissibility: async (
      parent: Candidacy,
      _: unknown,
      context: { auth: { hasRole: (role: Role) => boolean } }
    ) => {
      const result = await getAdmissibility({
        hasRole: context.auth.hasRole,
        getAdmissibilityFromCandidacyId:
          admissibilityDb.getAdmissibilityFromCandidacyId,
      })({ candidacyId: parent.id });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .map((v) => v.extractNullable())
        .extract();
    },
    examInfo: async (
      parent: Candidacy,
      _: unknown,
      context: { auth: { hasRole: (role: Role) => boolean } }
    ) => {
      const result = await getExamInfo({
        hasRole: context.auth.hasRole,
        getExamInfoFromCandidacyId: examInfoDb.getExamInfoFromCandidacyId,
      })({ candidacyId: parent.id });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .map((v) => v.extractNullable())
        .extract();
    },
  },
  Query: {
    getCandidacyById: async (_: unknown, { id }: { id: string }) => {
      const result = await getCandidacy({
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({ id });
      return result
        .map(withBasicSkills)
        .map(withMandatoryTrainings)
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    getCandidacies: async (
      _parent: unknown,
      _params: {
        limit?: number;
        offset?: number;
        statusFilter?: CandidacyStatusFilter;
        searchFilter?: string;
      },
      context: GraphqlContext
    ) => {
      try {
        return getCandidacySummaries({
          hasRole: context.auth.hasRole,
          iAMId: context.auth?.userInfo?.sub || "",
          ..._params,
        });
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    getTrainings: async () => {
      const result = await getTrainings({
        getTrainings: trainingDb.getTrainings,
      })();

      return result.extract();
    },
    getOrganismsForCandidacy: async (
      _: unknown,
      params: { candidacyId: string }
    ) => {
      const result = await getActiveOrganismsForCandidacyWithNewTypologies({
        getActiveOrganismForCertificationAndDepartment:
          organismDb.getActiveOrganismForCertificationAndDepartment,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({ candidacyId: params.candidacyId });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    getRandomOrganismsForCandidacy: async (
      _: unknown,
      {
        candidacyId,
        searchText,
        searchFilter,
      }: {
        candidacyId: string;
        searchText?: string;
        searchFilter: SearchOrganismFilter;
      }
    ) => {
      const candidacy = await prismaClient.candidacy.findUnique({
        where: { id: candidacyId },
        include: { organism: true },
      });

      const result = await getRandomOrganismsForCandidacyWithNewTypologies({
        getRandomActiveOrganismForCertificationAndDepartment:
          organismDb.getRandomActiveOrganismForCertificationAndDepartment,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({ candidacyId, searchText, searchFilter, limit: 11 });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .map((organisms) => {
          //remove the organism already selected for the candidacy if it's in the list
          let randomOrganisms = organisms
            .filter((c) => c.id !== candidacy?.organism?.id)
            .slice(0, 10);

          //add the candidacy selected organism as the first result if it exists
          if (
            candidacy?.organismId &&
            !randomOrganisms.some((org) => org.id == candidacy.organismId)
          ) {
            randomOrganisms = [
              candidacy.organism as Organism,
              ...randomOrganisms.slice(0, 9),
            ];
          }

          return randomOrganisms;
        })
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    getBasicSkills: async () => {
      const result = await getBasicSkills({
        getBasicSkills: basicSkillDb.getBasicSkills,
      })();

      return result.extract();
    },
    getCompanionsForCandidacy: async (
      _: unknown,
      params: { candidacyId: string }
    ) => {
      const candidacy = await prismaClient.candidacy.findUnique({
        where: { id: params.candidacyId },
        include: { organism: true },
      });
      if (candidacy) {
        //companion organisms are fetched differently if the candidacy organism typology is "experimentation" or not
        const result = await (candidacy.organism?.typology === "experimentation"
          ? getCompanionsForCandidacy({
              getCompanionsForCandidacy: organismDb.getCompanionOrganisms,
            })({ candidacyId: params.candidacyId })
          : getActiveOrganismsForCandidacyWithNewTypologies({
              getActiveOrganismForCertificationAndDepartment:
                organismDb.getActiveOrganismForCertificationAndDepartment,
              getCandidacyFromId: candidacyDb.getCandidacyFromId,
            })({ candidacyId: params.candidacyId }));

        return result
          .mapLeft(
            (error) => new mercurius.ErrorWithProps(error.message, error)
          )
          .extract();
      }
      return [];
    },
    candidacy_candidacyCountByStatus: (
      _: unknown,
      _params: {
        searchFilter?: string;
      },
      context: GraphqlContext
    ) =>
      getCandidacyCountByStatus({
        hasRole: context.auth!.hasRole,
        IAMId: context.auth!.userInfo!.sub,
        searchFilter: _params.searchFilter,
      }),
    candidacy_getCandidacyCcns: async (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        searchFilter?: string;
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

        return getCandidacyCcns(
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
  },
  Mutation: {
    candidacy_submitCandidacy: async (
      _: unknown,
      payload: { deviceId: string; candidacyId: string },
      context: GraphqlContext
    ) => {
      const result = await submitCandidacy({
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
        existsCandidacyWithActiveStatus:
          candidacyDb.existsCandidacyWithActiveStatus,
        getOrganismFromCandidacyId:
          organismDb.getReferentOrganismFromCandidacyId,
        sendNewCandidacyEmail,
      })({ candidacyId: payload.candidacyId });

      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.SUBMITTED_CANDIDACY,
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_updateCertification: async (_: unknown, payload: any) =>
      updateCertificationOfCandidacy({
        candidacyId: payload.candidacyId,
        certificationId: payload.certificationId,
        departmentId: payload.departmentId,
      }),
    candidacy_updateCertificationWithinOrganismScope: async (
      _: unknown,
      payload: any,
      context: { auth: { hasRole: (role: Role) => boolean } }
    ) =>
      updateCertificationWithinOrganismScope({
        hasRole: context.auth.hasRole,
        candidacyId: payload.candidacyId,
        certificationId: payload.certificationId,
      }),
    candidacy_addExperience: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await addExperienceToCandidacy({
        createExperience: experienceDb.insertExperience,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        experience: payload.experience,
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.ADDED_EXPERIENCE,
        extraInfo: result.isRight()
          ? {
              experienceId: result.extract().id,
            }
          : undefined,
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_updateExperience: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await updateExperienceOfCandidacy({
        updateExperience: experienceDb.updateExperience,
        getExperienceFromId: experienceDb.getExperienceFromId,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        experienceId: payload.experienceId,
        experience: payload.experience,
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.UPDATED_EXPERIENCE,
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_removeExperience: async (_: unknown, payload: any) => {
      // FIXME : this actually doesn't do shit
      logger.info("candidacy_removeExperience", payload);
    },

    candidacy_updateGoals: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await updateGoalsOfCandidacy({
        updateGoals: candidacyDb.updateCandidacyGoals,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        goals: payload.goals,
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.UPDATED_GOALS,
        context,
        result: result.map((n) => ({ n })), // typing hack for nothing
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
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
      context: GraphqlContext
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized"
          );
        }

        return updateContactOfCandidacy(
          {
            hasRole: context.auth.hasRole,
            keycloakId: context.auth.userInfo?.sub,
          },
          params
        );
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },

    candidacy_deleteById: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await deleteCandidacy({
        deleteCandidacyFromId: candidacyDb.deleteCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        context,
        result: result.map((s) => ({ s })), // typing hack for nothing
        eventType: CandidacyBusinessEvent.DELETED_CANDIDACY,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },

    candidacy_archiveById: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await archiveCandidacy({
        archiveCandidacy: candidacyDb.archiveCandidacy,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
        getReorientationReasonById,
        hasRole: context.auth.hasRole,
      })({
        candidacyId: payload.candidacyId,
        reorientationReasonId: payload.reorientationReasonId,
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        context,
        result,
        eventType: CandidacyBusinessEvent.ARCHIVED_CANDIDACY,
        extraInfo: {
          reorientationReasonId: payload.reorientationReasonId,
        },
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_unarchiveById: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await unarchiveCandidacy({
        unarchiveCandidacy: candidacyDb.unarchiveCandidacy,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
        hasRole: context.auth.hasRole,
      })({
        candidacyId: payload.candidacyId,
      });
      logCandidacyEvent({
        context,
        result,
        eventType: CandidacyBusinessEvent.UNARCHIVED_CANDIDACY,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_updateAppointmentInformations: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await updateAppointmentInformations({
        updateAppointmentInformations:
          candidacyDb.updateAppointmentInformations,
      })({
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
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },

    candidacy_takeOver: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await takeOverCandidacy({
        existsCandidacyWithActiveStatus:
          candidacyDb.existsCandidacyWithActiveStatus,
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
      })({
        candidacyId: payload.candidacyId,
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.TOOK_OVER_CANDIDACY,
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },

    candidacy_selectOrganism: async (_: unknown, payload: any) =>
      selectOrganismForCandidacy({
        candidacyId: payload.candidacyId,
        organismId: payload.organismId,
      }),
    candidacy_submitTypologyForm: async (
      _: unknown,
      payload: {
        candidacyId: string;
        typology: CandidateTypology;
        additionalInformation?: string;
        ccnId?: string;
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

        await updateCandidacyTypologyAndCcn(context.auth, payload);

        return candidacyDb.getCandidacyFromId(payload.candidacyId);
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    candidacy_submitTrainingForm: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await submitTraining({
        updateTrainingInformations: candidacyDb.updateTrainingInformations,
        existsCandidacyHavingHadStatus:
          candidacyDb.existsCandidacyHavingHadStatus,
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
      })({
        candidacyId: payload.candidacyId,
        training: payload.training,
      });

      const candidacy = result.isRight() ? result.extract() : undefined;
      if (candidacy?.email) {
        const token = generateJwt(
          { email: candidacy?.email, action: "login" },
          1 * 60 * 60 * 24 * 4
        );
        sendTrainingEmail(candidacy.email, token);
      }

      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.SUBMITTED_TRAINING_FORM,
        extraInfo: {
          training: payload.training,
        },
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },

    candidacy_confirmTrainingForm: async (
      _: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext
    ) => {
      const result = await confirmTrainingFormByCandidate({
        existsCandidacyWithActiveStatus:
          candidacyDb.existsCandidacyWithActiveStatus,
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
      })({
        candidacyId: candidacyId,
      });
      logCandidacyEvent({
        candidacyId,
        eventType: CandidacyBusinessEvent.CONFIRMED_TRAINING_FORM,
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_dropOut: async (
      _: unknown,
      payload: {
        candidacyId: string;
        dropOut: {
          dropOutReasonId: string;
          droppedOutAt?: number;
          otherReasonContent?: string;
        };
      },
      context: GraphqlContext
    ) => {
      const droppedOutAt: Date = payload.dropOut.droppedOutAt
        ? new Date(payload.dropOut.droppedOutAt)
        : new Date();

      const result = await dropOutCandidacy({
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
        getDropOutReasonById,
        dropOutCandidacy: candidacyDb.dropOutCandidacy,
      })({
        candidacyId: payload.candidacyId,
        dropOutReasonId: payload.dropOut.dropOutReasonId,
        otherReasonContent: payload.dropOut.otherReasonContent,
        droppedOutAt,
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.DROPPED_OUT_CANDIDACY,
        extraInfo: { ...payload.dropOut },
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_cancelDropOutById: async (
      _: unknown,
      payload: {
        candidacyId: string;
      },
      context: GraphqlContext
    ) => {
      const result = await cancelDropOutCandidacy({
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
        cancelDropOutCandidacy: candidacyDb.cancelDropOutCandidacy,
      })({
        candidacyId: payload.candidacyId,
      });

      // Save candidacyDropOut as AuditEvent
      const accountId = context.auth.userInfo?.sub;

      const candidacyDropOut = result.isRight()
        ? result.extract().candidacyDropOut
        : undefined;

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

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_updateAdmissibility: async (
      _: unknown,
      {
        candidacyId,
        admissibility,
      }: { candidacyId: string; admissibility: Admissibility },
      context: GraphqlContext
    ) => {
      const result = await updateAdmissibility({
        getAdmissibilityFromCandidacyId:
          admissibilityDb.getAdmissibilityFromCandidacyId,
        updateAdmissibility: admissibilityDb.updateAdmissibility,
      })({
        candidacyId,
        admissibility,
      });
      logCandidacyEvent({
        candidacyId,
        eventType: CandidacyBusinessEvent.UPDATED_ADMISSIBILITY,
        extraInfo: { admissibility },
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_updateExamInfo: async (
      _: unknown,
      { candidacyId, examInfo }: { candidacyId: string; examInfo: ExamInfo },
      context: GraphqlContext
    ) => {
      const result = await updateExamInfo({
        getExamInfoFromCandidacyId: examInfoDb.getExamInfoFromCandidacyId,
        updateExamInfo: examInfoDb.updateExamInfo,
      })({
        candidacyId,
        examInfo,
      });
      logCandidacyEvent({
        candidacyId,
        eventType: CandidacyBusinessEvent.UPDATED_EXAM_INFO,
        extraInfo: { examInfo },
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
};

export const resolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap
);
