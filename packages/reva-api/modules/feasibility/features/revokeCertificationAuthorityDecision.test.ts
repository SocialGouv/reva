import { FeasibilityStatus } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { createFeasibilityDematerializedHelper } from "../../../test/helpers/entities/create-feasibility-dematerialized-helper";
import { createFeasibilityUploadedPdfHelper } from "../../../test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import {
  getGraphQLClient,
  getGraphQLError,
} from "../../../test/jestGraphqlClient";
import { shouldNotGoHere } from "../../../test/jestHelpers";
import { graphql } from "../../graphql/generated";

const revokeCertificationAuthorityDecisionMutation = graphql(`
  mutation feasibility_revokeCertificationAuthorityDecision(
    $feasibilityId: ID!
    $reason: String
  ) {
    feasibility_revokeCertificationAuthorityDecision(
      feasibilityId: $feasibilityId
      reason: $reason
    ) {
      id
      decision
      decisionSentAt
      decisionComment
      history {
        id
        decision
        decisionSentAt
        decisionComment
      }
    }
  }
`);

const getCandidacyByIdQuery = graphql(`
  query getCandidacyById($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      candidacyLogs {
        id
        message
        details
      }
    }
  }
`);

describe("revokeCertificationAuthorityDecision", () => {
  const getAdminClient = () =>
    getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
        }),
      },
    });

  const getCertificateurClient = () =>
    getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_feasibility",
          keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
        }),
      },
    });

  const createFeasibilityWithDecision = async (
    decision: FeasibilityStatus,
    format: "dematerialized" | "pdf" = "dematerialized",
  ) => {
    const candidacy = await createCandidacyHelper();

    let feasibility;
    if (format === "pdf") {
      feasibility = await createFeasibilityUploadedPdfHelper({
        candidacyId: candidacy.id,
        decision,
        decisionSentAt: new Date(),
      });
    } else {
      feasibility = await createFeasibilityDematerializedHelper({
        candidacyId: candidacy.id,
        decision,
        decisionSentAt: new Date(),
        feasibilityDecisionHistory: {
          create: {
            decision,
            decisionSentAt: new Date(),
          },
        },
      });
    }

    return {
      candidacy,
      feasibility,
    };
  };

  describe("successful revocation scenarios", () => {
    test.each([
      { decision: "ADMISSIBLE" as const, format: "dematerialized" as const },
      { decision: "REJECTED" as const, format: "dematerialized" as const },
      { decision: "ADMISSIBLE" as const, format: "pdf" as const },
      { decision: "REJECTED" as const, format: "pdf" as const },
    ])(
      "should revoke $decision decision for $format feasibility",
      async ({ decision, format }) => {
        const { candidacy, feasibility } = await createFeasibilityWithDecision(
          decision,
          format,
        );
        const adminClient = getAdminClient();

        const result = await adminClient.request(
          revokeCertificationAuthorityDecisionMutation,
          {
            feasibilityId: feasibility.id,
            reason: "erreur de saisie",
          },
        );

        expect(
          result.feasibility_revokeCertificationAuthorityDecision,
        ).toMatchObject({
          decision: "COMPLETE",
          decisionSentAt: null,
          decisionComment: null,
        });

        const history =
          result.feasibility_revokeCertificationAuthorityDecision.history;

        // For PDF, history only shows INCOMPLETE decisions
        // For dematerialized, it shows all decisions from feasibilityDecision table
        if (format === "pdf") {
          expect(history.length).toBe(0);
        } else {
          expect(history.length).toBe(2);
          expect(history[0]).toMatchObject({
            decision: "COMPLETE",
          });
        }

        const candidacyResult = await adminClient.request(
          getCandidacyByIdQuery,
          {
            candidacyId: candidacy.id,
          },
        );

        expect(candidacyResult.getCandidacyById?.status).toBe(
          "DOSSIER_FAISABILITE_COMPLET",
        );
      },
    );
  });

  describe("candidacy log creation", () => {
    test("should create candidacy log with reason when provided", async () => {
      const { candidacy, feasibility } =
        await createFeasibilityWithDecision("ADMISSIBLE");
      const adminClient = getAdminClient();

      await adminClient.request(revokeCertificationAuthorityDecisionMutation, {
        feasibilityId: feasibility.id,
        reason: "erreur de saisie",
      });

      const candidacyLog = await prismaClient.candidacyLog.findFirst({
        where: {
          candidacyId: candidacy.id,
          eventType: "FEASIBILITY_DECISION_REVOKED",
        },
      });

      expect(candidacyLog?.eventType).toBe("FEASIBILITY_DECISION_REVOKED");
      expect(candidacyLog?.details).toEqual({
        reason: "erreur de saisie",
      });
    });
  });

  describe("access scenarios", () => {
    test("should fail for certificateur role", async () => {
      const { feasibility } = await createFeasibilityWithDecision("ADMISSIBLE");
      const certificateurClient = getCertificateurClient();

      try {
        await certificateurClient.request(
          revokeCertificationAuthorityDecisionMutation,
          {
            feasibilityId: feasibility.id,
          },
        );
        shouldNotGoHere();
      } catch (error) {
        const gqlError = getGraphQLError(error);
        expect(gqlError).toContain("You are not authorized!");
      }
    });
  });

  describe("error scenarios", () => {
    test.each([
      { decision: "COMPLETE" as const },
      { decision: "INCOMPLETE" as const },
      { decision: "PENDING" as const },
      { decision: "DRAFT" as const },
    ])("should fail to revoke $decision decision", async ({ decision }) => {
      const { feasibility } = await createFeasibilityWithDecision(decision);
      const adminClient = getAdminClient();

      try {
        await adminClient.request(
          revokeCertificationAuthorityDecisionMutation,
          {
            feasibilityId: feasibility.id,
          },
        );
        shouldNotGoHere();
      } catch (error) {
        const gqlError = getGraphQLError(error);
        expect(gqlError).toContain(
          "La décision ne peut être annulée que pour les dossiers recevables ou non recevables",
        );
      }
    });

    test("should fail when feasibility does not exist", async () => {
      const nonExistentFeasibilityId = "00000000-0000-0000-0000-000000000000";
      const adminClient = getAdminClient();

      try {
        await adminClient.request(
          revokeCertificationAuthorityDecisionMutation,
          {
            feasibilityId: nonExistentFeasibilityId,
          },
        );
        shouldNotGoHere();
      } catch (error) {
        const gqlError = getGraphQLError(error);
        expect(gqlError).toContain("Aucun dossier de faisabilité trouvé");
      }
    });
  });
});
