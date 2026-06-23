import { Prisma } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

import { graphql } from "@/modules/graphql/generated";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createFeasibilityDematerializedHelper } from "@/test/helpers/entities/create-feasibility-dematerialized-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

const sendDFFToCertificationAuthorityMutation = graphql(`
  mutation dff_sendToCertificationAuthority(
    $candidacyId: ID!
    $dematerializedFeasibilityFileId: ID!
    $certificationAuthorityId: ID!
  ) {
    dematerialized_feasibility_file_sendToCertificationAuthority(
      candidacyId: $candidacyId
      dematerializedFeasibilityFileId: $dematerializedFeasibilityFileId
      certificationAuthorityId: $certificationAuthorityId
    )
  }
`);

type CandidacyHelper = Awaited<ReturnType<typeof createCandidacyHelper>>;

const getCertificationAuthorityId = (candidacy: CandidacyHelper) =>
  candidacy.certification?.certificationAuthorityStructure
    ?.certificationAuthorityOnCertificationAuthorityStructure?.[0]
    ?.certificationAuthority?.id;

const getAapKeycloakId = (candidacy: CandidacyHelper) =>
  candidacy.organism?.organismOnAccounts?.[0]?.account?.keycloakId;

const createSwornStatementFile = async (candidacyId: string) =>
  prismaClient.file.create({
    data: {
      id: uuidV4(),
      name: "sworn-statement.pdf",
      mimeType: "application/pdf",
      path: `candidacies/${candidacyId}/dff_files/sworn-statement.pdf`,
    },
  });

const createDFFReadyToSendToCertificationAuthority = async () => {
  const candidacy = await createCandidacyHelper();
  const certificationAuthorityId = getCertificationAuthorityId(candidacy)!;

  const feasibility = await createFeasibilityDematerializedHelper({
    candidacyId: candidacy.id,
    decision: "DRAFT",
    certificationAuthorityId,
  });

  const swornStatementFile = await createSwornStatementFile(candidacy.id);

  await prismaClient.dematerializedFeasibilityFile.update({
    where: { id: feasibility.dematerializedFeasibilityFile!.id },
    data: {
      attachmentsPartComplete: true,
      certificationPartComplete: true,
      prerequisitesPartComplete: true,
      eligibilityRequirement: "PARTIAL_ELIGIBILITY_REQUIREMENT",
      swornStatementFileId: swornStatementFile.id,
      candidateConfirmationAt: new Date("2025-01-02"),
      sentToCandidateAt: new Date("2025-01-01"),
    },
  });

  return { candidacy, feasibility, certificationAuthorityId };
};

const getAapClient = (candidacy: CandidacyHelper) =>
  getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: getAapKeycloakId(candidacy)!,
      }),
    },
  });

type DFFNotReadyTestCase = {
  label: string;
  data: Prisma.DematerializedFeasibilityFileUpdateInput;
};

describe("Envoi du dossier de faisabilité dématérialisé au certificateur par l'AAP", () => {
  test("devrait réussir quand le dossier remplit toutes les conditions d'envoi", async () => {
    const { candidacy, feasibility, certificationAuthorityId } =
      await createDFFReadyToSendToCertificationAuthority();

    const client = getAapClient(candidacy);

    const result = await client.request(
      sendDFFToCertificationAuthorityMutation,
      {
        candidacyId: candidacy.id,
        dematerializedFeasibilityFileId:
          feasibility.dematerializedFeasibilityFile!.id,
        certificationAuthorityId,
      },
    );

    expect(
      result.dematerialized_feasibility_file_sendToCertificationAuthority,
    ).toBe("Ok");

    const updatedFeasibility = await prismaClient.feasibility.findFirst({
      where: { candidacyId: candidacy.id, isActive: true },
    });

    expect(updatedFeasibility?.decision).toBe("PENDING");
    expect(updatedFeasibility?.feasibilityFileSentAt).not.toBeNull();
    expect(updatedFeasibility?.certificationAuthorityId).toBe(
      certificationAuthorityId,
    );

    const updatedCandidacy = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updatedCandidacy?.status).toBe("DOSSIER_FAISABILITE_ENVOYE");
  });

  describe("devrait échouer quand le dossier n'est pas prêt à être envoyé", () => {
    test.each<DFFNotReadyTestCase>([
      {
        label: "attachmentsPartComplete est false",
        data: { attachmentsPartComplete: false },
      },
      {
        label: "swornStatementFileId est null",
        data: { swornStatementFileId: null },
      },
      {
        label: "candidateConfirmationAt est null",
        data: { candidateConfirmationAt: null },
      },
      {
        label: "eligibilityRequirement est null",
        data: { eligibilityRequirement: null },
      },
    ])("$label", async ({ data }: DFFNotReadyTestCase) => {
      const { candidacy, feasibility, certificationAuthorityId } =
        await createDFFReadyToSendToCertificationAuthority();

      await prismaClient.dematerializedFeasibilityFile.update({
        where: { id: feasibility.dematerializedFeasibilityFile!.id },
        data,
      });

      const client = getAapClient(candidacy);

      await expect(
        client.request(sendDFFToCertificationAuthorityMutation, {
          candidacyId: candidacy.id,
          dematerializedFeasibilityFileId:
            feasibility.dematerializedFeasibilityFile!.id,
          certificationAuthorityId,
        }),
      ).rejects.toThrowError(
        "Le dossier de faisabilité n'est pas prêt à être envoyé au certificateur",
      );
    });
  });
});
