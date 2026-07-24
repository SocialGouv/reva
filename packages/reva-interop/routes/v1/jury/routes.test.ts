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
  buildJuriesPageFixture,
  buildJuryCandidacyFixture,
  buildJuryResultCandidacyFixture,
  buildJurySessionCandidacyFixture,
  CANDIDACY_ID,
} from "../features/__testUtils/fixtures.js";
import { getJuries } from "../features/juries/getJuries.js";
import { getJuryByCandidacyId } from "../features/juries/getJuryByCandidacyId.js";
import { getJuryResultByCandidacyId } from "../features/juries/getJuryResultByCandidacyId.js";
import { getJurySessionByCandidacyId } from "../features/juries/getJurySessionByCandidacyId.js";
import { scheduleJurySessionByCandidacyId } from "../features/juries/scheduleJurySessionByCandidacyId.js";
import { updateJuryResultByCandidacyId } from "../features/juries/updateJuryResultByCandidacyId.js";
import { findSessionById } from "../features/session/findSessionById.js";

vi.mock("../features/juries/getJuries.js", () => ({ getJuries: vi.fn() }));
vi.mock("../features/juries/getJuryByCandidacyId.js", () => ({
  getJuryByCandidacyId: vi.fn(),
}));
vi.mock("../features/juries/getJurySessionByCandidacyId.js", () => ({
  getJurySessionByCandidacyId: vi.fn(),
}));
vi.mock("../features/juries/getJuryResultByCandidacyId.js", () => ({
  getJuryResultByCandidacyId: vi.fn(),
}));
vi.mock("../features/juries/scheduleJurySessionByCandidacyId.js", () => ({
  scheduleJurySessionByCandidacyId: vi.fn(),
}));
vi.mock("../features/juries/updateJuryResultByCandidacyId.js", () => ({
  updateJuryResultByCandidacyId: vi.fn(),
}));
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

describe("GET /interop/v1/informationsJury", () => {
  test("répond 200 avec la page de jurys", async () => {
    vi.mocked(getJuries).mockResolvedValue(buildJuriesPageFixture());

    const response = await app.inject({
      method: "GET",
      url: "/interop/v1/informationsJury",
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.info.totalElements).toBe(1);
    expect(body.data[0].candidatureId).toBe(CANDIDACY_ID);
  });

  test("transmet les paramètres de requête à la feature", async () => {
    vi.mocked(getJuries).mockResolvedValue(buildJuriesPageFixture());

    await app.inject({
      method: "GET",
      url: "/interop/v1/informationsJury?limite=5&statut=PROGRAMME",
      headers: securedHeaders(jwt),
    });

    expect(getJuries).toHaveBeenCalledWith(
      expect.anything(),
      0,
      5,
      "PROGRAMME",
      undefined,
    );
  });

  test("répond 204 quand aucun jury", async () => {
    vi.mocked(getJuries).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: "/interop/v1/informationsJury",
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("GET /interop/v1/candidatures/:id/informationJury", () => {
  test("répond 200 avec les informations du jury", async () => {
    vi.mocked(getJuryByCandidacyId).mockResolvedValue(
      buildJuryCandidacyFixture(),
    );

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json();
    expect(data.candidatureId).toBe(CANDIDACY_ID);
    expect(data.statut).toBe("PROGRAMME");
  });

  test("répond 204 quand aucun jury", async () => {
    vi.mocked(getJuryByCandidacyId).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("GET /interop/v1/candidatures/:id/informationJury/session", () => {
  test("répond 200 avec la session du jury", async () => {
    vi.mocked(getJurySessionByCandidacyId).mockResolvedValue(
      buildJurySessionCandidacyFixture(),
    );

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury/session`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json();
    expect(data.adresseSession).toBe("10 avenue de la République");
  });

  test("répond 204 quand aucune session", async () => {
    vi.mocked(getJurySessionByCandidacyId).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury/session`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("GET /interop/v1/candidatures/:id/informationJury/resultat", () => {
  test("répond 200 avec le résultat du jury", async () => {
    vi.mocked(getJuryResultByCandidacyId).mockResolvedValue(
      buildJuryResultCandidacyFixture(),
    );

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury/resultat`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json();
    expect(data.resultat).toBe("ECHEC");
    expect(data.blocs).toHaveLength(1);
  });

  test("répond 204 quand aucun résultat", async () => {
    vi.mocked(getJuryResultByCandidacyId).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury/resultat`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("PUT /interop/v1/candidatures/:id/informationJury/session", () => {
  test("répond 200 et transmet la date parsée à la feature", async () => {
    vi.mocked(scheduleJurySessionByCandidacyId).mockResolvedValue(
      buildJurySessionCandidacyFixture(),
    );

    const response = await app.inject({
      method: "PUT",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury/session`,
      headers: {
        ...securedHeaders(jwt),
        "content-type": `multipart/form-data; boundary=${BOUNDARY}`,
      },
      payload: multipartBody({ date: "2026-09-01" }),
    });

    expect(response.statusCode).toBe(200);
    expect(scheduleJurySessionByCandidacyId).toHaveBeenCalledWith(
      expect.anything(),
      KEYCLOAK_JWT,
      CANDIDACY_ID,
      expect.objectContaining({ date: "2026-09-01" }),
    );
  });

  test("répond 204 quand la feature ne renvoie rien", async () => {
    vi.mocked(scheduleJurySessionByCandidacyId).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "PUT",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury/session`,
      headers: {
        ...securedHeaders(jwt),
        "content-type": `multipart/form-data; boundary=${BOUNDARY}`,
      },
      payload: multipartBody({ date: "2026-09-01" }),
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("PUT /interop/v1/candidatures/:id/informationJury/resultat", () => {
  test("répond 200 et transmet le résultat à la feature", async () => {
    vi.mocked(updateJuryResultByCandidacyId).mockResolvedValue(
      buildJuryResultCandidacyFixture(),
    );

    const response = await app.inject({
      method: "PUT",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury/resultat`,
      headers: securedHeaders(jwt),
      payload: { resultat: "ECHEC" },
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json();
    expect(data.resultat).toBe("ECHEC");
  });

  test("répond 400 quand le résultat est absent du corps", async () => {
    const response = await app.inject({
      method: "PUT",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury/resultat`,
      headers: securedHeaders(jwt),
      payload: { commentaire: "Sans résultat" },
    });

    expect(response.statusCode).toBe(400);
    expect(updateJuryResultByCandidacyId).not.toHaveBeenCalled();
  });

  test("répond 204 quand la feature ne renvoie rien", async () => {
    vi.mocked(updateJuryResultByCandidacyId).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "PUT",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}/informationJury/resultat`,
      headers: securedHeaders(jwt),
      payload: { resultat: "ECHEC" },
    });

    expect(response.statusCode).toBe(204);
  });
});
