import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyDropOutHelper } from "@/test/helpers/entities/create-candidacy-drop-out-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

import * as SendCandidacyDropOutConfirmedEmailToAapModule from "./emails/sendCandidacyDropOutConfirmedEmailToAap";
import * as SendCandidacyDropOutConfirmedEmailToCandidateModule from "./emails/sendCandidacyDropOutConfirmedEmailToCandidate";

describe("candidate drop out decision", () => {
  test("should mark the drop out as confirmed when the candidate confirms it and sent an email to the aap", async () => {
    const sendCandidacyDropOutConfirmedEmailToAapSpy = vi
      .spyOn(
        SendCandidacyDropOutConfirmedEmailToAapModule,
        "sendCandidacyDropOutConfirmedEmailToAap",
      )
      .mockImplementation(() => Promise.resolve());

    const sendCandidacyDropOutConfirmedEmailToCandidateSpy = vi
      .spyOn(
        SendCandidacyDropOutConfirmedEmailToCandidateModule,
        "sendCandidacyDropOutConfirmedEmailToCandidate",
      )
      .mockImplementation(() => Promise.resolve());

    const candidacyDropOut = await createCandidacyDropOutHelper();

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "candidate",
          keycloakId: candidacyDropOut.candidacy.candidate?.keycloakId || "",
        }),
      },
    });

    const candidacy_updateCandidateCandidacyDropoutDecision = graphql(`
      mutation candidacy_updateCandidateCandidacyDropoutDecision_confirmed_true(
        $candidacyId: UUID!
        $dropOutConfirmed: Boolean!
      ) {
        candidacy_updateCandidateCandidacyDropoutDecision(
          candidacyId: $candidacyId
          dropOutConfirmed: $dropOutConfirmed
        ) {
          candidacyDropOut {
            dropOutConfirmedByCandidate
          }
        }
      }
    `);

    const res = await graphqlClient.request(
      candidacy_updateCandidateCandidacyDropoutDecision,
      {
        candidacyId: candidacyDropOut.candidacyId,
        dropOutConfirmed: true,
      },
    );

    expect(res).toMatchObject({
      candidacy_updateCandidateCandidacyDropoutDecision: {
        candidacyDropOut: { dropOutConfirmedByCandidate: true },
      },
    });

    expect(sendCandidacyDropOutConfirmedEmailToAapSpy).toHaveBeenCalledWith({
      aapEmail: candidacyDropOut.candidacy.organism?.emailContact,
      aapLabel: candidacyDropOut.candidacy.organism?.nomPublic,
      candidateFullName: `${candidacyDropOut.candidacy.candidate?.firstname} ${candidacyDropOut.candidacy.candidate?.lastname}`,
    });

    expect(
      sendCandidacyDropOutConfirmedEmailToCandidateSpy,
    ).toHaveBeenCalledWith({
      candidateEmail: candidacyDropOut.candidacy.candidate?.email,
      candidateFullName: `${candidacyDropOut.candidacy.candidate?.firstname} ${candidacyDropOut.candidacy.candidate?.lastname}`,
    });
  });

  test("should delete the candidacy drop out when  the candidate cancel the drop out", async () => {
    const candidacyDropOut = await createCandidacyDropOutHelper();

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "candidate",
          keycloakId: candidacyDropOut.candidacy.candidate?.keycloakId || "",
        }),
      },
    });

    const candidacy_updateCandidateCandidacyDropoutDecision = graphql(`
      mutation candidacy_updateCandidateCandidacyDropoutDecision_confirmed_false(
        $candidacyId: UUID!
        $dropOutConfirmed: Boolean!
      ) {
        candidacy_updateCandidateCandidacyDropoutDecision(
          candidacyId: $candidacyId
          dropOutConfirmed: $dropOutConfirmed
        ) {
          candidacyDropOut {
            dropOutConfirmedByCandidate
          }
        }
      }
    `);

    const res = await graphqlClient.request(
      candidacy_updateCandidateCandidacyDropoutDecision,
      {
        candidacyId: candidacyDropOut.candidacyId,
        dropOutConfirmed: false,
      },
    );

    expect(
      res.candidacy_updateCandidateCandidacyDropoutDecision.candidacyDropOut,
    ).toEqual(null);
  });

  test("should not be allowed to cancel a drop out if it has already been confirmed", async () => {
    const candidacyDropOut = await createCandidacyDropOutHelper({
      dropOutConfirmedByCandidate: true,
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "candidate",
          keycloakId: candidacyDropOut.candidacy.candidate?.keycloakId || "",
        }),
      },
    });

    const candidacy_updateCandidateCandidacyDropoutDecision = graphql(`
      mutation candidacy_updateCandidateCandidacyDropoutDecision_already_set(
        $candidacyId: UUID!
        $dropOutConfirmed: Boolean!
      ) {
        candidacy_updateCandidateCandidacyDropoutDecision(
          candidacyId: $candidacyId
          dropOutConfirmed: $dropOutConfirmed
        ) {
          candidacyDropOut {
            dropOutConfirmedByCandidate
          }
        }
      }
    `);

    await expect(
      graphqlClient.request(candidacy_updateCandidateCandidacyDropoutDecision, {
        candidacyId: candidacyDropOut.candidacyId,
        dropOutConfirmed: false,
      }),
    ).rejects.toThrowError(
      "La décision d'abandon a déjà été confirmée par le candidat",
    );
  });
});
