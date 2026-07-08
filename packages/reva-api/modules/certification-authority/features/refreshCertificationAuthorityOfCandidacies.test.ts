import { randomUUID } from "crypto";

import { FeasibilityFormat, FeasibilityStatus } from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";

import { refreshCertificationAuthorityOfCandidacies } from "./refreshCertificationAuthorityOfCandidacies";

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

describe("refreshCertificationAuthorityOfCandidacies", () => {
  test("should assign the certification authority to an unassigned candidacy that uniquely matches", async () => {
    const candidacy = await createCandidacyHelper();
    const ca = await createMatchingCertificationAuthority(candidacy);

    await refreshCertificationAuthorityOfCandidacies({
      updatedCertificationAuthorityId: ca.id,
      certificationIds: [candidacy.certificationId!],
      departmentIds: [candidacy.candidate!.departmentId],
    });

    const updated = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updated?.certificationAuthorityId).toEqual(ca.id);
  });

  test("should leave the candidacy unassigned when more than one certification authority matches", async () => {
    const candidacy = await createCandidacyHelper();
    const ca = await createMatchingCertificationAuthority(candidacy);
    await createMatchingCertificationAuthority(candidacy);

    await refreshCertificationAuthorityOfCandidacies({
      updatedCertificationAuthorityId: ca.id,
      certificationIds: [candidacy.certificationId!],
      departmentIds: [candidacy.candidate!.departmentId],
    });

    const updated = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updated?.certificationAuthorityId).toBeNull();
  });

  test("should not touch a candidacy mapped to a different certification authority", async () => {
    const candidacy = await createCandidacyHelper();
    const existingCa = await createCertificationAuthorityHelper();
    await prismaClient.candidacy.update({
      where: { id: candidacy.id },
      data: { certificationAuthorityId: existingCa.id },
    });
    // A different, unrelated CA whose coverage happens to match this candidacy.
    const matchingCa = await createMatchingCertificationAuthority(candidacy);

    await refreshCertificationAuthorityOfCandidacies({
      updatedCertificationAuthorityId: matchingCa.id,
      certificationIds: [candidacy.certificationId!],
      departmentIds: [candidacy.candidate!.departmentId],
    });

    const updated = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updated?.certificationAuthorityId).toEqual(existingCa.id);
  });

  test("should not assign a candidacy whose certification or department is outside the given coverage", async () => {
    const candidacy = await createCandidacyHelper();
    const ca = await createMatchingCertificationAuthority(candidacy);

    await refreshCertificationAuthorityOfCandidacies({
      updatedCertificationAuthorityId: ca.id,
      certificationIds: [randomUUID()],
      departmentIds: [candidacy.candidate!.departmentId],
    });

    const updated = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updated?.certificationAuthorityId).toBeNull();
  });

  describe("removing a stale mapping", () => {
    test("should remove the certification authority from a candidacy currently mapped to it that no longer falls within its coverage", async () => {
      const candidacy = await createCandidacyHelper();
      const ca = await createMatchingCertificationAuthority(candidacy);
      await prismaClient.candidacy.update({
        where: { id: candidacy.id },
        data: { certificationAuthorityId: ca.id },
      });

      // Simulate the CA's coverage having shrunk (as the update mutations do
      // before calling this function): the real links no longer match.
      await prismaClient.certificationAuthorityOnCertification.deleteMany({
        where: { certificationAuthorityId: ca.id },
      });
      await prismaClient.certificationAuthorityOnDepartment.deleteMany({
        where: { certificationAuthorityId: ca.id },
      });

      await refreshCertificationAuthorityOfCandidacies({
        updatedCertificationAuthorityId: ca.id,
        certificationIds: [],
        departmentIds: [],
      });

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toBeNull();
    });

    test("should keep the certification authority on a candidacy currently mapped to it that still falls within its coverage", async () => {
      const candidacy = await createCandidacyHelper();
      const ca = await createMatchingCertificationAuthority(candidacy);
      await prismaClient.candidacy.update({
        where: { id: candidacy.id },
        data: { certificationAuthorityId: ca.id },
      });

      await refreshCertificationAuthorityOfCandidacies({
        updatedCertificationAuthorityId: ca.id,
        certificationIds: [candidacy.certificationId!],
        departmentIds: [candidacy.candidate!.departmentId],
      });

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toEqual(ca.id);
    });

    test("should not remove the certification authority from a candidacy locked by a blocking feasibility decision", async () => {
      const candidacy = await createCandidacyHelper();
      const ca = await createMatchingCertificationAuthority(candidacy);
      await prismaClient.candidacy.update({
        where: { id: candidacy.id },
        data: { certificationAuthorityId: ca.id },
      });
      await createActiveFeasibilityWithDecision(candidacy.id, "PENDING");

      // Simulate the CA's coverage having shrunk: the real links no longer match.
      await prismaClient.certificationAuthorityOnCertification.deleteMany({
        where: { certificationAuthorityId: ca.id },
      });
      await prismaClient.certificationAuthorityOnDepartment.deleteMany({
        where: { certificationAuthorityId: ca.id },
      });

      await refreshCertificationAuthorityOfCandidacies({
        updatedCertificationAuthorityId: ca.id,
        certificationIds: [],
        departmentIds: [],
      });

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toEqual(ca.id);
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
      test(`should not select a candidacy whose active feasibility decision is ${decision}`, async () => {
        const candidacy = await createCandidacyHelper();
        const ca = await createMatchingCertificationAuthority(candidacy);
        await createActiveFeasibilityWithDecision(candidacy.id, decision);

        await refreshCertificationAuthorityOfCandidacies({
          updatedCertificationAuthorityId: ca.id,
          certificationIds: [candidacy.certificationId!],
          departmentIds: [candidacy.candidate!.departmentId],
        });

        const updated = await prismaClient.candidacy.findUnique({
          where: { id: candidacy.id },
        });
        expect(updated?.certificationAuthorityId).toBeNull();
      });
    });

    test("should assign a candidacy whose active feasibility decision is INCOMPLETE", async () => {
      const candidacy = await createCandidacyHelper();
      const ca = await createMatchingCertificationAuthority(candidacy);
      await createActiveFeasibilityWithDecision(candidacy.id, "INCOMPLETE");

      await refreshCertificationAuthorityOfCandidacies({
        updatedCertificationAuthorityId: ca.id,
        certificationIds: [candidacy.certificationId!],
        departmentIds: [candidacy.candidate!.departmentId],
      });

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toEqual(ca.id);
    });
  });
});
