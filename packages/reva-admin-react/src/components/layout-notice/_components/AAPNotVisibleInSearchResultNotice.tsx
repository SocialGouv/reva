import { NoticeAlert } from "@/components/notice/NoticeAlert";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useGraphQlClient } from "../../graphql/graphql-client/GraphqlClient";

const getOrganismQuery = graphql(`
  query getOrganismForAAPVisibilityCheck {
    account_getAccountForConnectedUser {
      organism {
        id
        isOnSite
        isRemote
        fermePourAbsenceOuConges
        managedDegrees {
          id
        }
        domaines {
          id
        }
        conventionCollectives {
          id
        }
      }
    }
  }
`);

export const useAAPVisibilityCheck = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getOrganismResponse } = useQuery({
    queryKey: ["organisms", "aap-visibility-check"],
    queryFn: () => graphqlClient.request(getOrganismQuery),
  });

  const organism =
    getOrganismResponse?.account_getAccountForConnectedUser?.organism;

  let isVisibleInSearchResults = true;

  if (organism) {
    const {
      isOnSite,
      isRemote,
      fermePourAbsenceOuConges,
      managedDegrees,
      domaines,
      conventionCollectives,
    } = organism;

    isVisibleInSearchResults = !!(
      (isOnSite || isRemote) &&
      !fermePourAbsenceOuConges &&
      managedDegrees.length &&
      (domaines.length || conventionCollectives.length)
    );
  }

  return { isVisibleInSearchResults };
};

export const AAPNotVisibleInSearchResultNotice = () => {
  return (
    <NoticeAlert>
      <p>
        <strong>
          Actuellement, vous n'êtes pas visible dans les résultats de recherche.
        </strong>{" "}
        Pour y apparaître, gérez votre compte depuis les{" "}
        <Link
          href="/agencies-settings/legal-information"
          className="fr-notice__link"
        >
          Paramètres
        </Link>
      </p>
    </NoticeAlert>
  );
};
