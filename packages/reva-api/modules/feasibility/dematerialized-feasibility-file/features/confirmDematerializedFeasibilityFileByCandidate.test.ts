/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { createFeasibilityDematerializedHelper } from "../../../../test/helpers/entities/create-feasibility-dematerialized-helper";
import { confirmDematerializedFeasibilityFileByCandidate } from "./confirmDematerializedFeasibilityFileByCandidate";

describe("confirmDematerializedFeasibilityFileByCandidate", () => {
  describe("When confirming a dematerialized feasibility file", () => {
    it("should update the file with candidate's decision comment and confirmation timestamp", async () => {
      const feasibility = await createFeasibilityDematerializedHelper();
      const dematerializedFeasibilityFileId =
        feasibility.dematerializedFeasibilityFile?.id ?? "";
      const input = {
        candidateDecisionComment: "This is my decision comment",
      };

      const result = await confirmDematerializedFeasibilityFileByCandidate({
        dematerializedFeasibilityFileId,
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
      const feasibility = await createFeasibilityDematerializedHelper();
      const dematerializedFeasibilityFileId =
        feasibility.dematerializedFeasibilityFile?.id ?? "";
      const input = {
        candidateDecisionComment: "",
      };

      const result = await confirmDematerializedFeasibilityFileByCandidate({
        dematerializedFeasibilityFileId,
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
