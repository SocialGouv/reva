import mercurius from "mercurius";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import { CertificationAuthority } from "./certification-authority.types";
import { getCertificationAuthorityById } from "./features/getCertificationAuthority";
import { getCertificationsByCertificationAuthorityId } from "./features/getCertificationsByCertificationAuthorityId";
import { getDepartmentsByCertificationAuthorityId } from "./features/getDepartmentsByCertificationAuthorityId";
import { updateCertificationAuthorityById } from "./features/updateCertificationAuthority";

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
  },
};
