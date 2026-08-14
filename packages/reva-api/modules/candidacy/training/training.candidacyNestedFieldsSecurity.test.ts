import { faker } from "@faker-js/faker";

import {
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

// `Candidacy.mandatoryTrainings` and `Candidacy.basicSkills` (defined in this module) have an
// `isAnyone` policy of their own in training.resolvers.ts: they are only reachable through a
// `Candidacy` object obtained from an already-gated resolver (e.g. `getCandidacyById`,
// protected by `canAccessCandidacy`). These tests verify that gate does transitively protect
// them too.
const candidacyTrainingFields = graphql(`
  query candidacyTrainingFields($id: ID!) {
    getCandidacyById(id: $id) {
      mandatoryTrainings {
        id
      }
      basicSkills {
        id
      }
    }
  }
`);

const getCandidacyTrainingFields = ({
  candidacyId,
  role,
  keycloakId,
}: {
  candidacyId: string;
  role?: KeyCloakUserRole;
  keycloakId?: string;
}) => {
  const graphqlClient = getGraphQLClient(
    role
      ? {
          headers: {
            authorization: authorizationHeaderForUser({ role, keycloakId }),
          },
        }
      : {},
  );

  return graphqlClient.request(candidacyTrainingFields, { id: candidacyId });
};

describe("nested fields security on Candidacy reached via getCandidacyById", () => {
  test("should not let an anonymous caller read mandatoryTrainings or basicSkills", async () => {
    const candidacy = await createCandidacyHelper();

    await expect(
      getCandidacyTrainingFields({ candidacyId: candidacy.id }),
    ).rejects.toThrowError(SESSION_EXPIRED);
  });

  test("should let an admin read mandatoryTrainings and basicSkills of any candidacy", async () => {
    const candidacy = await createCandidacyHelper();

    const res = await getCandidacyTrainingFields({
      candidacyId: candidacy.id,
      role: "admin",
      keycloakId: faker.string.uuid(),
    });

    const { mandatoryTrainings, basicSkills } = res.getCandidacyById ?? {};
    expect(Array.isArray(mandatoryTrainings)).toBe(true);
    expect(Array.isArray(basicSkills)).toBe(true);
  });

  test("should let the AAP supporting the candidacy read mandatoryTrainings and basicSkills", async () => {
    const candidacy = await createCandidacyHelper();
    const aapKeycloakId =
      candidacy.organism?.organismOnAccounts[0].account.keycloakId;

    const res = await getCandidacyTrainingFields({
      candidacyId: candidacy.id,
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    });

    const { mandatoryTrainings, basicSkills } = res.getCandidacyById ?? {};
    expect(Array.isArray(mandatoryTrainings)).toBe(true);
    expect(Array.isArray(basicSkills)).toBe(true);
  });

  test("should let the owning candidate read mandatoryTrainings and basicSkills", async () => {
    const candidacy = await createCandidacyHelper();

    const res = await getCandidacyTrainingFields({
      candidacyId: candidacy.id,
      role: "candidate",
      keycloakId: candidacy.candidate?.keycloakId,
    });

    const { mandatoryTrainings, basicSkills } = res.getCandidacyById ?? {};
    expect(Array.isArray(mandatoryTrainings)).toBe(true);
    expect(Array.isArray(basicSkills)).toBe(true);
  });

  test("should not let an AAP from another organism read mandatoryTrainings or basicSkills", async () => {
    const candidacy = await createCandidacyHelper();
    const anotherOrganism = await createOrganismHelper();

    await expect(
      getCandidacyTrainingFields({
        candidacyId: candidacy.id,
        role: "manage_candidacy",
        keycloakId: anotherOrganism.organismOnAccounts[0].account.keycloakId,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
  });

  test("should not let another candidate read mandatoryTrainings or basicSkills", async () => {
    const candidacy = await createCandidacyHelper();
    const anotherCandidate = await createCandidateHelper();

    await expect(
      getCandidacyTrainingFields({
        candidacyId: candidacy.id,
        role: "candidate",
        keycloakId: anotherCandidate.keycloakId,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
  });
});
