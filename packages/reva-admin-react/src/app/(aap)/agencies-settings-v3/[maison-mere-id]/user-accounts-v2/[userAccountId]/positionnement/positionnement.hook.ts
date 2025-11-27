import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdatePositionnementCollaborateurInput } from "@/graphql/generated/graphql";

const updatePositionnementCollaborateurMutation = graphql(`
  mutation updateUserAccountPositionnementForPositionnementPage(
    $maisonMereAAPId: ID!
    $positionnement: UpdatePositionnementCollaborateurInput!
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
    $organismsOffset: Int!
    $organismsLimit: Int!
    $organismsSearchFilter: String
    $collaborateurAccountIdFilter: ID
  ) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      paginatedOrganisms(
        offset: $organismsOffset
        limit: $organismsLimit
        searchFilter: $organismsSearchFilter
        collaborateurAccountIdFilter: $collaborateurAccountIdFilter
      ) {
        rows {
          id
          label
          nomPublic
          adresseNumeroEtNomDeRue
          adresseInformationsComplementaires
          adresseCodePostal
          adresseVille
          conformeNormesAccessibilite
          modaliteAccompagnement
          disponiblePourVaeCollective
        }
        info {
          totalPages
          totalRows
        }
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
  page = 1,
  organismsSearchFilter,
  onlyShowUserOrganisms = false,
}: {
  userAccountId: string;
  maisonMereAAPId: string;
  page: number;
  organismsSearchFilter?: string | null;
  onlyShowUserOrganisms: boolean;
}) => {
  const RECORDS_PER_PAGE = 10;
  const organismsOffset = (page - 1) * RECORDS_PER_PAGE;

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: userAccountAndMaisonMereAAPOrganismsData } = useQuery({
    queryKey: [
      userAccountId,
      maisonMereAAPId,
      organismsSearchFilter,
      onlyShowUserOrganisms,
      page,
      "agencies-settings-positionnement-page",
    ],
    queryFn: () =>
      graphqlClient.request(getUserAccountAndMaisonMereAAPOrganismsQuery, {
        maisonMereAAPId,
        userAccountId,
        organismsOffset,
        organismsLimit: RECORDS_PER_PAGE,
        organismsSearchFilter,
        collaborateurAccountIdFilter: onlyShowUserOrganisms
          ? userAccountId
          : undefined,
      }),
  });

  const updatePositionnementCollaborateur = useMutation({
    mutationFn: (positionnement: UpdatePositionnementCollaborateurInput) =>
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
          organismsSearchFilter,
          onlyShowUserOrganisms,
          page,
          "agencies-settings-positionnement-page",
        ],
      });
    },
  });

  const userAccount =
    userAccountAndMaisonMereAAPOrganismsData?.organism_getCompteCollaborateurById;

  const maisonMereAAPOrganismsPage = userAccountAndMaisonMereAAPOrganismsData
    ?.organism_getMaisonMereAAPById?.paginatedOrganisms || {
    rows: [],
    info: { totalPages: 0, totalRows: 0 },
  };

  return {
    userAccount,
    maisonMereAAPOrganismsPage,
    updatePositionnementCollaborateur,
  };
};
