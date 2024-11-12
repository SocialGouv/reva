import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

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

  return { certification, getCertificationQueryStatus };
};
