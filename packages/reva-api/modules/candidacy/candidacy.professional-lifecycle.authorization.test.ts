import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

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
import { injectGraphql } from "@/test/helpers/graphql-helper";

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const mutation = ({
  endpoint,
  authorization,
  arguments: mutationArguments,
  enumFields,
  returnFields,
}: {
  endpoint: string;
  authorization?: string;
  arguments?: Record<string, unknown>;
  enumFields?: string[];
  returnFields: string;
}) =>
  injectGraphql({
    fastify: global.testApp,
    authorization,
    payload: {
      requestType: "mutation",
      endpoint,
      arguments: mutationArguments,
      enumFields,
      returnFields,
    },
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
  endpoint: string;
  buildArguments: (candidacyId: string) => Record<string, unknown>;
  enumFields?: string[];
  returnFields: string;
}

const adminOrCompanionMutationCases: MutationCase[] = [
  {
    endpoint: "candidacy_unarchiveById",
    buildArguments: (candidacyId) => ({ candidacyId }),
    returnFields: "{ id }",
  },
  {
    endpoint: "candidacy_submitTypologyForm",
    buildArguments: (candidacyId) => ({ candidacyId, typology: "BENEVOLE" }),
    enumFields: ["typology"],
    returnFields: "{ id }",
  },
  {
    endpoint: "candidacy_dropOut",
    buildArguments: (candidacyId) => ({
      candidacyId,
      dropOut: { dropOutReasonId: faker.string.uuid() },
    }),
    returnFields: "{ id }",
  },
  {
    endpoint: "candidacy_submitEndAccompagnement",
    buildArguments: (candidacyId) => ({
      candidacyId,
      endAccompagnementDate: faker.date.past(),
      endAccompagnementReason: "CONTRAT_ACCOMPAGNEMENT_TERMINE",
    }),
    enumFields: ["endAccompagnementReason"],
    returnFields: "{ id }",
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
      "$endpoint",
      (mutationCase: MutationCase) => {
        const { endpoint, buildArguments, enumFields, returnFields } =
          mutationCase;

        test("rejects a random AAP for a candidacy outside its scope", async () => {
          const candidacy = await createCandidacyHelper();
          const response = await mutation({
            endpoint,
            authorization: await createForeignAapAuthorization(),
            arguments: buildArguments(candidacy.id),
            enumFields,
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(
            NOT_AUTHORIZED_CANDIDACY_MANAGE,
          );
        });

        test("rejects a maison mere manager from another maison mere", async () => {
          const candidacy = await createCandidacyHelper();
          const response = await mutation({
            endpoint,
            authorization: await createForeignMaisonMereManagerAuthorization(),
            arguments: buildArguments(candidacy.id),
            enumFields,
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(
            NOT_AUTHORIZED_CANDIDACY_MANAGE,
          );
        });

        test.each<KeyCloakUserRole>([
          "candidate",
          ...unsupportedProfessionalRoles,
        ])("rejects the %s role", async (role: KeyCloakUserRole) => {
          const response = await mutation({
            endpoint,
            authorization: asRole(role),
            arguments: buildArguments(faker.string.uuid()),
            enumFields,
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
        });

        test("rejects an unauthenticated request", async () => {
          const response = await mutation({
            endpoint,
            arguments: buildArguments(faker.string.uuid()),
            enumFields,
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
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

      const response = await mutation({
        endpoint: "candidacy_unarchiveById",
        authorization: asRole("admin"),
        arguments: { candidacyId: candidacy.id },
        returnFields: "{ id status }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_unarchiveById).toMatchObject({
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

      const response = await mutation({
        endpoint: "candidacy_unarchiveById",
        authorization: asRole("manage_candidacy", aapKeycloakId),
        arguments: { candidacyId: candidacy.id },
        returnFields: "{ id status }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_unarchiveById).toMatchObject({
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

      const response = await mutation({
        endpoint: "candidacy_unarchiveById",
        authorization: asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        arguments: { candidacyId: candidacy.id },
        returnFields: "{ id status }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_unarchiveById).toMatchObject({
        id: candidacy.id,
        status: "PROJET",
      });
    });

    test("allows an admin to update the candidacy typology", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await mutation({
        endpoint: "candidacy_submitTypologyForm",
        authorization: asRole("admin"),
        arguments: { candidacyId: candidacy.id, typology: "RETRAITE" },
        enumFields: ["typology"],
        returnFields: "{ id typology }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_submitTypologyForm).toMatchObject({
        id: candidacy.id,
        typology: "RETRAITE",
      });
    });

    test("allows the AAP associated to the candidacy to update its typology", async () => {
      const candidacy = await createCandidacyHelper();
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;

      const response = await mutation({
        endpoint: "candidacy_submitTypologyForm",
        authorization: asRole("manage_candidacy", aapKeycloakId),
        arguments: { candidacyId: candidacy.id, typology: "RETRAITE" },
        enumFields: ["typology"],
        returnFields: "{ id typology }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_submitTypologyForm).toMatchObject({
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

      const response = await mutation({
        endpoint: "candidacy_submitTypologyForm",
        authorization: asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        arguments: { candidacyId: candidacy.id, typology: "RETRAITE" },
        enumFields: ["typology"],
        returnFields: "{ id typology }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_submitTypologyForm).toMatchObject({
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

      const response = await mutation({
        endpoint: "candidacy_dropOut",
        authorization: asRole("admin"),
        arguments: {
          candidacyId: candidacy.id,
          dropOut: { dropOutReasonId: dropOutReason.id },
        },
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
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

      const response = await mutation({
        endpoint: "candidacy_dropOut",
        authorization: asRole("manage_candidacy", aapKeycloakId),
        arguments: {
          candidacyId: candidacy.id,
          dropOut: { dropOutReasonId: dropOutReason.id },
        },
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
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

      const response = await mutation({
        endpoint: "candidacy_dropOut",
        authorization: asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        arguments: {
          candidacyId: candidacy.id,
          dropOut: { dropOutReasonId: dropOutReason.id },
        },
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        await prismaClient.candidacyDropOut.findUnique({
          where: { candidacyId: candidacy.id },
        }),
      ).not.toBeNull();
    });

    test("allows an admin to submit the end of support", async () => {
      const candidacy = await createCandidacyHelper();
      const endAccompagnementDate = faker.date.past();

      const response = await mutation({
        endpoint: "candidacy_submitEndAccompagnement",
        authorization: asRole("admin"),
        arguments: {
          candidacyId: candidacy.id,
          endAccompagnementDate,
          endAccompagnementReason: "CONTRAT_ACCOMPAGNEMENT_TERMINE",
        },
        enumFields: ["endAccompagnementReason"],
        returnFields: "{ id endAccompagnementStatus }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_submitEndAccompagnement,
      ).toMatchObject({
        id: candidacy.id,
        endAccompagnementStatus: "PENDING",
      });
    });

    test("allows the AAP associated to the candidacy to submit its end of support", async () => {
      const candidacy = await createCandidacyHelper();
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;
      const endAccompagnementDate = faker.date.past();

      const response = await mutation({
        endpoint: "candidacy_submitEndAccompagnement",
        authorization: asRole("manage_candidacy", aapKeycloakId),
        arguments: {
          candidacyId: candidacy.id,
          endAccompagnementDate,
          endAccompagnementReason: "CONTRAT_ACCOMPAGNEMENT_TERMINE",
        },
        enumFields: ["endAccompagnementReason"],
        returnFields: "{ id endAccompagnementStatus }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_submitEndAccompagnement,
      ).toMatchObject({
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

      const response = await mutation({
        endpoint: "candidacy_submitEndAccompagnement",
        authorization: asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        arguments: {
          candidacyId: candidacy.id,
          endAccompagnementDate,
          endAccompagnementReason: "CONTRAT_ACCOMPAGNEMENT_TERMINE",
        },
        enumFields: ["endAccompagnementReason"],
        returnFields: "{ id endAccompagnementStatus }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_submitEndAccompagnement,
      ).toMatchObject({
        id: candidacy.id,
        endAccompagnementStatus: "PENDING",
      });
    });
  });

  describe("candidacy_archiveById", () => {
    const endpoint = "candidacy_archiveById";
    const buildArguments = (candidacyId: string) => ({
      candidacyId,
      archivingReason: "INACTIVITE_CANDIDAT",
    });
    const enumFields = ["archivingReason"];
    const returnFields = "{ id status }";

    test("allows an admin to archive the candidacy", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await mutation({
        endpoint,
        authorization: asRole("admin"),
        arguments: buildArguments(candidacy.id),
        enumFields,
        returnFields,
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data[endpoint].id).toBe(candidacy.id);
    });

    test("allows the candidate owning the candidacy to archive it", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await mutation({
        endpoint,
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        arguments: buildArguments(candidacy.id),
        enumFields,
        returnFields,
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data[endpoint].id).toBe(candidacy.id);
    });

    test("allows the AAP associated to the candidacy to archive it", async () => {
      const candidacy = await createCandidacyHelper();
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;

      const response = await mutation({
        endpoint,
        authorization: asRole("manage_candidacy", aapKeycloakId),
        arguments: buildArguments(candidacy.id),
        enumFields,
        returnFields,
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data[endpoint].id).toBe(candidacy.id);
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

      const response = await mutation({
        endpoint,
        authorization: asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        arguments: buildArguments(candidacy.id),
        enumFields,
        returnFields,
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data[endpoint].id).toBe(candidacy.id);
    });

    test("rejects a random candidate for a candidacy they do not own", async () => {
      const candidacy = await createCandidacyHelper();
      const randomCandidate = await createCandidateHelper();

      const response = await mutation({
        endpoint,
        authorization: asRole("candidate", randomCandidate.keycloakId),
        arguments: buildArguments(candidacy.id),
        enumFields,
        returnFields,
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_ACCESS,
      );
    });

    test("rejects a random AAP for a candidacy outside its scope", async () => {
      const candidacy = await createCandidacyHelper();
      const response = await mutation({
        endpoint,
        authorization: await createForeignAapAuthorization(),
        arguments: buildArguments(candidacy.id),
        enumFields,
        returnFields,
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_MANAGE,
      );
    });

    test("rejects a maison mere manager from another maison mere", async () => {
      const candidacy = await createCandidacyHelper();
      const response = await mutation({
        endpoint,
        authorization: await createForeignMaisonMereManagerAuthorization(),
        arguments: buildArguments(candidacy.id),
        enumFields,
        returnFields,
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_MANAGE,
      );
    });

    test.each(unsupportedProfessionalRoles)(
      "rejects the %s role",
      async (role: KeyCloakUserRole) => {
        const response = await mutation({
          endpoint,
          authorization: asRole(role),
          arguments: buildArguments(faker.string.uuid()),
          enumFields,
          returnFields,
        });

        expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request", async () => {
      const response = await mutation({
        endpoint,
        arguments: buildArguments(faker.string.uuid()),
        enumFields,
        returnFields,
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });
});
