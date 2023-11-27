import { Candidacy } from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";
import {
  fundingRequestFullCertOkHours,
  fundingRequestNoHours,
} from "../../../../test/fixtures/funding-request";
import { validateFeasibilityChecks } from "./feasibility-checks";

let candNoFeasibilty: Candidacy,
  candFeasibiltyValidated: Candidacy,
  candFeasibiltyRejected: Candidacy,
  candFeasibiltyPending: Candidacy;

describe("FundingRequesUnifvae Feasibility checks", () => {
  beforeAll(async () => {
    candNoFeasibilty = await prismaClient.candidacy.create({
      data: {
        deviceId: "plop1",
      },
    });
    candFeasibiltyValidated = await prismaClient.candidacy.create({
      data: {
        deviceId: "plop2",
        Feasibility: {
          create: {
            decision: "ADMISSIBLE",
            certificationAuthority: { create: { label: "dummy" } },
            feasibilityFile: {
              create: {
                name: "dummyFile.ext",
                mimeType: "kikoo/lol",
              },
            },
          },
        },
      },
    });
    candFeasibiltyRejected = await prismaClient.candidacy.create({
      data: {
        deviceId: "plop3",
        Feasibility: {
          create: {
            decision: "REJECTED",
            certificationAuthority: { create: { label: "dummy" } },
            feasibilityFile: {
              create: {
                name: "dummyFile.ext",
                mimeType: "kikoo/lol",
              },
            },
          },
        },
      },
    });
    candFeasibiltyPending = await prismaClient.candidacy.create({
      data: {
        deviceId: "plop4",
        Feasibility: {
          create: {
            decision: "PENDING",
            certificationAuthority: { create: { label: "dummy" } },
            feasibilityFile: {
              create: {
                name: "dummyFile.ext",
                mimeType: "kikoo/lol",
              },
            },
          },
        },
      },
    });
  });

  afterAll(async () => {
    await prismaClient.feasibility.deleteMany({});
    await prismaClient.file.deleteMany({});
    await prismaClient.candidacy.deleteMany({});
  });

  test("Should fail when feasibility not sent", async () => {
    const errors = await validateFeasibilityChecks({
      candidacyId: candNoFeasibilty.id,
      ...fundingRequestFullCertOkHours,
    });
    expect(errors.length).toEqual(1);
    expect(errors[0].fieldName).toBe("GLOBAL");
    expect(errors[0].message).toContain(
      "le dossier de faisabilité n'a pas été envoyé"
    );
  });

  test("Should fail when feasibility decision is still pending", async () => {
    const errors = await validateFeasibilityChecks({
      candidacyId: candFeasibiltyPending.id,
      ...fundingRequestFullCertOkHours,
    });
    expect(errors.length).toEqual(1);
    expect(errors[0].fieldName).toBe("GLOBAL");
    expect(errors[0].message).toContain(
      "la recevabilité n'a pas été prononcée"
    );
  });

  test("Should fail when feasibility rejected and funding request has disallowed items", async () => {
    const errors = await validateFeasibilityChecks({
      candidacyId: candFeasibiltyRejected.id,
      ...fundingRequestFullCertOkHours,
    });
    console.log(errors);
    expect(errors.length).toEqual(6);
  });

  test("Should succeed when feasibility rejected and request has only allowed items", async () => {
    const errors = await validateFeasibilityChecks({
      candidacyId: candFeasibiltyValidated.id,
      ...fundingRequestNoHours,
    });
    expect(errors.length).toEqual(0);
  });

  test("Should succeed when feasibility validated", async () => {
    const errors = await validateFeasibilityChecks({
      candidacyId: candFeasibiltyValidated.id,
      ...fundingRequestFullCertOkHours,
    });
    expect(errors.length).toEqual(0);
  });
});
