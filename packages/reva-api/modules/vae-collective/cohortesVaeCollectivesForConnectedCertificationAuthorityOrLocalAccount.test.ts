import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { createCohorteVaeCollectiveHelper } from "../../test/helpers/entities/create-vae-collective-helper";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { createFeasibilityDematerializedHelper } from "../../test/helpers/entities/create-feasibility-dematerialized-helper";
import { createCertificationAuthorityHelper } from "../../test/helpers/entities/create-certification-authority-helper";

const getCohortesForCertificationAuthorityOrLocalAccount = async ({
  userKeycloakId,
  userRole,
}: {
  userKeycloakId: string;
  userRole: KeyCloakUserRole;
}) => {
  return await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: userRole,
      keycloakId: userKeycloakId,
    }),
    payload: {
      requestType: "query",
      endpoint:
        "cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount",
      returnFields: "{ id nom }",
    },
  });
};

describe("cohortes vae collectives for certification authority or local account", () => {
  test("should return a cohorte when a candidacy is belonging to it and is associated to the certification authority", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const candidacy = await createCandidacyHelper({
      candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
    });

    const certificationAuthority = await createCertificationAuthorityHelper();

    await createFeasibilityDematerializedHelper({
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
    });

    const resp = await getCohortesForCertificationAuthorityOrLocalAccount({
      userKeycloakId: certificationAuthority.Account[0].keycloakId || "",
      userRole: "manage_certification_authority_local_account",
    });

    const obj = resp.json();

    expect(
      obj.data
        .cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount
        .length,
    ).toBe(1);
  });

  test("should return an empty array when a candidacy is belonging to a cohorte and is NOT associated to the certification authority", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const candidacy = await createCandidacyHelper({
      candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
    });

    const certificationAuthority = await createCertificationAuthorityHelper();

    await createFeasibilityDematerializedHelper({
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
    });

    const secondCertificationAuthority =
      await createCertificationAuthorityHelper();

    const resp = await getCohortesForCertificationAuthorityOrLocalAccount({
      userKeycloakId: secondCertificationAuthority.Account[0].keycloakId || "",
      userRole: "manage_certification_authority_local_account",
    });

    const obj = resp.json();

    expect(
      obj.data
        .cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount
        .length,
    ).toBe(0);
  });
});
