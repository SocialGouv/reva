import { CandidacyStatusStep } from "@prisma/client";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

test.each([
  "PROJET",
  "VALIDATION",
  "PRISE_EN_CHARGE",
  "PARCOURS_ENVOYE",
] satisfies CandidacyStatusStep[])(
  "candidate should be able to change it's type_accompagnement to 'autonome' when the candidacy status is '%s'",
  async (status) => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: status,
      candidacyArgs: { typeAccompagnement: "ACCOMPAGNE" },
    });
    const candidateKeycloakId = candidacy.candidate?.keycloakId;

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "candidate",
          keycloakId: candidateKeycloakId,
        }),
      },
    });

    const candidacy_updateTypeAccompagnement = graphql(`
      mutation candidacy_updateTypeAccompagnement_based_on_accompagnement_ACCOMPAGNE(
        $candidacyId: UUID!
        $typeAccompagnement: TypeAccompagnement!
      ) {
        candidacy_updateTypeAccompagnement(
          candidacyId: $candidacyId
          typeAccompagnement: $typeAccompagnement
        ) {
          id
          typeAccompagnement
        }
      }
    `);

    const res = await graphqlClient.request(
      candidacy_updateTypeAccompagnement,
      {
        candidacyId: candidacy.id,
        typeAccompagnement: "AUTONOME",
      },
    );

    expect(res).toMatchObject({
      candidacy_updateTypeAccompagnement: { typeAccompagnement: "AUTONOME" },
    });
  },
);

test("candidate should be able to change it's type_accompagnement to 'accompagne' when the candidacy status is 'PROJET'", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: "PROJET",
    candidacyArgs: { typeAccompagnement: "AUTONOME" },
  });
  const candidateKeycloakId = candidacy.candidate?.keycloakId;

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidateKeycloakId,
      }),
    },
  });

  const candidacy_updateTypeAccompagnement = graphql(`
    mutation candidacy_updateTypeAccompagnement_based_on_accompagnement_AUTONOME(
      $candidacyId: UUID!
      $typeAccompagnement: TypeAccompagnement!
    ) {
      candidacy_updateTypeAccompagnement(
        candidacyId: $candidacyId
        typeAccompagnement: $typeAccompagnement
      ) {
        id
        typeAccompagnement
      }
    }
  `);

  const res = await graphqlClient.request(candidacy_updateTypeAccompagnement, {
    candidacyId: candidacy.id,
    typeAccompagnement: "ACCOMPAGNE",
  });

  expect(res).toMatchObject({
    candidacy_updateTypeAccompagnement: { typeAccompagnement: "ACCOMPAGNE" },
  });
});

test("candidate should NOT be able to change it's type_accompagnement to 'autonome' when the candidacy status is equal to 'PARCOURS_CONFIRME'", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.PARCOURS_CONFIRME,
    candidacyArgs: { typeAccompagnement: "ACCOMPAGNE" },
  });
  const candidateKeycloakId = candidacy.candidate?.keycloakId;

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidateKeycloakId,
      }),
    },
  });

  const candidacy_updateTypeAccompagnement = graphql(`
    mutation candidacy_updateTypeAccompagnement_based_on_status_PARCOURS_CONFIRME(
      $candidacyId: UUID!
      $typeAccompagnement: TypeAccompagnement!
    ) {
      candidacy_updateTypeAccompagnement(
        candidacyId: $candidacyId
        typeAccompagnement: $typeAccompagnement
      ) {
        id
        typeAccompagnement
      }
    }
  `);

  await expect(
    graphqlClient.request(candidacy_updateTypeAccompagnement, {
      candidacyId: candidacy.id,
      typeAccompagnement: "AUTONOME",
    }),
  ).rejects.toThrowError(
    "Impossible de modifier le type d'accompagnement une fois le parcours confirmé",
  );
});

test("candidate should NOT be able to change it's type_accompagnement to 'accompagne' when the candidacy status is equal to 'DOSSIER_FAISABILITE_ENVOYE'", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
    candidacyArgs: { typeAccompagnement: "AUTONOME" },
  });
  const candidateKeycloakId = candidacy.candidate?.keycloakId;

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidateKeycloakId,
      }),
    },
  });

  const candidacy_updateTypeAccompagnement = graphql(`
    mutation candidacy_updateTypeAccompagnement_based_on_status_DOSSIER_FAISABILITE_ENVOYE(
      $candidacyId: UUID!
      $typeAccompagnement: TypeAccompagnement!
    ) {
      candidacy_updateTypeAccompagnement(
        candidacyId: $candidacyId
        typeAccompagnement: $typeAccompagnement
      ) {
        id
        typeAccompagnement
      }
    }
  `);

  await expect(
    graphqlClient.request(candidacy_updateTypeAccompagnement, {
      candidacyId: candidacy.id,
      typeAccompagnement: "ACCOMPAGNE",
    }),
  ).rejects.toThrowError(
    "Impossible de modifier le type d'accompagnement une fois le dossier de faisabilité envoyé",
  );
});
