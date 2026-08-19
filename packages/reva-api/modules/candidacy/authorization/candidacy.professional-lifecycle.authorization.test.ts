import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";
import { format } from "date-fns";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createDropOutReasonHelper } from "@/test/helpers/entities/create-drop-out-reason-helper";
import {
  attachCollaborateurAccountToOrganism,
  createOrganismHelper,
} from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const candidacy_unarchiveById = graphql(`
  mutation candidacy_unarchiveById_authorization($candidacyId: ID!) {
    candidacy_unarchiveById(candidacyId: $candidacyId) {
      id
      status
    }
  }
`);

const candidacy_submitTypologyForm = graphql(`
  mutation candidacy_submitTypologyForm_authorization(
    $candidacyId: ID!
    $typology: CandidateTypology!
  ) {
    candidacy_submitTypologyForm(
      candidacyId: $candidacyId
      typology: $typology
    ) {
      id
      typology
    }
  }
`);

const candidacy_dropOut = graphql(`
  mutation candidacy_dropOut_authorization(
    $candidacyId: UUID!
    $dropOut: DropOutInput!
  ) {
    candidacy_dropOut(candidacyId: $candidacyId, dropOut: $dropOut) {
      id
    }
  }
`);

const candidacy_submitEndAccompagnement = graphql(`
  mutation candidacy_submitEndAccompagnement_authorization(
    $candidacyId: UUID!
    $endAccompagnementDate: Timestamp!
    $endAccompagnementReason: EndAccompagnementReason!
  ) {
    candidacy_submitEndAccompagnement(
      candidacyId: $candidacyId
      endAccompagnementDate: $endAccompagnementDate
      endAccompagnementReason: $endAccompagnementReason
    ) {
      id
      endAccompagnementStatus
    }
  }
`);

const candidacy_archiveById = graphql(`
  mutation candidacy_archiveById_authorization(
    $candidacyId: ID!
    $archivingReason: CandidacyArchivingReason!
  ) {
    candidacy_archiveById(
      candidacyId: $candidacyId
      archivingReason: $archivingReason
    ) {
      id
      status
    }
  }
`);

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const getClient = (authorization?: string) =>
  getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

const unarchive = (authorization: string | undefined, candidacyId: string) =>
  getClient(authorization).request(candidacy_unarchiveById, { candidacyId });

const submitTypology = (
  authorization: string | undefined,
  candidacyId: string,
  typology: "BENEVOLE" | "RETRAITE" = "BENEVOLE",
) =>
  getClient(authorization).request(candidacy_submitTypologyForm, {
    candidacyId,
    typology,
  });

const dropOut = (
  authorization: string | undefined,
  candidacyId: string,
  dropOutReasonId = faker.string.uuid(),
) =>
  getClient(authorization).request(candidacy_dropOut, {
    candidacyId,
    dropOut: { dropOutReasonId },
  });

const submitEndAccompagnement = (
  authorization: string | undefined,
  candidacyId: string,
  endAccompagnementDate = faker.date.past(),
) =>
  getClient(authorization).request(candidacy_submitEndAccompagnement, {
    candidacyId,
    endAccompagnementDate: format(endAccompagnementDate, "yyyy-MM-dd"),
    endAccompagnementReason: "CONTRAT_ACCOMPAGNEMENT_TERMINE",
  });

const archive = (authorization: string | undefined, candidacyId: string) =>
  getClient(authorization).request(candidacy_archiveById, {
    candidacyId,
    archivingReason: "INACTIVITE_CANDIDAT",
  });

const createForeignAapAuthorization = async () => {
  const organism = await createOrganismHelper();
  return asRole(
    "manage_candidacy",
    organism.organismOnAccounts[0].account.keycloakId,
  );
};

const createForeignMaisonMereManagerAuthorization = async () => {
  const organism = await createOrganismHelper();
  const manager = organism.maisonMereAAP!.gestionnaire;
  await attachCollaborateurAccountToOrganism({
    organismId: organism.id,
    collaborateurAccountId: manager.id,
  });
  return asRole("gestion_maison_mere_aap", manager.keycloakId);
};

interface MutationCase {
  operationName: string;
  request: (
    authorization: string | undefined,
    candidacyId: string,
  ) => Promise<unknown>;
}

const adminOrCompanionMutationCases: MutationCase[] = [
  {
    operationName: "candidacy_unarchiveById",
    request: unarchive,
  },
  {
    operationName: "candidacy_submitTypologyForm",
    request: submitTypology,
  },
  {
    operationName: "candidacy_dropOut",
    request: dropOut,
  },
  {
    operationName: "candidacy_submitEndAccompagnement",
    request: submitEndAccompagnement,
  },
];

const unsupportedProfessionalRoles: KeyCloakUserRole[] = [
  "manage_feasibility",
  "manage_certification_authority_local_account",
  "manage_certification_registry",
  "manage_vae_collective",
];

describe("candidacy lifecycle resolver authorization", () => {
  describe("admin or candidacy companion mutations", () => {
    describe.each(adminOrCompanionMutationCases)(
      "$operationName",
      (mutationCase: MutationCase) => {
        const { request } = mutationCase;

        test("rejects a random AAP for a candidacy outside its scope", async () => {
          const candidacy = await createCandidacyHelper();
          await expect(
            request(await createForeignAapAuthorization(), candidacy.id),
          ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
        });

        test("rejects a maison mere manager from another maison mere", async () => {
          const candidacy = await createCandidacyHelper();
          await expect(
            request(
              await createForeignMaisonMereManagerAuthorization(),
              candidacy.id,
            ),
          ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
        });

        test.each<KeyCloakUserRole>([
          "candidate",
          ...unsupportedProfessionalRoles,
        ])("rejects the %s role", async (role: KeyCloakUserRole) => {
          await expect(
            request(asRole(role), faker.string.uuid()),
          ).rejects.toThrowError(NOT_AUTHORIZED);
        });

        test("rejects an unauthenticated request", async () => {
          await expect(
            request(undefined, faker.string.uuid()),
          ).rejects.toThrowError(SESSION_EXPIRED);
        });
      },
    );

    test("allows an admin to unarchive the candidacy", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });
      await prismaClient.candidacy.update({
        where: { id: candidacy.id },
        data: {
          status: "ARCHIVE",
          candidacyStatuses: { create: { status: "ARCHIVE" } },
        },
      });

      const response = await unarchive(asRole("admin"), candidacy.id);

      expect(response.candidacy_unarchiveById).toMatchObject({
        id: candidacy.id,
        status: "PROJET",
      });
    });

    test("allows the AAP associated to the candidacy to unarchive it", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;
      await prismaClient.candidacy.update({
        where: { id: candidacy.id },
        data: {
          status: "ARCHIVE",
          candidacyStatuses: { create: { status: "ARCHIVE" } },
        },
      });

      const response = await unarchive(
        asRole("manage_candidacy", aapKeycloakId),
        candidacy.id,
      );

      expect(response.candidacy_unarchiveById).toMatchObject({
        id: candidacy.id,
        status: "PROJET",
      });
    });

    test("allows the maison mere manager of the AAP associated to the candidacy to unarchive it", async () => {
      const organism = await createOrganismHelper();
      const maisonMereAAP = organism.maisonMereAAP!;
      const siblingOrganism = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });
      await attachCollaborateurAccountToOrganism({
        organismId: siblingOrganism.id,
        collaborateurAccountId: maisonMereAAP.gestionnaire.id,
      });
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
        candidacyArgs: { organismId: organism.id },
      });
      await prismaClient.candidacy.update({
        where: { id: candidacy.id },
        data: {
          status: "ARCHIVE",
          candidacyStatuses: { create: { status: "ARCHIVE" } },
        },
      });

      const response = await unarchive(
        asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        candidacy.id,
      );

      expect(response.candidacy_unarchiveById).toMatchObject({
        id: candidacy.id,
        status: "PROJET",
      });
    });

    test("allows an admin to update the candidacy typology", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await submitTypology(
        asRole("admin"),
        candidacy.id,
        "RETRAITE",
      );

      expect(response.candidacy_submitTypologyForm).toMatchObject({
        id: candidacy.id,
        typology: "RETRAITE",
      });
    });

    test("allows the AAP associated to the candidacy to update its typology", async () => {
      const candidacy = await createCandidacyHelper();
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;

      const response = await submitTypology(
        asRole("manage_candidacy", aapKeycloakId),
        candidacy.id,
        "RETRAITE",
      );

      expect(response.candidacy_submitTypologyForm).toMatchObject({
        id: candidacy.id,
        typology: "RETRAITE",
      });
    });

    test("allows the maison mere manager of the AAP associated to the candidacy to update its typology", async () => {
      const organism = await createOrganismHelper();
      const maisonMereAAP = organism.maisonMereAAP!;
      const siblingOrganism = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });
      await attachCollaborateurAccountToOrganism({
        organismId: siblingOrganism.id,
        collaborateurAccountId: maisonMereAAP.gestionnaire.id,
      });
      const candidacy = await createCandidacyHelper({
        candidacyArgs: { organismId: organism.id },
      });

      const response = await submitTypology(
        asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        candidacy.id,
        "RETRAITE",
      );

      expect(response.candidacy_submitTypologyForm).toMatchObject({
        id: candidacy.id,
        typology: "RETRAITE",
      });
    });

    test("allows an admin to drop out the candidacy", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus:
          CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
      });
      const dropOutReason = await createDropOutReasonHelper();

      await dropOut(asRole("admin"), candidacy.id, dropOutReason.id);

      expect(
        await prismaClient.candidacyDropOut.findUnique({
          where: { candidacyId: candidacy.id },
        }),
      ).not.toBeNull();
    });

    test("allows the AAP associated to the candidacy to drop it out", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus:
          CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
      });
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;
      const dropOutReason = await createDropOutReasonHelper();

      await dropOut(
        asRole("manage_candidacy", aapKeycloakId),
        candidacy.id,
        dropOutReason.id,
      );

      expect(
        await prismaClient.candidacyDropOut.findUnique({
          where: { candidacyId: candidacy.id },
        }),
      ).not.toBeNull();
    });

    test("allows the maison mere manager of the AAP associated to the candidacy to drop it out", async () => {
      const organism = await createOrganismHelper();
      const maisonMereAAP = organism.maisonMereAAP!;
      const siblingOrganism = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });
      await attachCollaborateurAccountToOrganism({
        organismId: siblingOrganism.id,
        collaborateurAccountId: maisonMereAAP.gestionnaire.id,
      });
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus:
          CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
        candidacyArgs: { organismId: organism.id },
      });
      const dropOutReason = await createDropOutReasonHelper();

      await dropOut(
        asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        candidacy.id,
        dropOutReason.id,
      );

      expect(
        await prismaClient.candidacyDropOut.findUnique({
          where: { candidacyId: candidacy.id },
        }),
      ).not.toBeNull();
    });

    test("allows an admin to submit the end of support", async () => {
      const candidacy = await createCandidacyHelper();
      const endAccompagnementDate = faker.date.past();

      const response = await submitEndAccompagnement(
        asRole("admin"),
        candidacy.id,
        endAccompagnementDate,
      );

      expect(response.candidacy_submitEndAccompagnement).toMatchObject({
        id: candidacy.id,
        endAccompagnementStatus: "PENDING",
      });
    });

    test("allows the AAP associated to the candidacy to submit its end of support", async () => {
      const candidacy = await createCandidacyHelper();
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;
      const endAccompagnementDate = faker.date.past();

      const response = await submitEndAccompagnement(
        asRole("manage_candidacy", aapKeycloakId),
        candidacy.id,
        endAccompagnementDate,
      );

      expect(response.candidacy_submitEndAccompagnement).toMatchObject({
        id: candidacy.id,
        endAccompagnementStatus: "PENDING",
      });
    });

    test("allows the maison mere manager of the AAP associated to the candidacy to submit its end of support", async () => {
      const organism = await createOrganismHelper();
      const maisonMereAAP = organism.maisonMereAAP!;
      const siblingOrganism = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });
      await attachCollaborateurAccountToOrganism({
        organismId: siblingOrganism.id,
        collaborateurAccountId: maisonMereAAP.gestionnaire.id,
      });
      const candidacy = await createCandidacyHelper({
        candidacyArgs: { organismId: organism.id },
      });
      const endAccompagnementDate = faker.date.past();

      const response = await submitEndAccompagnement(
        asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        candidacy.id,
        endAccompagnementDate,
      );

      expect(response.candidacy_submitEndAccompagnement).toMatchObject({
        id: candidacy.id,
        endAccompagnementStatus: "PENDING",
      });
    });
  });

  describe("candidacy_archiveById", () => {
    test("allows an admin to archive the candidacy", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await archive(asRole("admin"), candidacy.id);

      expect(response.candidacy_archiveById.id).toBe(candidacy.id);
    });

    test("allows the candidate owning the candidacy to archive it", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await archive(
        asRole("candidate", candidacy.candidate!.keycloakId),
        candidacy.id,
      );

      expect(response.candidacy_archiveById.id).toBe(candidacy.id);
    });

    test("allows the AAP associated to the candidacy to archive it", async () => {
      const candidacy = await createCandidacyHelper();
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;

      const response = await archive(
        asRole("manage_candidacy", aapKeycloakId),
        candidacy.id,
      );

      expect(response.candidacy_archiveById.id).toBe(candidacy.id);
    });

    test("allows the maison mere manager of the AAP associated to the candidacy to archive it", async () => {
      const organism = await createOrganismHelper();
      const maisonMereAAP = organism.maisonMereAAP!;
      const siblingOrganism = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });
      await attachCollaborateurAccountToOrganism({
        organismId: siblingOrganism.id,
        collaborateurAccountId: maisonMereAAP.gestionnaire.id,
      });
      const candidacy = await createCandidacyHelper({
        candidacyArgs: { organismId: organism.id },
      });

      const response = await archive(
        asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        candidacy.id,
      );

      expect(response.candidacy_archiveById.id).toBe(candidacy.id);
    });

    test("rejects a random candidate for a candidacy they do not own", async () => {
      const candidacy = await createCandidacyHelper();
      const randomCandidate = await createCandidateHelper();

      await expect(
        archive(asRole("candidate", randomCandidate.keycloakId), candidacy.id),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    });

    test("rejects a random AAP for a candidacy outside its scope", async () => {
      const candidacy = await createCandidacyHelper();
      await expect(
        archive(await createForeignAapAuthorization(), candidacy.id),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
    });

    test("rejects a maison mere manager from another maison mere", async () => {
      const candidacy = await createCandidacyHelper();
      await expect(
        archive(
          await createForeignMaisonMereManagerAuthorization(),
          candidacy.id,
        ),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
    });

    test.each(unsupportedProfessionalRoles)(
      "rejects the %s role",
      async (role: KeyCloakUserRole) => {
        await expect(
          archive(asRole(role), faker.string.uuid()),
        ).rejects.toThrowError(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request", async () => {
      await expect(
        archive(undefined, faker.string.uuid()),
      ).rejects.toThrowError(SESSION_EXPIRED);
    });
  });
});
