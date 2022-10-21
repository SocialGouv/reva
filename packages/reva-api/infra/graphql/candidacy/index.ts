import { addExperienceToCandidacy } from "../../../domain/features/addExperienceToCandidacy";
import { archiveCandidacy } from "../../../domain/features/archiveCandidacy";
import { createCandidacy } from "../../../domain/features/createCandidacy";
import { deleteCandidacy } from "../../../domain/features/deleteCandidacy";
import { getCandidacy } from "../../../domain/features/getCandidacy";
import { getCandidacySummaries } from "../../../domain/features/getCandidacies";
import { getCompanions } from "../../../domain/features/getCompanions";
import { getDeviceCandidacy } from "../../../domain/features/getDeviceCandidacy";
import { getAAPOrganismsForCandidacy } from "../../../domain/features/getOrganismsForCandidacy";
import { submitCandidacy } from "../../../domain/features/submitCandidacy";
import { takeOverCandidacy } from "../../../domain/features/takeOverCandidacy";
import { updateAppointmentInformations } from "../../../domain/features/updateAppointmentInformations";
import { updateCertificationOfCandidacy } from "../../../domain/features/updateCertificationOfCandidacy";
import { updateContactOfCandidacy } from "../../../domain/features/updateContactOfCandidacy";
import { updateExperienceOfCandidacy } from "../../../domain/features/updateExperienceOfCandidacy";
import { updateGoalsOfCandidacy } from "../../../domain/features/updateGoalsOfCandidacy";
import * as candidacyDb from "../../database/postgres/candidacies";
import * as organismDb from "../../database/postgres/organisms";
import * as experienceDb from "../../database/postgres/experiences";
import * as goalDb from "../../database/postgres/goals";
import * as trainingDb from "../../database/postgres/trainings";
import * as basicSkillDb from "../../database/postgres/basicSkills";
import mercurius from "mercurius";
import { getTrainings } from "../../../domain/features/getTrainings";
import { selectOrganismForCandidacy } from "../../../domain/features/selectOrganismForCandidacy";
import { notifyNewCandidacy } from "../../mattermost";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import Keycloak from 'keycloak-connect';
import { getBasicSkills } from "../../../domain/features/getBasicSkills";
import { submitTraining } from "../../../domain/features/submitTrainingForm";
import { Candidacy } from "../../../domain/types/candidacy";
import { confirmTrainingFormByCandidate } from "../../../domain/features/validateTrainingFormByCandidate";

const withBasicSkills = (c: Candidacy) => ({
  ...c,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  basicSkillIds: c.basicSkills.reduce((memo, bs) => {
    return [...memo, bs.basicSkill.id];
  }, []),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  basicSkills: c.basicSkills.map(bs => bs.basicSkill),
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
  mandatoryTrainings: c.trainings.map(t => t.training)
});

export const resolvers = {
  Query: {
    getCandidacy: async (other: unknown, { deviceId }: { deviceId: string; }, context: any) => {
      const result = await getDeviceCandidacy({ getCandidacyFromDeviceId: candidacyDb.getCandidacyFromDeviceId })({ deviceId });
      return result
        .map(withBasicSkills)
        .map(withMandatoryTrainings)
        .mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    getCandidacyById: async (other: unknown, { id }: { id: string; }, context: any) => {
      const result = await getCandidacy({ getCandidacyFromId: candidacyDb.getCandidacyFromId })({ id });
      return result
        .map(withBasicSkills)
        .map(withMandatoryTrainings)
        .mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    getCandidacies: async (_: unknown, params: { deviceId: string; }, context: { reply: any, app: { auth: any, userInfo: any, keycloak: Keycloak.Keycloak, getKeycloakAdmin: () => KeycloakAdminClient; }; }) => {
      const result = await getCandidacySummaries({
        hasRole: context.app.auth.hasRole,
        getCandidacySummaries: candidacyDb.getCandidacies,
        getCandidacySummariesForUser: candidacyDb.getCandidaciesForUser
      })({ IAMId: context.app.userInfo?.sub });
      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    getTrainings: async () => {
      const result = await getTrainings({ getTrainings: trainingDb.getTrainings })();

      return result.extract();
    },
    getOrganismsForCandidacy: async (_: unknown, params: { candidacyId: string; }) => {
      const result = await getAAPOrganismsForCandidacy({
        getAAPOrganisms: organismDb.getAAPOrganisms
      })({ candidacyId: params.candidacyId });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    getBasicSkills: async () => {
      const result = await getBasicSkills({ getBasicSkills: basicSkillDb.getBasicSkills })();

      return result.extract();
    }
  },
  Mutation: {
    candidacy_createCandidacy: async (_: unknown, { candidacy }: { candidacy: { deviceId: string; certificationId: string; regionId: string; }; }) => {

      const result = await createCandidacy({
        createCandidacy: candidacyDb.insertCandidacy,
        getCandidacyFromDeviceId: candidacyDb.getCandidacyFromDeviceId,
        notifyTeam: notifyNewCandidacy
      })({ deviceId: candidacy.deviceId, certificationId: candidacy.certificationId, regionId: candidacy.regionId });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    candidacy_submitCandidacy: async (_: unknown, payload: { deviceId: string; candidacyId: string; }) => {

      const result = await submitCandidacy({
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({ candidacyId: payload.candidacyId });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    candidacy_updateCertification: async (_: unknown, payload: any) => { 
      const result = await updateCertificationOfCandidacy({
        updateCertification: candidacyDb.updateCertification,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        certificationId: payload.certificationId,
        regionId: payload.regionId
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    candidacy_addExperience: async (_: unknown, payload: any) => {
      const result = await addExperienceToCandidacy({
        createExperience: experienceDb.insertExperience,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        experience: payload.experience
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    candidacy_updateExperience: async (_: unknown, payload: any) => {
      const result = await updateExperienceOfCandidacy({
        updateExperience: experienceDb.updateExperience,
        getExperienceFromId: experienceDb.getExperienceFromId,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        experienceId: payload.experienceId,
        experience: payload.experience
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    candidacy_removeExperience: async (_: unknown, payload: any) => { console.log("candidacy_removeExperience", payload); },


    candidacy_updateGoals: async (_: unknown, payload: any) => { 
      const result = await updateGoalsOfCandidacy({
        updateGoals: goalDb.updateGoals,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        goals: payload.goals
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },

    candidacy_updateContact: async (_: unknown, payload: any) => {
      const result = await updateContactOfCandidacy({
        updateContact: candidacyDb.updateContactOnCandidacy,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        phone: payload.phone,
        email: payload.email
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },

    candidacy_deleteById: async (_: unknown, payload: any) => {
      const result = await deleteCandidacy({
        deleteCandidacyFromId: candidacyDb.deleteCandidacyFromId,
      })({
        candidacyId: payload.candidacyId
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },

    candidacy_archiveById: async (_: unknown, payload: any) => {
      const result = await archiveCandidacy({
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
      })({
        candidacyId: payload.candidacyId
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },

    candidacy_updateAppointmentInformations: async (_: unknown, payload: any) => {
      const result = await updateAppointmentInformations({
        updateAppointmentInformations: candidacyDb.updateAppointmentInformations,
      })({
        candidacyId: payload.candidacyId,
        candidateTypologyInformations: payload.candidateTypologyInformations,
        appointmentInformations: payload.appointmentInformations
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },

    candidacy_takeOver: async (_: unknown, payload: any, context: { app: { auth: any; }; }) => {
      const result = await takeOverCandidacy({
        hasRole: context.app.auth.hasRole,
        existsCandidacyWithActiveStatus: candidacyDb.existsCandidacyWithActiveStatus,
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
      })({
        candidacyId: payload.candidacyId
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },

    candidacy_selectOrganism: async (_: unknown, payload: any) => {
      const result = await selectOrganismForCandidacy({
        updateOrganism: candidacyDb.updateOrganism,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: payload.candidacyId,
        organismId: payload.organismId
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    candidacy_submitTrainingForm: async (_: unknown, payload: any, context: { app: { auth: any; }; }) => {
      const result = await submitTraining({
        hasRole: context.app.auth.hasRole,
        updateTrainingInformations: candidacyDb.updateTrainingInformations,
        existsCandidacyWithActiveStatus: candidacyDb.existsCandidacyWithActiveStatus,
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
      })({
        candidacyId: payload.candidacyId,
        training: payload.training
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    candidacy_confirmTrainingForm: async (_: unknown, { candidacyId }: { candidacyId: string; }) => {
      const result = await confirmTrainingFormByCandidate({
        existsCandidacyWithActiveStatus: candidacyDb.existsCandidacyWithActiveStatus,
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
      })({
        candidacyId: candidacyId
      });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    }
  }
};
