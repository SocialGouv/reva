import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import { CANDIDATURE_NON_TROUVEE } from "@/modules/shared/errors/messages";
import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
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

const unsupportedCandidateWriteRoles: KeyCloakUserRole[] = [
  "manage_candidacy",
  "gestion_maison_mere_aap",
  "manage_feasibility",
  "manage_certification_authority_local_account",
  "manage_certification_registry",
  "manage_vae_collective",
];

interface OwnerMutationCase {
  endpoint: string;
  buildArguments: (candidacyId: string) => Record<string, unknown>;
  enumFields?: string[];
  returnFields: string;
  adminBusinessError: (candidacyId: string) => string;
}

describe("candidacy candidate-side resolver authorization", () => {
  describe("candidacy fields owned by the candidate", () => {
    const ownerMutationCases: OwnerMutationCase[] = [
      {
        endpoint: "candidacy_updateGoals",
        buildArguments: (candidacyId: string) => ({ candidacyId, goals: [] }),
        returnFields: "",
        adminBusinessError: (candidacyId: string) =>
          `Candidature ${candidacyId} non trouvée`,
      },
      {
        endpoint: "candidacy_submitCandidacy",
        buildArguments: (candidacyId: string) => ({ candidacyId }),
        returnFields: "{ id }",
        adminBusinessError: () => CANDIDATURE_NON_TROUVEE,
      },
      {
        endpoint: "candidacy_updateTypeAccompagnement",
        buildArguments: (candidacyId: string) => ({
          candidacyId,
          typeAccompagnement: "AUTONOME",
        }),
        enumFields: ["typeAccompagnement"],
        returnFields: "{ id }",
        adminBusinessError: () => CANDIDATURE_NON_TROUVEE,
      },
      {
        endpoint: "candidacy_updateCandidateCandidacyDropoutDecision",
        buildArguments: (candidacyId: string) => ({
          candidacyId,
          dropOutConfirmed: true,
        }),
        returnFields: "{ id }",
        adminBusinessError: () => "Aucun abandon trouvé pour cette candidature",
      },
      {
        endpoint: "candidacy_updateCandidacyEndAccompagnementDecision",
        buildArguments: (candidacyId: string) => ({
          candidacyId,
          endAccompagnement: true,
        }),
        returnFields: "{ id }",
        adminBusinessError: () => CANDIDATURE_NON_TROUVEE,
      },
      {
        endpoint: "candidacy_markFeasibilityFileResourceFirstAsRead",
        buildArguments: (candidacyId: string) => ({ candidacyId }),
        returnFields: "{ id }",
        adminBusinessError: () => CANDIDATURE_NON_TROUVEE,
      },
    ];

    describe.each(ownerMutationCases)(
      "$endpoint",
      (mutationCase: OwnerMutationCase) => {
        const {
          endpoint,
          buildArguments,
          enumFields,
          returnFields,
          adminBusinessError,
        } = mutationCase;
        test("allows an admin to request the candidacy action", async () => {
          const candidacyId = faker.string.uuid();

          const response = await mutation({
            endpoint,
            authorization: asRole("admin"),
            arguments: buildArguments(candidacyId),
            enumFields,
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(
            adminBusinessError(candidacyId),
          );
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

        test.each(unsupportedCandidateWriteRoles)(
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
      },
    );

    test("allows an admin to select an organism for any candidacy", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });
      const organism = await createOrganismHelper();

      const response = await mutation({
        endpoint: "candidacy_selectOrganism",
        authorization: asRole("admin"),
        arguments: { candidacyId: candidacy.id, organismId: organism.id },
        returnFields: "{ id organismId }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_selectOrganism).toMatchObject({
        id: candidacy.id,
        organismId: organism.id,
      });
    });

    test("allows the candidate owning the candidacy to select an organism", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });
      const organism = await createOrganismHelper();

      const response = await mutation({
        endpoint: "candidacy_selectOrganism",
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        arguments: { candidacyId: candidacy.id, organismId: organism.id },
        returnFields: "{ id organismId }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_selectOrganism).toMatchObject({
        id: candidacy.id,
        organismId: organism.id,
      });
    });

    test("rejects a random candidate selecting an organism for a candidacy they do not own", async () => {
      const candidacy = await createCandidacyHelper();
      const randomCandidate = await createCandidateHelper();

      const response = await mutation({
        endpoint: "candidacy_selectOrganism",
        authorization: asRole("candidate", randomCandidate.keycloakId),
        arguments: {
          candidacyId: candidacy.id,
          organismId: faker.string.uuid(),
        },
        returnFields: "{ id organismId }",
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_ACCESS,
      );
    });

    test.each(unsupportedCandidateWriteRoles)(
      "rejects the %s role from selecting an organism",
      async (role: KeyCloakUserRole) => {
        const response = await mutation({
          endpoint: "candidacy_selectOrganism",
          authorization: asRole(role),
          arguments: {
            candidacyId: faker.string.uuid(),
            organismId: faker.string.uuid(),
          },
          returnFields: "{ id organismId }",
        });

        expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request to select an organism", async () => {
      const response = await mutation({
        endpoint: "candidacy_selectOrganism",
        arguments: {
          candidacyId: faker.string.uuid(),
          organismId: faker.string.uuid(),
        },
        returnFields: "{ id organismId }",
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });

    test("allows the candidate owning the candidacy to update its goals", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });

      const response = await mutation({
        endpoint: "candidacy_updateGoals",
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        arguments: { candidacyId: candidacy.id, goals: [] },
        returnFields: "",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_updateGoals).toBe(0);
    });

    test("allows the candidate owning the candidacy to submit it", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });

      const response = await mutation({
        endpoint: "candidacy_submitCandidacy",
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        arguments: { candidacyId: candidacy.id },
        returnFields: "{ id status }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_submitCandidacy).toMatchObject({
        id: candidacy.id,
        status: "VALIDATION",
      });
    });

    test("allows the candidate owning the candidacy to decide on the end of support", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          endAccompagnementStatus: "PENDING",
          endAccompagnementDate: faker.date.future(),
        },
      });

      const response = await mutation({
        endpoint: "candidacy_updateCandidacyEndAccompagnementDecision",
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        arguments: { candidacyId: candidacy.id, endAccompagnement: false },
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      const updatedCandidacy = await prismaClient.candidacy.findUniqueOrThrow({
        where: { id: candidacy.id },
      });
      expect(updatedCandidacy.endAccompagnementStatus).toBe("NOT_REQUESTED");
    });

    test("allows the candidate owning the candidacy to mark the feasibility resource as read", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyArgs: { feasibilityFileResourceFirstReadAt: null },
      });

      const response = await mutation({
        endpoint: "candidacy_markFeasibilityFileResourceFirstAsRead",
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        arguments: { candidacyId: candidacy.id },
        returnFields: "{ id feasibilityFileResourceFirstRead }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(
        response.json().data.candidacy_markFeasibilityFileResourceFirstAsRead,
      ).toMatchObject({
        id: candidacy.id,
        feasibilityFileResourceFirstRead: true,
      });
    });
  });
});
