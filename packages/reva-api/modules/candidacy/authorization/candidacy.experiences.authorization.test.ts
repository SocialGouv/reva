import { faker } from "@faker-js/faker";
import { CandidacyStatusStep, ExperienceDuration } from "@prisma/client";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import {
  attachCollaborateurAccountToOrganism,
  createOrganismHelper,
} from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const candidacy_addExperience = graphql(`
  mutation candidacy_addExperience_authorization(
    $candidacyId: ID!
    $experience: ExperienceInput
  ) {
    candidacy_addExperience(
      candidacyId: $candidacyId
      experience: $experience
    ) {
      id
    }
  }
`);

const candidacy_updateExperience = graphql(`
  mutation candidacy_updateExperience_authorization(
    $candidacyId: ID!
    $experienceId: ID!
    $experience: ExperienceInput
  ) {
    candidacy_updateExperience(
      candidacyId: $candidacyId
      experienceId: $experienceId
      experience: $experience
    ) {
      id
    }
  }
`);

const candidacy_deleteExperience = graphql(`
  mutation candidacy_deleteExperience_authorization(
    $candidacyId: ID!
    $experienceId: ID!
  ) {
    candidacy_deleteExperience(
      candidacyId: $candidacyId
      experienceId: $experienceId
    )
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

const experienceInput = {
  title: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  duration: ExperienceDuration.betweenOneAndThreeYears,
  startedAt: Date.parse("2020-01-01T00:00:00.000Z"),
};

const createExperience = (candidacyId: string) =>
  prismaClient.experience.create({
    data: {
      candidacyId,
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      duration: ExperienceDuration.betweenOneAndThreeYears,
      startedAt: faker.date.past(),
    },
  });

interface ExperienceMutationCase {
  operationName: string;
  request: (
    authorization: string | undefined,
    candidacyId: string,
    experienceId?: string,
  ) => Promise<boolean>;
}

describe("candidacy experience resolver authorization", () => {
  describe("candidacy experiences", () => {
    const experienceMutationCases: ExperienceMutationCase[] = [
      {
        operationName: "candidacy_addExperience",
        request: async (authorization, candidacyId) => {
          const response = await getClient(authorization).request(
            candidacy_addExperience,
            { candidacyId, experience: experienceInput },
          );
          return response.candidacy_addExperience !== null;
        },
      },
      {
        operationName: "candidacy_updateExperience",
        request: async (authorization, candidacyId, experienceId) => {
          const response = await getClient(authorization).request(
            candidacy_updateExperience,
            {
              candidacyId,
              experienceId: experienceId ?? faker.string.uuid(),
              experience: experienceInput,
            },
          );
          return response.candidacy_updateExperience !== null;
        },
      },
      {
        operationName: "candidacy_deleteExperience",
        request: async (authorization, candidacyId, experienceId) => {
          const response = await getClient(authorization).request(
            candidacy_deleteExperience,
            {
              candidacyId,
              experienceId: experienceId ?? faker.string.uuid(),
            },
          );
          return response.candidacy_deleteExperience !== null;
        },
      },
    ];

    describe.each(experienceMutationCases)(
      "$operationName",
      (mutationCase: ExperienceMutationCase) => {
        const { operationName, request } = mutationCase;
        test("allows an admin to manage an experience", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            operationName === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);

          await expect(
            request(asRole("admin"), candidacy.id, experience?.id),
          ).resolves.toBe(true);
        });

        test("allows the candidate owning the candidacy to manage an experience", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            operationName === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);

          await expect(
            request(
              asRole("candidate", candidacy.candidate!.keycloakId),
              candidacy.id,
              experience?.id,
            ),
          ).resolves.toBe(true);
        });

        test("allows the AAP associated to the candidacy to manage an experience", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            operationName === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);

          await expect(
            request(
              asRole(
                "manage_candidacy",
                candidacy.organism!.organismOnAccounts[0].account.keycloakId,
              ),
              candidacy.id,
              experience?.id,
            ),
          ).resolves.toBe(true);
        });

        test("allows the maison mere manager of the AAP associated to the candidacy to manage an experience", async () => {
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
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
            candidacyArgs: { organismId: organism.id },
          });
          const experience =
            operationName === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);

          await expect(
            request(
              asRole(
                "gestion_maison_mere_aap",
                maisonMereAAP.gestionnaire.keycloakId,
              ),
              candidacy.id,
              experience?.id,
            ),
          ).resolves.toBe(true);
        });

        test("rejects a maison mere manager from another maison mere", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            operationName === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);
          const foreignOrganism = await createOrganismHelper();
          const foreignManager = foreignOrganism.maisonMereAAP!.gestionnaire;
          await attachCollaborateurAccountToOrganism({
            organismId: foreignOrganism.id,
            collaborateurAccountId: foreignManager.id,
          });

          await expect(
            request(
              asRole("gestion_maison_mere_aap", foreignManager.keycloakId),
              candidacy.id,
              experience?.id,
            ),
          ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
        });

        test("rejects a random candidate for a candidacy they do not own", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            operationName === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);
          const randomCandidate = await createCandidateHelper();

          await expect(
            request(
              asRole("candidate", randomCandidate.keycloakId),
              candidacy.id,
              experience?.id,
            ),
          ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
        });

        test.each<KeyCloakUserRole>([
          "manage_feasibility",
          "manage_certification_authority_local_account",
          "manage_certification_registry",
          "manage_vae_collective",
        ])("rejects the %s role", async (role: KeyCloakUserRole) => {
          await expect(
            request(asRole(role), faker.string.uuid()),
          ).rejects.toThrowError(NOT_AUTHORIZED);
        });

        test("rejects an unauthenticated request", async () => {
          await expect(
            request(undefined, faker.string.uuid()),
          ).rejects.toThrowError(SESSION_EXPIRED);
        });
      },
    );

    // Rejection of foreign experience IDs for candidate and AAP actors is covered by
    // updateExperienceOfCandidacy.test.ts and deleteExperienceFromCandidacy.test.ts.
  });
});
