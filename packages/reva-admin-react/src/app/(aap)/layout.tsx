"use client";
import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";
import AccountSetup from "./_components/account-setup/AccountSetup";
import { usePathname } from "next/navigation";
const accountWithMaisonMereQuery = graphql(`
  query getAccountInfo {
    account_getAccountForConnectedUser {
      organism {
        id
      }
      maisonMereAAP {
        showAccountSetup
        id
      }
    }
  }
`);

const AapLayout = ({ children }: { children: ReactNode }) => {
  const { isGestionnaireMaisonMereAAP } = useAuth();
  const { graphqlClient } = useGraphQlClient();
  const currentPathName = usePathname();

  const { data: accountWithMaisonMereResponse } = useQuery({
    queryKey: ["organisms"],
    queryFn: () => graphqlClient.request(accountWithMaisonMereQuery),
  });

  if (!accountWithMaisonMereResponse) {
    return <p>Chargement...</p>;
  }

  //show the first time aap account setup if the aap is a maisonMere manager, if the account setup page has never been shown and if the user is not on the CGU page
  if (
    isGestionnaireMaisonMereAAP &&
    accountWithMaisonMereResponse?.account_getAccountForConnectedUser
      ?.maisonMereAAP?.showAccountSetup &&
    currentPathName !== "/cgu/"
  ) {
    return (
      <AccountSetup
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
