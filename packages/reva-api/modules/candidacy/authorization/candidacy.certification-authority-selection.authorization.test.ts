import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import {
  attachCollaborateurAccountToOrganism,
  createOrganismHelper,
} from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

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
  role?: KeyCloakUserRole;
  keycloakId?: string;
  candidacyId: string;
  certificationAuthorityId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: role
      ? {
          authorization: authorizationHeaderForUser({ role, keycloakId }),
        }
      : undefined,
  });

  return graphqlClient.request(candidacy_updateCertificationAuthority, {
    candidacyId,
    certificationAuthorityId,
  });
};

describe("candidacy_updateCertificationAuthority", () => {
  test("allows an admin to update the certification authority of any candidacy", async () => {
    const candidacy = await createCandidacyHelper();
    const certificationAuthority = await createCertificationAuthorityHelper();

    const response = await updateCertificationAuthority({
      role: "admin",
      keycloakId: faker.string.uuid(),
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
    });

    expect(response).toMatchObject({
      candidacy_updateCertificationAuthority: { id: candidacy.id },
    });
  });

  test("allows the candidate owning the candidacy to update its certification authority", async () => {
    const candidacy = await createCandidacyHelper();
    const certificationAuthority = await createCertificationAuthorityHelper();

    const response = await updateCertificationAuthority({
      role: "candidate",
      keycloakId: candidacy.candidate?.keycloakId ?? "",
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
    });

    expect(response).toMatchObject({
      candidacy_updateCertificationAuthority: { id: candidacy.id },
    });
  });

  test("rejects a random candidate for a candidacy they do not own", async () => {
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

  test("allows the AAP associated to the candidacy to update its certification authority", async () => {
    const candidacy = await createCandidacyHelper();
    const certificationAuthority = await createCertificationAuthorityHelper();

    const response = await updateCertificationAuthority({
      role: "manage_candidacy",
      keycloakId:
        candidacy.organism?.organismOnAccounts[0]?.account.keycloakId ?? "",
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
    });

    expect(response).toMatchObject({
      candidacy_updateCertificationAuthority: { id: candidacy.id },
    });
  });

  test("rejects an AAP not associated to the candidacy", async () => {
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

  test("allows the maison mere manager of the AAP associated to the candidacy to update its certification authority", async () => {
    const organism = await createOrganismHelper();
    const maisonMereAAP = organism.maisonMereAAP!;
    const siblingOrganism = await createOrganismHelper({
      maisonMereAAPId: maisonMereAAP.id,
    });
    await attachCollaborateurAccountToOrganism({
      organismId: siblingOrganism.id,
      collaborateurAccountId: maisonMereAAP.gestionnaire.id,
    });
    const candidacy = await createCandidacyHelper({
      candidacyArgs: { organismId: organism.id },
    });
    const certificationAuthority = await createCertificationAuthorityHelper();

    const response = await updateCertificationAuthority({
      role: "gestion_maison_mere_aap",
      keycloakId: maisonMereAAP.gestionnaire.keycloakId,
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
    });

    expect(response.candidacy_updateCertificationAuthority.id).toBe(
      candidacy.id,
    );
  });

  test("rejects a maison mere manager from another maison mere", async () => {
    const candidacy = await createCandidacyHelper();
    const foreignOrganism = await createOrganismHelper();
    const foreignManager = foreignOrganism.maisonMereAAP!.gestionnaire;
    await attachCollaborateurAccountToOrganism({
      organismId: foreignOrganism.id,
      collaborateurAccountId: foreignManager.id,
    });

    await expect(
      updateCertificationAuthority({
        role: "gestion_maison_mere_aap",
        keycloakId: foreignManager.keycloakId,
        candidacyId: candidacy.id,
        certificationAuthorityId: faker.string.uuid(),
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
  });

  test.each<KeyCloakUserRole>([
    "manage_feasibility",
    "manage_certification_authority_local_account",
    "manage_certification_registry",
    "manage_vae_collective",
  ])("rejects the %s role", async (role: KeyCloakUserRole) => {
    await expect(
      updateCertificationAuthority({
        role,
        keycloakId: faker.string.uuid(),
        candidacyId: faker.string.uuid(),
        certificationAuthorityId: faker.string.uuid(),
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });

  test("rejects an unauthenticated request", async () => {
    await expect(
      updateCertificationAuthority({
        candidacyId: faker.string.uuid(),
        certificationAuthorityId: faker.string.uuid(),
      }),
    ).rejects.toThrowError(SESSION_EXPIRED);
  });
});
