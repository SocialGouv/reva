import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { NoticeAlert } from "@/components/notice/NoticeAlert";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "../../graphql/graphql-client/GraphqlClient";

const getOrganismQuery = graphql(`
  query getOrganismForAAPVisibilityCheck {
    account_getAccountForConnectedUser {
      organism {
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

  const organism =
    getOrganismResponse?.account_getAccountForConnectedUser?.organism;

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
