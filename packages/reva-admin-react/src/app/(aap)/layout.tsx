"use client";
import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";
import AccountSetup from "./_components/account-setup/AccountSetup";
const accountWithMaisonMereQuery = graphql(`
  query getAccountInfo {
    account_getAccountForConnectedUser {
      organism {
        id
      }
      maisonMereAAP {
        showAccountSetup
        id
        organisms {
          id
          isHeadAgency
          label
          informationsCommerciales {
            nom
          }
        }
      }
    }
  }
`);

const AapLayout = ({ children }: { children: ReactNode }) => {
  const { isGestionnaireMaisonMereAAP } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  const { graphqlClient } = useGraphQlClient();

  const { data: accountWithMaisonMereResponse } = useQuery({
    queryKey: ["organisms"],
    queryFn: () => graphqlClient.request(accountWithMaisonMereQuery),
  });

  if (!accountWithMaisonMereResponse) {
    return <p>Chargement...</p>;
  }

  if (
    isGestionnaireMaisonMereAAP &&
    accountWithMaisonMereResponse?.account_getAccountForConnectedUser
      ?.maisonMereAAP?.showAccountSetup &&
    isFeatureActive("AAP_INTERVENTION_ZONE_UPDATE")
  ) {
    return (
      <AccountSetup
        headAgencyId={
          accountWithMaisonMereResponse?.account_getAccountForConnectedUser
            ?.organism?.id
        }
        maisonMereAAPId={
          accountWithMaisonMereResponse.account_getAccountForConnectedUser
            .maisonMereAAP.id
        }
      />
    );
  }

  return <div className="flex flex-col md:flex-row w-full">{children}</div>;
};

export default AapLayout;
