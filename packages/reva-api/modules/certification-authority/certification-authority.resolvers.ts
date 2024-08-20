import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { CertificationAuthorityLocalAccount } from "@prisma/client";
import mercurius from "mercurius";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import { resolversSecurityMap } from "./certification-authority.security";
import { CertificationAuthority } from "./certification-authority.types";
import { canUserManageCertificationAuthorityLocalAccount } from "./features/canUserManageCertifiationAuthorityLocalAccount";
import { createCertificationAuthorityLocalAccount } from "./features/createCertificationAuthorityLocalAccount";
import { deleteCertificationAuthorityLocalAccount } from "./features/deleteCertificationAuthorityLocalAccount";
import { getCertificationAuthorities } from "./features/getCertificationAuthorities";
import { getCertificationAuthoritiesByCertificationId } from "./features/getCertificationAuthoritiesByCertificationId";
import { getCertificationAuthoritiesToTransferCandidacy } from "./features/getCertificationAuthoritiesToTransferCandidacy";
import { getCertificationAuthorityById } from "./features/getCertificationAuthority";
import { getCertificationAuthorityLocalAccountById } from "./features/getCertificationAuthorityLocalAccountById";
import { getCertificationsByCertificationAuthorityId } from "./features/getCertificationsByCertificationAuthorityId";
import { getDepartmentsByCertificationAuthorityId } from "./features/getDepartmentsByCertificationAuthorityId";
import { searchCertificationAuthoritiesAndLocalAccounts } from "./features/searchCertificationAuthoritiesAndLocalAccounts";
import { transferCandidacyToAnotherCertificationAuthority } from "./features/transferCandidacyToAnotherCertificationAuthority";
import { updateCertificationAuthorityById } from "./features/updateCertificationAuthority";
import { updateCertificationAuthorityDepartmentsAndCertifications } from "./features/updateCertificationAuthorityDepartmentsAndCertifications";
import { updateCertificationAuthorityLocalAccount } from "./features/updateCertificationAuthorityLocalAccount";
import { getCertificationAuthorityStructureById } from "./features/getCertificationAuthorityStructureById";
import { getCertificationsByCertificationStructureId } from "./features/getCertificationsByCertificationStructureId";
import { getCertificationAuthorityStructures } from "./features/getCertificationAuthorityStructures";
import { updateCertificationAuthorityStructure } from "./features/updateCertificationAuthorityStructure";
import { updateCertificationAuthorityStructureCertifications } from "./features/updateCertificationAuthorityStructureCertifications";

const unsafeResolvers = {
  CertificationAuthority: {
    departments: (parent: CertificationAuthority) =>
      getDepartmentsByCertificationAuthorityId({
        certificationAuthorityId: parent.id,
      }),
    certifications: (parent: CertificationAuthority) =>
      getCertificationsByCertificationAuthorityId({
        certificationAuthorityId: parent.id,
      }),
    certificationAuthorityStructure: ({
      certificationAuthorityStructureId,
    }: CertificationAuthority) =>
      getCertificationAuthorityStructureById({
        certificationAuthorityStructureId,
      }),
  },

  CertificationAuthorityLocalAccount: {
    certificationAuthority: (
      parent: CertificationAuthorityLocalAccount,
      _: unknown,
    ) =>
      getCertificationAuthorityById({
        id: parent.certificationAuthorityId,
      }),
  },
  Certification: {
    certificationAuthorities: ({
      id: certificationId,
    }: CertificationAuthority) =>
      getCertificationAuthoritiesByCertificationId({
        certificationId,
      }),
  },
  CertificationAuthorityStructure: {
    certifications: ({ id: certificationStructureId }: { id: string }) =>
      getCertificationsByCertificationStructureId({ certificationStructureId }),
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
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }

        return updateCertificationAuthorityById(
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
      context: GraphqlContext,
    ) => {
      return createCertificationAuthorityLocalAccount({
        ...params.input,
        certificationAuthorityKeycloakId: context.auth.userInfo?.sub || "",
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
      context: GraphqlContext,
    ) => {
      const canManage = await canUserManageCertificationAuthorityLocalAccount({
        certificationAuthorityLocalAccountId:
          params.input.certificationAuthorityLocalAccountId,
        userKeycloakId: context.auth.userInfo?.sub || "",
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      if (!canManage) {
        throw new Error(
          "L'utilisateur n'est pas autorisé à modifier ce compte local d'autorité de certification",
        );
      }
      return updateCertificationAuthorityLocalAccount(params.input);
    },
    certification_authority_updateCertificationAuthorityDepartmentsAndCertifications:
      async (
        _parent: unknown,
        params: {
          input: {
            certificationAuthorityId: string;
            departmentIds: string[];
            certificationIds: string[];
          };
        },
      ) =>
        updateCertificationAuthorityDepartmentsAndCertifications(params.input),

    certification_authority_deleteCertificationAuthorityLocalAccount: async (
      _parent: unknown,
      params: {
        certificationAuthorityLocalAccountId: string;
      },
      context: GraphqlContext,
    ) => {
      const canManage = await canUserManageCertificationAuthorityLocalAccount({
        certificationAuthorityLocalAccountId:
          params.certificationAuthorityLocalAccountId,
        userKeycloakId: context.auth.userInfo?.sub || "",
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
      if (!canManage) {
        throw new Error(
          "L'utilisateur n'est pas autorisé à modifier ce compte local d'autorité de certification",
        );
      }
      return deleteCertificationAuthorityLocalAccount({
        certificationAuthorityLocalAccountId:
          params.certificationAuthorityLocalAccountId,
      });
    },

    certification_authority_transferCandidacyToAnotherCertificationAuthority:
      async (
        _parent: unknown,
        params: {
          candidacyId: string;
          certificationAuthorityId: string;
          transferReason: string;
        },
      ) => transferCandidacyToAnotherCertificationAuthority(params),
    certification_authority_updateCertificationAuthorityStructure: async (
      _parent: unknown,
      params: {
        certificationAuthorityStructureId: string;
        certificationAuthorityStructureLabel: string;
      },
    ) => updateCertificationAuthorityStructure(params),
    certification_authority_updateCertificationAuthorityStructureCertifications:
      async (
        _parent: unknown,
        params: {
          certificationAuthorityStructureId: string;
          certificationIds: string[];
        },
      ) => updateCertificationAuthorityStructureCertifications(params),
  },
  Query: {
    certification_authority_getCertificationAuthority: async (
      _parent: unknown,
      params: {
        id: string;
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

        return getCertificationAuthorityById(params);
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    certification_authority_getCertificationAuthorities: (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        searchFilter?: string;
      },
    ) => getCertificationAuthorities(params),

    certification_authority_searchCertificationAuthoritiesAndLocalAccounts: (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        searchFilter?: string;
      },
    ) => searchCertificationAuthoritiesAndLocalAccounts(params),

    certification_authority_getCertificationAuthorityLocalAccount: (
      _parent: unknown,
      params: {
        id: string;
      },
    ) =>
      getCertificationAuthorityLocalAccountById({
        certificationAuthorityLocalAccountId: params.id,
      }),

    certification_authority_getCertificationAuthoritiesToTransferCandidacy: (
      _parent: unknown,
      params: {
        candidacyId: string;
        offset?: number;
        limit?: number;
        searchFilter?: string;
      },
    ) => getCertificationAuthoritiesToTransferCandidacy(params),
    certification_authority_getCertificationAuthorityStructures: (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
      },
    ) => getCertificationAuthorityStructures(params),

    certification_authority_getCertificationAuthorityStructure: (
      _parent: unknown,
      {
        id,
      }: {
        id: string;
      },
    ) =>
      getCertificationAuthorityStructureById({
        certificationAuthorityStructureId: id,
      }),
  },
};

export const resolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
