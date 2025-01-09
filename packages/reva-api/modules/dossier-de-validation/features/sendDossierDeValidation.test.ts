import { buildApp } from "../../../infra/server/app";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { clearDatabase } from "../../../test/jestClearDatabaseBeforeEachTestFile";
import keycloakPluginMock from "../../../test/mocks/keycloak-plugin.mock";
import { FastifyInstance } from "fastify";
import * as FILE from "../../shared/file/file.service";
import { createFeasibilityUploadedPdfHelper } from "../../../test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { createCertificationHelper } from "../../../test/helpers/entities/create-certification-helper";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import * as SEND_NEW_DV_TO_CA_EMAIL from "../emails/sendNewDVToCertificationAuthoritiesEmail";
import * as SEND_NEW_DV_TO_CANDIDATE_EMAIL from "../emails/sendDVSentToCandidateEmail";
import { createJuryHelper } from "../../../test/helpers/entities/create-jury-helper";
import { CandidacyStatusStep } from "@prisma/client";

beforeAll(async () => {
  const app = await buildApp({ keycloakPluginMock });
  (global as any).fastify = app;
});

beforeEach(async () => {
  await clearDatabase();
});

const postDossierDeValidation = ({
  candidacyId,
  authorization,
}: {
  candidacyId: string;
  authorization: ReturnType<typeof authorizationHeaderForUser>;
}) => {
  const formData = new FormData();
  formData.append("candidacyId", candidacyId);
  formData.append(
    "dossierDeValidationFile",
    new File([], "test.pdf", { type: "application/pdf" }),
  );

  const fastify = (global as any).fastify as FastifyInstance;

  return fastify.inject({
    method: "POST",
    url: `api/dossier-de-validation/upload-dossier-de-validation`,
    headers: {
      authorization,
      "content-type": "multipart/form-data",
    },
    body: formData,
  });
};

const createCertificationWithcertificationAuthority = async () => {
  const certification = await createCertificationHelper({});
  const certificationAuthority =
    certification.certificationAuthorityStructure
      ?.certificationAuthorityOnCertificationAuthorityStructure[0]
      ?.certificationAuthority;
  return { certification, certificationAuthority };
};

test("should validate upload of dossier de validation", async () => {
  jest.spyOn(FILE, "uploadFileToS3").mockImplementation();

  const sendNewDVToCertificationAuthoritiesEmailMock = jest.spyOn(
    SEND_NEW_DV_TO_CA_EMAIL,
    "sendNewDVToCertificationAuthoritiesEmail",
  );

  const sendDVSentToCandidateEmailMock = jest.spyOn(
    SEND_NEW_DV_TO_CANDIDATE_EMAIL,
    "sendDVSentToCandidateEmail",
  );

  const { certification, certificationAuthority } =
    await createCertificationWithcertificationAuthority();

  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
      status: "DEMANDE_FINANCEMENT_ENVOYE",
    },
    candidacyActiveStatus: "DEMANDE_FINANCEMENT_ENVOYE",
  });

  const feasibility = await createFeasibilityUploadedPdfHelper({
    decision: "ADMISSIBLE",
    certificationAuthorityId: certificationAuthority?.id,
    candidacyId: candidacy.id,
  });

  const resp = await postDossierDeValidation({
    candidacyId: feasibility.candidacyId,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: feasibility.candidacy.organism?.accounts[0].keycloakId,
    }),
  });

  const emails = [];
  if (certificationAuthority?.contactEmail) {
    emails.push(certificationAuthority?.contactEmail);
  }

  expect(
    await sendNewDVToCertificationAuthoritiesEmailMock.mock.results[0].value,
  ).toBe(`email sent to ${emails.map((email) => email).join(", ")}`);

  expect(await sendDVSentToCandidateEmailMock.mock.results[0].value).toBe(
    `email sent to ${candidacy?.candidate?.email}`,
  );

  expect(resp.statusCode).toEqual(200);
});

[
  CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
  CandidacyStatusStep.DEMANDE_PAIEMENT_ENVOYEE,
].forEach((candidacyActiveStatus) => {
  test(`when status is ${candidacyActiveStatus} it should prevent sending again a DV when no jury result`, async () => {
    const { certification, certificationAuthority } =
      await createCertificationWithcertificationAuthority();

    const candidacy = await createCandidacyHelper({
      candidacyArgs: {
        certificationId: certification.id,
      },
      candidacyActiveStatus,
    });

    const feasibility = await createFeasibilityUploadedPdfHelper({
      decision: "ADMISSIBLE",
      certificationAuthorityId: certificationAuthority?.id,
      candidacyId: candidacy.id,
    });

    const resp = await postDossierDeValidation({
      candidacyId: feasibility.candidacyId,
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: feasibility.candidacy.organism?.accounts[0].keycloakId,
      }),
    });

    expect(resp.statusCode).toEqual(500);
    expect(resp.body).toMatch(
      "Seul un candidat ayant échoué totalement ou partiellement au jury peut renvoyer un dossier de validation",
    );
  });

  test("when status is ${candidacyActiveStatus} should prevent sending again a DV when FULL_SUCCESS_OF_FULL_CERTIFICATION jury result", async () => {
    const { certification, certificationAuthority } =
      await createCertificationWithcertificationAuthority();

    const candidacy = await createCandidacyHelper({
      candidacyArgs: {
        certificationId: certification.id,
      },
      candidacyActiveStatus,
    });

    const feasibility = await createFeasibilityUploadedPdfHelper({
      decision: "ADMISSIBLE",
      certificationAuthorityId: certificationAuthority?.id,
      candidacyId: candidacy.id,
    });

    await createJuryHelper({
      candidacyId: candidacy.id,
      result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    });

    const resp = await postDossierDeValidation({
      candidacyId: feasibility.candidacyId,
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: feasibility.candidacy.organism?.accounts[0].keycloakId,
      }),
    });

    expect(resp.statusCode).toEqual(500);
    expect(resp.body).toMatch(
      "Seul un candidat ayant échoué totalement ou partiellement au jury peut renvoyer un dossier de validation",
    );
  });

  [
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  ].forEach((result) =>
    test(`when status is ${candidacyActiveStatus} should allow sending again a DV when ${result} jury result`, async () => {
      const { certification, certificationAuthority } =
        await createCertificationWithcertificationAuthority();

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification.id,
        },
        candidacyActiveStatus,
      });

      const feasibility = await createFeasibilityUploadedPdfHelper({
        decision: "ADMISSIBLE",
        certificationAuthorityId: certificationAuthority?.id,
        candidacyId: candidacy.id,
      });

      await createJuryHelper({
        candidacyId: candidacy.id,
        result,
      });

      const resp = await postDossierDeValidation({
        candidacyId: feasibility.candidacyId,
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
          keycloakId: feasibility.candidacy.organism?.accounts[0].keycloakId,
        }),
      });

      expect(resp.statusCode).toEqual(200);
    }),
  );
});
