import { buildApp } from "../../infra/server/app";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createFormaCodeHelper } from "../../test/helpers/entities/create-formacode-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { clearDatabase } from "../../test/jestClearDatabaseBeforeEachTestFile";
import keycloakPluginMock from "../../test/mocks/keycloak-plugin.mock";
import { RNCPReferential } from "./rncp/referential";
beforeAll(async () => {
  const app = await buildApp({ keycloakPluginMock });
  (global as any).fastify = app;
});

afterEach(async () => {
  await clearDatabase();
});

it("should create a new certification in the 'BROUILLON' status", async () => {
  const myFormaCode = await createFormaCodeHelper();
  jest.spyOn(RNCPReferential, "getInstance").mockImplementation(
    () =>
      ({
        findOneByRncp: () => ({
          ID_FICHE: "1234",
          NUMERO_FICHE: "1234",
          INTITULE: "1234",
          BLOCS_COMPETENCES: [],
          FORMACODES: [{ CODE: myFormaCode.code }],
          PREREQUIS: { PARSED_PREREQUIS: [], LISTE_PREREQUIS: "" },
          DATE_FIN_ENREGISTREMENT: new Date(),
          NOMENCLATURE_EUROPE: { INTITULE: "Niveau 4" },
        }),
      }) as unknown as RNCPReferential,
  );

  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "referential_addCertification",
      arguments: { input: { codeRncp: "1234" } },
      returnFields: "{status}",
    },
  });
  expect(response.json()).not.toHaveProperty("errors");
  expect(response.json().data.referential_addCertification.status).toBe(
    "BROUILLON",
  );
});
