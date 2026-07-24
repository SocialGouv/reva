import { FastifyInstance } from "fastify";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import { buildApp } from "../../../app.js";
import { getGraphQlClient } from "../../../utils/graphqlClient.js";
import { getUserAccessToken } from "../../../utils/keycloak.js";
import {
  activeSession,
  KEYCLOAK_JWT,
  securedHeaders,
  signSessionJwt,
} from "../__tests__/httpTestHarness.js";
import {
  buildDossierDeValidationFixture,
  buildDossierDeValidationHistoryFixture,
  buildDossiersDeValidationPageFixture,
  CANDIDACY_ID,
} from "../features/__testUtils/fixtures.js";
import { createDossierDeValidationDecisionByCandidacyId } from "../features/dossiersDeValidation/createDossierDeValidationDecisionByCandidacyId.js";
import { getDossierDeValidationByCandidacyId } from "../features/dossiersDeValidation/getDossierDeValidationByCandidacyId.js";
import { getDossierDeValidationHistoryByCandidacyId } from "../features/dossiersDeValidation/getDossierDeValidationHistoryByCandidacyId.js";
import { getDossiersDeValidation } from "../features/dossiersDeValidation/getDossiersDeValidation.js";
import { findSessionById } from "../features/session/findSessionById.js";

vi.mock("../features/dossiersDeValidation/getDossiersDeValidation.js", () => ({
  getDossiersDeValidation: vi.fn(),
}));
vi.mock(
  "../features/dossiersDeValidation/getDossierDeValidationByCandidacyId.js",
  () => ({ getDossierDeValidationByCandidacyId: vi.fn() }),
);
vi.mock(
  "../features/dossiersDeValidation/getDossierDeValidationHistoryByCandidacyId.js",
  () => ({ getDossierDeValidationHistoryByCandidacyId: vi.fn() }),
);
vi.mock(
  "../features/dossiersDeValidation/createDossierDeValidationDecisionByCandidacyId.js",
  () => ({ createDossierDeValidationDecisionByCandidacyId: vi.fn() }),
);
vi.mock("../features/session/findSessionById.js", () => ({
  findSessionById: vi.fn(),
}));
vi.mock("../../../utils/keycloak.js", () => ({ getUserAccessToken: vi.fn() }));
vi.mock("../../../utils/graphqlClient.js", () => ({
  getGraphQlClient: vi.fn(),
}));

let app: FastifyInstance;
let jwt: string;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  jwt = await signSessionJwt();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(findSessionById).mockResolvedValue(activeSession());
  vi.mocked(getUserAccessToken).mockResolvedValue(KEYCLOAK_JWT);
  vi.mocked(getGraphQlClient).mockReturnValue({
    query: vi.fn(),
    mutation: vi.fn(),
  } as unknown as ReturnType<typeof getGraphQlClient>);
});

describe("GET /interop/v1/dossiersDeValidation", () => {
  test("répond 200 avec la page de dossiers", async () => {
    vi.mocked(getDossiersDeValidation).mockResolvedValue(
      buildDossiersDeValidationPageFixture(),
    );

    const response = await app.inject({
      method: "GET",
      url: "/interop/v1/dossiersDeValidation",
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.info.totalElements).toBe(1);
    expect(body.data[0].id).toBe("dossier-1");
  });

  test("transmet les paramètres de requête à la feature", async () => {
    vi.mocked(getDossiersDeValidation).mockResolvedValue(
      buildDossiersDeValidationPageFixture(),
    );

    await app.inject({
      method: "GET",
      url: "/interop/v1/dossiersDeValidation?limite=5&statut=VERIFIE",
      headers: securedHeaders(jwt),
    });

    expect(getDossiersDeValidation).toHaveBeenCalledWith(
      expect.anything(),
      0,
      5,
      "VERIFIE",
      undefined,
    );
  });

  test("répond 204 quand aucun dossier", async () => {
    vi.mocked(getDossiersDeValidation).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: "/interop/v1/dossiersDeValidation",
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("GET /interop/v1/candidatures/:id/dossierDeValidation", () => {
  test("répond 200 avec le dossier de validation sérialisé", async () => {
    vi.mocked(getDossierDeValidationByCandidacyId).mockResolvedValue(
      buildDossierDeValidationFixture(),
    );

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeValidation`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json();
    expect(data.id).toBe("dossier-validation-1");
    expect(data.statut).toBe("VERIFIE");
  });

  test("répond 204 quand aucun dossier de validation", async () => {
    vi.mocked(getDossierDeValidationByCandidacyId).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeValidation`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("GET /interop/v1/candidatures/:id/dossierDeValidation/decisions", () => {
  test("répond 200 avec l'historique des décisions", async () => {
    vi.mocked(getDossierDeValidationHistoryByCandidacyId).mockResolvedValue(
      buildDossierDeValidationHistoryFixture(),
    );

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeValidation/decisions`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json();
    expect(data).toHaveLength(2);
    expect(data[0].decision).toBe("VERIFIE");
  });

  test("répond 204 quand aucun historique", async () => {
    vi.mocked(getDossierDeValidationHistoryByCandidacyId).mockResolvedValue(
      undefined,
    );

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeValidation/decisions`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("POST /interop/v1/candidatures/:id/dossierDeValidation/decisions", () => {
  test("répond 200 et transmet la décision à la feature", async () => {
    vi.mocked(createDossierDeValidationDecisionByCandidacyId).mockResolvedValue(
      {
        id: CANDIDACY_ID,
        activeDossierDeValidation: {
          decision: "COMPLETE",
          decisionComment: "Dossier vérifié",
        },
      } as unknown as Awaited<
        ReturnType<typeof createDossierDeValidationDecisionByCandidacyId>
      >,
    );

    const response = await app.inject({
      method: "POST",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeValidation/decisions`,
      headers: securedHeaders(jwt),
      payload: { decision: "VERIFIE", commentaire: "Dossier vérifié" },
    });

    expect(response.statusCode).toBe(200);
    expect(createDossierDeValidationDecisionByCandidacyId).toHaveBeenCalledWith(
      expect.anything(),
      CANDIDACY_ID,
      { decision: "VERIFIE", commentaire: "Dossier vérifié" },
    );
  });

  test("répond 400 quand la décision est absente du corps", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeValidation/decisions`,
      headers: securedHeaders(jwt),
      payload: { commentaire: "Sans décision" },
    });

    expect(response.statusCode).toBe(400);
    expect(
      createDossierDeValidationDecisionByCandidacyId,
    ).not.toHaveBeenCalled();
  });

  test("répond 204 quand la feature ne renvoie rien", async () => {
    vi.mocked(createDossierDeValidationDecisionByCandidacyId).mockResolvedValue(
      undefined,
    );

    const response = await app.inject({
      method: "POST",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeValidation/decisions`,
      headers: securedHeaders(jwt),
      payload: { decision: "VERIFIE" },
    });

    expect(response.statusCode).toBe(204);
  });
});
