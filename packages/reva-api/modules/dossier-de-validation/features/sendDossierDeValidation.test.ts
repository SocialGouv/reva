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

  const certification = await createCertificationHelper({});
  const certificationAuthority =
    certification.certificationAuthorityStructure
      ?.certificationAuthorityOnCertificationAuthorityStructure[0]
      ?.certificationAuthority;

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
