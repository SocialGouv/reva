/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { randomUUID } from "crypto";

import { Account, LegalStatus, Organism, prisma } from "@prisma/client";

import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";

const organismAP = {
  label: "Formapro",
  legalStatus: LegalStatus.SAS,
  siret: "1234888",
  address: "64 boulevard du Général Leclerc",
  city: "Paris",
  zip: "75015",
  contactAdministrativeEmail: "contact@formapro.fr",
  contactCommercialEmail: "contact@formapro.fr",
  contactCommercialName: "Riton BG",
  isActive: true,
};

const accountAP = {
  firstname: "Jojo",
  lastname: "Landouille",
  email: "contact@jojo-formation.fr",
  keycloakId: randomUUID(),
};

const subreqSample = {
  companyName: "Formidable",
  companyLegalStatus: LegalStatus.SAS,
  companySiret: "1234888",
  companyAddress: "64 boulevard du Général Leclerc 35600 Fougères",
  companyBillingAddress: "123 rue Tabaga 75015 Paris",
  companyBic: "1232131",
  companyIban: "234345343",
  companyBillingEmail: "billing@jojo-formation.fr",
  accountFirstname: accountAP.firstname,
  accountLastname: accountAP.lastname,
  accountPhoneNumber: "03214556789",
  accountEmail: organismAP.contactCommercialEmail,
};

const subreqSameOrganism = {
  ...subreqSample, // same siret
  companyName: "Jeanjean formation",
  accountEmail: "contact@jojo-formation.fr", // different account
};

const subreqSameAccount = {
  ...subreqSample,
  accountEmail: accountAP.email, // same account
  companyName: "Momo formation",
  companySiret: "987bla123", // different organism
};

let subreqSampleId: string,
  subreqSameOrganismId: string,
  subreqSameAccountId: string,
  organismAPId: string,
  accountAPId: string;

describe("Subscription request validation / rejection", () => {
  beforeAll(async () => {
    // Create organism + account
    await prismaClient.organism
      .create({ data: organismAP })
      .then(({ id }) => (organismAPId = id));
    await prismaClient.account
      .create({
        data: {
          ...accountAP,
          organismId: organismAPId,
          keycloakId: randomUUID(),
        },
      })
      .then(({ id }) => (accountAPId = id));
    // Create subscription requests
    await prismaClient.subscriptionRequest
      .create({ data: subreqSample })
      .then(({ id }) => (subreqSampleId = id));
    await prismaClient.subscriptionRequest
      .create({ data: subreqSameOrganism })
      .then(({ id }) => (subreqSameOrganismId = id));
    await prismaClient.subscriptionRequest
      .create({ data: subreqSameAccount })
      .then(({ id }) => (subreqSameAccountId = id));
  });

  afterAll(async () => {
    await prismaClient.account.delete({ where: { id: accountAPId } });
    await prismaClient.organism.delete({ where: { id: organismAPId } });
    await prismaClient.subscriptionRequest.deleteMany({
      where: {
        id: { in: [subreqSampleId, subreqSameOrganismId, subreqSameAccountId] },
      },
    });
  });

  test("Validation should fail when organism already exists", async () => {
    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "blabla",
      }),
      payload: {
        requestType: "mutation",
        endpoint: "subscription_validateSubscriptionRequest",
        arguments: { subscriptionRequestId: subreqSameOrganismId },
      },
    });
    expect(resp.statusCode).not.toBe(200);
    const errors = resp.json().errors;
    expect(errors.length).toEqual(1);
    expect(errors[0].message).toEqual(
      `Un organisme existe déjà avec le siret ${subreqSameOrganism.companySiret}`
    );
  });

  test("Validation should fail when account already exists", async () => {
    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "blabla",
      }),
      payload: {
        requestType: "mutation",
        endpoint: "subscription_validateSubscriptionRequest",
        arguments: { subscriptionRequestId: subreqSameAccountId },
      },
    });
    expect(resp.statusCode).not.toBe(200);
    const errors = resp.json().errors;
    expect(errors.length).toEqual(1);
    expect(errors[0].message).toEqual(
      `Un compte existe déjà avec l'email ${subreqSameAccount.accountEmail}`
    );
  });

});
