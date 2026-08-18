import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import { NOT_AUTHORIZED_CANDIDACY_ACCESS } from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createDropOutReasonHelper } from "@/test/helpers/entities/create-drop-out-reason-helper";
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

describe("candidacy candidate-side resolver authorization", () => {
  describe("candidacy_candidateDropOutCandidacy", () => {
    const dropOut = (dropOutReasonId: string) => ({ dropOutReasonId });

    test("allows the candidate owning the candidacy to drop it out", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus:
          CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
      });
      const dropOutReason = await createDropOutReasonHelper();

      const response = await mutation({
        endpoint: "candidacy_candidateDropOutCandidacy",
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        arguments: {
          candidacyId: candidacy.id,
          dropOut: dropOut(dropOutReason.id),
        },
        returnFields: "{ id }",
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.candidacy_candidateDropOutCandidacy.id).toBe(
        candidacy.id,
      );
    });

    test("rejects a random candidate for a candidacy they do not own", async () => {
      const candidacy = await createCandidacyHelper();
      const randomCandidate = await createCandidateHelper();

      const response = await mutation({
        endpoint: "candidacy_candidateDropOutCandidacy",
        authorization: asRole("candidate", randomCandidate.keycloakId),
        arguments: {
          candidacyId: candidacy.id,
          dropOut: dropOut(faker.string.uuid()),
        },
        returnFields: "{ id }",
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_ACCESS,
      );
    });

    test.each<KeyCloakUserRole>([
      "admin",
      "manage_candidacy",
      "gestion_maison_mere_aap",
      "manage_feasibility",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])(
      "rejects the %s actor without candidate ownership",
      async (role: KeyCloakUserRole) => {
        const candidacy = await createCandidacyHelper();

        const response = await mutation({
          endpoint: "candidacy_candidateDropOutCandidacy",
          authorization: asRole(role),
          arguments: {
            candidacyId: candidacy.id,
            dropOut: dropOut(faker.string.uuid()),
          },
          returnFields: "{ id }",
        });

        expect(response.json().errors[0].message).toBe(
          NOT_AUTHORIZED_CANDIDACY_ACCESS,
        );
      },
    );

    test("rejects an unauthenticated request", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await mutation({
        endpoint: "candidacy_candidateDropOutCandidacy",
        arguments: {
          candidacyId: candidacy.id,
          dropOut: dropOut(faker.string.uuid()),
        },
        returnFields: "{ id }",
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_ACCESS,
      );
    });
  });
});
