/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import {
  Account,
  Candidacy,
  Candidate,
  CertificationAuthority,
  File,
  MaisonMereAAP,
  Organism,
} from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import {
  CANDIDATE_MAN,
  CANDIDATE_WOMAN,
  CERTIFICATION_AUTHORITY_STRUCTURES,
  ORGANISM_EXPERIMENTATION,
  ORGANISM_EXPERT_BRANCHE_ET_FILIERE,
} from "../../../test/fixtures";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";

let organism: Organism,
  candidate: Candidate,
  randomCandidate: Candidate,
  candidacy: Candidacy,
  aapAccount: Account,
  randomOrganism: Organism,
  randomAapAccount: Account,
  maisonMereAAp: MaisonMereAAP,
  maisonMereAapManagerAccount: Account,
  randomMaisonMereAapManagerAccount: Account,
  certificationAuthority: CertificationAuthority,
  certificationAuthorityAccount: Account,
  feasibilityFile: File,
  randomCertificationAuthority: CertificationAuthority,
  randomCertificationAuthorityAccount: Account,
  certificationAuthorityLocalAccountAccount: Account,
  randomCertificationAuthorityLocalAccountAccount: Account;

beforeAll(async () => {
  const ileDeFrance = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  maisonMereAapManagerAccount = await prismaClient.account.create({
    data: {
      keycloakId: "79c6649e-3ff6-4e36-9651-c9e26d4a1f8d",
      email: "maisonmere.email.com",
    },
  });
  maisonMereAAp = await prismaClient.maisonMereAAP.create({
    data: {
      gestionnaireAccountId: maisonMereAapManagerAccount.id,
      raisonSociale: "maisonMere",
      dateExpirationCertificationQualiopi: new Date(),
      statutJuridique: "ASSOCIATION_LOI_1901",
      siret: "1234",
      typologie: "expertFiliere",
    },
  });

  randomMaisonMereAapManagerAccount = await prismaClient.account.create({
    data: {
      keycloakId: "56489671-7633-4a8b-a06c-b0930c001343",
      email: "randommaisonmere.email.com",
    },
  });

  await prismaClient.maisonMereAAP.create({
    data: {
      gestionnaireAccountId: randomMaisonMereAapManagerAccount.id,
      raisonSociale: "maisonMere",
      dateExpirationCertificationQualiopi: new Date(),
      statutJuridique: "ASSOCIATION_LOI_1901",
      siret: "1234",
      typologie: "expertFiliere",
    },
  });

  organism = await prismaClient.organism.create({
    data: { ...ORGANISM_EXPERIMENTATION, maisonMereAAPId: maisonMereAAp.id },
  });

  aapAccount = await prismaClient.account.create({
    data: {
      keycloakId: "ac5d568d-c6ba-41e3-95f9-6fedc49dcd45",
      email: "aap.email.com",
      organismId: organism.id,
    },
  });

  randomOrganism = await prismaClient.organism.create({
    data: ORGANISM_EXPERT_BRANCHE_ET_FILIERE,
  });

  randomAapAccount = await prismaClient.account.create({
    data: {
      keycloakId: "2d0498e3-5bd9-4ff0-857a-d4d34a119ced",
      email: "randomaap.email.com",
      organismId: randomOrganism.id,
    },
  });

  candidate = await prismaClient.candidate.create({
    data: { ...CANDIDATE_MAN, departmentId: ileDeFrance?.id || "" },
  });

  randomCandidate = await prismaClient.candidate.create({
    data: { ...CANDIDATE_WOMAN, departmentId: ileDeFrance?.id || "" },
  });

  const certification = await prismaClient.certification.findFirst({
    where: { label: "CAP Boucher" },
  });

  const department = await prismaClient.department.findFirst({
    where: { code: "01" },
  });

  candidacy = await prismaClient.candidacy.create({
    data: {
      candidateId: candidate.id,
      organismId: organism.id,
      departmentId: department?.id,
      certificationId: certification?.id,
    },
  });

  certificationAuthority = await prismaClient.certificationAuthority.create({
    data: {
      label: "certification authority",
      certificationAuthorityStructureId:
        CERTIFICATION_AUTHORITY_STRUCTURES.UIMM.id,
    },
  });

  certificationAuthorityAccount = await prismaClient.account.create({
    data: {
      keycloakId: "1a0b848e-e3a1-4c0d-b943-8c714fc59b25",
      email: "certauth.email.com",
      certificationAuthorityId: certificationAuthority.id,
    },
  });

  feasibilityFile = await prismaClient.file.create({
    data: { name: "file", mimeType: "text/plain", path: "file" },
  });

  await prismaClient.feasibility.create({
    data: {
      candidacyId: candidacy.id,
      feasibilityUploadedPdf: {
        create: {
          feasibilityFileId: feasibilityFile.id,
        },
      },
      certificationAuthorityId: certificationAuthority.id,
    },
  });

  randomCertificationAuthority =
    await prismaClient.certificationAuthority.create({
      data: {
        label: "random certification authority",
        certificationAuthorityStructureId:
          CERTIFICATION_AUTHORITY_STRUCTURES.UIMM.id,
      },
    });

  randomCertificationAuthorityAccount = await prismaClient.account.create({
    data: {
      keycloakId: "9097d59c-9630-42c0-9da8-17ea5f42c41c",
      email: "randomcertauth.email.com",
      certificationAuthorityId: randomCertificationAuthority.id,
    },
  });

  certificationAuthorityLocalAccountAccount = await prismaClient.account.create(
    {
      data: {
        keycloakId: "0a1228e0-148a-4280-964b-e2674b8ad5ae",
        email: "certauthlocalaccount.email.com",
      },
    },
  );

  await prismaClient.certificationAuthorityLocalAccount.create({
    data: {
      certificationAuthorityId: certificationAuthority.id,
      accountId: certificationAuthorityLocalAccountAccount.id,
      certificationAuthorityLocalAccountOnDepartment: {
        create: {
          department: { connect: { id: candidacy.departmentId as string } },
        },
      },
      certificationAuthorityLocalAccountOnCertification: {
        create: {
          certification: { connect: { id: certification?.id as string } },
        },
      },
    },
  });

  const randomDepartment = await prismaClient.department.findFirst({
    where: { code: "02" },
  });

  randomCertificationAuthorityLocalAccountAccount =
    await prismaClient.account.create({
      data: {
        keycloakId: "09eb700b-92da-4705-8f8b-c1ce45b6b656",
        email: "randomcertauthlocalaccount.email.com",
      },
    });

  await prismaClient.certificationAuthorityLocalAccount.create({
    data: {
      certificationAuthorityId: certificationAuthority.id,
      accountId: randomCertificationAuthorityLocalAccountAccount.id,
      certificationAuthorityLocalAccountOnDepartment: {
        create: {
          department: { connect: { id: randomDepartment?.id as string } },
        },
      },
      certificationAuthorityLocalAccountOnCertification: {
        create: {
          certification: { connect: { id: certification?.id as string } },
        },
      },
    },
  });
});

const getCandidacy = ({
  role,
  keycloakId,
}: {
  role: KeyCloakUserRole;
  keycloakId?: string;
}) =>
  injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role,
      keycloakId: keycloakId || "whatever",
    }),
    payload: {
      requestType: "query",
      endpoint: "getCandidacyById",
      arguments: { id: candidacy.id },
      returnFields: "{id}",
    },
  });

test("Admin should be able to access candidacy", async () => {
  const resp = await getCandidacy({ role: "admin" });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Candidate owning the candidacy should be able to access it", async () => {
  const resp = await getCandidacy({
    role: "candidate",
    keycloakId: candidate.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Random candidate should not be able to access the candidacy", async () => {
  const resp = await getCandidacy({
    role: "candidate",
    keycloakId: randomCandidate.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});

test("Aap associated to the candidacy should be able to access it", async () => {
  const resp = await getCandidacy({
    role: "manage_candidacy",
    keycloakId: aapAccount.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Random aap should not be able to access the candidacy", async () => {
  const resp = await getCandidacy({
    role: "manage_candidacy",
    keycloakId: randomAapAccount.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});

test("Maison mere manager of the aap associated to the candidacy should be able to access it", async () => {
  const resp = await getCandidacy({
    role: "gestion_maison_mere_aap",
    keycloakId: maisonMereAapManagerAccount.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Random maison mere manager should not be able to access the candidacy", async () => {
  const resp = await getCandidacy({
    role: "gestion_maison_mere_aap",
    keycloakId: randomMaisonMereAapManagerAccount.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});

test("Certification authority manager of the feasibility file of the candidacy should be able to access it", async () => {
  const resp = await getCandidacy({
    role: "manage_certification_authority_local_account",
    keycloakId: certificationAuthorityAccount.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Random Certification authority manager should not be able to access the candidacy", async () => {
  const resp = await getCandidacy({
    role: "manage_certification_authority_local_account",
    keycloakId: randomCertificationAuthorityAccount.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});

test("Certification local account of the feasibility file of the candidacy should be able to access it", async () => {
  const resp = await getCandidacy({
    role: "manage_feasibility",
    keycloakId: certificationAuthorityLocalAccountAccount.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCandidacyById).toMatchObject({
    id: candidacy.id,
  });
});

test("Random Certification local account should not be able to access the candidacy", async () => {
  const resp = await getCandidacy({
    role: "manage_feasibility",
    keycloakId: randomCertificationAuthorityLocalAccountAccount.keycloakId,
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.errors[0].message).toEqual(
    "Vous n'êtes pas autorisé à accéder à cette candidature",
  );
});
