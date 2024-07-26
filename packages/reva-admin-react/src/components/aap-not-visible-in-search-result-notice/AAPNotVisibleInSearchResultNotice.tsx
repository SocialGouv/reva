import { graphql } from "@/graphql/generated";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import Link from "next/link";
import { useGraphQlClient } from "../graphql/graphql-client/GraphqlClient";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
  const [visible, setVisible] = useState(true);

  return visible ? (
    <div
      id="fr-notice-:r5:"
      className="fr-notice text-dsfr-light-decisions-text-default-warning bg-dsfr-light-decisions-background-contrast-warning"
    >
      <div className="fr-container flex">
        <span className="fr-icon fr-icon-warning-fill -mt-[1px]" />
        <div className="fr-notice__body pl-4 flex-1">
          <p className="fr-notice__title">
            <p>
              <strong>
                Actuellement, vous n’êtes pas visible dans les résultats de
                recherche.
              </strong>{" "}
              Pour y apparaître, gérez votre compte depuis les{" "}
              <Link
                href="/agencies-settings/legal-information"
                className="fr-notice__link"
              >
                Paramètres
              </Link>
            </p>
          </p>
          <button
            className="fr-btn--close fr-btn text-dsfr-light-decisions-text-default-warning hover:bg-transparent"
            onClick={() => setVisible(false)}
          >
            Masquer le message
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
