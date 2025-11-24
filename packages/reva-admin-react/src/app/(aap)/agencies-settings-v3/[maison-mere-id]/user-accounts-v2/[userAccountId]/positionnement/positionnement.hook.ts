import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { PositionnementCollaborateurInput } from "@/graphql/generated/graphql";

const updatePositionnementCollaborateurMutation = graphql(`
  mutation updateUserAccountPositionnementForPositionnementPage(
    $maisonMereAAPId: ID!
    $positionnement: PositionnementCollaborateurInput!
  ) {
    organism_updatePositionnementCollaborateur(
      maisonMereAAPId: $maisonMereAAPId
      positionnement: $positionnement
    ) {
      id
    }
  }
`);

const getUserAccountAndMaisonMereAAPOrganismsQuery = graphql(`
  query getUserAccountAndMaisonMereAAPOrganismsForPositionnementPage(
    $maisonMereAAPId: ID!
    $userAccountId: ID!
  ) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      organisms {
        id
        label
        adresseNumeroEtNomDeRue
        adresseInformationsComplementaires
        adresseCodePostal
        adresseVille
        conformeNormesAccessibilite
        modaliteAccompagnement
        disponiblePourVaeCollective
      }
    }
    organism_getCompteCollaborateurById(
      maisonMereAAPId: $maisonMereAAPId
      accountId: $userAccountId
    ) {
      id
      firstname
      lastname
      email
      organisms {
        id
      }
    }
  }
`);

export const usePositionnementPage = ({
  maisonMereAAPId,
  userAccountId,
}: {
  userAccountId: string;
  maisonMereAAPId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: userAccountAndMaisonMereAAPOrganismsData } = useQuery({
    queryKey: [
      userAccountId,
      maisonMereAAPId,
      "agencies-settings-positionnement-page",
    ],
    queryFn: () =>
      graphqlClient.request(getUserAccountAndMaisonMereAAPOrganismsQuery, {
        maisonMereAAPId,
        userAccountId,
      }),
  });

  const updatePositionnementCollaborateur = useMutation({
    mutationFn: (positionnement: PositionnementCollaborateurInput) =>
      graphqlClient.request(updatePositionnementCollaborateurMutation, {
        maisonMereAAPId,
        positionnement,
      }),
    mutationKey: [userAccountId, "agencies-settings-positionnement-page"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          userAccountId,
          maisonMereAAPId,
          "agencies-settings-positionnement-page",
        ],
      });
    },
  });

  const userAccount =
    userAccountAndMaisonMereAAPOrganismsData?.organism_getCompteCollaborateurById;

  const maisonMereAAPOrganisms =
    userAccountAndMaisonMereAAPOrganismsData?.organism_getMaisonMereAAPById
      ?.organisms || [];

  return {
    userAccount,
    maisonMereAAPOrganisms,
    updatePositionnementCollaborateur,
  };
};
