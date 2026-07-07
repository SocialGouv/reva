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
    await createMatchingCertificationAuthority(candidacy);
    await createMatchingCertificationAuthority(candidacy);

    await refreshCertificationAuthorityOfCandidacies({
      certificationIds: [candidacy.certificationId!],
      departmentIds: [candidacy.candidate!.departmentId],
    });

    const updated = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updated?.certificationAuthorityId).toBeNull();
  });

  test("should not touch a candidacy that already has a certification authority, even if it no longer matches", async () => {
    const candidacy = await createCandidacyHelper();
    const existingCa = await createCertificationAuthorityHelper();
    await prismaClient.candidacy.update({
      where: { id: candidacy.id },
      data: { certificationAuthorityId: existingCa.id },
    });
    // A different, unrelated CA whose coverage happens to match this candidacy.
    await createMatchingCertificationAuthority(candidacy);

    await refreshCertificationAuthorityOfCandidacies({
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
    await createMatchingCertificationAuthority(candidacy);

    await refreshCertificationAuthorityOfCandidacies({
      certificationIds: [randomUUID()],
      departmentIds: [candidacy.candidate!.departmentId],
    });

    const updated = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updated?.certificationAuthorityId).toBeNull();
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
        await createMatchingCertificationAuthority(candidacy);
        await createActiveFeasibilityWithDecision(candidacy.id, decision);

        await refreshCertificationAuthorityOfCandidacies({
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
