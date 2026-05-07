import { add, sub } from "date-fns";

import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createDossierDeValidationHelper } from "@/test/helpers/entities/create-dossier-de-validation-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";

import { scheduleSessionOfJury } from "./scheduleSessionOfJury";

const userEmail = "admin@test.com";
const userKeycloakId = "3c6d4571-da18-49a3-90e5-cc83ae7446bf";
const userRoles: KeyCloakUserRole[] = ["admin"];

async function createTestSetup({
  dossierDeValidationSentAt,
}: {
  dossierDeValidationSentAt?: Date;
} = {}) {
  const certificationAuthority = await createCertificationAuthorityHelper();

  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: "DOSSIER_DE_VALIDATION_ENVOYE",
  });

  await createFeasibilityUploadedPdfHelper({
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
    decision: "ADMISSIBLE",
    isActive: true,
  });

  await createDossierDeValidationHelper({
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
    dossierDeValidationSentAt,
  });

  return { candidacy };
}

function toTimestampString(date: Date): string {
  return String(date.getTime());
}

test("should throw if dossierDeValidationSentAt is not set", async () => {
  const { candidacy } = await createTestSetup();

  await expect(
    scheduleSessionOfJury({
      candidacyId: candidacy.id,
      date: toTimestampString(add(new Date(), { months: 1 })),
      timeSpecified: false,
      userEmail,
      userKeycloakId,
      userRoles,
    }),
  ).rejects.toThrow(
    "La date du jury doit être après la date d'envoi du dossier de validation",
  );
});

test("should throw if session date is before dossier de validation sent date", async () => {
  const { candidacy } = await createTestSetup({
    dossierDeValidationSentAt: add(new Date(), { months: 2 }),
  });

  await expect(
    scheduleSessionOfJury({
      candidacyId: candidacy.id,
      date: toTimestampString(add(new Date(), { months: 1 })),
      timeSpecified: false,
      userEmail,
      userKeycloakId,
      userRoles,
    }),
  ).rejects.toThrow(
    "La date du jury doit être après la date d'envoi du dossier de validation",
  );
});

test("should schedule successfully when session date is the same day as dossier de validation sent date", async () => {
  const dossierDeValidationSentAt = new Date("2026-05-06T14:30:00.000Z");
  const { candidacy } = await createTestSetup({
    dossierDeValidationSentAt,
  });

  const jury = await scheduleSessionOfJury({
    candidacyId: candidacy.id,
    date: toTimestampString(new Date("2026-05-06T00:00:00.000Z")),
    timeSpecified: false,
    userEmail,
    userKeycloakId,
    userRoles,
  });

  expect(jury).toBeDefined();
  expect(jury.candidacyId).toEqual(candidacy.id);
});

test("should throw if session date is more than 2 years in the future", async () => {
  const { candidacy } = await createTestSetup({
    dossierDeValidationSentAt: sub(new Date(), { months: 2 }),
  });

  await expect(
    scheduleSessionOfJury({
      candidacyId: candidacy.id,
      date: toTimestampString(add(new Date(), { years: 2, days: 1 })),
      timeSpecified: false,
      userEmail,
      userKeycloakId,
      userRoles,
    }),
  ).rejects.toThrow(
    "La date du jury doit être au maximum dans les 2 prochaines années",
  );
});

test("should schedule successfully when session date is after dossier de validation sent date", async () => {
  const { candidacy } = await createTestSetup({
    dossierDeValidationSentAt: sub(new Date(), { months: 2 }),
  });

  const jury = await scheduleSessionOfJury({
    candidacyId: candidacy.id,
    date: toTimestampString(add(new Date(), { months: 1 })),
    timeSpecified: false,
    userEmail,
    userKeycloakId,
    userRoles,
  });

  expect(jury).toBeDefined();
  expect(jury.candidacyId).toEqual(candidacy.id);
});
