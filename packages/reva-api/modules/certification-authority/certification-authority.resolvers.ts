import mercurius from "mercurius";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import { CertificationAuthority } from "./certification-authority.types";
import { canUserManageCertificationAuthorityLocalAccount } from "./features/canUserManageCertifiationAuthorityLocalAccount";
import { createCertificationAuthorityLocalAccount } from "./features/createCertificationAuthorityLocalAccount";
import { getCertificationAuthorities } from "./features/getCertificationAuthorities";
import { getCertificationAuthorityById } from "./features/getCertificationAuthority";
import { getCertificationAuthorityLocalAccountByCertificationAuthorityId } from "./features/getCertificationAuthorityLocalAccountByCertificationAuthorityId";
import { getCertificationsByCertificationAuthorityId } from "./features/getCertificationsByCertificationAuthorityId";
import { getDepartmentsByCertificationAuthorityId } from "./features/getDepartmentsByCertificationAuthorityId";
import { updateCertificationAuthorityById } from "./features/updateCertificationAuthority";
import { updateCertificationAuthorityLocalAccount } from "./features/updateCertificationAuthorityLocalAccount";

export const resolvers = {
  CertificationAuthority: {
    departments: (parent: CertificationAuthority) =>
      getDepartmentsByCertificationAuthorityId({
        certificationAuthorityId: parent.id,
      }),
    certifications: (parent: CertificationAuthority) =>
      getCertificationsByCertificationAuthorityId({
        certificationAuthorityId: parent.id,
      }),
    certificationAuthorityLocalAccounts: (parent: CertificationAuthority) =>
      getCertificationAuthorityLocalAccountByCertificationAuthorityId({
        certificationAuthorityId: parent.id,
      }),
  },
  Mutation: {
    certification_authority_updateCertificationAuthority: async (
      _parent: unknown,
      params: {
        certificationAuthorityId: string;
        certificationAuthorityData: {
          label: string;
          contactFullName: string | null;
          contactEmail: string | null;
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

        return updateCertificationAuthorityById(
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
    certification_authority_createCertificationAuthorityLocalAccount: async (
      _parent: unknown,
      params: {
        input: {
          accountFirstname: string;
          accountLastname: string;
          accountEmail: string;
          departmentIds: string[];
          certificationIds: string[];
        };
      },
      context: GraphqlContext
    ) => {
      const keycloakAdmin = await context.app.getKeycloakAdmin();

      return createCertificationAuthorityLocalAccount({
        ...params.input,
        certificationAuthorityKeycloakId: context.auth.userInfo?.sub || "",
        keycloakAdmin,
      });
    },

    certification_authority_updateCertificationAuthorityLocalAccount: async (
      _parent: unknown,
      params: {
        input: {
          certificationAuthorityLocalAccountId: string;
          departmentIds: string[];
          certificationIds: string[];
        };
      },
      context: GraphqlContext
    ) => {
      const canManage = await canUserManageCertificationAuthorityLocalAccount({
        certificationAuthorityLocalAccountId:
          params.input.certificationAuthorityLocalAccountId,
        userKeycloakId: context.auth.userInfo?.sub || "",
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      if (!canManage) {
        throw new Error(
          "L'utilisateur n'est pas autorisé à modifier ce compte local d'autorité de certification"
        );
      }
      return updateCertificationAuthorityLocalAccount(params.input);
    },
  },
  Query: {
    certification_authority_getCertificationAuthority: async (
      _parent: unknown,
      params: {
        id: string;
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

        return getCertificationAuthorityById(
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
    certification_authority_getCertificationAuthorities: async (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        searchFilter?: string;
      },
      context: GraphqlContext
    ) => {
      if (!context.auth.hasRole("admin")) {
        throw new Error("Utilisateur non autorisé");
      }

      return getCertificationAuthorities(params);
    },
  },
};
