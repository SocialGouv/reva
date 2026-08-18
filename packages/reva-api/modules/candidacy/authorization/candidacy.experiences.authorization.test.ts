import { faker } from "@faker-js/faker";
import { CandidacyStatusStep, ExperienceDuration } from "@prisma/client";

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

const experienceInput = {
  title: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  duration: ExperienceDuration.betweenOneAndThreeYears,
  startedAt: Date.parse("2020-01-01T00:00:00.000Z"),
};

const createExperience = (candidacyId: string) =>
  prismaClient.experience.create({
    data: {
      candidacyId,
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      duration: ExperienceDuration.betweenOneAndThreeYears,
      startedAt: faker.date.past(),
    },
  });

interface ExperienceMutationCase {
  endpoint: string;
  buildArguments: (
    candidacyId: string,
    experienceId?: string,
  ) => Record<string, unknown>;
  returnFields: string;
}

describe("candidacy experience resolver authorization", () => {
  describe("candidacy experiences", () => {
    const experienceMutationCases: ExperienceMutationCase[] = [
      {
        endpoint: "candidacy_addExperience",
        buildArguments: (candidacyId: string, _experienceId?: string) => ({
          candidacyId,
          experience: experienceInput,
        }),
        returnFields: "{ id }",
      },
      {
        endpoint: "candidacy_updateExperience",
        buildArguments: (candidacyId: string, experienceId?: string) => ({
          candidacyId,
          experienceId: experienceId ?? faker.string.uuid(),
          experience: experienceInput,
        }),
        returnFields: "{ id }",
      },
      {
        endpoint: "candidacy_deleteExperience",
        buildArguments: (candidacyId: string, experienceId?: string) => ({
          candidacyId,
          experienceId: experienceId ?? faker.string.uuid(),
        }),
        returnFields: "",
      },
    ];

    describe.each(experienceMutationCases)(
      "$endpoint",
      (mutationCase: ExperienceMutationCase) => {
        const { endpoint, buildArguments, returnFields } = mutationCase;
        test("allows an admin to manage an experience", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            endpoint === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);

          const response = await mutation({
            endpoint,
            authorization: asRole("admin"),
            arguments: buildArguments(candidacy.id, experience?.id),
            enumFields: ["duration"],
            returnFields,
          });

          expect(response.json()).not.toHaveProperty("errors");
          expect(response.json().data[endpoint]).not.toBeNull();
        });

        test("allows the candidate owning the candidacy to manage an experience", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            endpoint === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);

          const response = await mutation({
            endpoint,
            authorization: asRole("candidate", candidacy.candidate!.keycloakId),
            arguments: buildArguments(candidacy.id, experience?.id),
            enumFields: ["duration"],
            returnFields,
          });

          expect(response.json()).not.toHaveProperty("errors");
          expect(response.json().data[endpoint]).not.toBeNull();
        });

        test("allows the AAP associated to the candidacy to manage an experience", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            endpoint === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);

          const response = await mutation({
            endpoint,
            authorization: asRole(
              "manage_candidacy",
              candidacy.organism!.organismOnAccounts[0].account.keycloakId,
            ),
            arguments: buildArguments(candidacy.id, experience?.id),
            enumFields: ["duration"],
            returnFields,
          });

          expect(response.json()).not.toHaveProperty("errors");
          expect(response.json().data[endpoint]).not.toBeNull();
        });

        test("allows the maison mere manager of the AAP associated to the candidacy to manage an experience", async () => {
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
          const experience =
            endpoint === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);

          const response = await mutation({
            endpoint,
            authorization: asRole(
              "gestion_maison_mere_aap",
              maisonMereAAP.gestionnaire.keycloakId,
            ),
            arguments: buildArguments(candidacy.id, experience?.id),
            enumFields: ["duration"],
            returnFields,
          });

          expect(response.json()).not.toHaveProperty("errors");
          expect(response.json().data[endpoint]).not.toBeNull();
        });

        test("rejects a maison mere manager from another maison mere", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            endpoint === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);
          const foreignOrganism = await createOrganismHelper();
          const foreignManager = foreignOrganism.maisonMereAAP!.gestionnaire;
          await attachCollaborateurAccountToOrganism({
            organismId: foreignOrganism.id,
            collaborateurAccountId: foreignManager.id,
          });

          const response = await mutation({
            endpoint,
            authorization: asRole(
              "gestion_maison_mere_aap",
              foreignManager.keycloakId,
            ),
            arguments: buildArguments(candidacy.id, experience?.id),
            enumFields: ["duration"],
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(
            NOT_AUTHORIZED_CANDIDACY_MANAGE,
          );
        });

        test("rejects a random candidate for a candidacy they do not own", async () => {
          const candidacy = await createCandidacyHelper({
            candidacyActiveStatus: CandidacyStatusStep.PROJET,
          });
          const experience =
            endpoint === "candidacy_addExperience"
              ? undefined
              : await createExperience(candidacy.id);
          const randomCandidate = await createCandidateHelper();

          const response = await mutation({
            endpoint,
            authorization: asRole("candidate", randomCandidate.keycloakId),
            arguments: buildArguments(candidacy.id, experience?.id),
            enumFields: ["duration"],
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(
            NOT_AUTHORIZED_CANDIDACY_ACCESS,
          );
        });

        test.each<KeyCloakUserRole>([
          "manage_feasibility",
          "manage_certification_authority_local_account",
          "manage_certification_registry",
          "manage_vae_collective",
        ])("rejects the %s role", async (role: KeyCloakUserRole) => {
          const response = await mutation({
            endpoint,
            authorization: asRole(role),
            arguments: buildArguments(faker.string.uuid()),
            enumFields: ["duration"],
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
        });

        test("rejects an unauthenticated request", async () => {
          const response = await mutation({
            endpoint,
            arguments: buildArguments(faker.string.uuid()),
            enumFields: ["duration"],
            returnFields,
          });

          expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
        });
      },
    );

    // Rejection of foreign experience IDs for candidate and AAP actors is covered by
    // updateExperienceOfCandidacy.test.ts and deleteExperienceFromCandidacy.test.ts.
  });
});
