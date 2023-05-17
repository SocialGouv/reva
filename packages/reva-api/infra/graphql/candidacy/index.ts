import { composeResolvers } from "@graphql-tools/resolvers-composition";
import mercurius from "mercurius";

import { addExperienceToCandidacy } from "../../../domain/features/addExperienceToCandidacy";
import { archiveCandidacy } from "../../../domain/features/archiveCandidacy";
import { createCandidacy } from "../../../domain/features/createCandidacy";
import { deleteCandidacy } from "../../../domain/features/deleteCandidacy";
import { dropOutCandidacy } from "../../../domain/features/dropOutCandidacy";
import { getAdmissibility } from "../../../domain/features/getAdmissibility";
import { getBasicSkills } from "../../../domain/features/getBasicSkills";
import { getCandidacy } from "../../../domain/features/getCandidacy";
import { getCompanionsForCandidacy } from "../../../domain/features/getCompanionsForCandidacy";
import { getDeviceCandidacy } from "../../../domain/features/getDeviceCandidacy";
import { getExamInfo } from "../../../domain/features/getExamInfo";
import {
  getAAPOrganismsForCandidacy,
  getActiveOrganismsForCandidacyWithNewTypologies,
} from "../../../domain/features/getOrganismsForCandidacy";
import { getTrainings } from "../../../domain/features/getTrainings";
import { selectOrganismForCandidacy } from "../../../domain/features/selectOrganismForCandidacy";
import { submitCandidacy } from "../../../domain/features/submitCandidacy";
import { submitTraining } from "../../../domain/features/submitTrainingForm";
import { takeOverCandidacy } from "../../../domain/features/takeOverCandidacy";
import { unarchiveCandidacy } from "../../../domain/features/unarchiveCandidacy";
import { updateAdmissibility } from "../../../domain/features/updateAdmissibility";
import { updateAppointmentInformations } from "../../../domain/features/updateAppointmentInformations";
import { updateCertificationOfCandidacy } from "../../../domain/features/updateCertificationOfCandidacy";
import { updateContactOfCandidacy } from "../../../domain/features/updateContactOfCandidacy";
import { updateExamInfo } from "../../../domain/features/updateExamInfo";
import { updateExperienceOfCandidacy } from "../../../domain/features/updateExperienceOfCandidacy";
import { updateGoalsOfCandidacy } from "../../../domain/features/updateGoalsOfCandidacy";
import { confirmTrainingFormByCandidate } from "../../../domain/features/validateTrainingFormByCandidate";
import { Role } from "../../../domain/types/account";
import {
  Admissibility,
  Candidacy,
  CandidacyBusinessEvent,
  ExamInfo,
} from "../../../domain/types/candidacy";
import * as admissibilityDb from "../../database/postgres/admissibility";
import * as basicSkillDb from "../../database/postgres/basicSkills";
import * as candidacyDb from "../../database/postgres/candidacies";
import * as dropOutDb from "../../database/postgres/dropOutReasons";
import * as examInfoDb from "../../database/postgres/examInfo";
import * as experienceDb from "../../database/postgres/experiences";
import * as goalDb from "../../database/postgres/goals";
import * as organismDb from "../../database/postgres/organisms";
import * as reorientationReasonDb from "../../database/postgres/reorientationReasons";
import * as trainingDb from "../../database/postgres/trainings";
import { logger } from "../../logger";
import { notifyNewCandidacy } from "../../mattermost";
import { getCandidacySummaries } from "./features/getCandicacySummaries";
import { getCandidacyCountByStatus } from "./features/getCandidacyCountByStatus";
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
    getCandidacy: async (
      _: unknown,
      { deviceId }: { deviceId: string }
    ): Promise<mercurius.ErrorWithProps | Candidacy> => {
      const result = await getDeviceCandidacy({
        getCandidacyFromDeviceId: candidacyDb.getCandidacyFromDeviceId,
      })({ deviceId });
      return result
        .map(withBasicSkills)
        .map(withMandatoryTrainings)
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
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
      _params: { limit?: number; offset?: number },
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
      const result = await (process.env.USE_ORGANISMS_WITH_NEW_TYPOLOGIES ===
      "true"
        ? getActiveOrganismsForCandidacyWithNewTypologies({
            getActiveOrganismForCertificationAndDepartment:
              organismDb.getActiveOrganismForCertificationAndDepartment,
            getCandidacyFromId: candidacyDb.getCandidacyFromId,
          })({ candidacyId: params.candidacyId })
        : getAAPOrganismsForCandidacy({
            getAAPOrganisms: organismDb.getAAPOrganisms,
          })({ candidacyId: params.candidacyId }));

      return result
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
      const result = await (process.env.USE_ORGANISMS_WITH_NEW_TYPOLOGIES ===
      "true"
        ? getActiveOrganismsForCandidacyWithNewTypologies({
            getActiveOrganismForCertificationAndDepartment:
              organismDb.getActiveOrganismForCertificationAndDepartment,
            getCandidacyFromId: candidacyDb.getCandidacyFromId,
          })({ candidacyId: params.candidacyId })
        : getCompanionsForCandidacy({
            getCompanionsForCandidacy: organismDb.getCompanionOrganisms,
          })({ candidacyId: params.candidacyId }));

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_candidacyCountByStatus: (
      _: unknown,
      _params: unknown,
      context: GraphqlContext
    ) =>
      getCandidacyCountByStatus({
        hasRole: context.auth!.hasRole,
        IAMId: context.auth!.userInfo!.sub,
      }),
  },
  Mutation: {
    candidacy_createCandidacy: async (
      _: any,
      {
        candidacy,
      }: {
        candidacy: {
          deviceId: string;
          certificationId: string;
          regionId: string;
          departmentId: string;
        };
      },
      context: GraphqlContext
    ) => {
      const result = await createCandidacy({
        createCandidacy: candidacyDb.insertCandidacy,
        getCandidacyFromDeviceId: candidacyDb.getCandidacyFromDeviceId,
        notifyTeam: notifyNewCandidacy,
      })({
        deviceId: candidacy.deviceId,
        certificationId: candidacy.certificationId,
        regionId: candidacy.regionId,
        departmentId: candidacy.departmentId,
      });

      logCandidacyEvent({
        eventType: CandidacyBusinessEvent.CREATED_CANDIDACY,
        context,
        result,
      });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_submitCandidacy: async (
      _: unknown,
      payload: { deviceId: string; candidacyId: string },
      context: GraphqlContext
    ) => {
      const result = await submitCandidacy({
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
        existsCandidacyHavingHadStatus:
          candidacyDb.existsCandidacyHavingHadStatus,
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
    candidacy_updateCertification: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await updateCertificationOfCandidacy({
        updateCertification: candidacyDb.updateCertification,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
        updateOrganism: candidacyDb.updateOrganism,
      })({
        candidacyId: payload.candidacyId,
        certificationId: payload.certificationId,
        departmentId: payload.departmentId,
      });

      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.UPDATED_CERTIFICATION,
        extraInfo: {
          certificationId: payload.certificationId,
          departmentId: payload.departmentId,
        },
        context,
        result,
      });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
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
        updateGoals: goalDb.updateGoals,
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
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await updateContactOfCandidacy({
        updateContact: candidacyDb.updateContactOnCandidacy,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        phone: payload.phone,
        email: payload.email,
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.UPDATED_CONTACT,
        extraInfo: result.isRight()
          ? { phone: payload.phone, email: payload.email }
          : undefined,
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
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
        getReorientationReasonById:
          reorientationReasonDb.getReorientationReasonById,
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
        candidateTypologyInformations: payload.candidateTypologyInformations,
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

    candidacy_selectOrganism: async (
      _: unknown,
      payload: any,
      context: GraphqlContext
    ) => {
      const result = await selectOrganismForCandidacy({
        updateOrganism: candidacyDb.updateOrganism,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        organismId: payload.organismId,
      });
      logCandidacyEvent({
        candidacyId: payload.candidacyId,
        eventType: CandidacyBusinessEvent.SELECTED_ORGANISM,
        extraInfo: {
          organismId: payload.organismId,
        },
        context,
        result,
      });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
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
        getDropOutReasonById: dropOutDb.getDropOutReasonById,
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
