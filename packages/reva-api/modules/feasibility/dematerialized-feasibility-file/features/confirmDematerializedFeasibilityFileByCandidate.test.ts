/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import {
  Candidacy,
  DematerializedFeasibilityFile,
  Feasibility,
} from "@prisma/client";
import {
  createCandidacyUnifvae,
  createCandidateJPL,
  createExpertFiliereOrganism,
  createFeasibilityWithDematerializedFeasibilityFile,
} from "../../../../test/helpers/create-db-entity";
import { confirmDematerializedFeasibilityFileByCandidate } from "./confirmDematerializedFeasibilityFileByCandidate";

type FeasibilityWithDematerializedFeasibilityFile = Feasibility & {
  dematerializedFeasibilityFile: DematerializedFeasibilityFile;
};

describe("confirmDematerializedFeasibilityFileByCandidate", () => {
  let candidacy: Candidacy;
  let feasibility: FeasibilityWithDematerializedFeasibilityFile;
  let dff: DematerializedFeasibilityFile;

  beforeAll(async () => {
    await createExpertFiliereOrganism();
    await createCandidateJPL();
    candidacy = await createCandidacyUnifvae();

    feasibility = (await createFeasibilityWithDematerializedFeasibilityFile(
      candidacy.id,
    )) as FeasibilityWithDematerializedFeasibilityFile;
    dff = feasibility.dematerializedFeasibilityFile;
  });

  describe("When confirming a dematerialized feasibility file", () => {
    it("should update the file with candidate's decision comment and confirmation timestamp", async () => {
      const input = {
        candidateDecisionComment: "This is my decision comment",
      };

      const result = await confirmDematerializedFeasibilityFileByCandidate({
        dematerializedFeasibilityFileId: dff.id,
        input,
      });

      expect(result).toBeDefined();
      expect(result.candidateDecisionComment).toBe(
        input.candidateDecisionComment,
      );
      expect(result.candidateConfirmationAt).toBeDefined();
      expect(new Date(result.candidateConfirmationAt!)).toBeInstanceOf(Date);
    });

    it("should allow confirmation without a decision comment", async () => {
      const input = {
        candidateDecisionComment: "",
      };

      const result = await confirmDematerializedFeasibilityFileByCandidate({
        dematerializedFeasibilityFileId: dff.id,
        input,
      });

      expect(result).toBeDefined();
      expect(result.candidateDecisionComment).toBe("");
      expect(result.candidateConfirmationAt).toBeDefined();
    });

    it("should throw error for non-existent feasibility file", async () => {
      const input = {
        candidateDecisionComment: "",
      };

      await expect(
        confirmDematerializedFeasibilityFileByCandidate({
          dematerializedFeasibilityFileId: "non-existent-id",
          input,
        }),
      ).rejects.toThrow();
    });
  });
});
