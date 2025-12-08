import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

const mockAdminKeycloakUuid = "1b0e7046-ca61-4259-b716-785f36ab79b2";

describe("candidate information update", () => {
  test("should update phone and email of candidate when user is an admin", async () => {
    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }

    const newPhone = "0600000000";
    const newEmail = "newEmail@example.com";

    const resp = await injectGraphql({
      fastify: global.testApp,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: mockAdminKeycloakUuid,
      }),
      payload: {
        requestType: "mutation",
        arguments: {
          candidacyId: candidacy.id,
          candidateId: candidacy.candidateId,
          candidateContactDetails: {
            phone: newPhone,
            email: newEmail,
          },
        },
        endpoint: "candidate_updateCandidateContactDetails",
        returnFields: "{ phone email}",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");
    const obj = resp.json();
    expect(obj.data.candidate_updateCandidateContactDetails).toMatchObject({
      phone: newPhone,
      email: newEmail,
    });
  });

  test("should not update email of candidate when user is an aap", async () => {
    const candidacy = await createCandidacyHelper();
    const aap = candidacy.organism;

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }

    const newPhone = "0600000000";
    const oldEmail = candidacy.candidate.email;
    const newEmail = "newEmail@example.com";

    const resp = await injectGraphql({
      fastify: global.testApp,
      authorization: authorizationHeaderForUser({
        role: "gestion_maison_mere_aap",
        keycloakId: aap?.organismOnAccounts[0].account.keycloakId,
      }),
      payload: {
        requestType: "mutation",
        arguments: {
          candidacyId: candidacy.id,
          candidateId: candidacy.candidateId,
          candidateContactDetails: {
            phone: newPhone,
            email: newEmail,
          },
        },
        endpoint: "candidate_updateCandidateContactDetails",
        returnFields: "{ phone email}",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");
    const obj = resp.json();
    expect(obj.data.candidate_updateCandidateContactDetails).toMatchObject({
      phone: newPhone,
      email: oldEmail,
    });
  });
});
