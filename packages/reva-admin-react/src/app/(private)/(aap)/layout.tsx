"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { Skeleton } from "@/components/aap-candidacy-layout/Skeleton";
import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

import AccountSetup from "./_components/account-setup/AccountSetup";

const accountWithMaisonMereQuery = graphql(`
  query getAccountInfo {
    account_getAccountForConnectedUser {
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
    return <Skeleton />;
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
