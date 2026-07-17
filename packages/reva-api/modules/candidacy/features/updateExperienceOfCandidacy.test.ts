import { CandidacyStatusStep, ExperienceDuration } from "@prisma/client";

import {
  IMPOSSIBLE_METTRE_JOUR_EXPERIENCES_APRES_CONFIRME,
  IMPOSSIBLE_MODIFIER_EXPERIENCES_APRES_ENVOI_DOSSIER,
} from "@/modules/shared/errors/messages";
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

describe("mise à jour d'une expérience de candidature", () => {
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

  test("doit mettre à jour une expérience rattachée à la candidature autorisée", async () => {
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

  test("doit rejeter la mise à jour d'une expérience qui n'est pas rattachée à la candidature autorisée", async () => {
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

  test("doit empêcher un candidat de mettre à jour une expérience après avoir confirmé le parcours", async () => {
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
    ).rejects.toThrow(IMPOSSIBLE_METTRE_JOUR_EXPERIENCES_APRES_CONFIRME);
  });

  test("doit permettre à un AAP de mettre à jour une expérience rattachée à une candidature qu'il possède", async () => {
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

  test("doit rejeter un AAP qui met à jour une expérience non rattachée à une candidature qu'il possède", async () => {
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

  test("doit permettre à un AAP de mettre à jour une expérience lorsque le statut est DOSSIER_FAISABILITE_INCOMPLET", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
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
    "doit empêcher un AAP de mettre à jour une expérience lorsque le statut de la candidature est %s",
    async (status: CandidacyStatusStep) => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: status,
      });

      const experience = await createExperienceForCandidacy(
        candidacy.id,
        "Experience 1",
      );

      const graphqlClient = getGraphQLClientForAap(
        candidacy.organism?.organismOnAccounts[0].account.keycloakId,
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
      ).rejects.toThrow(IMPOSSIBLE_MODIFIER_EXPERIENCES_APRES_ENVOI_DOSSIER);
    },
  );
});
