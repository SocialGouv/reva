import { CandidacyStatusStep, ExperienceDuration } from "@prisma/client";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const addExperienceMutation = graphql(`
  mutation addExperience($candidacyId: ID!, $experience: ExperienceInput!) {
    candidacy_addExperience(
      candidacyId: $candidacyId
      experience: $experience
    ) {
      id
      title
      description
    }
  }
`);

describe("ajout d'expérience à une candidature", () => {
  const experienceInput = {
    title: "New experience",
    description: "New description",
    duration: ExperienceDuration.betweenOneAndThreeYears,
    startedAt: Date.parse("2020-01-01T00:00:00.000Z"),
  };

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

  test("doit permettre à un AAP d'ajouter une expérience à une candidature qu'il possède lorsque le statut est PROJET", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });

    const graphqlClient = getGraphQLClientForAap(
      candidacy.organism?.organismOnAccounts[0].account.keycloakId,
    );

    const result = await graphqlClient.request(addExperienceMutation, {
      candidacyId: candidacy.id,
      experience: experienceInput,
    });

    expect(result.candidacy_addExperience).toMatchObject({
      title: "New experience",
      description: "New description",
    });
  });

  test("doit permettre à un AAP d'ajouter une expérience lorsque le statut est DOSSIER_FAISABILITE_INCOMPLET", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
    });

    const graphqlClient = getGraphQLClientForAap(
      candidacy.organism?.organismOnAccounts[0].account.keycloakId,
    );

    const result = await graphqlClient.request(addExperienceMutation, {
      candidacyId: candidacy.id,
      experience: experienceInput,
    });

    expect(result.candidacy_addExperience).toMatchObject({
      title: "New experience",
      description: "New description",
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
    "doit empêcher un AAP d'ajouter une expérience lorsque le statut de la candidature est %s",
    async (status: CandidacyStatusStep) => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: status,
      });

      const graphqlClient = getGraphQLClientForAap(
        candidacy.organism?.organismOnAccounts[0].account.keycloakId,
      );

      await expect(
        graphqlClient.request(addExperienceMutation, {
          candidacyId: candidacy.id,
          experience: experienceInput,
        }),
      ).rejects.toThrow(
        "Impossible de modifier les expériences après l'envoi du dossier de faisabilité",
      );
    },
  );

  test("doit empêcher un candidat d'ajouter une expérience après avoir confirmé le parcours", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PARCOURS_CONFIRME,
    });

    const graphqlClient = getGraphQLClientForCandidate(
      candidacy.candidate?.keycloakId,
    );

    await expect(
      graphqlClient.request(addExperienceMutation, {
        candidacyId: candidacy.id,
        experience: experienceInput,
      }),
    ).rejects.toThrow(
      "Impossible de mettre à jour les experiences après avoir confirmé le parcours",
    );
  });

  test("doit rejeter un AAP qui ajoute une expérience à une candidature qu'il ne possède pas", async () => {
    const ownedCandidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });
    const foreignCandidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    });

    const graphqlClient = getGraphQLClientForAap(
      ownedCandidacy.organism?.organismOnAccounts[0].account.keycloakId,
    );

    await expect(
      graphqlClient.request(addExperienceMutation, {
        candidacyId: foreignCandidacy.id,
        experience: experienceInput,
      }),
    ).rejects.toThrow();
  });
});
