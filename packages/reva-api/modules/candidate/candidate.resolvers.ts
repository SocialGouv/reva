import { composeResolvers } from "@graphql-tools/resolvers-composition";
import mercurius from "mercurius";

import { prismaClient } from "../../prisma/client";
import {
  CandidateProfileUpdateInput,
  CandidateUpdateInput,
} from "./candidate.types";
import { getCandidateWithCandidacyFromKeycloakId } from "./database/candidates";
import { askForLogin } from "./features/candidateAskForLogin";
import { askForRegistration } from "./features/candidateAskForRegistration";
import { candidateAuthentication } from "./features/candidateAuthentication";
import { getCandidateWithCandidacy } from "./features/candidateGetCandidateWithCandidacy";
import { getNiveauDeFormationLePlusEleve } from "./features/getNiveauDeFormationLePlusEleve";
import { updateCandidate } from "./features/updateCandidate";
import { updateCandidateProfile } from "./features/updateCandidateProfile";
import { resolversSecurityMap } from "./security/security";
import { getHighestDegreeByCandidateId } from "./features/getHighestDegreeByCandidateId";

const unsafeResolvers = {
  Candidate: {
    department: async (parent: { departmentId: string }) => {
      if (!parent.departmentId) return null;
      const department = await prismaClient.department.findUnique({
        where: {
          id: parent.departmentId,
        },
      });

      return department;
    },
    country: async (parent: { countryId: string }) => {
      if (!parent.countryId) return null;
      const country = await prismaClient.country.findUnique({
        where: {
          id: parent.countryId,
        },
      });

      return country;
    },
    birthDepartment: async (parent: { birthDepartmentId: string }) => {
      if (!parent.birthDepartmentId) return null;
      const birthDepartment = await prismaClient.department.findUnique({
        where: {
          id: parent.birthDepartmentId,
        },
      });

      return birthDepartment;
    },
    niveauDeFormationLePlusEleve: async ({
      niveauDeFormationLePlusEleveDegreeId,
    }: {
      niveauDeFormationLePlusEleveDegreeId: string;
    }) =>
      getNiveauDeFormationLePlusEleve({ niveauDeFormationLePlusEleveDegreeId }),
    highestDegree: async ({ candidateId }: { candidateId: string }) =>
      getHighestDegreeByCandidateId({ candidateId }),
  },
  Query: {
    candidate_getCandidateWithCandidacy: async (
      _: any,
      _params: any,
      context: { auth: any },
    ) => {
      const result = await getCandidateWithCandidacy({
        getCandidateWithCandidacy: getCandidateWithCandidacyFromKeycloakId,
      })({ keycloakId: context.auth.userInfo?.sub });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
  Mutation: {
    candidate_askForRegistration: async (
      _: any,
      params: {
        candidate: {
          email: string;
          phone: string;
          firstname: string;
          lastname: string;
          departmentId: string;
        };
      },
    ) => askForRegistration(params.candidate),
    candidate_login: async (
      _: any,
      params: {
        token: string;
      },
    ) =>
      candidateAuthentication({
        ...params,
      }),
    candidate_askForLogin: async (_: unknown, params: { email: string }) =>
      askForLogin(params.email),
    candidate_updateCandidateInformation: (
      _: unknown,
      {
        candidateInformation,
      }: {
        candidateInformation: CandidateUpdateInput;
      },
      context: GraphqlContext,
    ) =>
      updateCandidate({
        params: {
          candidate: candidateInformation,
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
        },
      }),

    candidate_updateCandidateProfile: (
      _: unknown,
      {
        candidateProfile,
      }: {
        candidateProfile: CandidateProfileUpdateInput;
      },
      context: GraphqlContext,
    ) =>
      updateCandidateProfile({
        params: {
          ...candidateProfile,
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
        },
      }),
  },
};

export const candidateResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
