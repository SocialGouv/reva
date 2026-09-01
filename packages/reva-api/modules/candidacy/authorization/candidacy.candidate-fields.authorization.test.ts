import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import { CANDIDATURE_NON_TROUVEE } from "@/modules/shared/errors/messages";
import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const candidacy_updateGoals = graphql(`
  mutation candidacy_updateGoals_authorization(
    $candidacyId: ID!
    $goals: [CandidateGoalInput!]!
  ) {
    candidacy_updateGoals(candidacyId: $candidacyId, goals: $goals)
  }
`);

const candidacy_submitCandidacy = graphql(`
  mutation candidacy_submitCandidacy_authorization($candidacyId: ID!) {
    candidacy_submitCandidacy(candidacyId: $candidacyId) {
      id
      status
    }
  }
`);

const candidacy_updateTypeAccompagnement = graphql(`
  mutation candidacy_updateTypeAccompagnement_authorization(
    $candidacyId: UUID!
    $typeAccompagnement: TypeAccompagnement!
  ) {
    candidacy_updateTypeAccompagnement(
      candidacyId: $candidacyId
      typeAccompagnement: $typeAccompagnement
    ) {
      id
    }
  }
`);

const candidacy_updateCandidateCandidacyDropoutDecision = graphql(`
  mutation candidacy_updateCandidateCandidacyDropoutDecision_authorization(
    $candidacyId: UUID!
    $dropOutConfirmed: Boolean!
  ) {
    candidacy_updateCandidateCandidacyDropoutDecision(
      candidacyId: $candidacyId
      dropOutConfirmed: $dropOutConfirmed
    ) {
      id
    }
  }
`);

const candidacy_updateCandidacyEndAccompagnementDecision = graphql(`
  mutation candidacy_updateCandidacyEndAccompagnementDecision_authorization(
    $candidacyId: UUID!
    $endAccompagnement: Boolean!
  ) {
    candidacy_updateCandidacyEndAccompagnementDecision(
      candidacyId: $candidacyId
      endAccompagnement: $endAccompagnement
    ) {
      id
    }
  }
`);

const candidacy_markFeasibilityFileDematAutonomeResourceAsHidden = graphql(`
  mutation candidacy_markFeasibilityFileDematAutonomeResourceAsHidden_authorization(
    $candidacyId: UUID!
  ) {
    candidacy_markFeasibilityFileDematAutonomeResourceAsHidden(
      candidacyId: $candidacyId
    ) {
      id
      feasibilityFileDematAutonomeResourceHidden
    }
  }
`);

const candidacy_selectOrganism = graphql(`
  mutation candidacy_selectOrganism_authorization(
    $candidacyId: UUID!
    $organismId: UUID!
  ) {
    candidacy_selectOrganism(
      candidacyId: $candidacyId
      organismId: $organismId
    ) {
      id
      organismId
    }
  }
`);

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const getClient = (authorization?: string) =>
  getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

const updateGoals = (authorization: string | undefined, candidacyId: string) =>
  getClient(authorization).request(candidacy_updateGoals, {
    candidacyId,
    goals: [],
  });

const submitCandidacy = (
  authorization: string | undefined,
  candidacyId: string,
) =>
  getClient(authorization).request(candidacy_submitCandidacy, { candidacyId });

const updateTypeAccompagnement = (
  authorization: string | undefined,
  candidacyId: string,
) =>
  getClient(authorization).request(candidacy_updateTypeAccompagnement, {
    candidacyId,
    typeAccompagnement: "AUTONOME",
  });

const updateCandidateCandidacyDropoutDecision = (
  authorization: string | undefined,
  candidacyId: string,
) =>
  getClient(authorization).request(
    candidacy_updateCandidateCandidacyDropoutDecision,
    { candidacyId, dropOutConfirmed: true },
  );

const updateCandidacyEndAccompagnementDecision = (
  authorization: string | undefined,
  candidacyId: string,
  endAccompagnement = true,
) =>
  getClient(authorization).request(
    candidacy_updateCandidacyEndAccompagnementDecision,
    { candidacyId, endAccompagnement },
  );

const markFeasibilityFileDematAutonomeResourceAsHidden = (
  authorization: string | undefined,
  candidacyId: string,
) =>
  getClient(authorization).request(
    candidacy_markFeasibilityFileDematAutonomeResourceAsHidden,
    { candidacyId },
  );

const selectOrganism = (
  authorization: string | undefined,
  candidacyId: string,
  organismId: string,
) =>
  getClient(authorization).request(candidacy_selectOrganism, {
    candidacyId,
    organismId,
  });

const unsupportedCandidateWriteRoles: KeyCloakUserRole[] = [
  "manage_candidacy",
  "gestion_maison_mere_aap",
  "manage_feasibility",
  "manage_certification_authority_local_account",
  "manage_certification_registry",
  "manage_vae_collective",
];

interface OwnerMutationCase {
  operationName: string;
  request: (
    authorization: string | undefined,
    candidacyId: string,
  ) => Promise<unknown>;
  adminBusinessError: (candidacyId: string) => string;
}

describe("candidacy candidate-side resolver authorization", () => {
  describe("candidacy fields owned by the candidate", () => {
    const ownerMutationCases: OwnerMutationCase[] = [
      {
        operationName: "candidacy_updateGoals",
        request: updateGoals,
        adminBusinessError: (candidacyId: string) =>
          `Candidature ${candidacyId} non trouvée`,
      },
      {
        operationName: "candidacy_submitCandidacy",
        request: submitCandidacy,
        adminBusinessError: () => CANDIDATURE_NON_TROUVEE,
      },
      {
        operationName: "candidacy_updateTypeAccompagnement",
        request: updateTypeAccompagnement,
        adminBusinessError: () => CANDIDATURE_NON_TROUVEE,
      },
      {
        operationName: "candidacy_updateCandidateCandidacyDropoutDecision",
        request: updateCandidateCandidacyDropoutDecision,
        adminBusinessError: () => "Aucun abandon trouvé pour cette candidature",
      },
      {
        operationName: "candidacy_updateCandidacyEndAccompagnementDecision",
        request: updateCandidacyEndAccompagnementDecision,
        adminBusinessError: () => CANDIDATURE_NON_TROUVEE,
      },
      {
        operationName:
          "candidacy_markFeasibilityFileDematAutonomeResourceAsHidden",
        request: markFeasibilityFileDematAutonomeResourceAsHidden,
        adminBusinessError: () => CANDIDATURE_NON_TROUVEE,
      },
    ];

    describe.each(ownerMutationCases)(
      "$operationName",
      (mutationCase: OwnerMutationCase) => {
        const { request, adminBusinessError } = mutationCase;
        test("allows an admin to request the candidacy action", async () => {
          const candidacyId = faker.string.uuid();

          await expect(
            request(asRole("admin"), candidacyId),
          ).rejects.toThrowError(adminBusinessError(candidacyId));
        });

        test("rejects a random candidate for a candidacy they do not own", async () => {
          const candidacy = await createCandidacyHelper();
          const randomCandidate = await createCandidateHelper();

          await expect(
            request(
              asRole("candidate", randomCandidate.keycloakId),
              candidacy.id,
            ),
          ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
        });

        test.each(unsupportedCandidateWriteRoles)(
          "rejects the %s role",
          async (role: KeyCloakUserRole) => {
            await expect(
              request(asRole(role), faker.string.uuid()),
            ).rejects.toThrowError(NOT_AUTHORIZED);
          },
        );

        test("rejects an unauthenticated request", async () => {
          await expect(
            request(undefined, faker.string.uuid()),
          ).rejects.toThrowError(SESSION_EXPIRED);
        });
      },
    );

    test("allows an admin to select an organism for any candidacy", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });
      const organism = await createOrganismHelper();

      const response = await selectOrganism(
        asRole("admin"),
        candidacy.id,
        organism.id,
      );

      expect(response.candidacy_selectOrganism).toMatchObject({
        id: candidacy.id,
        organismId: organism.id,
      });
    });

    test("allows the candidate owning the candidacy to select an organism", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });
      const organism = await createOrganismHelper();

      const response = await selectOrganism(
        asRole("candidate", candidacy.candidate!.keycloakId),
        candidacy.id,
        organism.id,
      );

      expect(response.candidacy_selectOrganism).toMatchObject({
        id: candidacy.id,
        organismId: organism.id,
      });
    });

    test("rejects a random candidate selecting an organism for a candidacy they do not own", async () => {
      const candidacy = await createCandidacyHelper();
      const randomCandidate = await createCandidateHelper();

      await expect(
        selectOrganism(
          asRole("candidate", randomCandidate.keycloakId),
          candidacy.id,
          faker.string.uuid(),
        ),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    });

    test.each(unsupportedCandidateWriteRoles)(
      "rejects the %s role from selecting an organism",
      async (role: KeyCloakUserRole) => {
        await expect(
          selectOrganism(
            asRole(role),
            faker.string.uuid(),
            faker.string.uuid(),
          ),
        ).rejects.toThrowError(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request to select an organism", async () => {
      await expect(
        selectOrganism(undefined, faker.string.uuid(), faker.string.uuid()),
      ).rejects.toThrowError(SESSION_EXPIRED);
    });

    test("allows the candidate owning the candidacy to update its goals", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });

      const response = await updateGoals(
        asRole("candidate", candidacy.candidate!.keycloakId),
        candidacy.id,
      );

      expect(response.candidacy_updateGoals).toBe(0);
    });

    test("allows the candidate owning the candidacy to submit it", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });

      const response = await submitCandidacy(
        asRole("candidate", candidacy.candidate!.keycloakId),
        candidacy.id,
      );

      expect(response.candidacy_submitCandidacy).toMatchObject({
        id: candidacy.id,
        status: "VALIDATION",
      });
    });

    test("allows the candidate owning the candidacy to decide on the end of support", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          endAccompagnementStatus: "PENDING",
          endAccompagnementDate: faker.date.future(),
        },
      });

      await updateCandidacyEndAccompagnementDecision(
        asRole("candidate", candidacy.candidate!.keycloakId),
        candidacy.id,
        false,
      );

      const updatedCandidacy = await prismaClient.candidacy.findUniqueOrThrow({
        where: { id: candidacy.id },
      });
      expect(updatedCandidacy.endAccompagnementStatus).toBe("NOT_REQUESTED");
    });

    test("allows the candidate owning the candidacy to mark the feasibility resource as hidden", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyArgs: { feasibilityFileDematAutonomeResourceHiddenAt: null },
      });

      const response = await markFeasibilityFileDematAutonomeResourceAsHidden(
        asRole("candidate", candidacy.candidate!.keycloakId),
        candidacy.id,
      );

      expect(
        response.candidacy_markFeasibilityFileDematAutonomeResourceAsHidden,
      ).toMatchObject({
        id: candidacy.id,
        feasibilityFileDematAutonomeResourceHidden: true,
      });
    });
  });
});
