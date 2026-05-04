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

describe("suppression d'une expérience de candidature", () => {
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

  test("doit supprimer une expérience avec succès et conserver l'autre", async () => {
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

  test("doit rejeter la suppression d'une expérience qui n'est pas rattachée à la candidature autorisée", async () => {
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
      graphqlClient.request(deleteExperienceMutation, {
        candidacyId: ownedCandidacy.id,
        experienceId: foreignExperience.id,
      }),
    ).rejects.toThrow();
  });

  test("doit permettre à un AAP de supprimer une expérience rattachée à une candidature qu'il possède", async () => {
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

    const result = await graphqlClient.request(deleteExperienceMutation, {
      candidacyId: candidacy.id,
      experienceId: experience.id,
    });

    expect(result.candidacy_deleteExperience).toBe(true);

    const deletedExperience = await prismaClient.experience.findUnique({
      where: { id: experience.id },
    });

    expect(deletedExperience).toBeNull();
  });

  test("doit rejeter un AAP qui supprime une expérience non rattachée à une candidature qu'il possède", async () => {
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
      graphqlClient.request(deleteExperienceMutation, {
        candidacyId: ownedCandidacy.id,
        experienceId: foreignExperience.id,
      }),
    ).rejects.toThrow();
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
  ])(
    "doit empêcher la suppression lorsque le statut de la candidature est %s",
    async (status: CandidacyStatusStep) => {
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
    },
  );

  test("doit permettre à un AAP de supprimer une expérience lorsque le statut est DOSSIER_FAISABILITE_INCOMPLET", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
    });

    const experience = await createExperienceForCandidacy(
      candidacy.id,
      "Experience to delete",
    );

    const graphqlClient = getGraphQLClientForAap(
      candidacy.organism?.organismOnAccounts[0].account.keycloakId,
    );

    const result = await graphqlClient.request(deleteExperienceMutation, {
      candidacyId: candidacy.id,
      experienceId: experience.id,
    });

    expect(result.candidacy_deleteExperience).toBe(true);
  });

  test.each<CandidacyStatusStep>([
    "DOSSIER_FAISABILITE_ENVOYE",
    "DOSSIER_FAISABILITE_COMPLET",
    "DOSSIER_FAISABILITE_RECEVABLE",
    "DOSSIER_FAISABILITE_NON_RECEVABLE",
    "DOSSIER_DE_VALIDATION_ENVOYE",
    "DOSSIER_DE_VALIDATION_SIGNALE",
    "DOSSIER_PRO",
    "CERTIFICATION",
  ])(
    "doit empêcher un AAP de supprimer une expérience lorsque le statut de la candidature est %s",
    async (status: CandidacyStatusStep) => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: status,
      });

      const experience = await createExperienceForCandidacy(
        candidacy.id,
        "Test Experience",
      );

      const graphqlClient = getGraphQLClientForAap(
        candidacy.organism?.organismOnAccounts[0].account.keycloakId,
      );

      await expect(
        graphqlClient.request(deleteExperienceMutation, {
          candidacyId: candidacy.id,
          experienceId: experience.id,
        }),
      ).rejects.toThrow(
        "Impossible de modifier les expériences après l'envoi du dossier de faisabilité",
      );
    },
  );
});
