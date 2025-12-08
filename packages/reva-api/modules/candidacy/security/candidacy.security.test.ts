import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityLocalAccountHelper } from "@/test/helpers/entities/create-certification-authority-local-account-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

const getCandidacy = ({
  role,
  candidacyId,
  keycloakId,
}: {
  role: KeyCloakUserRole;
  candidacyId: string;
  keycloakId?: string;
}) =>
  injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role,
      keycloakId: keycloakId || "whatever",
    }),
    payload: {
      requestType: "query",
      endpoint: "getCandidacyById",
      arguments: { id: candidacyId },
      returnFields: "{id}",
    },
  });

test("Admin should be able to access candidacy", async () => {
  const candidacy = await createCandidacyHelper();
  const resp = await getCandidacy({
    role: "admin",
    candidacyId: candidacy.id,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Candidate owning the candidacy should be able to access it", async () => {
  const candidacy = await createCandidacyHelper();
  const resp = await getCandidacy({
    role: "candidate",
    keycloakId: candidacy.candidate?.keycloakId,
    candidacyId: candidacy.id,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Random candidate should not be able to access the candidacy", async () => {
  const candidacy = await createCandidacyHelper();
  const randomCandidate = await createCandidateHelper();

  const resp = await getCandidacy({
    role: "candidate",
    keycloakId: randomCandidate.keycloakId,
    candidacyId: candidacy.id,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});

test("Aap associated to the candidacy should be able to access it", async () => {
  const organism = await createOrganismHelper();
  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      organismId: organism.id,
    },
  });

  const resp = await getCandidacy({
    role: "manage_candidacy",
    keycloakId: organism.organismOnAccounts[0].account.keycloakId,
    candidacyId: candidacy.id,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Random aap should not be able to access the candidacy", async () => {
  const organism = await createOrganismHelper();
  const candidacy = await createCandidacyHelper();
  const resp = await getCandidacy({
    role: "manage_candidacy",
    keycloakId: organism.organismOnAccounts[0].account.keycloakId,
    candidacyId: candidacy.id,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});

test("Maison mere manager of the aap associated to the candidacy should be able to access it", async () => {
  const organism = await createOrganismHelper();
  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      organismId: organism.id,
    },
  });

  const resp = await getCandidacy({
    role: "gestion_maison_mere_aap",
    keycloakId: organism.maisonMereAAP?.gestionnaire.keycloakId,
    candidacyId: candidacy.id,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Random maison mere manager should not be able to access the candidacy", async () => {
  const organism = await createOrganismHelper();
  const candidacy = await createCandidacyHelper();
  const resp = await getCandidacy({
    role: "gestion_maison_mere_aap",
    keycloakId: organism.maisonMereAAP?.gestionnaire.keycloakId,
    candidacyId: candidacy.id,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});

test("Certification authority manager of the feasibility file of the candidacy should be able to access it", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();

  const feasibility = await createFeasibilityUploadedPdfHelper({
    certificationAuthorityId: certificationAuthority.id,
  });

  const resp = await getCandidacy({
    role: "manage_certification_authority_local_account",
    keycloakId: certificationAuthority.Account[0].keycloakId,
    candidacyId: feasibility.candidacyId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: feasibility.candidacyId,
  });
});

test("Random Certification authority manager should not be able to access the candidacy", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();
  const candidacy = await createCandidacyHelper();
  const resp = await getCandidacy({
    role: "manage_certification_authority_local_account",
    keycloakId: certificationAuthority.Account[0].keycloakId,
    candidacyId: candidacy.id,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});

test("Certification local account of the feasibility file of the candidacy should be able to access it", async () => {
  const certificationAuthorityLocalAccount =
    await createCertificationAuthorityLocalAccountHelper();

  const certification = await createCertificationHelper({
    certificationAuthorityStructureId:
      certificationAuthorityLocalAccount.certificationAuthority
        .certificationAuthorityOnCertificationAuthorityStructure[0]
        ?.certificationAuthorityStructureId,
  });

  const candidacyInput = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
  });

  await prismaClient.certificationAuthorityLocalAccountOnCertification.create({
    data: {
      certificationAuthorityLocalAccountId:
        certificationAuthorityLocalAccount.id,
      certificationId: certification.id,
    },
  });

  await prismaClient.certificationAuthorityLocalAccountOnDepartment.create({
    data: {
      certificationAuthorityLocalAccountId:
        certificationAuthorityLocalAccount.id,
      departmentId: candidacyInput.candidate?.departmentId || "",
    },
  });

  const feasibility = await createFeasibilityUploadedPdfHelper({
    certificationAuthorityId:
      certificationAuthorityLocalAccount.certificationAuthorityId,
    candidacyId: candidacyInput.id,
  });

  const resp = await getCandidacy({
    role: "manage_feasibility",
    keycloakId: certificationAuthorityLocalAccount.account.keycloakId,
    candidacyId: feasibility.candidacyId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: feasibility.candidacyId,
  });
});

test("Random Certification local account should not be able to access the candidacy", async () => {
  const certificationAuthorityLocalAccount =
    await createCertificationAuthorityLocalAccountHelper();
  const candidacy = await createCandidacyHelper();
  const resp = await getCandidacy({
    role: "manage_feasibility",
    keycloakId: certificationAuthorityLocalAccount.account.keycloakId,
    candidacyId: candidacy.id,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});
