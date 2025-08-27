import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  Account,
  CertificationAuthorityLocalAccount,
  CertificationRegistryManager,
} from "@prisma/client";
import mercurius from "mercurius";

import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger";

import { getAccountById } from "../account/features/getAccount";
import { buildCandidacyAuditLogUserInfo } from "../candidacy-log/features/logCandidacyAuditEvent";

import { resolversSecurityMap } from "./certification-authority.security";
import {
  CertificationAuthority,
  CreateCertificationAuthorityLocalAccountInput,
  UpdateCertificationAuthorityLocalAccountGeneralInformationInput,
} from "./certification-authority.types";
import { canUserManageCertificationAuthorityLocalAccount } from "./features/canUserManageCertifiationAuthorityLocalAccount";
import { certificationAuthorityAcceptCgu } from "./features/certificationAuthorityAcceptCgu";
import { createCertificationAuthority } from "./features/createCertificationAuthority";
import { createCertificationAuthorityLocalAccount } from "./features/createCertificationAuthorityLocalAccount";
import { createCertificationAuthorityStructure } from "./features/createCertificationAuthorityStructure";
import { createCertificationRegistryManager } from "./features/createCertificationRegistryManager";
import { deleteCertificationAuthorityLocalAccount } from "./features/deleteCertificationAuthorityLocalAccount";
import { getAccountByCertificationAuthorityId } from "./features/getAccountByCertificationAuthorityId";
import { getCertificationAuthorities } from "./features/getCertificationAuthorities";
import { getCertificationAuthoritiesByCertificationId } from "./features/getCertificationAuthoritiesByCertificationId";
import { getCertificationAuthoritiesByStructureId } from "./features/getCertificationAuthoritiesByStructureId";
import { getCertificationAuthoritiesToTransferCandidacy } from "./features/getCertificationAuthoritiesToTransferCandidacy";
import { getCertificationAuthorityById } from "./features/getCertificationAuthority";
import { getCertificationAuthorityLocalAccountByAccountId } from "./features/getCertificationAuthorityLocalAccountByAccountId";
import { getCertificationAuthorityLocalAccountByCertificationAuthorityId } from "./features/getCertificationAuthorityLocalAccountByCertificationAuthorityId";
import { getCertificationAuthorityLocalAccountById } from "./features/getCertificationAuthorityLocalAccountById";
import { getCertificationAuthorityLocalAccountsToTransferCandidacy } from "./features/getCertificationAuthorityLocalAccountsToTransferCandidacy";
import { getCertificationAuthorityRegions } from "./features/getCertificationAuthorityRegions";
import { getCertificationAuthorityStructureById } from "./features/getCertificationAuthorityStructureById";
import { getCertificationAuthorityStructures } from "./features/getCertificationAuthorityStructures";
import { getCertificationAuthorityStructuresByCertificationAuthorityId } from "./features/getCertificationAuthorityStructuresByCertificationAuthorityId";
import { getCertificationRegistryManagerByAccountId } from "./features/getCertificationRegistryManagerByAccountId";
import { getCertificationRegistryManagerByStructureId } from "./features/getCertificationRegistryManagerByStructureId";
import { getCertificationsByCertificationAuthorityId } from "./features/getCertificationsByCertificationAuthorityId";
import { getCertificationsByCertificationStructureId } from "./features/getCertificationsByCertificationStructureId";
import { getDepartmentsByCertificationAuthorityId } from "./features/getDepartmentsByCertificationAuthorityId";
import { getLastProfessionalCguCertificateur } from "./features/getLastProfessionalCguCertificateur";
import { getMetabaseIframeUrl } from "./features/getMetabaseIframeUrl";
import { searchCertificationAuthoritiesAndLocalAccounts } from "./features/searchCertificationAuthoritiesAndLocalAccounts";
import { transferCandidacyToAnotherCertificationAuthority } from "./features/transferCandidacyToAnotherCertificationAuthority";
import { transferCandidacyToCertificationAuthorityLocalAccount } from "./features/transferCandidacyToCertificationAuthorityLocalAccount";
import { updateCertificationAuthorityById } from "./features/updateCertificationAuthority";
import { updateCertificationAuthorityCertifications } from "./features/updateCertificationAuthorityCertifications";
import { updateCertificationAuthorityDepartments } from "./features/updateCertificationAuthorityDepartments";
import { updateCertificationAuthorityDepartmentsAndCertifications } from "./features/updateCertificationAuthorityDepartmentsAndCertifications";
import { updateCertificationAuthorityLocalAccountCertifications } from "./features/updateCertificationAuthorityLocalAccountCertifications";
import { updateCertificationAuthorityLocalAccountDepartments } from "./features/updateCertificationAuthorityLocalAccountDepartments";
import { updateCertificationAuthorityLocalAccountGeneralInformation } from "./features/updateCertificationAuthorityLocalAccountGeneralInformation";
import { updateCertificationAuthorityStructure } from "./features/updateCertificationAuthorityStructure";
import { updateCertificationAuthorityStructureCertifications } from "./features/updateCertificationAuthorityStructureCertifications";
import { updateCertificationRegistryManager } from "./features/updateCertificationRegistryManager";

const unsafeResolvers = {
  Account: {
    certificationRegistryManager: (parent: Account) =>
      getCertificationRegistryManagerByAccountId({
        accountId: parent.id,
      }),
    certificationAuthorityLocalAccount: (parent: Account) =>
      getCertificationAuthorityLocalAccountByAccountId({
        accountId: parent.id,
      }),
  },
  CertificationAuthority: {
    departments: (parent: CertificationAuthority) =>
      getDepartmentsByCertificationAuthorityId({
        certificationAuthorityId: parent.id,
      }),
    regions: (parent: CertificationAuthority) =>
      getCertificationAuthorityRegions(parent.id),
    certifications: (parent: CertificationAuthority) =>
      getCertificationsByCertificationAuthorityId({
        certificationAuthorityId: parent.id,
      }),
    certificationAuthorityStructures: ({
      id: certificationAuthorityId,
    }: CertificationAuthority) =>
      getCertificationAuthorityStructuresByCertificationAuthorityId({
        certificationAuthorityId,
      }),
    account: (parent: CertificationAuthority) =>
      getAccountByCertificationAuthorityId({
        certificationAuthorityId: parent.id,
      }),
    certificationAuthorityLocalAccounts: (parent: CertificationAuthority) =>
      getCertificationAuthorityLocalAccountByCertificationAuthorityId({
        certificationAuthorityId: parent.id,
      }),
    metabaseDashboardIframeUrl: async (parent: CertificationAuthority) =>
      getMetabaseIframeUrl(parent),
  },

  CertificationAuthorityLocalAccount: {
    certificationAuthority: (parent: CertificationAuthorityLocalAccount) =>
      getCertificationAuthorityById({
        id: parent.certificationAuthorityId,
      }),
    account: (parent: CertificationAuthorityLocalAccount, _: unknown) =>
      getAccountById({
        id: parent.accountId,
      }),
  },
  Certification: {
    certificationAuthorities: ({
      id: certificationId,
    }: CertificationAuthority) =>
      getCertificationAuthoritiesByCertificationId({
        certificationId,
      }),
    certificationAuthorityStructure: ({
      certificationAuthorityStructureId,
    }: {
      certificationAuthorityStructureId?: string;
    }) =>
      certificationAuthorityStructureId
        ? getCertificationAuthorityStructureById({
            certificationAuthorityStructureId:
              certificationAuthorityStructureId,
          })
        : null,
  },
  CertificationAuthorityStructure: {
    certifications: ({ id: certificationStructureId }: { id: string }) =>
      getCertificationsByCertificationStructureId({ certificationStructureId }),
    certificationAuthorities: ({
      id: certificationStructureId,
    }: {
      id: string;
    }) => getCertificationAuthoritiesByStructureId(certificationStructureId),
    certificationRegistryManager: ({
      id: certificationStructureId,
    }: {
      id: string;
    }) =>
      getCertificationRegistryManagerByStructureId(certificationStructureId),
    cgu: async ({
      cguVersion,
      cguAcceptedAt,
    }: {
      cguVersion: number;
      cguAcceptedAt?: Date;
    }) => {
      return {
        version: cguVersion,
        acceptedAt: cguAcceptedAt,
        isLatestVersion:
          (await getLastProfessionalCguCertificateur())?.version == cguVersion,
      };
    },
  },
  CertificationRegistryManager: {
    certificationAuthorityStructure: (parent: CertificationRegistryManager) =>
      getCertificationAuthorityStructureById({
        certificationAuthorityStructureId:
          parent.certificationAuthorityStructureId,
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
          contactPhone: string | null;
          isGlobalContact: boolean;
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

        return updateCertificationAuthorityById(params);
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },

    certification_authority_createCertificationAuthorityLocalAccount: async (
      _parent: unknown,
      params: {
        input: CreateCertificationAuthorityLocalAccountInput;
      },
    ) =>
      createCertificationAuthorityLocalAccount({
        ...params.input,
      }),

    certification_authority_createCertificationAuthority: async (
      _parent: unknown,
      params: {
        input: {
          accountFirstname: string;
          accountLastname: string;
          accountEmail: string;
          label: string;
          certificationAuthorityStructureId: string;
          certificationIds: string[];
        };
      },
    ) =>
      createCertificationAuthority({
        ...params.input,
      }),

    certification_authority_updateCertificationAuthorityLocalAccountGeneralInformation:
      async (
        _parent: unknown,
        params: {
          input: UpdateCertificationAuthorityLocalAccountGeneralInformationInput;
        },
        context: GraphqlContext,
      ) => {
        const canManage = await canUserManageCertificationAuthorityLocalAccount(
          {
            certificationAuthorityLocalAccountId:
              params.input.certificationAuthorityLocalAccountId,
            userKeycloakId: context.auth.userInfo?.sub || "",
            userRoles: context.auth.userInfo?.realm_access?.roles || [],
          },
        );
        if (!canManage) {
          throw new Error(
            "L'utilisateur n'est pas autorisé à modifier ce compte local d'autorité de certification",
          );
        }
        return updateCertificationAuthorityLocalAccountGeneralInformation(
          params.input,
        );
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

    certification_authority_updateCertificationAuthorityCertifications: async (
      _parent: unknown,
      params: {
        certificationAuthorityId: string;
        certificationIds: string[];
      },
    ) => updateCertificationAuthorityCertifications(params),

    certification_authority_updateCertificationAuthorityDepartments: async (
      _parent: unknown,
      params: {
        certificationAuthorityId: string;
        departmentIds: string[];
      },
    ) => updateCertificationAuthorityDepartments(params),

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

    certification_authority_updateCertificationAuthorityLocalAccountDepartments:
      async (
        _parent: unknown,
        params: {
          certificationAuthorityLocalAccountId: string;
          departmentIds: string[];
        },
        context: GraphqlContext,
      ) => {
        const canManage = await canUserManageCertificationAuthorityLocalAccount(
          {
            certificationAuthorityLocalAccountId:
              params.certificationAuthorityLocalAccountId,
            userKeycloakId: context.auth.userInfo?.sub || "",
            userRoles: context.auth.userInfo?.realm_access?.roles || [],
          },
        );
        if (!canManage) {
          throw new Error(
            "L'utilisateur n'est pas autorisé à modifier ce compte local d'autorité de certification",
          );
        }
        return updateCertificationAuthorityLocalAccountDepartments(params);
      },

    certification_authority_updateCertificationAuthorityLocalAccountCertifications:
      async (
        _parent: unknown,
        params: {
          certificationAuthorityLocalAccountId: string;
          certificationIds: string[];
        },
        context: GraphqlContext,
      ) => {
        const canManage = await canUserManageCertificationAuthorityLocalAccount(
          {
            certificationAuthorityLocalAccountId:
              params.certificationAuthorityLocalAccountId,
            userKeycloakId: context.auth.userInfo?.sub || "",
            userRoles: context.auth.userInfo?.realm_access?.roles || [],
          },
        );
        if (!canManage) {
          throw new Error(
            "L'utilisateur n'est pas autorisé à modifier ce compte local d'autorité de certification",
          );
        }
        return updateCertificationAuthorityLocalAccountCertifications(params);
      },

    certification_authority_transferCandidacyToAnotherCertificationAuthority:
      async (
        _parent: unknown,
        params: {
          candidacyId: string;
          certificationAuthorityId: string;
          transferReason: string;
        },
        context: GraphqlContext,
      ) =>
        transferCandidacyToAnotherCertificationAuthority({
          ...params,
          userInfo: buildCandidacyAuditLogUserInfo(context),
        }),

    certification_authority_transferCandidacyToCertificationAuthorityLocalAccount:
      async (
        _parent: unknown,
        params: {
          candidacyId: string;
          certificationAuthorityLocalAccountId: string;
          transferReason: string;
        },
        context: GraphqlContext,
      ) => {
        await transferCandidacyToCertificationAuthorityLocalAccount({
          ...params,
          userInfo: buildCandidacyAuditLogUserInfo(context),
        });

        return true;
      },

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

    certification_authority_createCertificationRegistryManager: async (
      _parent: unknown,
      params: {
        input: {
          certificationAuthorityStructureId: string;
          accountFirstname: string;
          accountLastname: string;
          accountEmail: string;
        };
      },
    ) => {
      return createCertificationRegistryManager(params.input);
    },
    certification_authority_updateCertificationRegistryManager: async (
      _parent: unknown,
      params: {
        input: {
          certificationRegistryManagerId: string;
          accountFirstname: string;
          accountLastname: string;
          accountEmail: string;
        };
      },
    ) => {
      return updateCertificationRegistryManager(params.input);
    },
    certification_authority_acceptCgu: async (
      _parent: unknown,
      _params: unknown,
      context: GraphqlContext,
    ) =>
      certificationAuthorityAcceptCgu({
        keycloakId: context.auth.userInfo?.sub || "",
        roles: context.auth.userInfo?.realm_access?.roles || [],
      }),
    certification_authority_createCertificationAuthorityStructure: async (
      _parent: unknown,
      params: {
        label: string;
      },
    ) => createCertificationAuthorityStructure(params.label),
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

    certification_authority_getCertificationAuthorityLocalAccountsToTransferCandidacy:
      (
        _parent: unknown,
        params: {
          candidacyId: string;
          offset?: number;
          limit?: number;
          searchFilter?: string;
        },
        context: GraphqlContext,
      ) =>
        getCertificationAuthorityLocalAccountsToTransferCandidacy({
          ...params,
          keycloakId: context.auth.userInfo?.sub,
        }),

    certification_authority_getCertificationAuthorityStructures: (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        searchFilter?: string;
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
