import { useMutation, useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const getFCCertificationQuery = graphql(`
  query getFCCertificationForAddCertificationPage($rncp: ID!) {
    getFCCertification(rncp: $rncp) {
      ID_FICHE
      NUMERO_FICHE
      INTITULE
      ABREGE {
        CODE
        LIBELLE
      }
      NOMENCLATURE_EUROPE {
        NIVEAU
        INTITULE
      }
      DATE_FIN_ENREGISTREMENT
      DATE_LIMITE_DELIVRANCE
      FORMACODES {
        CODE
        LIBELLE
      }
      DOMAINS {
        id
        code
        label
        children {
          id
          code
          label
        }
      }
    }
  }
`);

const addCertificationMutation = graphql(`
  mutation addFCCertificationForAddCertificationPage(
    $input: AddCertificationInput!
  ) {
    referential_addCertification(input: $input) {
      id
    }
  }
`);

export const useAddCertificationPage = ({ rncp }: { rncp: string }) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationQueryResponse,
    status: getCertificationQueryStatus,
  } = useQuery({
    queryKey: [
      rncp,
      "certifications",
      "getFCCertificationForAddCertificationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getFCCertificationQuery, {
        rncp,
      }),
  });

  const certification = getCertificationQueryResponse?.getFCCertification;

  const addCertification = useMutation({
    mutationFn: (input: { codeRncp: string }) =>
      graphqlClient.request(addCertificationMutation, {
        input,
      }),
  });

  return { certification, getCertificationQueryStatus, addCertification };
};
