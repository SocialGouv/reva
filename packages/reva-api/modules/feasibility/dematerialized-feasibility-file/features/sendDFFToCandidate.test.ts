import { FeasibilityStatus } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

import { graphql } from "@/modules/graphql/generated";
import { DOSSIER_FAISABILITE_NON_TROUVE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createFeasibilityDematerializedHelper } from "@/test/helpers/entities/create-feasibility-dematerialized-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

const sendDFFToCandidateMutation = graphql(`
  mutation dff_sendToCandidate(
    $candidacyId: ID!
    $dematerializedFeasibilityFileId: ID!
  ) {
    dematerialized_feasibility_file_sendToCandidate(
      candidacyId: $candidacyId
      dematerializedFeasibilityFileId: $dematerializedFeasibilityFileId
    )
  }
`);

type CandidacyHelper = Awaited<ReturnType<typeof createCandidacyHelper>>;

const getAapKeycloakId = (candidacy: CandidacyHelper) =>
  candidacy.organism?.organismOnAccounts?.[0]?.account?.keycloakId;

const createDFFReadyToSendToCandidate = async (
  decision: FeasibilityStatus = "DRAFT",
) => {
  const candidacy = await createCandidacyHelper();
  const feasibility = await createFeasibilityDematerializedHelper({
    candidacyId: candidacy.id,
    decision,
  });

  return { candidacy, feasibility };
};

const getAapClient = (candidacy: CandidacyHelper) =>
  getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: getAapKeycloakId(candidacy)!,
      }),
    },
  });

const SEND_TO_CANDIDATE_INVALID_DECISION_MESSAGE =
  "Le dossier de faisabilité n'est pas en état de draft ou incomplet pour être envoyé au candidat";

describe("Envoi du dossier de faisabilité dématérialisé au candidat par l'AAP", () => {
  test.each<FeasibilityStatus>(["DRAFT", "INCOMPLETE"])(
    "devrait réussir quand la décision de faisabilité est %s",
    async (decision: FeasibilityStatus) => {
      const { candidacy, feasibility } =
        await createDFFReadyToSendToCandidate(decision);

      const client = getAapClient(candidacy);

      const result = await client.request(sendDFFToCandidateMutation, {
        candidacyId: candidacy.id,
        dematerializedFeasibilityFileId:
          feasibility.dematerializedFeasibilityFile!.id,
      });

      expect(result.dematerialized_feasibility_file_sendToCandidate).toBe("Ok");

      const updatedDff =
        await prismaClient.dematerializedFeasibilityFile.findUnique({
          where: { id: feasibility.dematerializedFeasibilityFile!.id },
        });

      expect(updatedDff?.sentToCandidateAt).not.toBeNull();

      const updatedFeasibility = await prismaClient.feasibility.findFirst({
        where: { candidacyId: candidacy.id, isActive: true },
      });

      expect(updatedFeasibility?.decision).toBe(decision);

      const auditLog = await prismaClient.candidacyLog.findFirst({
        where: {
          candidacyId: candidacy.id,
          eventType: "DFF_SENT_TO_CANDIDATE",
        },
      });

      expect(auditLog).not.toBeNull();
    },
  );

  describe("devrait échouer quand la décision de faisabilité n'est ni draft ni incomplet", () => {
    test.each<FeasibilityStatus>(["PENDING", "ADMISSIBLE", "REJECTED"])(
      "decision %s",
      async (decision: FeasibilityStatus) => {
        const { candidacy, feasibility } =
          await createDFFReadyToSendToCandidate(decision);

        const client = getAapClient(candidacy);

        await expect(
          client.request(sendDFFToCandidateMutation, {
            candidacyId: candidacy.id,
            dematerializedFeasibilityFileId:
              feasibility.dematerializedFeasibilityFile!.id,
          }),
        ).rejects.toThrowError(SEND_TO_CANDIDATE_INVALID_DECISION_MESSAGE);
      },
    );
  });

  test("devrait échouer quand le dossier de faisabilité dématérialisé n'existe pas", async () => {
    const { candidacy } = await createDFFReadyToSendToCandidate();

    const client = getAapClient(candidacy);

    await expect(
      client.request(sendDFFToCandidateMutation, {
        candidacyId: candidacy.id,
        dematerializedFeasibilityFileId: uuidV4(),
      }),
    ).rejects.toThrowError(DOSSIER_FAISABILITE_NON_TROUVE);
  });
});
