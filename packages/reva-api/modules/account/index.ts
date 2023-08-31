import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import Keycloak from "keycloak-connect";
import mercurius from "mercurius";
import { Left } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../domain/types/functionalError";
import { getCertificationAuthorityById } from "../feasibility/feasibility.features";
import * as organismsDb from "../organism/database/organisms";
import * as accountsDb from "./database/accounts";
import { createAccount } from "./features/createAccount";
import * as IAM from "./features/keycloak";

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

      const result = await createAccount({
        createAccountInIAM: IAM.createAccount(keycloakAdmin),
        createAccountWithProfile: accountsDb.createAccountProfile,
        getAccountInIAM: IAM.getAccount(keycloakAdmin),
        getOrganismById: organismsDb.getOrganismById,
        getCertificationAuthorityById,
      })(params.account);

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
};
