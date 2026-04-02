import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { CandidateTypology } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { getActiveCandidaciesByCandidateId } from "../candidacy/features/getActiveCandidaciesByCandidateId";
import { getCandidacyConventionCollectiveById } from "../candidacy/features/getCandidacyConventionCollectiveById";
import { getFirstActiveCandidacyByCandidateId } from "../candidacy/features/getFirstActiveCandidacyByCandidateId";
import { buildCandidacyAuditLogUserInfo } from "../candidacy-log/features/logCandidacyAuditEvent";

import {
  CandidateProfileUpdateInput,
  CandidateUpdateBySelfInput,
  CandidateUpdateInput,
  TypeAccompagnement,
} from "./candidate.types";
import { askForLogin } from "./features/candidateAskForLogin";
import { askForRegistration } from "./features/candidateAskForRegistration";
import { candidateAskForRegistrationWithPassword } from "./features/candidateAskForRegistrationWithPassword";
import { candidateForgotPassword } from "./features/candidateForgotPassword";
import { candidateLoginWithCredentials } from "./features/candidateLoginWithCredentials";
import { candidateLoginWithToken } from "./features/candidateLoginWithToken";
import { candidateResetPassword } from "./features/candidateResetPassword";
import { getCandidateByCandidacyId } from "./features/getCandidateByCandidacyId";
import { getCandidateById } from "./features/getCandidateById";
import { getCandidateByKeycloakId } from "./features/getCandidateByKeycloakId";
import { getCivilInformationCompletedByCandidateId } from "./features/getCivilInformationCompletedByCandidateId";
import { getContactInformationCompletedByCandidateId } from "./features/getContactInformationCompletedByCandidateId";
import { getHighestDegreeById } from "./features/getHighestDegreeById";
import { getNiveauDeFormationLePlusEleve } from "./features/getNiveauDeFormationLePlusEleve";
import { getTypologyAndCollectiveAgreementCompletedByCandidateId } from "./features/getTypologyAndCollectiveAgreementCompletedByCandidateId";
import { updateCandidate } from "./features/updateCandidate";
import { updateCandidateContactDetails } from "./features/updateCandidateContactDetails";
import { updateCandidateProfile } from "./features/updateCandidateProfile";
import { updateCandidateTypologyAndCcn } from "./features/updateCandidateTypologyAndCcn";
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
    candidacies: async ({ id: candidateId }: { id: string }) =>
      getActiveCandidaciesByCandidateId({ candidateId }),
    conventionCollective: ({ ccnId }: { ccnId: string }) =>
      getCandidacyConventionCollectiveById({ ccnId }),
    contactInformationCompleted: async ({ id: candidateId }: { id: string }) =>
      getContactInformationCompletedByCandidateId({ candidateId }),
    civilInformationCompleted: async ({ id: candidateId }: { id: string }) =>
      getCivilInformationCompletedByCandidateId({ candidateId }),
    typologyAndCollectiveAgreementCompleted: async ({
      id: candidateId,
    }: {
      id: string;
    }) =>
      getTypologyAndCollectiveAgreementCompletedByCandidateId({ candidateId }),
  },
  Query: {
    candidate_getCandidateWithCandidacy: async (
      _: unknown,
      _params: unknown,
      context: GraphqlContext,
    ) => {
      const keycloakId = context.auth.userInfo?.sub;
      if (!keycloakId) {
        throw new Error("Utilisateur non authentifié");
      }

      return getCandidateByKeycloakId({
        keycloakId,
      });
    },
    candidate_getCandidateById: async (_: any, params: { id: string }) =>
      getCandidateById({ candidateId: params.id }),
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
          cohorteVaeCollectiveId?: string;
        };
      },
    ) => askForRegistration(params.candidate),
    candidate_askForRegistrationWithPassword: async (
      _: any,
      params: { email: string; certificationId?: string },
    ) => candidateAskForRegistrationWithPassword(params),
    candidate_askForLogin: async (_: unknown, params: { email: string }) =>
      askForLogin(params.email),
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
    ) =>
      candidateResetPassword({
        ...params,
      }),
    candidate_updateCandidateInformation: async (
      _: unknown,
      {
        candidacyId,
        candidateInformation,
      }: {
        candidacyId: string;
        candidateInformation: CandidateUpdateInput;
      },
      context: GraphqlContext,
    ) => {
      const candidate = await getCandidateByCandidacyId({ candidacyId });
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      return updateCandidate({
        params: {
          candidate: { ...candidateInformation, id: candidate.id },
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
        },
      });
    },

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
        candidateId,
        candidateInformation,
      }: {
        candidateId: string;
        candidateInformation: Partial<CandidateUpdateBySelfInput>;
      },
      context: GraphqlContext,
    ) =>
      updateCandidate({
        params: {
          candidate: { ...candidateInformation, id: candidateId },
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
        },
      }),
    candidate_updateCandidateContactDetails: async (
      _: unknown,
      {
        candidacyId,
        candidateId,
        candidateContactDetails,
      }: {
        candidacyId: string;
        candidateId: string;
        candidateContactDetails: {
          phone: string;
          email: string;
        };
      },
      context: GraphqlContext,
    ) =>
      updateCandidateContactDetails({
        candidacyId,
        candidateId,
        ...candidateContactDetails,
        userInfo: buildCandidacyAuditLogUserInfo(context),
      }),
    candidate_updateCandidateTypologyAndCcn: async (
      _: unknown,
      {
        candidateId,
        candidateTypologyAndCcn: { typology, additionalInformation, ccnId },
      }: {
        candidateId: string;
        candidateTypologyAndCcn: {
          typology: CandidateTypology;
          additionalInformation: string;
          ccnId: string;
        };
      },
    ) =>
      updateCandidateTypologyAndCcn({
        candidateId,
        typology,
        additionalInformation,
        ccnId,
      }),
  },
};

export const candidateResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
