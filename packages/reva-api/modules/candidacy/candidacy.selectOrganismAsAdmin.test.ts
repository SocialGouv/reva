import {} from "@prisma/client";

import * as EmailModule from "@/modules/shared/email/sendEmailUsingTemplate";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";
import { getBackofficeUrl } from "../shared/email/backoffice.url.helpers";

const candidacy_selectOrganismAsAdmin = graphql(`
  mutation candidacy_selectOrganismAsAdmin(
    $candidacyId: UUID!
    $organismId: UUID!
  ) {
    candidacy_selectOrganismAsAdmin(
      candidacyId: $candidacyId
      organismId: $organismId
    ) {
      id
      organismId
    }
  }
`);

const selectOrganismAsAdmin = async ({
  candidacyId,
  organismId,
  userKeycloakId,
}: {
  candidacyId: string;
  organismId: string;
  userKeycloakId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: userKeycloakId,
      }),
    },
  });

  return graphqlClient.request(candidacy_selectOrganismAsAdmin, {
    candidacyId,
    organismId,
  });
};

test("admin should be able to select an organism for a candidacy when its finance module is 'hors plateforme'", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: "PROJET",
    candidacyArgs: { financeModule: "hors_plateforme" },
  });

  const account = await createAccountHelper();

  const organism = await createOrganismHelper();

  const res = await selectOrganismAsAdmin({
    candidacyId: candidacy.id,
    organismId: organism.id,
    userKeycloakId: account.keycloakId,
  });

  expect(res).toMatchObject({
    candidacy_selectOrganismAsAdmin: { organismId: organism.id },
  });
});

(["unifvae", "unireva"] as const).forEach((financeModule) => {
  test(`admin should not be able to select an organism for a candidacy when its finance module is ${financeModule}`, async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: "PROJET",
      candidacyArgs: { financeModule },
    });

    const account = await createAccountHelper();

    const organism = await createOrganismHelper();

    await expect(() =>
      selectOrganismAsAdmin({
        candidacyId: candidacy.id,
        organismId: organism.id,
        userKeycloakId: account.keycloakId,
      }),
    ).rejects.toThrowError(
      "La candidature doit utiliser le module de financement 'hors plateforme'.",
    );
  });
});

test("when selecting an organism, an email should be sent to the new organism", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: "PROJET",
    candidacyArgs: { financeModule: "hors_plateforme" },
  });

  const sendEmailUsingTemplateSpy = vi.spyOn(
    EmailModule,
    "sendEmailUsingTemplate",
  );

  const account = await createAccountHelper();

  const organism = await createOrganismHelper();

  await selectOrganismAsAdmin({
    candidacyId: candidacy.id,
    organismId: organism.id,
    userKeycloakId: account.keycloakId,
  });

  expect(sendEmailUsingTemplateSpy).toHaveBeenCalledWith({
    to: { email: organism.emailContact },
    templateId: 691,
    params: {
      candidateFullName: `${candidacy.candidate?.lastname} ${candidacy.candidate?.firstname}`,
      candidacyUrl: getBackofficeUrl({
        path: `/candidacies/${candidacy.id}/summary`,
      }),
    },
  });
});
