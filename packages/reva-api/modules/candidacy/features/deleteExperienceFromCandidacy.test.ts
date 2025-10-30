import { CandidacyStatusStep, ExperienceDuration } from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const deleteExperienceMutation = graphql(`
  mutation deleteExperience($candidacyId: ID!, $experienceId: ID!) {
    candidacy_deleteExperience(
      candidacyId: $candidacyId
      experienceId: $experienceId
    )
  }
`);

describe("delete experience from candidacy", () => {
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

  test("should successfully delete one experience and keep the other", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });

    const experience1 = await createExperienceForCandidacy(
      candidacy.id,
      "Experience 1",
    );
    const experience2 = await createExperienceForCandidacy(
      candidacy.id,
      "Experience 2",
    );

    const graphqlClient = getGraphQLClientForCandidate(
      candidacy.candidate?.keycloakId,
    );

    const result = await graphqlClient.request(deleteExperienceMutation, {
      candidacyId: candidacy.id,
      experienceId: experience1.id,
    });

    expect(result.candidacy_deleteExperience).toBe(true);

    const deletedExperience = await prismaClient.experience.findUnique({
      where: { id: experience1.id },
    });
    const remainingExperience = await prismaClient.experience.findUnique({
      where: { id: experience2.id },
    });

    expect(deletedExperience).toBeNull();
    expect(remainingExperience).not.toBeNull();
    expect(remainingExperience?.title).toBe("Experience 2");
  });

  test("should fail when candidacy does not exist", async () => {
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "admin-id",
        }),
      },
    });

    await expect(
      graphqlClient.request(deleteExperienceMutation, {
        candidacyId: "11111111-1111-1111-1111-111111111111",
        experienceId: "22222222-2222-2222-2222-222222222222",
      }),
    ).rejects.toThrow("Aucune candidature n'a été trouvée");
  });

  test.each<CandidacyStatusStep>([
    "VALIDATION",
    "PRISE_EN_CHARGE",
    "PARCOURS_ENVOYE",
    "PARCOURS_CONFIRME",
    "DOSSIER_FAISABILITE_INCOMPLET",
    "DOSSIER_FAISABILITE_ENVOYE",
    "DOSSIER_FAISABILITE_COMPLET",
    "DOSSIER_FAISABILITE_RECEVABLE",
    "DOSSIER_FAISABILITE_NON_RECEVABLE",
    "DOSSIER_DE_VALIDATION_ENVOYE",
    "DOSSIER_DE_VALIDATION_SIGNALE",
    "ARCHIVE",
  ])("should prevent deletion when candidacy status is %s", async (status) => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: status,
    });

    const experience = await createExperienceForCandidacy(
      candidacy.id,
      "Test Experience",
    );

    const graphqlClient = getGraphQLClientForCandidate(
      candidacy.candidate?.keycloakId,
    );

    await expect(
      graphqlClient.request(deleteExperienceMutation, {
        candidacyId: candidacy.id,
        experienceId: experience.id,
      }),
    ).rejects.toThrow(
      "Impossible de supprimer les expériences après avoir envoyé la candidature à l'AAP",
    );
  });
});
