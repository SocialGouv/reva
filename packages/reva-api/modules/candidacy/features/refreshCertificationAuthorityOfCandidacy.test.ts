import { FeasibilityFormat, FeasibilityStatus } from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";

import { refreshCertificationAuthorityOfCandidacy } from "./refreshCertificationAuthorityOfCandidacy";

type Candidacy = Awaited<ReturnType<typeof createCandidacyHelper>>;

const createMatchingCertificationAuthority = (candidacy: Candidacy) =>
  createCertificationAuthorityHelper({
    certificationAuthorityOnCertification: {
      create: { certificationId: candidacy.certificationId! },
    },
    certificationAuthorityOnDepartment: {
      create: { departmentId: candidacy.candidate!.departmentId },
    },
  });

const createActiveFeasibilityWithDecision = (
  candidacyId: string,
  decision: FeasibilityStatus,
) =>
  prismaClient.feasibility.create({
    data: {
      candidacyId,
      feasibilityFormat: FeasibilityFormat.UPLOADED_PDF,
      decision,
      isActive: true,
    },
  });

describe("refreshCertificationAuthorityOfCandidacy", () => {
  describe("CA selection logic", () => {
    test("should set certificationAuthorityId when exactly one CA matches", async () => {
      const candidacy = await createCandidacyHelper();
      const ca = await createMatchingCertificationAuthority(candidacy);

      await refreshCertificationAuthorityOfCandidacy({
        candidacyId: candidacy.id,
      });

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toEqual(ca.id);
    });

    test("should set certificationAuthorityId to null when no CA matches", async () => {
      const candidacy = await createCandidacyHelper();
      // Set a CA directly to verify the refresh clears it when no match is found
      const unrelatedCa = await createCertificationAuthorityHelper();
      await prismaClient.candidacy.update({
        where: { id: candidacy.id },
        data: { certificationAuthorityId: unrelatedCa.id },
      });

      await refreshCertificationAuthorityOfCandidacy({
        candidacyId: candidacy.id,
      });

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toBeNull();
    });

    test("should set certificationAuthorityId to null when multiple CAs match", async () => {
      const candidacy = await createCandidacyHelper();
      await createMatchingCertificationAuthority(candidacy);
      await createMatchingCertificationAuthority(candidacy);

      await refreshCertificationAuthorityOfCandidacy({
        candidacyId: candidacy.id,
      });

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toBeNull();
    });
  });

  describe("feasibility decision guard", () => {
    const blockingDecisions: FeasibilityStatus[] = [
      "PENDING",
      "REJECTED",
      "ADMISSIBLE",
      "COMPLETE",
    ];

    blockingDecisions.forEach((decision) => {
      test(`should not update certificationAuthorityId when feasibility decision is ${decision}`, async () => {
        const candidacy = await createCandidacyHelper();
        const ca = await createMatchingCertificationAuthority(candidacy);
        await prismaClient.candidacy.update({
          where: { id: candidacy.id },
          data: { certificationAuthorityId: ca.id },
        });
        await createActiveFeasibilityWithDecision(candidacy.id, decision);

        await refreshCertificationAuthorityOfCandidacy({
          candidacyId: candidacy.id,
        });

        const updated = await prismaClient.candidacy.findUnique({
          where: { id: candidacy.id },
        });
        expect(updated?.certificationAuthorityId).toEqual(ca.id);
      });
    });

    test("should update certificationAuthorityId when feasibility decision is INCOMPLETE", async () => {
      const candidacy = await createCandidacyHelper();
      const ca = await createMatchingCertificationAuthority(candidacy);
      await createActiveFeasibilityWithDecision(candidacy.id, "INCOMPLETE");

      await refreshCertificationAuthorityOfCandidacy({
        candidacyId: candidacy.id,
      });

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toEqual(ca.id);
    });

    test("should update certificationAuthorityId when no feasibility exists", async () => {
      const candidacy = await createCandidacyHelper();
      const ca = await createMatchingCertificationAuthority(candidacy);

      await refreshCertificationAuthorityOfCandidacy({
        candidacyId: candidacy.id,
      });

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toEqual(ca.id);
    });
  });
});
