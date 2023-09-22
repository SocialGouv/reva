import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import Keycloak from "keycloak-connect";
import mercurius from "mercurius";
import { Left } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import { createAccount } from "./features/createAccount";

export const resolvers = {
  Mutation: {
    account_createAccount: async (
      _: any,
      params: {
        account: {
          email: string;
          username: string;
          firstname?: string;
          lastname?: string;
          group: KeyCloakGroup;
          organismId?: string;
        };
      },
      context: {
        reply: any;
        auth: any;
        app: {
          keycloak: Keycloak.Keycloak;
          getKeycloakAdmin: () => KeycloakAdminClient;
        };
      }
    ) => {
      if (!context.auth.hasRole("admin")) {
        return Left(
          new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized"
          )
        )
          .mapLeft(
            (error) => new mercurius.ErrorWithProps(error.message, error)
          )
          .extract();
      }

      const keycloakAdmin = await context.app.getKeycloakAdmin();
      try {
        return createAccount({
          ...params.account,
          keycloakAdmin,
        });
      } catch (e) {
        logger.error(e);

        if (e instanceof Error) {
          throw new mercurius.ErrorWithProps(e.message, e);
        } else {
          throw new mercurius.ErrorWithProps("unknown error");
        }
      }
    },
  },
};
