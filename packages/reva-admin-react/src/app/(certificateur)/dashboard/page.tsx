"use client";
import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityMetabaseUrlQuery = graphql(`
  query getCertificationAuthorityMetabaseUrl {
    account_getAccountForConnectedUser {
      certificationAuthority {
        metabaseDashboardIframeUrl
      }
    }
  }
`);

const CertificationAuthorityDashboard = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCertificationAuthorityMetabaseUrl } = useQuery({
    queryKey: ["certificateur", "getCertificationAuthorityMetabaseUrl"],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityMetabaseUrlQuery),
  });

  const iframeUrl =
    getCertificationAuthorityMetabaseUrl?.account_getAccountForConnectedUser
      ?.certificationAuthority?.metabaseDashboardIframeUrl;

  if (!iframeUrl) {
    return null;
  }

  return <iframe src={iframeUrl} className="w-full h-[3200px]" />;
};

export default CertificationAuthorityDashboard;
