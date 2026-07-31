import {
  NOT_AUTHORIZED,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

// Ces champs sont accessibles depuis la query publique `cohorteVaeCollective(codeInscription)`
// (isAnyone) via CohorteVaeCollective.commanditaireVaeCollective, qui doit rester
// consultable anonymement (raisonSociale affichée lors de l'inscription candidat).
// Il faut donc que ces champs imbriqués, eux, restent protégés individuellement.
describe("nested fields security on CommanditaireVaeCollective reached from the public cohorte lookup", () => {
  test("should not let an anonymous caller read cohorteVaeCollectives via the public cohorte lookup", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      codeInscription: "SECU1234",
    });

    const query = graphql(`
      query publicCohorteVaeCollectiveCommanditaireCohortes(
        $codeInscription: String!
      ) {
        cohorteVaeCollective(codeInscription: $codeInscription) {
          commanditaireVaeCollective {
            cohorteVaeCollectives {
              rows {
                id
              }
            }
          }
        }
      }
    `);

    const graphqlClient = getGraphQLClient({});

    await expect(
      graphqlClient.request(query, {
        codeInscription: cohorteVaeCollective.codeInscription || "",
      }),
    ).rejects.toThrowError(SESSION_EXPIRED);
  });

  test("should not let an anonymous caller read metabaseDashboardIframeUrl via the public cohorte lookup", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      codeInscription: "SECU5678",
    });

    const query = graphql(`
      query publicCohorteVaeCollectiveCommanditaireMetabaseUrl(
        $codeInscription: String!
      ) {
        cohorteVaeCollective(codeInscription: $codeInscription) {
          commanditaireVaeCollective {
            metabaseDashboardIframeUrl
          }
        }
      }
    `);

    const graphqlClient = getGraphQLClient({});

    await expect(
      graphqlClient.request(query, {
        codeInscription: cohorteVaeCollective.codeInscription || "",
      }),
    ).rejects.toThrowError(SESSION_EXPIRED);
  });

  test("should let the gestionnaire read cohorteVaeCollectives and metabaseDashboardIframeUrl of their own commanditaire vae collective", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const userKeycloakId =
      cohorteVaeCollective.commanditaireVaeCollective?.gestionnaire?.keycloakId;

    if (!userKeycloakId) {
      throw new Error("Compte gestionnaire non trouvé");
    }

    const query = graphql(`
      query gestionnaireCommanditaireNestedFields(
        $commanditaireVaeCollectiveId: ID!
      ) {
        vaeCollective_getCommanditaireVaeCollective(
          commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
        ) {
          cohorteVaeCollectives {
            rows {
              id
            }
          }
          metabaseDashboardIframeUrl
        }
      }
    `);

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_vae_collective",
          keycloakId: userKeycloakId,
        }),
      },
    });

    const res = await graphqlClient.request(query, {
      commanditaireVaeCollectiveId:
        cohorteVaeCollective.commanditaireVaeCollectiveId,
    });

    expect(
      res.vaeCollective_getCommanditaireVaeCollective.cohorteVaeCollectives.rows.map(
        (row) => row.id,
      ),
    ).toContain(cohorteVaeCollective.id);
  });

  test("should not let an AAP with a cohorte assigned to their organism read the metabaseDashboardIframeUrl", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const candidacy = await createCandidacyHelper({
      candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
    });

    const aapKeycloakId =
      candidacy.organism?.organismOnAccounts[0].account.keycloakId;

    if (!aapKeycloakId) {
      throw new Error("Compte AAP non trouvé");
    }

    const query = graphql(`
      query aapCohortesCommanditaireMetabaseUrl {
        cohortesVaeCollectivesForConnectedAap {
          commanditaireVaeCollective {
            metabaseDashboardIframeUrl
          }
        }
      }
    `);

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
          keycloakId: aapKeycloakId,
        }),
      },
    });

    await expect(graphqlClient.request(query)).rejects.toThrowError(
      NOT_AUTHORIZED,
    );
  });
});
