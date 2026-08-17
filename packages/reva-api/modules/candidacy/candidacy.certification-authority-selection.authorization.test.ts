import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const candidacy_updateCertificationAuthority = graphql(`
  mutation candidacy_updateCertificationAuthority(
    $candidacyId: UUID!
    $certificationAuthorityId: UUID!
  ) {
    candidacy_updateCertificationAuthority(
      candidacyId: $candidacyId
      certificationAuthorityId: $certificationAuthorityId
    ) {
      id
    }
  }
`);

const updateCertificationAuthority = ({
  role,
  keycloakId,
  candidacyId,
  certificationAuthorityId,
}: {
  role: KeyCloakUserRole;
  keycloakId: string;
  candidacyId: string;
  certificationAuthorityId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({ role, keycloakId }),
    },
  });

  return graphqlClient.request(candidacy_updateCertificationAuthority, {
    candidacyId,
    certificationAuthorityId,
  });
};

test("Admin should be able to update the certification authority of any candidacy", async () => {
  const candidacy = await createCandidacyHelper();
  const certificationAuthority = await createCertificationAuthorityHelper();

  const res = await updateCertificationAuthority({
    role: "admin",
    keycloakId: faker.string.uuid(),
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
  });

  expect(res).toMatchObject({
    candidacy_updateCertificationAuthority: { id: candidacy.id },
  });
});

test("Candidate owning the candidacy should be able to update its certification authority", async () => {
  const candidacy = await createCandidacyHelper();
  const certificationAuthority = await createCertificationAuthorityHelper();

  const res = await updateCertificationAuthority({
    role: "candidate",
    keycloakId: candidacy.candidate?.keycloakId ?? "",
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
  });

  expect(res).toMatchObject({
    candidacy_updateCertificationAuthority: { id: candidacy.id },
  });
});

test("Random candidate should not be able to update the certification authority of a candidacy they do not own", async () => {
  const candidacy = await createCandidacyHelper();
  const certificationAuthority = await createCertificationAuthorityHelper();
  const randomCandidate = await createCandidateHelper();

  await expect(
    updateCertificationAuthority({
      role: "candidate",
      keycloakId: randomCandidate.keycloakId,
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
    }),
  ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
});

test("Aap associated to the candidacy should be able to update its certification authority", async () => {
  const candidacy = await createCandidacyHelper();
  const certificationAuthority = await createCertificationAuthorityHelper();

  const res = await updateCertificationAuthority({
    role: "manage_candidacy",
    keycloakId:
      candidacy.organism?.organismOnAccounts[0]?.account.keycloakId ?? "",
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
  });

  expect(res).toMatchObject({
    candidacy_updateCertificationAuthority: { id: candidacy.id },
  });
});

test("Random aap should not be able to update the certification authority of a candidacy it is not associated to", async () => {
  const candidacy = await createCandidacyHelper();
  const otherCandidacy = await createCandidacyHelper();
  const certificationAuthority = await createCertificationAuthorityHelper();

  await expect(
    updateCertificationAuthority({
      role: "manage_candidacy",
      keycloakId:
        otherCandidacy.organism?.organismOnAccounts[0]?.account.keycloakId ??
        "",
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
    }),
  ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
});
