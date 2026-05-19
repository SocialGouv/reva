"use client";
import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getMaisonMereAAPMetabaseDashboardIframeUrlQuery = graphql(`
  query getMaisonMereAAPMetabaseDashboardIframeUrl {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        metabaseDashboardIframeUrl
      }
    }
  }
`);

const AAPDashboard = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getMaisonMereAAPMetabaseDashboardIframeUrl } = useQuery({
    queryKey: ["aap", "getMaisonMereAAPMetabaseDashboardIframeUrl"],
    queryFn: () =>
      graphqlClient.request(getMaisonMereAAPMetabaseDashboardIframeUrlQuery),
  });

  const iframeUrl =
    getMaisonMereAAPMetabaseDashboardIframeUrl
      ?.account_getAccountForConnectedUser?.maisonMereAAP
      ?.metabaseDashboardIframeUrl;

  if (!iframeUrl) {
    return null;
  }

  return <iframe src={iframeUrl} className="w-full h-[3200px]" />;
};

export default AAPDashboard;
