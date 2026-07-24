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
  CANDIDACY_ID,
  buildCandidacyFixture,
} from "../features/__testUtils/fixtures.js";
import { getCandidacyById } from "../features/candidacies/getCandidacyById.js";
import { mapGetCandidacyById } from "../features/candidacies/getCandidacyById.mapper.js";
import { findSessionById } from "../features/session/findSessionById.js";

vi.mock("../features/candidacies/getCandidacyById.js", () => ({
  getCandidacyById: vi.fn(),
}));
vi.mock("../features/session/findSessionById.js", () => ({
  findSessionById: vi.fn(),
}));
vi.mock("../../../utils/keycloak.js", () => ({
  getUserAccessToken: vi.fn(),
}));
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

describe("GET /interop/v1/candidatures/:candidatureId", () => {
  test("répond 200 avec le corps sérialisé de la candidature", async () => {
    vi.mocked(getCandidacyById).mockResolvedValue(buildCandidacyFixture());

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: mapGetCandidacyById(buildCandidacyFixture()),
    });
  });

  test("répond 204 quand la candidature est introuvable", async () => {
    vi.mocked(getCandidacyById).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
  });

  test("répond 409 quand la feature remonte une erreur GraphQL", async () => {
    vi.mocked(getCandidacyById).mockRejectedValue(
      Object.assign(new Error("x"), { graphQLErrors: [{ message: "boom" }] }),
    );

    const response = await app.inject({
      method: "GET",
      url: `/interop/v1/candidatures/${CANDIDACY_ID}`,
      headers: securedHeaders(jwt),
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ statusCode: 409, error: "boom" });
  });
});
