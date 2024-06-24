import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyQuery = graphql(`
  query getCandidacyForPaymentRequestUnifvaeInvoicePage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        firstname
        lastname
        gender
      }
      certification {
        label
      }
      organism {
        label
      }
      fundingRequestUnifvae {
        numAction
      }
    }
  }
`);

export const usePaymentRequestUniFvaeInvoicePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{ candidacyId: string }>();

  const { data: getCandidacyResponse, status: getCandidacyStatus } = useQuery({
    queryKey: [candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const candidacy = getCandidacyResponse?.getCandidacyById;

  return { candidacy, getCandidacyStatus };
};
