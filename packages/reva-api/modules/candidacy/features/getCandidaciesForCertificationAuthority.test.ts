import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { createCandidacyDropOutHelper } from "@/test/helpers/entities/create-candidacy-drop-out-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { createJuryHelper } from "@/test/helpers/entities/create-jury-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";

import { getCandidaciesForCertificationAuthority } from "./getCandidaciesForCertificationAuthority";

describe("getCandidaciesForCertificationAuthority", () => {
  describe("Permissions", () => {
    test("should throw error when user has manage_feasibility role but no certificationAuthorityId", async () => {
      await expect(async () => {
        await getCandidaciesForCertificationAuthority({
          hasRole: (role) => role === "manage_feasibility",
        });
      }).rejects.toThrow(
        "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource",
      );
    });

    test("should not throw error when user has manage_feasibility role with certificationAuthorityId", async () => {
      const certificationAuthority = await createCertificationAuthorityHelper();

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: (role) => role === "manage_feasibility",
      });

      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(result.info).toBeDefined();
    });
  });

  describe("Feasibility Status Filters", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should filter candidacies with DOSSIER_FAISABILITE_ENVOYE status", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      // Créer une autre candidature avec un statut différent
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        feasibilityStatuses: [CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(feasibility.candidacy.id);
      expect(result.rows[0].status).toBe(
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );
    });

    test("should filter candidacies with DOSSIER_FAISABILITE_COMPLET status", async () => {
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        feasibilityStatuses: [CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe(
        CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET,
      );
    });

    test("should filter candidacies with DOSSIER_FAISABILITE_INCOMPLET status", async () => {
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        feasibilityStatuses: [
          CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
        ],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe(
        CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
      );
    });

    test("should filter candidacies with DOSSIER_FAISABILITE_RECEVABLE status", async () => {
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        feasibilityStatuses: [
          CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
        ],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe(
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
    });

    test("should filter candidacies with DOSSIER_FAISABILITE_NON_RECEVABLE status", async () => {
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        feasibilityStatuses: [
          CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE,
        ],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe(
        CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE,
      );
    });

    test("should filter candidacies with multiple feasibility statuses (OR logic)", async () => {
      const feasibility1 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );
      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      // Créer une candidature qui ne devrait pas matcher
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        feasibilityStatuses: [
          CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
          CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
        ],
      });

      expect(result.rows).toHaveLength(2);
      expect(result.rows.some((c) => c.id === feasibility1.candidacy.id)).toBe(
        true,
      );
      expect(result.rows.some((c) => c.id === feasibility2.candidacy.id)).toBe(
        true,
      );
    });
  });

  describe("Validation Status Filters", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should filter candidacies with DOSSIER_DE_VALIDATION_ENVOYE status", async () => {
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        validationStatuses: [CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe(
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );
    });

    test("should filter candidacies with DOSSIER_DE_VALIDATION_SIGNALE status", async () => {
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        validationStatuses: [CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe(
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
      );
    });

    test("should filter candidacies with multiple validation statuses (OR logic)", async () => {
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        validationStatuses: [
          CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
          CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
        ],
      });

      expect(result.rows).toHaveLength(2);
    });
  });

  describe("Jury Status Filters", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should filter candidacies with jury TO_SCHEDULE (DossierDeValidation actif mais pas de jury)", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );

      // Créer un DossierDeValidation avec décision PENDING
      const file = await prismaClient.file.create({
        data: { name: "test.pdf", mimeType: "application/pdf", path: "/test" },
      });
      await prismaClient.dossierDeValidation.create({
        data: {
          candidacyId: feasibility.candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
          dossierDeValidationFileId: file.id,
          decision: "PENDING",
          isActive: true,
        },
      });

      // Candidature avec jury actif (ne doit pas matcher)
      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );
      const file2 = await prismaClient.file.create({
        data: {
          name: "test2.pdf",
          mimeType: "application/pdf",
          path: "/test2",
        },
      });
      await prismaClient.dossierDeValidation.create({
        data: {
          candidacyId: feasibility2.candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
          dossierDeValidationFileId: file2.id,
          decision: "COMPLETE",
          isActive: true,
        },
      });
      await createJuryHelper({
        candidacyId: feasibility2.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: new Date(),
        isActive: true,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryStatuses: ["TO_SCHEDULE"],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(feasibility.candidacy.id);
    });

    test("should filter candidacies with jury SCHEDULED (jury actif)", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );

      await createJuryHelper({
        candidacyId: feasibility.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: new Date(),
        isActive: true,
      });

      // Candidature sans jury actif (ne doit pas matcher)
      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: feasibility2.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: new Date(),
        isActive: false,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryStatuses: ["SCHEDULED"],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(feasibility.candidacy.id);
    });

    test("should filter candidacies with multiple jury statuses (logique OR)", async () => {
      // Candidature à programmer (DossierDeValidation sans jury)
      const feasibility1 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );
      const file1 = await prismaClient.file.create({
        data: {
          name: "test1.pdf",
          mimeType: "application/pdf",
          path: "/test1",
        },
      });
      await prismaClient.dossierDeValidation.create({
        data: {
          candidacyId: feasibility1.candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
          dossierDeValidationFileId: file1.id,
          decision: "PENDING",
          isActive: true,
        },
      });

      // Candidature programmée (jury actif)
      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: feasibility2.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: new Date(),
        isActive: true,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryStatuses: ["TO_SCHEDULE", "SCHEDULED"],
      });

      expect(result.rows).toHaveLength(2);
    });

    test("should include only active juries in jury status filters", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );

      const file = await prismaClient.file.create({
        data: { name: "test.pdf", mimeType: "application/pdf", path: "/test" },
      });
      await prismaClient.dossierDeValidation.create({
        data: {
          candidacyId: feasibility.candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
          dossierDeValidationFileId: file.id,
          decision: "COMPLETE",
          isActive: true,
        },
      });

      // Jury inactif - la candidature devrait matcher TO_SCHEDULE
      await createJuryHelper({
        candidacyId: feasibility.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: new Date(),
        isActive: false,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryStatuses: ["TO_SCHEDULE"],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(feasibility.candidacy.id);
    });
  });

  describe("Jury Result Filters", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test.each([
      "FULL_SUCCESS_OF_FULL_CERTIFICATION",
      "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
      "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
      "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
      "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
      "FAILURE",
      "CANDIDATE_EXCUSED",
      "CANDIDATE_ABSENT",
    ] as const)(
      "should filter candidacies with jury result %s",
      async (
        juryResult:
          | "FULL_SUCCESS_OF_FULL_CERTIFICATION"
          | "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION"
          | "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION"
          | "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION"
          | "PARTIAL_SUCCESS_PENDING_CONFIRMATION"
          | "FAILURE"
          | "CANDIDATE_EXCUSED"
          | "CANDIDATE_ABSENT",
      ) => {
        const feasibility = await createFeasibilityUploadedPdfHelper(
          { certificationAuthorityId: certificationAuthority.id },
          CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
        );

        await createJuryHelper({
          candidacyId: feasibility.candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
          dateOfSession: new Date(),
          dateOfResult: new Date(),
          result: juryResult,
          isActive: true,
        });

        // Créer une autre candidature avec un résultat différent
        await createFeasibilityUploadedPdfHelper(
          { certificationAuthorityId: certificationAuthority.id },
          CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
        );

        const result = await getCandidaciesForCertificationAuthority({
          certificationAuthorityId: certificationAuthority.id,
          hasRole: () => true,
          juryResults: [juryResult],
        });

        expect(result.rows.some((c) => c.id === feasibility.candidacy.id)).toBe(
          true,
        );
      },
    );

    test("should filter candidacies with multiple jury results (OR logic)", async () => {
      const feasibility1 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: feasibility1.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
        isActive: true,
      });

      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: feasibility2.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        result: "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
        isActive: true,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryResults: [
          "FULL_SUCCESS_OF_FULL_CERTIFICATION",
          "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
        ],
      });

      expect(result.rows).toHaveLength(2);
    });

    test("should filter candidacies with AWAITING_RESULT (session future sans résultat)", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const feasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );

      await createJuryHelper({
        candidacyId: feasibility.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: futureDate,
        result: null,
        isActive: true,
      });

      // Candidature avec session passée (ne doit pas matcher)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: feasibility2.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: pastDate,
        result: null,
        isActive: true,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryResults: ["AWAITING_RESULT" as any],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(feasibility.candidacy.id);
    });

    test("should only include active juries in jury result filters", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );

      await createJuryHelper({
        candidacyId: feasibility.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
        isActive: false,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryResults: ["FULL_SUCCESS_OF_FULL_CERTIFICATION"],
      });

      expect(result.rows).toHaveLength(0);
    });
  });

  describe("Include Dropouts Filter", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should exclude dropout candidacies by default (includeDropouts = false)", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      const candidacyDropOut = await createCandidacyDropOutHelper();
      await prismaClient.feasibility.create({
        data: {
          candidacyId: candidacyDropOut.candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
        },
      });
      await prismaClient.candidacy.update({
        where: { id: candidacyDropOut.candidacy.id },
        data: { status: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE },
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        includeDropouts: false,
      });

      expect(
        result.rows.every((c) => c.id !== candidacyDropOut.candidacy.id),
      ).toBe(true);
      expect(result.rows.some((c) => c.id === feasibility.candidacy.id)).toBe(
        true,
      );
    });

    test("should include dropout candidacies when includeDropouts = true", async () => {
      const candidacyDropOut = await createCandidacyDropOutHelper();
      await prismaClient.feasibility.create({
        data: {
          candidacyId: candidacyDropOut.candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
        },
      });
      await prismaClient.candidacy.update({
        where: { id: candidacyDropOut.candidacy.id },
        data: { status: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE },
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        includeDropouts: true,
      });

      expect(
        result.rows.some((c) => c.id === candidacyDropOut.candidacy.id),
      ).toBe(true);
    });

    test("should include dropout candidacies when includeDropouts = true even with a statusFilter", async () => {
      // Créer une candidature normale (sans abandon)
      const normalFeasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      // Créer une candidature avec abandon
      const candidacyDropOut = await createCandidacyDropOutHelper();
      await prismaClient.feasibility.create({
        data: {
          candidacyId: candidacyDropOut.candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
        },
      });
      await prismaClient.candidacy.update({
        where: { id: candidacyDropOut.candidacy.id },
        data: { status: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE },
      });

      // Test avec statusFilter DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON
      // Ce statusFilter exclut normalement les abandons, mais includeDropouts=true devrait surcharger cela
      const resultWithFilter = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        statusFilter: "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON",
        includeDropouts: true,
      });

      // Les deux candidatures devraient être incluses
      expect(
        resultWithFilter.rows.some(
          (c) => c.id === candidacyDropOut.candidacy.id,
        ),
      ).toBe(true);
      expect(
        resultWithFilter.rows.some(
          (c) => c.id === normalFeasibility.candidacy.id,
        ),
      ).toBe(true);

      // Maintenant tester avec includeDropouts = false (comportement par défaut)
      const resultWithoutDropouts =
        await getCandidaciesForCertificationAuthority({
          certificationAuthorityId: certificationAuthority.id,
          hasRole: () => true,
          statusFilter: "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON",
          includeDropouts: false,
        });

      // Seule la candidature normale devrait être incluse
      expect(
        resultWithoutDropouts.rows.every(
          (c) => c.id !== candidacyDropOut.candidacy.id,
        ),
      ).toBe(true);
      expect(
        resultWithoutDropouts.rows.some(
          (c) => c.id === normalFeasibility.candidacy.id,
        ),
      ).toBe(true);
    });
  });

  describe("Cohorte VAE Collective Filter", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should filter candidacies by cohorteVaeCollectiveId", async () => {
      const vaeCollective = await createCohorteVaeCollectiveHelper();

      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
        candidacyArgs: {
          cohorteVaeCollectiveId: vaeCollective.id || undefined,
        },
      });

      await prismaClient.feasibility.create({
        data: {
          candidacyId: candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
        },
      });

      // Créer une autre candidature sans cohorte
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        cohorteVaeCollectiveId: vaeCollective.id || undefined,
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(candidacy.id);
    });
  });

  describe("Search Filter", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should filter candidacies by search term in candidate name", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      });

      await prismaClient.feasibility.create({
        data: {
          candidacyId: candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
        },
      });

      await prismaClient.candidate.update({
        where: { id: candidacy.candidateId || "" },
        data: { firstname: "UniqueFirstName" },
      });

      // Créer une autre candidature avec un nom différent
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        searchFilter: "UniqueFirstName",
      });

      expect(result.rows.some((c) => c.id === candidacy.id)).toBe(true);
    });
  });

  describe("Sort Filters", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should sort candidacies by DATE_CREATION_DESC", async () => {
      const feasibility1 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      // Attendre un peu pour garantir des timestamps différents
      await new Promise((resolve) => setTimeout(resolve, 10));

      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        sortByFilter: "DATE_CREATION_DESC",
      });

      expect(result.rows[0].id).toBe(feasibility2.candidacy.id);
      expect(result.rows[1].id).toBe(feasibility1.candidacy.id);
    });

    test("should sort candidacies by DATE_CREATION_ASC", async () => {
      const feasibility1 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      await new Promise((resolve) => setTimeout(resolve, 10));

      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        sortByFilter: "DATE_CREATION_ASC",
      });

      expect(result.rows[0].id).toBe(feasibility1.candidacy.id);
      expect(result.rows[1].id).toBe(feasibility2.candidacy.id);
    });
  });

  describe("Pagination", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should paginate results correctly with limit and offset", async () => {
      // Créer 5 candidatures
      for (let i = 0; i < 5; i++) {
        await createFeasibilityUploadedPdfHelper(
          { certificationAuthorityId: certificationAuthority.id },
          CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
        );
      }

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        limit: 2,
        offset: 0,
      });

      expect(result.rows).toHaveLength(2);
      expect(result.info.totalRows).toBe(5);
      expect(result.info.currentPage).toBe(1);
    });

    test("should return correct page with offset", async () => {
      // Créer 5 candidatures
      const candidacies = [];
      for (let i = 0; i < 5; i++) {
        candidacies.push(
          await createFeasibilityUploadedPdfHelper(
            { certificationAuthorityId: certificationAuthority.id },
            CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
          ),
        );
      }

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        limit: 2,
        offset: 2,
      });

      expect(result.rows).toHaveLength(2);
      expect(result.info.currentPage).toBe(2);
    });
  });

  describe("Combined Filters", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should apply feasibility AND jury filters together", async () => {
      const feasibility1 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: feasibility1.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: new Date(),
        dateOfResult: null,
        isActive: true,
      });

      // Créer une candidature avec statut correspondant mais sans jury
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );

      // Créer une candidature avec jury mais statut différent
      const feasibility3 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );
      await createJuryHelper({
        candidacyId: feasibility3.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: new Date(),
        dateOfResult: null,
        isActive: true,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        feasibilityStatuses: [
          CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
        ],
        juryStatuses: ["SCHEDULED"],
      });

      // Devrait correspondre aux candidatures avec statut RECEVABLE OU jury programmé
      expect(result.rows.length).toBeGreaterThanOrEqual(2);
      expect(result.rows.some((c) => c.id === feasibility1.candidacy.id)).toBe(
        true,
      );
    });

    test("should apply validation AND jury result filters together", async () => {
      const feasibility1 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );
      await createJuryHelper({
        candidacyId: feasibility1.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
        isActive: true,
      });

      // Créer une candidature avec statut de validation mais résultat différent
      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );
      await createJuryHelper({
        candidacyId: feasibility2.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        result: "FAILURE",
        isActive: true,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        validationStatuses: [CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE],
        juryResults: ["FULL_SUCCESS_OF_FULL_CERTIFICATION"],
      });

      // Devrait correspondre aux deux grâce à la logique OR entre différentes catégories de filtres
      expect(result.rows.length).toBeGreaterThanOrEqual(1);
    });

    test("should apply all filters together with includeDropouts", async () => {
      const vaeCollective = await createCohorteVaeCollectiveHelper();

      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus:
          CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
        candidacyArgs: {
          cohorteVaeCollectiveId: vaeCollective.id || undefined,
        },
      });

      await prismaClient.feasibility.create({
        data: {
          candidacyId: candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
        },
      });

      await createJuryHelper({
        candidacyId: candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
        isActive: true,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        cohorteVaeCollectiveId: vaeCollective.id || undefined,
        feasibilityStatuses: [
          CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
        ],
        juryResults: ["FULL_SUCCESS_OF_FULL_CERTIFICATION"],
        includeDropouts: false,
      });

      expect(result.rows.some((c) => c.id === candidacy.id)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test("should return empty results when no candidacies match filters", async () => {
      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        feasibilityStatuses: [
          CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE,
        ],
      });

      expect(result.rows).toHaveLength(0);
      expect(result.info.totalRows).toBe(0);
    });

    test("should handle empty filter arrays correctly", async () => {
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        feasibilityStatuses: [],
        validationStatuses: [],
        juryStatuses: [],
        juryResults: [],
      });

      expect(result.rows.length).toBeGreaterThanOrEqual(1);
    });

    test("should only return candidacies within CANDIDACY_STATUS_TO_INCLUDE list", async () => {
      // Ces statuts devraient être inclus
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      // Créer une candidature avec un statut exclu
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PARCOURS_CONFIRME,
      });
      await prismaClient.feasibility.create({
        data: {
          candidacyId: candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
        },
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
      });

      expect(
        result.rows.every(
          (c) =>
            c.status === CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE ||
            c.status === CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET ||
            c.status === CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET ||
            c.status === CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE ||
            c.status ===
              CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE ||
            c.status === CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE ||
            c.status === CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
        ),
      ).toBe(true);
    });

    test("should only return candidacies linked to the certification authority", async () => {
      const otherCertificationAuthority =
        await createCertificationAuthorityHelper();

      const feasibility1 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: otherCertificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
      });

      expect(result.rows.every((c) => c.id === feasibility1.candidacy.id)).toBe(
        true,
      );
    });
  });
});
