import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { prismaClient } from "../../prisma/client";
import { getFirstActiveCandidacyByCandidateId } from "../candidacy/features/getFirstActiveCandidacyByCandidateId";
import {
  CandidateProfileUpdateInput,
  CandidateUpdateInput,
  TypeAccompagnement,
} from "./candidate.types";
import { askForLogin } from "./features/candidateAskForLogin";
import { askForRegistration } from "./features/candidateAskForRegistration";
import { candidateAuthentication } from "./features/candidateAuthentication";
import { candidateForgotPassword } from "./features/candidateForgotPassword";
import { candidateLoginWithCredentials } from "./features/candidateLoginWithCredentials";
import { candidateLoginWithToken } from "./features/candidateLoginWithToken";
import { candidateResetPassword } from "./features/candidateResetPassword";
import { getCandidateByKeycloakIdAndCreateCandidacyIfNoActiveOneExists } from "./features/getCandidateByKeycloakIdAndCreateCandidacyIfNoActiveOneExists";
import { getHighestDegreeById } from "./features/getHighestDegreeById";
import { getNiveauDeFormationLePlusEleve } from "./features/getNiveauDeFormationLePlusEleve";
import { updateCandidate } from "./features/updateCandidate";
import { updateCandidateProfile } from "./features/updateCandidateProfile";
import { resolversSecurityMap } from "./security/security";

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
    highestDegree: async ({ highestDegreeId }: { highestDegreeId: string }) =>
      getHighestDegreeById({ highestDegreeId }),
    candidacy: async ({ id: candidateId }: { id: string }) =>
      getFirstActiveCandidacyByCandidateId({ candidateId }),
  },
  Query: {
    candidate_getCandidateWithCandidacy: (
      _: unknown,
      _params: unknown,
      context: GraphqlContext,
    ) =>
      getCandidateByKeycloakIdAndCreateCandidacyIfNoActiveOneExists({
        keycloakId: context.auth.userInfo?.sub || "",
      }),
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
          typeAccompagnement: TypeAccompagnement;
        };
      },
    ) => askForRegistration(params.candidate),
    candidate_askForLogin: async (_: unknown, params: { email: string }) =>
      askForLogin(params.email),
    candidate_login: async (
      _: any,
      params: {
        token: string;
      },
    ) =>
      candidateAuthentication({
        ...params,
      }),
    candidate_loginWithToken: async (
      _: any,
      params: {
        token: string;
      },
    ) =>
      candidateLoginWithToken({
        ...params,
      }),
    candidate_loginWithCredentials: async (
      _: any,
      params: {
        email: string;
        password: string;
      },
    ) =>
      candidateLoginWithCredentials({
        ...params,
      }),
    candidate_forgotPassword: async (
      _: any,
      params: {
        email: string;
      },
    ) => {
      await candidateForgotPassword(params.email);

      return true;
    },
    candidate_resetPassword: async (
      _: any,
      params: {
        token: string;
        password: string;
      },
    ) => {
      await candidateResetPassword({
        ...params,
      });

      return true;
    },
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
    candidate_updateCandidateInformationBySelf: async (
      _: unknown,
      {
        candidateInformation,
      }: { candidateInformation: Partial<CandidateUpdateInput> },
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
  },
};

export const candidateResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
