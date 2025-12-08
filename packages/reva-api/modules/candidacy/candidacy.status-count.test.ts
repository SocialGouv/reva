import { CandidacyStatusStep, Candidate, Certification } from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyDropOutHelper } from "@/test/helpers/entities/create-candidacy-drop-out-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createJuryHelper } from "@/test/helpers/entities/create-jury-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

import { CandidacyStatusFilter } from "./candidacy.types";

const createCandidacies = async ({
  status,
  count,
  droppedOut,
  reoriented,
  jury,
}: {
  status: CandidacyStatusStep;
  count: number;
  droppedOut?: boolean;
  reoriented?: boolean;
  jury?: "WITH_RESULT_DATE" | "WITHOUT_RESULT_DATE";
}) => {
  const organism = await createOrganismHelper();
  const candidacies = [];
  let reorientation = null;
  if (reoriented) {
    reorientation = await prismaClient.reorientationReason.findFirst();
  }
  for (let i = 0; i < count; i++) {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: status,
      candidacyArgs: {
        organismId: organism.id,
        reorientationReasonId: reoriented ? reorientation?.id : undefined,
      },
    });
    if (droppedOut) {
      await createCandidacyDropOutHelper({ candidacyId: candidacy.id });
    }
    if (jury) {
      await createJuryHelper({
        candidacyId: candidacy.id,
        dateOfResult: jury === "WITH_RESULT_DATE" ? new Date() : null,
      });
    }
    candidacies.push(candidacy);
  }
  return { candidacies, organism };
};

const executeQueryAndAssertResults = async ({
  keycloakId,
  role,
  searchFilter,
  defaultAssertionOverride,
}: {
  keycloakId?: string;
  role: KeyCloakUserRole;
  searchFilter?: string;
  defaultAssertionOverride?: Partial<Record<CandidacyStatusFilter, number>>;
}) => {
  const resultAssertion = {
    ACTIVE_HORS_ABANDON: 0,
    ABANDON: 0,
    REORIENTEE: 0,
    ARCHIVE_HORS_ABANDON_HORS_REORIENTATION: 0,
    PARCOURS_CONFIRME_HORS_ABANDON: 0,
    PRISE_EN_CHARGE_HORS_ABANDON: 0,
    PARCOURS_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON: 0,
    DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON: 0,
    JURY_HORS_ABANDON: 0,
    JURY_PROGRAMME_HORS_ABANDON: 0,
    JURY_PASSE_HORS_ABANDON: 0,
    VALIDATION_HORS_ABANDON: 0,
    PROJET_HORS_ABANDON: 0,
    END_ACCOMPAGNEMENT: 0,
    ...defaultAssertionOverride,
  };

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role,
        keycloakId: keycloakId || "whatever",
      }),
    },
  });

  const candidacy_candidacyCountByStatus = graphql(`
    query candidacy_candidacyCountByStatus($searchFilter: String) {
      candidacy_candidacyCountByStatus(searchFilter: $searchFilter) {
        ACTIVE_HORS_ABANDON
        ABANDON
        REORIENTEE
        ARCHIVE_HORS_ABANDON_HORS_REORIENTATION
        PARCOURS_CONFIRME_HORS_ABANDON
        PRISE_EN_CHARGE_HORS_ABANDON
        PARCOURS_ENVOYE_HORS_ABANDON
        DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON
        DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON
        DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON
        DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON
        DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON
        DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON
        JURY_HORS_ABANDON
        JURY_PROGRAMME_HORS_ABANDON
        JURY_PASSE_HORS_ABANDON
        VALIDATION_HORS_ABANDON
        PROJET_HORS_ABANDON
        END_ACCOMPAGNEMENT
      }
    }
  `);

  const res = await graphqlClient.request(candidacy_candidacyCountByStatus, {
    searchFilter,
  });

  expect(res.candidacy_candidacyCountByStatus).toMatchObject(resultAssertion);
};

const simpleStatusesTestData: [
  CandidacyStatusStep,
  CandidacyStatusFilter,
  "ACTIVE" | "INACTIVE",
][] = [
  [CandidacyStatusStep.PROJET, "PROJET_HORS_ABANDON", "INACTIVE"],
  [CandidacyStatusStep.VALIDATION, "VALIDATION_HORS_ABANDON", "ACTIVE"],
  [
    CandidacyStatusStep.PRISE_EN_CHARGE,
    "PRISE_EN_CHARGE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.PARCOURS_ENVOYE,
    "PARCOURS_ENVOYE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.PARCOURS_CONFIRME,
    "PARCOURS_CONFIRME_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
    "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
    "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET,
    "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
    "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE,
    "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON",
    "INACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
    "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
    "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON",
    "ACTIVE",
  ],
];

describe.each(["ADMIN", "AAP"] as const)(
  "Candidacy status count tests for %s",
  (userProfile: "ADMIN" | "AAP") => {
    test.each(simpleStatusesTestData)(
      "should count the correct number of candidacies with status %s and status filter %s as %s",
      async (
        status: CandidacyStatusStep,
        statusFilter: CandidacyStatusFilter,
        activeOrInactive: "ACTIVE" | "INACTIVE",
      ) => {
        //these candidacies should be visible to both profiles
        const { organism } = await createCandidacies({
          status,
          count: 5,
        });

        //these candidacies should only be visible to the admin profile
        await createCandidacies({
          status,
          count: 5,
        });

        await executeQueryAndAssertResults(
          userProfile === "ADMIN" //Admin profile
            ? {
                role: "admin",
                defaultAssertionOverride: {
                  ACTIVE_HORS_ABANDON: activeOrInactive === "ACTIVE" ? 10 : 0,
                  [statusFilter]: 10,
                },
              }
            : {
                role: "manage_candidacy", //AAP profile
                keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
                defaultAssertionOverride: {
                  ACTIVE_HORS_ABANDON: activeOrInactive === "ACTIVE" ? 5 : 0,
                  [statusFilter]: 5,
                },
              },
        );
      },
    );

    test("should count the correct number dropped out candidacies", async () => {
      //these candidacies should be visible to both profiles
      const { organism } = await createCandidacies({
        status: CandidacyStatusStep.PRISE_EN_CHARGE,
        count: 5,
        droppedOut: true,
      });

      //these candidacies should only be visible to the admin profile
      await createCandidacies({
        status: CandidacyStatusStep.PRISE_EN_CHARGE,
        count: 5,
        droppedOut: true,
      });

      await executeQueryAndAssertResults(
        userProfile === "ADMIN" //Admin profile
          ? {
              role: "admin",
              defaultAssertionOverride: { ABANDON: 10 },
            }
          : {
              role: "manage_candidacy", // AAP profile
              keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
              defaultAssertionOverride: { ABANDON: 5 },
            },
      );
    });

    test("should count the correct number of archived candidacies", async () => {
      //these candidacies should be visible to both profiles
      const { organism } = await createCandidacies({
        status: CandidacyStatusStep.ARCHIVE,
        count: 5,
      });

      //these candidacies should only be visible to the admin profile
      await createCandidacies({
        status: CandidacyStatusStep.ARCHIVE,
        count: 5,
      });

      await executeQueryAndAssertResults(
        userProfile === "ADMIN" //Admin profile
          ? {
              role: "admin",
              defaultAssertionOverride: {
                ARCHIVE_HORS_ABANDON_HORS_REORIENTATION: 10,
              },
            }
          : {
              role: "manage_candidacy", //AAP profile
              keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
              defaultAssertionOverride: {
                ARCHIVE_HORS_ABANDON_HORS_REORIENTATION: 5,
              },
            },
      );
    });

    test("should count the correct number of reoriented candidacies", async () => {
      //these candidacies should be visible to both profiles
      const { organism } = await createCandidacies({
        status: CandidacyStatusStep.ARCHIVE,
        count: 5,
        reoriented: true,
      });

      //these candidacies should only be visible to the admin profile
      await createCandidacies({
        status: CandidacyStatusStep.ARCHIVE,
        count: 5,
        reoriented: true,
      });

      await executeQueryAndAssertResults(
        userProfile === "ADMIN" //Admin profile
          ? {
              role: "admin",
              defaultAssertionOverride: { REORIENTEE: 10 },
            }
          : {
              role: "manage_candidacy", //AAP profile
              keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
              defaultAssertionOverride: { REORIENTEE: 5 },
            },
      );
    });

    test("should count the correct number of 'JURY_PROGRAMME_HORS_ABANDON' candidacies", async () => {
      //these candidacies should be visible to both profiles
      const { organism } = await createCandidacies({
        status: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
        jury: "WITHOUT_RESULT_DATE",
        count: 5,
      });

      //these candidacies should only be visible to the admin profile
      await createCandidacies({
        status: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
        jury: "WITHOUT_RESULT_DATE",
        count: 5,
      });

      await executeQueryAndAssertResults(
        userProfile === "ADMIN" //Admin profile
          ? {
              role: "admin",
              defaultAssertionOverride: {
                ACTIVE_HORS_ABANDON: 10,
                DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON: 10,
                JURY_HORS_ABANDON: 10,
                JURY_PROGRAMME_HORS_ABANDON: 10,
              },
            }
          : {
              role: "manage_candidacy", //AAP profile
              keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
              defaultAssertionOverride: {
                ACTIVE_HORS_ABANDON: 5,
                DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON: 5,
                JURY_HORS_ABANDON: 5,
                JURY_PROGRAMME_HORS_ABANDON: 5,
              },
            },
      );
    });

    test("should count the correct number of 'JURY_PASSE_HORS_ABANDON' candidacies", async () => {
      //these candidacies should be visible to both profiles
      const { organism } = await createCandidacies({
        status: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
        jury: "WITH_RESULT_DATE",
        count: 5,
      });

      //these candidacies should only be visible to the admin profile
      await createCandidacies({
        status: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
        jury: "WITH_RESULT_DATE",
        count: 5,
      });

      await executeQueryAndAssertResults(
        userProfile === "ADMIN" //Admin profile
          ? {
              role: "admin",
              defaultAssertionOverride: {
                ACTIVE_HORS_ABANDON: 10,
                DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON: 10,
                JURY_HORS_ABANDON: 10,
                JURY_PASSE_HORS_ABANDON: 10,
              },
            }
          : {
              role: "manage_candidacy", //AAP profile
              keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
              defaultAssertionOverride: {
                ACTIVE_HORS_ABANDON: 5,
                DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON: 5,
                JURY_HORS_ABANDON: 5,
                JURY_PASSE_HORS_ABANDON: 5,
              },
            },
      );
    });

    test("should count 0 candidacy when searching for the wrong search criteria", async () => {
      const { organism } = await createCandidacies({
        status: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
        count: 1,
      });

      await executeQueryAndAssertResults(
        userProfile === "ADMIN" //Admin profile
          ? {
              role: "admin",
              searchFilter: "WRONG_CRITERIA",
            }
          : {
              role: "manage_candidacy", //AAP profile
              keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
              searchFilter: "WRONG_CRITERIA",
            },
      );
    });

    test("should count the correct number of candidacy when searching for the right organism label", async () => {
      //that candidacy should be visible to both profiles
      const { organism } = await createCandidacyHelper();

      if (!organism) {
        throw new Error("Organism not created");
      }

      const organismWithSameLabel = await createOrganismHelper({
        label: organism.label,
      });

      //that candidacy should only be visible to the admin profile
      await createCandidacyHelper({
        candidacyArgs: { organismId: organismWithSameLabel.id },
      });

      await executeQueryAndAssertResults(
        userProfile === "ADMIN" //Admin profile
          ? {
              role: "admin",
              searchFilter: organism?.label,
              defaultAssertionOverride: {
                ACTIVE_HORS_ABANDON: 2,
                PARCOURS_CONFIRME_HORS_ABANDON: 2,
              },
            }
          : {
              role: "manage_candidacy", //AAP profile
              keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
              searchFilter: organism?.label,
              defaultAssertionOverride: {
                ACTIVE_HORS_ABANDON: 1,
                PARCOURS_CONFIRME_HORS_ABANDON: 1,
              },
            },
      );
    });

    test("should count the correct number of candidacy when searching for the right department label", async () => {
      //that candidacy should be visible to both profiles
      const { candidate, organism } = await createCandidacyHelper();
      const department = await prismaClient.department.findUnique({
        where: { id: candidate?.departmentId },
      });

      const candidate2 = await createCandidateHelper({
        departmentId: department?.id,
      });

      //that candidacy should only be visible to the admin profile
      await createCandidacyHelper({
        candidacyArgs: {
          candidateId: candidate2.id,
        },
      });

      await executeQueryAndAssertResults(
        userProfile === "ADMIN" //Admin profile
          ? {
              role: "admin",
              searchFilter: department?.label,
              defaultAssertionOverride: {
                ACTIVE_HORS_ABANDON: 2,
                PARCOURS_CONFIRME_HORS_ABANDON: 2,
              },
            }
          : {
              role: "manage_candidacy", //AAP profile
              keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
              searchFilter: department?.label,
              defaultAssertionOverride: {
                ACTIVE_HORS_ABANDON: 1,
                PARCOURS_CONFIRME_HORS_ABANDON: 1,
              },
            },
      );
    });

    test.each(["label", "rncpTypeDiplome"] as const)(
      "should count the correct number of candidacy when searching for the right candidate %s",
      async (field: keyof Certification) => {
        //that candidacy should be visible to both profiles
        const { certification, organism } = await createCandidacyHelper();

        //that candidacy should only be visible to the admin profile
        await createCandidacyHelper({
          candidacyArgs: { certificationId: certification?.id },
        });

        await executeQueryAndAssertResults(
          userProfile === "ADMIN" //Admin profile
            ? {
                role: "admin",
                searchFilter: certification?.[field] as string,
                defaultAssertionOverride: {
                  ACTIVE_HORS_ABANDON: 2,
                  PARCOURS_CONFIRME_HORS_ABANDON: 2,
                },
              }
            : {
                role: "manage_candidacy", //AAP profile
                keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
                searchFilter: certification?.[field] as string,
                defaultAssertionOverride: {
                  ACTIVE_HORS_ABANDON: 1,
                  PARCOURS_CONFIRME_HORS_ABANDON: 1,
                },
              },
        );
      },
    );

    test.each([
      "lastname",
      "firstname",
      "firstname2",
      "firstname3",
      "email",
      "phone",
    ] as const)(
      "should count the correct number of candidacies when searching for the right candidate %s",
      async (field: keyof Candidate) => {
        //that candidacy should be visible to both profiles
        const { candidate, organism } = await createCandidacyHelper();

        //that candidacy should only be visible to the admin profile
        await createCandidacyHelper({
          candidacyArgs: { candidateId: candidate?.id },
        });

        await executeQueryAndAssertResults(
          userProfile === "ADMIN" //Admin profile
            ? {
                role: "admin",
                searchFilter: candidate?.[field] as string,
                defaultAssertionOverride: {
                  ACTIVE_HORS_ABANDON: 2,
                  PARCOURS_CONFIRME_HORS_ABANDON: 2,
                },
              }
            : {
                role: "manage_candidacy", //AAP profile
                keycloakId: organism?.organismOnAccounts[0].account.keycloakId,
                searchFilter: candidate?.[field] as string,
                defaultAssertionOverride: {
                  ACTIVE_HORS_ABANDON: 1,
                  PARCOURS_CONFIRME_HORS_ABANDON: 1,
                },
              },
        );
      },
    );
  },
);
