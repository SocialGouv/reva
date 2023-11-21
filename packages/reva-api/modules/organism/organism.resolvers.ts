import mercurius from "mercurius";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import { getOrganismById } from "./features/getOrganism";
import { updateOrganismById } from "./features/updateOrganism";

export const resolvers = {
  Mutation: {
    organism_updateOrganism: async (
      _parent: unknown,
      params: {
        organismId: string;
        organismData: {
          label: string;
          contactAdministrativeEmail: string;
          contactAdministrativePhone: string | null;
          website: string | null;
          isActive: boolean;
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

        return updateOrganismById(
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
    organism_getOrganism: async (
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

        if (!context.auth.hasRole("admin")) {
          throw new Error("Utilisateur non autorisé");
        }

        return getOrganismById({ organismId: params.id });
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
  },
};
