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
  buildFeasibilitiesPageFixture,
  buildFeasibilityCandidacyFixture,
  buildFeasibilityHistoryFixture,
  CANDIDACY_ID,
} from "../features/__testUtils/fixtures.js";
import { createFeasibilityDecisionByCandidacyId } from "../features/feasibilities/createFeasibilityDecisionByCandidacyId.js";
import { getFeasibilities } from "../features/feasibilities/getFeasibilities.js";
import { getFeasibilityByCandidacyId } from "../features/feasibilities/getFeasibilityByCandidacyId.js";
import { getFeasibilityHistoryByCandidacyId } from "../features/feasibilities/getFeasibilityHistoryByCandidacyId.js";
import { findSessionById } from "../features/session/findSessionById.js";

vi.mock("../features/feasibilities/getFeasibilityByCandidacyId.js", () => ({
  getFeasibilityByCandidacyId: vi.fn(),
}));
vi.mock(
  "../features/feasibilities/getFeasibilityHistoryByCandidacyId.js",
  () => ({ getFeasibilityHistoryByCandidacyId: vi.fn() }),
);
vi.mock("../features/feasibilities/getFeasibilities.js", () => ({
  getFeasibilities: vi.fn(),
}));
vi.mock(
  "../features/feasibilities/createFeasibilityDecisionByCandidacyId.js",
  () => ({ createFeasibilityDecisionByCandidacyId: vi.fn() }),
);
vi.mock("../features/session/findSessionById.js", () => ({
  findSessionById: vi.fn(),
}));
vi.mock("../../../utils/keycloak.js", () => ({ getUserAccessToken: vi.fn() }));
vi.mock("../../../utils/graphqlClient.js", () => ({
  getGraphQlClient: vi.fn(),
}));

// Corps multipart/form-data minimal : chaque champ devient { value } côté handler.
const BOUNDARY = "----interopTestBoundary";
const multipartBody = (fields: Record<string, string>) =>
  Object.entries(fields)
    .map(
      ([name, value]) =>
        `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
    )
    .join("") + `--${BOUNDARY}--\r\n`;

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

describe("GET /interop/v1/candidatures/:id/dossierDeFaisabilite", () => {
  test("répond 200 avec le dossier de faisabilité sérialisé", async () => {
    vi.mocked(getFeasibilityByCandidacyId).mockResolvedValue(
      buildFeasibilityCandidacyFixture(),
    );

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeFaisabilite`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json();
    expect(data.candidatureId).toBe(CANDIDACY_ID);
    expect(data.statut).toBe("EN_ATTENTE");
  });

  test("répond 204 quand aucun dossier de faisabilité", async () => {
    vi.mocked(getFeasibilityByCandidacyId).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeFaisabilite`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
  });
});

describe("GET /interop/v1/candidatures/:id/dossierDeFaisabilite/decisions", () => {
  test("répond 200 avec l'historique des décisions", async () => {
    vi.mocked(getFeasibilityHistoryByCandidacyId).mockResolvedValue(
      buildFeasibilityHistoryFixture(),
    );

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeFaisabilite/decisions`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json();
    expect(data).toHaveLength(2);
    expect(data[0].decision).toBe("COMPLET");
  });

  test("répond 204 quand aucun historique", async () => {
    vi.mocked(getFeasibilityHistoryByCandidacyId).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeFaisabilite/decisions`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("GET /interop/v1/dossiersDeFaisabilite", () => {
  test("répond 200 avec la page de dossiers", async () => {
    vi.mocked(getFeasibilities).mockResolvedValue(
      buildFeasibilitiesPageFixture(),
    );

    const response = await app.inject({
      method: "GET",
      url: "/interop/v1/dossiersDeFaisabilite",
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.info.totalElements).toBe(1);
    expect(body.data[0].candidatureId).toBe(CANDIDACY_ID);
  });

  test("transmet les paramètres de requête à la feature", async () => {
    vi.mocked(getFeasibilities).mockResolvedValue(
      buildFeasibilitiesPageFixture(),
    );

    await app.inject({
      method: "GET",
      url: "/interop/v1/dossiersDeFaisabilite?limite=5&statut=RECEVABLE",
      headers: securedHeaders(jwt),
    });

    expect(getFeasibilities).toHaveBeenCalledWith(
      expect.anything(),
      0,
      5,
      "RECEVABLE",
      undefined,
    );
  });

  test("répond 204 quand aucun dossier", async () => {
    vi.mocked(getFeasibilities).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: "/interop/v1/dossiersDeFaisabilite",
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("POST /interop/v1/candidatures/:id/dossierDeFaisabilite/decisions", () => {
  test("répond 200 et transmet la décision parsée à la feature", async () => {
    vi.mocked(createFeasibilityDecisionByCandidacyId).mockResolvedValue({
      id: CANDIDACY_ID,
      feasibility: {
        decision: "COMPLETE",
        decisionComment: null,
        decisionSentAt: null,
        decisionFile: null,
      },
    } as unknown as Awaited<
      ReturnType<typeof createFeasibilityDecisionByCandidacyId>
    >);

    const response = await app.inject({
      method: "POST",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeFaisabilite/decisions`,
      headers: {
        ...securedHeaders(jwt),
        "content-type": `multipart/form-data; boundary=${BOUNDARY}`,
      },
      payload: multipartBody({ decision: "COMPLET" }),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.decision).toBe("COMPLET");
    expect(createFeasibilityDecisionByCandidacyId).toHaveBeenCalledWith(
      expect.anything(),
      KEYCLOAK_JWT,
      CANDIDACY_ID,
      expect.objectContaining({ decision: "COMPLET" }),
    );
  });

  test("répond 204 quand la feature ne renvoie rien", async () => {
    vi.mocked(createFeasibilityDecisionByCandidacyId).mockResolvedValue(
      undefined,
    );

    const response = await app.inject({
      method: "POST",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/dossierDeFaisabilite/decisions`,
      headers: {
        ...securedHeaders(jwt),
        "content-type": `multipart/form-data; boundary=${BOUNDARY}`,
      },
      payload: multipartBody({ decision: "COMPLET" }),
    });

    expect(response.statusCode).toBe(204);
  });
});
