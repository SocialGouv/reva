import { createReadStream, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { CertificationStatus } from "@prisma/client";
import { addDays, subDays } from "date-fns";

import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";

import { updateCertificationAdditionalInfo } from "./updateCertificationAdditionalInfo";

const MISSING_DOSSIER_ERROR =
  "La trame du dossier de validation est requise et doit être transmise soit par PDF, soit sous forme de lien.";

const createPendingCertification = async ({
  status = CertificationStatus.A_VALIDER_PAR_CERTIFICATEUR,
}: {
  status?: CertificationStatus;
}) =>
  createCertificationHelper({
    status,
    availableAt: subDays(new Date(), 1),
    rncpExpiresAt: addDays(new Date(), 1),
  });

const createDummyUpload = (): GraphqlUploadedFile =>
  Promise.resolve().then(() => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), "reva-upload-"));
    const temporaryFilePath = join(temporaryDirectory, "dossier-template.pdf");

    writeFileSync(temporaryFilePath, Buffer.from("%PDF-1.4\n%reva-test\n"));

    return {
      filename: "dossier-template.pdf",
      mimetype: "application/pdf",
      createReadStream: () => createReadStream(temporaryFilePath),
    };
  });

describe("updateCertificationAdditionalInfo", () => {
  it("requires a dossier link or template", async () => {
    const certification = await createPendingCertification({});

    await expect(
      updateCertificationAdditionalInfo({
        certificationId: certification.id,
        additionalInfo: {
          linkToReferential: "",
          additionalDocuments: [],
        },
      }),
    ).rejects.toThrow(MISSING_DOSSIER_ERROR);
  });

  it("keeps dossier mutual exclusion", async () => {
    const certification = await createPendingCertification({});

    await expect(
      updateCertificationAdditionalInfo({
        certificationId: certification.id,
        additionalInfo: {
          linkToReferential: "",
          additionalDocuments: [],
          dossierDeValidationLink: "https://example.test/dossier",
          dossierDeValidationTemplate: createDummyUpload(),
        },
      }),
    ).rejects.toThrow(MISSING_DOSSIER_ERROR);
  });
});
