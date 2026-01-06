import { FeasibilityFormat } from "@prisma/client";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const createCandidacyMutation = graphql(`
  mutation createCandidacy_test(
    $candidateId: UUID!
    $certificationId: UUID
    $typeAccompagnement: TypeAccompagnement
    $cohorteVaeCollectiveId: UUID
  ) {
    candidacy_createCandidacy(
      candidateId: $candidateId
      data: {
        certificationId: $certificationId
        typeAccompagnement: $typeAccompagnement
        cohorteVaeCollectiveId: $cohorteVaeCollectiveId
      }
    ) {
      id
      feasibilityFormat
      typeAccompagnement
      cohorteVaeCollective {
        id
      }
    }
  }
`);

describe("createCandidacy", () => {
  test.each([
    {
      typeAccompagnement: "ACCOMPAGNE" as const,
      expectedFormat: "DEMATERIALIZED",
    },
    { typeAccompagnement: "AUTONOME" as const, expectedFormat: "UPLOADED_PDF" },
  ])(
    "should set feasibilityFormat to $expectedFormat when typeAccompagnement is $typeAccompagnement",
    async ({
      typeAccompagnement,
      expectedFormat,
    }: {
      typeAccompagnement: "ACCOMPAGNE" | "AUTONOME";
      expectedFormat: string;
    }) => {
      const candidate = await createCandidateHelper();
      const certification = await createCertificationHelper({
        feasibilityFormat: FeasibilityFormat.DEMATERIALIZED,
      });

      const graphqlClient = getGraphQLClient({
        headers: {
          authorization: authorizationHeaderForUser({
            role: "candidate",
            keycloakId: candidate.keycloakId,
          }),
        },
      });

      const result = await graphqlClient.request(createCandidacyMutation, {
        candidateId: candidate.id,
        certificationId: certification.id,
        typeAccompagnement,
      });

      expect(result.candidacy_createCandidacy?.feasibilityFormat).toBe(
        expectedFormat,
      );
      expect(result.candidacy_createCandidacy?.typeAccompagnement).toBe(
        typeAccompagnement,
      );
    },
  );

  test("should set feasibilityFormat to DEMATERIALIZED for VAE Collective", async () => {
    const candidate = await createCandidateHelper();
    const cohorte = await createCohorteVaeCollectiveHelper();

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "candidate",
          keycloakId: candidate.keycloakId,
        }),
      },
    });

    const result = await graphqlClient.request(createCandidacyMutation, {
      candidateId: candidate.id,
      cohorteVaeCollectiveId: cohorte.id,
    });

    expect(result.candidacy_createCandidacy?.feasibilityFormat).toBe(
      "DEMATERIALIZED",
    );
    expect(result.candidacy_createCandidacy?.typeAccompagnement).toBe(
      "ACCOMPAGNE",
    );
    expect(result.candidacy_createCandidacy?.cohorteVaeCollective?.id).toBe(
      cohorte.id,
    );
  });
});
