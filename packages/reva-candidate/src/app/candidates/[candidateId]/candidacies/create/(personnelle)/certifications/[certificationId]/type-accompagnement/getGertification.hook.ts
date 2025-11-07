import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CERTIFICATION = graphql(`
  query getCertificationByIdForCreateCandidacy($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      isAapAvailable
    }
  }
`);

export const useGetCertification = () => {
  const { graphqlClient } = useGraphQlClient();

  const { certificationId } = useParams<{ certificationId: string }>();

  const { data } = useQuery({
    queryKey: ["certification", certificationId],
    queryFn: () =>
      graphqlClient.request(GET_CERTIFICATION, {
        certificationId,
      }),
  });

  return { certification: data?.getCertification };
};
