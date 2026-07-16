import { faker } from "@faker-js/faker";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

// Autorisation des resolvers finance (unireva + unifvae).
// On prouve que la porte de rôle refuse un appelant non habilité sur chaque
// resolver de premier niveau. Les champs Candidacy.* et les mutations de
// paiement partagent le preset isAdminOrCandidacyCompanion, dont le refus est
// prouvé ici; withPolicies garantit par ailleurs qu'aucun resolver n'est sans policy.

const NOT_AUTHORIZED = "You are not authorized!";
const UNAUTHENTICATED = "Votre session a expiré, veuillez vous reconnecter.";

const asRole = (role: KeyCloakUserRole) =>
  authorizationHeaderForUser({ role, keycloakId: faker.string.uuid() });

// Montants factices: la requête est refusée avant d'atteindre la feature,
// seule la validation de type de l'input doit passer.
const uniRevaPaymentInput = {
  diagnosisEffectiveHourCount: 0,
  diagnosisEffectiveCost: 0,
  postExamEffectiveHourCount: 0,
  postExamEffectiveCost: 0,
  individualEffectiveHourCount: 0,
  individualEffectiveCost: 0,
  collectiveEffectiveHourCount: 0,
  collectiveEffectiveCost: 0,
  mandatoryTrainingsEffectiveHourCount: 0,
  mandatoryTrainingsEffectiveCost: 0,
  basicSkillsEffectiveHourCount: 0,
  basicSkillsEffectiveCost: 0,
  certificateSkillsEffectiveHourCount: 0,
  certificateSkillsEffectiveCost: 0,
  otherTrainingEffectiveHourCount: 0,
  otherTrainingEffectiveCost: 0,
  examEffectiveHourCount: 0,
  examEffectiveCost: 0,
  invoiceNumber: "TEST",
};

const uniFvaePaymentInput = {
  individualEffectiveHourCount: 0,
  individualEffectiveCost: 0,
  collectiveEffectiveHourCount: 0,
  collectiveEffectiveCost: 0,
  mandatoryTrainingsEffectiveHourCount: 0,
  mandatoryTrainingsEffectiveCost: 0,
  basicSkillsEffectiveHourCount: 0,
  basicSkillsEffectiveCost: 0,
  certificateSkillsEffectiveHourCount: 0,
  certificateSkillsEffectiveCost: 0,
  otherTrainingEffectiveHourCount: 0,
  otherTrainingEffectiveCost: 0,
  invoiceNumber: "TEST",
};

describe("finance - autorisation des resolvers", () => {
  // isAdminOrManager
  describe("candidate_getFundingRequest", () => {
    const call = (authorization?: string) =>
      injectGraphql({
        fastify: global.testApp,
        authorization,
        payload: {
          requestType: "query",
          endpoint: "candidate_getFundingRequest",
          arguments: { candidacyId: faker.string.uuid() },
          returnFields: "{ __typename }",
        },
      });

    test("un candidat est refusé", async () => {
      const resp = await call(asRole("candidate"));
      expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("un appelant non authentifié est refusé", async () => {
      const resp = await call();
      expect(resp.json().errors[0].message).toBe(UNAUTHENTICATED);
    });
  });

  // isAdminOrCandidacyCompanion (partagé par les autres mutations et les champs Candidacy.*)
  test("candidacy_createOrUpdatePaymentRequest refuse un candidat", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      authorization: asRole("candidate"),
      payload: {
        requestType: "mutation",
        endpoint: "candidacy_createOrUpdatePaymentRequest",
        arguments: {
          candidacyId: faker.string.uuid(),
          paymentRequest: uniRevaPaymentInput,
        },
        returnFields: "{ __typename }",
      },
    });
    expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
  });

  test("candidacy_confirmPaymentRequest refuse un candidat", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      authorization: asRole("candidate"),
      payload: {
        requestType: "mutation",
        endpoint: "candidacy_confirmPaymentRequest",
        arguments: { candidacyId: faker.string.uuid() },
        returnFields: "{ __typename }",
      },
    });
    expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
  });

  test("candidacy_createOrUpdatePaymentRequestUnifvae refuse un candidat", async () => {
    const resp = await injectGraphql({
      fastify: global.testApp,
      authorization: asRole("candidate"),
      payload: {
        requestType: "mutation",
        endpoint: "candidacy_createOrUpdatePaymentRequestUnifvae",
        arguments: {
          candidacyId: faker.string.uuid(),
          paymentRequest: uniFvaePaymentInput,
        },
        returnFields: "{ __typename }",
      },
    });
    expect(resp.json().errors[0].message).toBe(NOT_AUTHORIZED);
  });
});
