import { FastifyInstance } from "fastify";

import * as FILE from "@/modules/shared/file/file.service";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createDossierDeValidationHelper } from "@/test/helpers/entities/create-dossier-de-validation-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { createJuryHelper } from "@/test/helpers/entities/create-jury-helper";

import * as SEND_NEW_DV_TO_CANDIDATE_EMAIL from "../emails/sendDVSentToCandidateEmail";
import * as SEND_NEW_DV_TO_CA_EMAIL from "../emails/sendNewDVToCertificationAuthoritiesEmail";

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

  expect(sendNewDVToCertificationAuthoritiesEmailMock).toHaveBeenCalledWith({
    emails,
    candidacyId: candidacy.id,
  });
  expect(sendNewDVToCertificationAuthoritiesEmailMock).toHaveBeenCalledTimes(1);

  expect(sendDVSentToCandidateEmailMock).toHaveBeenCalledTimes(1);

  expect(resp.statusCode).toEqual(200);
});

test(`it should prevent sending again a DV when a DV is already PENDING`, async () => {
  const { certification, certificationAuthority } =
    await createCertificationWithcertificationAuthority();

  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
    candidacyActiveStatus: "DEMANDE_FINANCEMENT_ENVOYE",
  });

  const feasibility = await createFeasibilityUploadedPdfHelper({
    decision: "ADMISSIBLE",
    certificationAuthorityId: certificationAuthority?.id,
    candidacyId: candidacy.id,
  });

  await createDossierDeValidationHelper({
    candidacyId: candidacy.id,
    decision: "PENDING",
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
    "Un dossier de validation est en cours de validation par le certificateur.",
  );
});

test(`it should prevent sending again a DV when a DV is already PENDING and jury shceduled but no jury result`, async () => {
  const { certification, certificationAuthority } =
    await createCertificationWithcertificationAuthority();

  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
    candidacyActiveStatus: "DEMANDE_FINANCEMENT_ENVOYE",
  });

  const feasibility = await createFeasibilityUploadedPdfHelper({
    decision: "ADMISSIBLE",
    certificationAuthorityId: certificationAuthority?.id,
    candidacyId: candidacy.id,
  });

  await createDossierDeValidationHelper({
    candidacyId: candidacy.id,
    decision: "PENDING",
  });

  await createJuryHelper({
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

test(`it should prevent sending again a DV when a DV is already PENDING and when FULL_SUCCESS_OF_FULL_CERTIFICATION jury result`, async () => {
  const { certification, certificationAuthority } =
    await createCertificationWithcertificationAuthority();

  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
    candidacyActiveStatus: "DEMANDE_FINANCEMENT_ENVOYE",
  });

  const feasibility = await createFeasibilityUploadedPdfHelper({
    decision: "ADMISSIBLE",
    certificationAuthorityId: certificationAuthority?.id,
    candidacyId: candidacy.id,
  });

  await createDossierDeValidationHelper({
    candidacyId: candidacy.id,
    decision: "PENDING",
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
  "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
  "FAILURE",
  "CANDIDATE_EXCUSED",
  "CANDIDATE_ABSENT",
].forEach((result) =>
  test(`it should allow sending again a DV when ${result} jury result`, async () => {
    const { certification, certificationAuthority } =
      await createCertificationWithcertificationAuthority();

    const candidacy = await createCandidacyHelper({
      candidacyArgs: {
        certificationId: certification.id,
      },
      candidacyActiveStatus: "DEMANDE_FINANCEMENT_ENVOYE",
    });

    const feasibility = await createFeasibilityUploadedPdfHelper({
      decision: "ADMISSIBLE",
      certificationAuthorityId: certificationAuthority?.id,
      candidacyId: candidacy.id,
    });

    await createDossierDeValidationHelper({
      candidacyId: candidacy.id,
      decision: "PENDING",
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
