import { Candidacy } from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";
import {
  CERTIFICATION_AUTHORITY_STRUCTURES,
  FUNDING_REQUEST_FULL_CERT_OK_HOURS,
  FUNDING_REQUEST_NO_HOURS,
} from "../../../../test/fixtures";
import { validateFeasibilityChecks } from "./feasibility-checks";

let candNoFeasibilty: Candidacy,
  candFeasibiltyValidated: Candidacy,
  candFeasibiltyRejected: Candidacy,
  candFeasibiltyPending: Candidacy;

describe("FundingRequesUnifvae Feasibility checks", () => {
  beforeAll(async () => {
    candNoFeasibilty = await prismaClient.candidacy.create({});
    candFeasibiltyValidated = await prismaClient.candidacy.create({
      data: {
        Feasibility: {
          create: {
            decision: "ADMISSIBLE",
            certificationAuthority: {
              create: {
                label: "dummy",
                certificationAuthorityStructureId:
                  CERTIFICATION_AUTHORITY_STRUCTURES.UIMM.id,
              },
            },

            feasibilityUploadedPdf: {
              create: {
                feasibilityFile: {
                  create: {
                    name: "dummyFile.ext",
                    mimeType: "kikoo/lol",
                    path: "dummyFile.ext",
                  },
                },
              },
            },
          },
        },
      },
    });
    candFeasibiltyRejected = await prismaClient.candidacy.create({
      data: {
        Feasibility: {
          create: {
            decision: "REJECTED",
            certificationAuthority: {
              create: {
                label: "dummy",
                certificationAuthorityStructureId:
                  CERTIFICATION_AUTHORITY_STRUCTURES.UIMM.id,
              },
            },
            feasibilityUploadedPdf: {
              create: {
                feasibilityFile: {
                  create: {
                    name: "dummyFile.ext",
                    mimeType: "kikoo/lol",
                    path: "dummyFile.ext",
                  },
                },
              },
            },
          },
        },
      },
    });
    candFeasibiltyPending = await prismaClient.candidacy.create({
      data: {
        Feasibility: {
          create: {
            decision: "PENDING",
            certificationAuthority: {
              create: {
                label: "dummy",
                certificationAuthorityStructureId:
                  CERTIFICATION_AUTHORITY_STRUCTURES.UIMM.id,
              },
            },
            feasibilityUploadedPdf: {
              create: {
                feasibilityFile: {
                  create: {
                    name: "dummyFile.ext",
                    mimeType: "kikoo/lol",
                    path: "dummyFile.ext",
                  },
                },
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
      ...FUNDING_REQUEST_FULL_CERT_OK_HOURS,
    });
    expect(errors.length).toEqual(1);
    expect(errors[0].fieldName).toBe("GLOBAL");
    expect(errors[0].message).toContain(
      "le dossier de faisabilité n'a pas été envoyé",
    );
  });

  test("Should fail when feasibility decision is still pending", async () => {
    const errors = await validateFeasibilityChecks({
      candidacyId: candFeasibiltyPending.id,
      ...FUNDING_REQUEST_FULL_CERT_OK_HOURS,
    });
    expect(errors.length).toEqual(1);
    expect(errors[0].fieldName).toBe("GLOBAL");
    expect(errors[0].message).toContain(
      "la recevabilité n'a pas été prononcée",
    );
  });

  test("Should fail when feasibility rejected and funding request has disallowed items", async () => {
    const errors = await validateFeasibilityChecks({
      candidacyId: candFeasibiltyRejected.id,
      ...FUNDING_REQUEST_FULL_CERT_OK_HOURS,
    });
    console.log(errors);
    expect(errors.length).toEqual(6);
  });

  test("Should succeed when feasibility rejected and request has only allowed items", async () => {
    const errors = await validateFeasibilityChecks({
      candidacyId: candFeasibiltyValidated.id,
      ...FUNDING_REQUEST_NO_HOURS,
    });
    expect(errors.length).toEqual(0);
  });

  test("Should succeed when feasibility validated", async () => {
    const errors = await validateFeasibilityChecks({
      candidacyId: candFeasibiltyValidated.id,
      ...FUNDING_REQUEST_FULL_CERT_OK_HOURS,
    });
    expect(errors.length).toEqual(0);
  });
});
