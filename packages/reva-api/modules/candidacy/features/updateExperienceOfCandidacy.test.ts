import { CandidacyStatusStep, ExperienceDuration } from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const updateExperienceMutation = graphql(`
  mutation updateExperience_with_candidate_owner(
    $candidacyId: ID!
    $experienceId: ID!
    $experience: ExperienceInput!
  ) {
    candidacy_updateExperience(
      candidacyId: $candidacyId
      experienceId: $experienceId
      experience: $experience
    ) {
      id
      title
      description
    }
  }
`);

describe("update experience of candidacy", () => {
  const createExperienceForCandidacy = async (
    candidacyId: string,
    title: string,
  ) =>
    prismaClient.experience.create({
      data: {
        candidacyId,
        title,
        description: "Test description",
        duration: ExperienceDuration.betweenOneAndThreeYears,
        startedAt: new Date("2020-01-01"),
      },
    });

  const getGraphQLClientForCandidate = (keycloakId?: string) =>
    getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "candidate",
          keycloakId,
        }),
      },
    });

  const getGraphQLClientForAap = (keycloakId?: string) =>
    getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
          keycloakId,
        }),
      },
    });

  test("should update an experience attached to the authorized candidacy", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });

    const experience = await createExperienceForCandidacy(
      candidacy.id,
      "Experience 1",
    );

    const graphqlClient = getGraphQLClientForCandidate(
      candidacy.candidate?.keycloakId,
    );

    const result = await graphqlClient.request(updateExperienceMutation, {
      candidacyId: candidacy.id,
      experienceId: experience.id,
      experience: {
        title: "Updated experience",
        description: "Updated description",
        duration: ExperienceDuration.moreThanThreeYears,
        startedAt: Date.parse("2021-01-01T00:00:00.000Z"),
      },
    });

    expect(result.candidacy_updateExperience).toMatchObject({
      id: experience.id,
      title: "Updated experience",
      description: "Updated description",
    });
  });

  test("should reject updating an experience that is not attached to the authorized candidacy", async () => {
    const ownedCandidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });
    const foreignCandidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });

    const foreignExperience = await createExperienceForCandidacy(
      foreignCandidacy.id,
      "Foreign Experience",
    );

    const graphqlClient = getGraphQLClientForCandidate(
      ownedCandidacy.candidate?.keycloakId,
    );

    await expect(
      graphqlClient.request(updateExperienceMutation, {
        candidacyId: ownedCandidacy.id,
        experienceId: foreignExperience.id,
        experience: {
          title: "Updated experience",
          description: "Updated description",
          duration: ExperienceDuration.moreThanThreeYears,
          startedAt: Date.parse("2021-01-01T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow();
  });

  test("should prevent a candidate from updating an experience after confirming the parcours", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PARCOURS_CONFIRME,
    });

    const experience = await createExperienceForCandidacy(
      candidacy.id,
      "Experience 1",
    );

    const graphqlClient = getGraphQLClientForCandidate(
      candidacy.candidate?.keycloakId,
    );

    await expect(
      graphqlClient.request(updateExperienceMutation, {
        candidacyId: candidacy.id,
        experienceId: experience.id,
        experience: {
          title: "Updated experience",
          description: "Updated description",
          duration: ExperienceDuration.moreThanThreeYears,
          startedAt: Date.parse("2021-01-01T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow(
      "Impossible de mettre à jour les experiences après avoir confirmé le parcours",
    );
  });

  test("should let an AAP update an experience attached to a candidacy it owns", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });

    const experience = await createExperienceForCandidacy(
      candidacy.id,
      "Experience 1",
    );

    const graphqlClient = getGraphQLClientForAap(
      candidacy.organism?.organismOnAccounts[0].account.keycloakId,
    );

    const result = await graphqlClient.request(updateExperienceMutation, {
      candidacyId: candidacy.id,
      experienceId: experience.id,
      experience: {
        title: "Updated experience",
        description: "Updated description",
        duration: ExperienceDuration.moreThanThreeYears,
        startedAt: Date.parse("2021-01-01T00:00:00.000Z"),
      },
    });

    expect(result.candidacy_updateExperience).toMatchObject({
      id: experience.id,
      title: "Updated experience",
      description: "Updated description",
    });
  });

  test("should reject an AAP updating an experience that is not attached to a candidacy it owns", async () => {
    const ownedCandidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });
    const foreignCandidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });

    const foreignExperience = await createExperienceForCandidacy(
      foreignCandidacy.id,
      "Foreign Experience",
    );

    const graphqlClient = getGraphQLClientForAap(
      ownedCandidacy.organism?.organismOnAccounts[0].account.keycloakId,
    );

    await expect(
      graphqlClient.request(updateExperienceMutation, {
        candidacyId: ownedCandidacy.id,
        experienceId: foreignExperience.id,
        experience: {
          title: "Updated experience",
          description: "Updated description",
          duration: ExperienceDuration.moreThanThreeYears,
          startedAt: Date.parse("2021-01-01T00:00:00.000Z"),
        },
      }),
    ).rejects.toThrow();
  });
});
