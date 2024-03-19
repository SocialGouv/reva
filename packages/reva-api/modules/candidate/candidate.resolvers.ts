import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import Keycloak from "keycloak-connect";
import mercurius from "mercurius";
import { Right } from "purify-ts";

import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { prismaClient } from "../../prisma/client";
import { generateJwt } from "./auth.helper";
import { CandidateUpdateInput } from "./candidate.types";
import {
  getCandidateByEmail as getCandidateByEmailFromDb,
  getCandidateWithCandidacyFromKeycloakId,
} from "./database/candidates";
import { askForLogin } from "./features/candidateAskForLogin";
import { askForRegistration } from "./features/candidateAskForRegistration";
import { candidateAuthentication } from "./features/candidateAuthentication";
import { getCandidateWithCandidacy } from "./features/candidateGetCandidateWithCandidacy";
import { getCandidateByEmail } from "./features/getCandidateByEmail";
import { updateCandidate } from "./features/updateCandidate";
import {
  sendLoginEmail,
  sendRegistrationEmail,
  sendUnknownUserEmail,
} from "./mails";
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
    candidate_getCandidateByEmail: async (
      _: any,
      { email }: { email: string },
      context: { auth: any },
    ) => {
      const result = await getCandidateByEmail({
        hasRole: context.auth.hasRole,
        getCandidateByEmail: getCandidateByEmailFromDb,
      })({ email });

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
    ) => {
      const result = await askForRegistration({
        generateJWTForRegistration: async (data: unknown) =>
          Right(generateJwt(data, 3 * 60 * 60)),
        sendRegistrationEmail: async (data) =>
          sendRegistrationEmail(data.email, data.token),
      })(params.candidate);

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidate_login: async (
      _: any,
      params: {
        token: string;
      },
      {
        app,
      }: {
        app: {
          keycloak: Keycloak.Keycloak;
          getKeycloakAdmin: () => KeycloakAdminClient;
        };
      },
    ) => {
      const keycloakAdmin = await app.getKeycloakAdmin();

      const result = await candidateAuthentication({
        ...params,
        keycloakAdmin,
      });

      return result;
    },
    candidate_askForLogin: async (
      _: unknown,
      params: { email: string },
      context: {
        app: {
          getKeycloakAdmin: () => KeycloakAdminClient;
        };
      },
    ) => {
      const keycloakAdmin = await context.app.getKeycloakAdmin();

      const doesUserExists = async ({ userEmail }: { userEmail: string }) =>
        !!(
          await keycloakAdmin.users.find({
            max: 1,
            realm: process.env.KEYCLOAK_APP_REALM,
            email: userEmail,
            exact: true,
          })
        ).length;

      const result = await askForLogin({
        doesUserExists,
        generateJWTForLogin: async (data: unknown) =>
          Right(generateJwt(data, 1 * 60 * 60)),
        sendLoginEmail: async (data) => sendLoginEmail(data.email, data.token),
        sendUnknownUserEmail: async (data) => sendUnknownUserEmail(data.email),
      })(params.email);

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidate_updateCandidate: async (
      _: any,
      {
        candidate,
      }: {
        candidate: CandidateUpdateInput;
      },
    ) => {
      const candidateUpdated = await updateCandidate({ candidate });
      return candidateUpdated;
    },
  },
};

export const candidateResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
