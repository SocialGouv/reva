import {
  FUNDING_REQUEST_FULL_CERT_OK_HOURS_DECIMAL,
  FUNDING_REQUEST_NO_HOURS,
} from "@/test/fixtures/funding-requests.fixture";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";

import { validateFeasibilityChecks } from "./feasibility-checks";

describe("FundingRequesUnifvae Feasibility checks", () => {
  test("Should fail when feasibility not sent", async () => {
    const candidacy = await createCandidacyHelper();
    const errors = await validateFeasibilityChecks({
      candidacyId: candidacy.id,
      ...FUNDING_REQUEST_FULL_CERT_OK_HOURS_DECIMAL,
    });
    expect(errors.length).toEqual(1);
    expect(errors[0].fieldName).toBe("GLOBAL");
    expect(errors[0].message).toContain(
      "le dossier de faisabilité n'a pas été envoyé",
    );
  });

  test("Should fail when feasibility decision is still pending", async () => {
    const feasibility = await createFeasibilityUploadedPdfHelper({
      decision: "PENDING",
    });
    const errors = await validateFeasibilityChecks({
      candidacyId: feasibility.candidacyId,
      ...FUNDING_REQUEST_FULL_CERT_OK_HOURS_DECIMAL,
    });
    expect(errors.length).toEqual(1);
    expect(errors[0].fieldName).toBe("GLOBAL");
    expect(errors[0].message).toContain(
      "la recevabilité n'a pas été prononcée",
    );
  });

  test("Should fail when feasibility rejected and funding request has disallowed items", async () => {
    const feasibility = await createFeasibilityUploadedPdfHelper({
      decision: "REJECTED",
    });
    const errors = await validateFeasibilityChecks({
      candidacyId: feasibility.candidacyId,
      ...FUNDING_REQUEST_FULL_CERT_OK_HOURS_DECIMAL,
    });
    expect(errors.length).toEqual(6);
  });

  test("Should succeed when feasibility rejected and request has only allowed items", async () => {
    const feasibility = await createFeasibilityUploadedPdfHelper({
      decision: "REJECTED",
    });
    const errors = await validateFeasibilityChecks({
      candidacyId: feasibility.candidacyId,
      ...FUNDING_REQUEST_NO_HOURS,
    });
    expect(errors.length).toEqual(0);
  });

  test("Should succeed when feasibility validated", async () => {
    const feasibility = await createFeasibilityUploadedPdfHelper({
      decision: "ADMISSIBLE",
    });
    const errors = await validateFeasibilityChecks({
      candidacyId: feasibility.candidacyId,
      ...FUNDING_REQUEST_FULL_CERT_OK_HOURS_DECIMAL,
    });
    expect(errors.length).toEqual(0);
  });
});
