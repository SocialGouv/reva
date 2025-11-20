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
    test("lève une erreur si l'utilisateur a le rôle manage_feasibility sans certificationAuthorityId", async () => {
      await expect(async () => {
        await getCandidaciesForCertificationAuthority({
          hasRole: (role) => role === "manage_feasibility",
        });
      }).rejects.toThrow(
        "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource",
      );
    });

    test("n'échoue pas quand le rôle manage_feasibility dispose d'un certificationAuthorityId", async () => {
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

  describe("Filtres de statut faisabilité", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    const FEASIBILITY_STATUSES = [
      CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET,
      CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
      CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE,
    ] as const;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test.each(FEASIBILITY_STATUSES)(
      "filtre les candidatures sur le statut de faisabilité %s",
      async (status: (typeof FEASIBILITY_STATUSES)[number]) => {
        const feasibility = await createFeasibilityUploadedPdfHelper(
          { certificationAuthorityId: certificationAuthority.id },
          status,
        );

        const differentStatus =
          FEASIBILITY_STATUSES.find((s) => s !== status) ??
          CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE;

        await createFeasibilityUploadedPdfHelper(
          { certificationAuthorityId: certificationAuthority.id },
          differentStatus,
        );

        const result = await getCandidaciesForCertificationAuthority({
          certificationAuthorityId: certificationAuthority.id,
          hasRole: () => true,
          feasibilityStatuses: [status],
        });

        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].id).toBe(feasibility.candidacy.id);
        expect(result.rows[0].status).toBe(status);
      },
    );

    test("applique une logique OU entre plusieurs statuts de faisabilité", async () => {
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

  describe("Filtres de statut validation", () => {
    let certificationAuthority: Awaited<
      ReturnType<typeof createCertificationAuthorityHelper>
    >;

    const VALIDATION_STATUSES = [
      CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
    ] as const;

    beforeEach(async () => {
      certificationAuthority = await createCertificationAuthorityHelper();
    });

    test.each(VALIDATION_STATUSES)(
      "filtre les candidatures sur le statut de validation %s",
      async (status: (typeof VALIDATION_STATUSES)[number]) => {
        const feasibility = await createFeasibilityUploadedPdfHelper(
          { certificationAuthorityId: certificationAuthority.id },
          status,
        );

        const result = await getCandidaciesForCertificationAuthority({
          certificationAuthorityId: certificationAuthority.id,
          hasRole: () => true,
          validationStatuses: [status],
        });

        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].id).toBe(feasibility.candidacy.id);
        expect(result.rows[0].status).toBe(status);
      },
    );

    test("applique une logique OU entre plusieurs statuts de validation", async () => {
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

    test("filtre les candidatures avec le statut jury TO_SCHEDULE (DV envoyé sans jury actif)", async () => {
      const toSchedule = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );

      // Candidature avec jury actif (ne doit pas matcher)
      const withActiveJury = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );
      await createJuryHelper({
        candidacyId: withActiveJury.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: new Date(),
        isActive: true,
      });

      // Statut différent sans jury (ne doit pas matcher)
      await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryStatuses: ["TO_SCHEDULE"],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(toSchedule.candidacy.id);
    });

    test("filtre les candidatures avec le statut jury SCHEDULED (jury actif à venir)", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const scheduled = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: scheduled.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: futureDate,
        isActive: true,
      });

      // Jury passé (ne doit pas matcher)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const pastJury = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: pastJury.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: pastDate,
        isActive: true,
      });

      // Jury futur mais inactif (ne doit pas matcher)
      const inactiveJury = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: inactiveJury.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: futureDate,
        isActive: false,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryStatuses: ["SCHEDULED"],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(scheduled.candidacy.id);
    });

    test("applique une logique OU entre plusieurs statuts de jury", async () => {
      const toSchedule = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );

      const scheduled = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      await createJuryHelper({
        candidacyId: scheduled.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: futureDate,
        isActive: true,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryStatuses: ["TO_SCHEDULE", "SCHEDULED"],
      });

      expect(result.rows).toHaveLength(2);
      expect(result.rows.some((c) => c.id === toSchedule.candidacy.id)).toBe(
        true,
      );
      expect(result.rows.some((c) => c.id === scheduled.candidacy.id)).toBe(
        true,
      );
    });

    test("n'inclut que les jurys actifs dans les filtres de statut de jury", async () => {
      const feasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      );

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
      "filtre les candidatures pour le résultat de jury %s",
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

    test("applique une logique OU entre plusieurs résultats de jury", async () => {
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

    test("filtre les candidatures avec AWAITING_RESULT (session passée sans résultat)", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      // Candidature avec session passée (doit matcher)
      const feasibility = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );

      await createJuryHelper({
        candidacyId: feasibility.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: pastDate,
        result: null,
        isActive: true,
      });

      // Candidature avec session future (ne doit pas matcher)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const feasibility2 = await createFeasibilityUploadedPdfHelper(
        { certificationAuthorityId: certificationAuthority.id },
        CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
      );
      await createJuryHelper({
        candidacyId: feasibility2.candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        dateOfSession: futureDate,
        result: null,
        isActive: true,
      });

      const result = await getCandidaciesForCertificationAuthority({
        certificationAuthorityId: certificationAuthority.id,
        hasRole: () => true,
        juryResults: ["AWAITING_RESULT"],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(feasibility.candidacy.id);
    });

    test("n'inclut que les jurys actifs dans les filtres de résultat", async () => {
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

    test("exclut les abandons par défaut (includeDropouts = false)", async () => {
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

    test("inclut les abandons lorsque includeDropouts = true", async () => {
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

    test("inclut les abandons avec includeDropouts = true même avec un statusFilter", async () => {
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

    test("filtre les candidatures par cohorteVaeCollectiveId", async () => {
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

    test("filtre les candidatures par terme recherché sur le nom du candidat", async () => {
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

    test("trie les candidatures par DATE_CREATION_DESC", async () => {
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

    test("trie les candidatures par DATE_CREATION_ASC", async () => {
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

    test("pagine correctement avec limit et offset", async () => {
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

    test("retourne la page attendue lorsque offset est renseigné", async () => {
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

    test("applique conjointement les filtres faisabilité et jury", async () => {
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

    test("applique conjointement les filtres validation et résultats de jury", async () => {
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

    test("applique l'ensemble des filtres tout en gérant includeDropouts", async () => {
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

    test("retourne un résultat vide quand aucun filtre ne correspond", async () => {
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

    test("gère correctement des tableaux de filtres vides", async () => {
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

    test("ne retourne que les statuts inclus dans CANDIDACY_STATUS_TO_INCLUDE", async () => {
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

    test("retourne uniquement les candidatures liées à la certification authority", async () => {
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
