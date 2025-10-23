import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { NoticeAlert } from "@/components/notice/NoticeAlert";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "../../graphql/graphql-client/GraphqlClient";

const getOrganismQuery = graphql(`
  query getOrganismForAAPVisibilityCheck {
    account_getAccountForConnectedUser {
      organisms {
        id
        isVisibleInCandidateSearchResults
      }
    }
  }
`);

export const useAAPVisibilityCheck = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getOrganismResponse, isLoading: getOrganismisLoading } =
    useQuery({
      queryKey: ["organisms", "aap-visibility-check"],
      queryFn: () => graphqlClient.request(getOrganismQuery),
    });

  //TODO: gérer le cas où l'utilisateur a plusieurs organismes lorsque les interfaces seront prêtes
  //Pour l'instant le compte à au plus un organisme
  const organism =
    getOrganismResponse?.account_getAccountForConnectedUser?.organisms?.[0];

  const isVisibleInSearchResults =
    !!organism?.isVisibleInCandidateSearchResults;

  return { isVisibleInSearchResults, getOrganismisLoading };
};

export const AAPNotVisibleInSearchResultNotice = () => {
  return (
    <NoticeAlert>
      <p data-test="not-visible-alert-notice">
        <strong>
          Actuellement, vous n'êtes pas visible dans les résultats de recherche.
        </strong>{" "}
        Pour y apparaître, gérez votre compte depuis les{" "}
        <Link href="/agencies-settings-v3" className="fr-notice__link">
          Paramètres
        </Link>
      </p>
    </NoticeAlert>
  );
};
