import {
  CandidacyStatusStep,
  FeasibilityFormat,
  FeasibilityStatus,
} from "@prisma/client";

import { graphql } from "@/modules/graphql/generated";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createFeasibilityDematerializedHelper } from "@/test/helpers/entities/create-feasibility-dematerialized-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

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

  const getStatusForDecision = (
    decision: FeasibilityStatus,
  ): CandidacyStatusStep => {
    const decisionToStatusMap: Record<FeasibilityStatus, CandidacyStatusStep> =
      {
        ADMISSIBLE: "DOSSIER_FAISABILITE_RECEVABLE",
        REJECTED: "DOSSIER_FAISABILITE_NON_RECEVABLE",
        INCOMPLETE: "DOSSIER_FAISABILITE_INCOMPLET",
        COMPLETE: "DOSSIER_FAISABILITE_COMPLET",
        PENDING: "DOSSIER_FAISABILITE_ENVOYE",
        DRAFT: "PARCOURS_CONFIRME",
      };

    return decisionToStatusMap[decision];
  };

  const createFeasibilityWithDecision = async (
    decision: FeasibilityStatus,
    format: FeasibilityFormat = "DEMATERIALIZED",
  ) => {
    const status = getStatusForDecision(decision);
    const candidacy = await createCandidacyHelper({
      candidacyArgs: { status },
    });

    let feasibility;
    if (format === "UPLOADED_PDF") {
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
    test.each<{
      decision: FeasibilityStatus;
      format: FeasibilityFormat;
    }>([
      {
        decision: "ADMISSIBLE",
        format: "DEMATERIALIZED",
      },
      {
        decision: "REJECTED",
        format: "DEMATERIALIZED",
      },
      {
        decision: "ADMISSIBLE",
        format: "UPLOADED_PDF",
      },
      {
        decision: "REJECTED",
        format: "UPLOADED_PDF",
      },
    ])(
      "should revoke $decision decision for $format feasibility",
      async ({
        decision,
        format,
      }: {
        decision: FeasibilityStatus;
        format: FeasibilityFormat;
      }) => {
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
        if (format === "UPLOADED_PDF") {
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

      await expect(
        certificateurClient.request(
          revokeCertificationAuthorityDecisionMutation,
          {
            feasibilityId: feasibility.id,
          },
        ),
      ).rejects.toThrowError("You are not authorized!");
    });
  });

  describe("error scenarios", () => {
    test.each<{
      decision: FeasibilityStatus;
    }>([
      { decision: "COMPLETE" },
      { decision: "INCOMPLETE" },
      { decision: "PENDING" },
      { decision: "DRAFT" },
    ])(
      "should fail to revoke $decision decision",
      async ({ decision }: { decision: FeasibilityStatus }) => {
        const { feasibility } = await createFeasibilityWithDecision(decision);
        const adminClient = getAdminClient();

        await expect(
          adminClient.request(revokeCertificationAuthorityDecisionMutation, {
            feasibilityId: feasibility.id,
          }),
        ).rejects.toThrowError(
          "La décision ne peut être annulée que pour les dossiers recevables ou non recevables",
        );
      },
    );

    test("should fail when feasibility does not exist", async () => {
      const nonExistentFeasibilityId = "00000000-0000-0000-0000-000000000000";
      const adminClient = getAdminClient();

      await expect(
        adminClient.request(revokeCertificationAuthorityDecisionMutation, {
          feasibilityId: nonExistentFeasibilityId,
        }),
      ).rejects.toThrowError("Aucun dossier de faisabilité trouvé");
    });

    test.each<CandidacyStatusStep>([
      "DOSSIER_DE_VALIDATION_ENVOYE",
      "DOSSIER_DE_VALIDATION_SIGNALE",
    ])(
      "should fail when candidacy status is %s",
      async (status: CandidacyStatusStep) => {
        const candidacy = await createCandidacyHelper({
          candidacyArgs: { status },
        });

        const feasibility = await createFeasibilityDematerializedHelper({
          candidacyId: candidacy.id,
          decision: "ADMISSIBLE",
          decisionSentAt: new Date(),
        });

        const adminClient = getAdminClient();

        await expect(
          adminClient.request(revokeCertificationAuthorityDecisionMutation, {
            feasibilityId: feasibility.id,
          }),
        ).rejects.toThrowError(
          "La décision ne peut être annulée que lorsque la candidature est à l'étape DOSSIER_FAISABILITE_RECEVABLE ou DOSSIER_FAISABILITE_NON_RECEVABLE",
        );
      },
    );
  });
});
