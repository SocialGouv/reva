import {
  CandidacyStatusStep,
  FeasibilityFormat,
  FeasibilityStatus,
} from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

import { graphql } from "@/modules/graphql/generated";
import { NOT_AUTHORIZED } from "@/modules/shared/security/messages";
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

describe("Révocation de la décision du dossier de faisabilité", () => {
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

    return { candidacy, feasibility };
  };

  describe("Révocation réussie", () => {
    test.each<{
      decision: FeasibilityStatus;
      format: FeasibilityFormat;
      expectedDecision: string;
      expectedStatus: string;
    }>([
      {
        decision: "ADMISSIBLE",
        format: "DEMATERIALIZED",
        expectedDecision: "COMPLETE",
        expectedStatus: "DOSSIER_FAISABILITE_COMPLET",
      },
      {
        decision: "REJECTED",
        format: "DEMATERIALIZED",
        expectedDecision: "COMPLETE",
        expectedStatus: "DOSSIER_FAISABILITE_COMPLET",
      },
      {
        decision: "ADMISSIBLE",
        format: "UPLOADED_PDF",
        expectedDecision: "COMPLETE",
        expectedStatus: "DOSSIER_FAISABILITE_COMPLET",
      },
      {
        decision: "REJECTED",
        format: "UPLOADED_PDF",
        expectedDecision: "COMPLETE",
        expectedStatus: "DOSSIER_FAISABILITE_COMPLET",
      },
      {
        decision: "COMPLETE",
        format: "DEMATERIALIZED",
        expectedDecision: "PENDING",
        expectedStatus: "DOSSIER_FAISABILITE_ENVOYE",
      },
      {
        decision: "INCOMPLETE",
        format: "DEMATERIALIZED",
        expectedDecision: "PENDING",
        expectedStatus: "DOSSIER_FAISABILITE_ENVOYE",
      },
      {
        decision: "COMPLETE",
        format: "UPLOADED_PDF",
        expectedDecision: "PENDING",
        expectedStatus: "DOSSIER_FAISABILITE_ENVOYE",
      },
      {
        decision: "INCOMPLETE",
        format: "UPLOADED_PDF",
        expectedDecision: "PENDING",
        expectedStatus: "DOSSIER_FAISABILITE_ENVOYE",
      },
    ])(
      "devrait révoquer la décision $decision ($format) → $expectedDecision",
      async ({
        decision,
        format,
        expectedDecision,
        expectedStatus,
      }: {
        decision: FeasibilityStatus;
        format: FeasibilityFormat;
        expectedDecision: string;
        expectedStatus: string;
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
          decision: expectedDecision,
          decisionSentAt: null,
          decisionComment: null,
        });

        const history =
          result.feasibility_revokeCertificationAuthorityDecision.history;

        if (format === "UPLOADED_PDF") {
          expect(history.length).toBe(0);
        } else {
          expect(history.length).toBe(2);
          expect(history[0]).toMatchObject({ decision: expectedDecision });
        }

        const candidacyResult = await adminClient.request(
          getCandidacyByIdQuery,
          { candidacyId: candidacy.id },
        );

        expect(candidacyResult.getCandidacyById?.status).toBe(expectedStatus);
      },
    );
  });

  describe("Journal de candidature", () => {
    test("devrait créer un log avec le motif quand il est fourni", async () => {
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

  describe("Contrôle d'accès", () => {
    test("devrait échouer pour un certificateur", async () => {
      const { feasibility } = await createFeasibilityWithDecision("ADMISSIBLE");
      const certificateurClient = getCertificateurClient();

      await expect(
        certificateurClient.request(
          revokeCertificationAuthorityDecisionMutation,
          { feasibilityId: feasibility.id },
        ),
      ).rejects.toThrowError(NOT_AUTHORIZED);
    });
  });

  describe("Cas d'erreur", () => {
    test.each<{ decision: FeasibilityStatus }>([
      { decision: "PENDING" },
      { decision: "DRAFT" },
    ])(
      "devrait échouer pour une décision $decision",
      async ({ decision }: { decision: FeasibilityStatus }) => {
        const { feasibility } = await createFeasibilityWithDecision(decision);
        const adminClient = getAdminClient();

        await expect(
          adminClient.request(revokeCertificationAuthorityDecisionMutation, {
            feasibilityId: feasibility.id,
          }),
        ).rejects.toThrowError(
          "La décision ne peut être annulée que pour les dossiers recevables, non recevables, complets ou incomplets",
        );
      },
    );

    test("devrait échouer quand le dossier de faisabilité n'existe pas", async () => {
      const adminClient = getAdminClient();

      await expect(
        adminClient.request(revokeCertificationAuthorityDecisionMutation, {
          feasibilityId: "00000000-0000-0000-0000-000000000000",
        }),
      ).rejects.toThrowError("Aucun dossier de faisabilité trouvé");
    });

    test.each<CandidacyStatusStep>([
      "DOSSIER_DE_VALIDATION_ENVOYE",
      "DOSSIER_DE_VALIDATION_SIGNALE",
    ])(
      "devrait échouer quand le statut de la candidature est %s",
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
          "La décision ne peut être annulée que lorsque la candidature est à l'étape DOSSIER_FAISABILITE_RECEVABLE, DOSSIER_FAISABILITE_NON_RECEVABLE, DOSSIER_FAISABILITE_COMPLET ou DOSSIER_FAISABILITE_INCOMPLET",
        );
      },
    );
  });

  describe("Préservation des données DFF après révocation d'une décision INCOMPLETE", () => {
    test("devrait préserver sentToCandidateAt, candidateConfirmationAt, swornStatementFileId et feasibilityFileSentAt", async () => {
      const { feasibility } = await createFeasibilityWithDecision("INCOMPLETE");

      const swornStatementFile = await prismaClient.file.create({
        data: {
          id: uuidV4(),
          name: "sworn-statement.pdf",
          mimeType: "application/pdf",
          path: `candidacies/${feasibility.candidacyId}/dff_files/sworn-statement.pdf`,
        },
      });

      const dffId = (
        feasibility as { dematerializedFeasibilityFile: { id: string } }
      ).dematerializedFeasibilityFile.id;

      await prismaClient.dematerializedFeasibilityFile.update({
        where: { id: dffId },
        data: {
          sentToCandidateAt: new Date("2025-01-01"),
          candidateConfirmationAt: new Date("2025-01-02"),
          swornStatementFileId: swornStatementFile.id,
        },
      });

      await prismaClient.feasibility.update({
        where: { id: feasibility.id },
        data: { feasibilityFileSentAt: new Date("2025-01-01") },
      });

      const adminClient = getAdminClient();

      await adminClient.request(revokeCertificationAuthorityDecisionMutation, {
        feasibilityId: feasibility.id,
        reason: "erreur de saisie",
      });

      const updatedFeasibility = await prismaClient.feasibility.findUnique({
        where: { id: feasibility.id },
        include: { dematerializedFeasibilityFile: true },
      });

      expect(updatedFeasibility?.decision).toBe("PENDING");
      expect(updatedFeasibility?.feasibilityFileSentAt).not.toBeNull();

      const dff = updatedFeasibility?.dematerializedFeasibilityFile;
      expect(dff?.sentToCandidateAt).not.toBeNull();
      expect(dff?.candidateConfirmationAt).not.toBeNull();
      expect(dff?.swornStatementFileId).not.toBeNull();
    });
  });
});
