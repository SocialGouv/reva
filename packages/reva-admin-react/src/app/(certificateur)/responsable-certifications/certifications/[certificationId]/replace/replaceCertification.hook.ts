import { useMutation, useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const getFCCertificationQuery = graphql(`
  query getFCCertificationForReplaceCertificationPage($rncp: ID!) {
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

const getCertificationQuery = graphql(`
  query getCertificationForReplaceCertificationPage($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      label
      codeRncp
    }
  }
`);

const replaceCertificationMutation = graphql(`
  mutation replaceCertificationMutation($input: ReplaceCertificationInput!) {
    referential_replaceCertification(input: $input) {
      id
    }
  }
`);

export const useReplaceCertificationPage = ({
  rncp,
  certificationId,
}: {
  rncp: string;
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationQueryResponse,
    status: getCertificationQueryStatus,
  } = useQuery({
    queryKey: [
      certificationId,
      "certifications",
      "getCertificationForReplaceCertificationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const certification = getCertificationQueryResponse?.getCertification;

  const {
    data: getFCCertificationQueryResponse,
    status: getFCCertificationQueryStatus,
  } = useQuery({
    queryKey: [
      rncp,
      "certifications",
      "getFCCertificationForReplaceCertificationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getFCCertificationQuery, {
        rncp,
      }),
    enabled: !!rncp && rncp.length > 0,
  });

  const fcCertification = getFCCertificationQueryResponse?.getFCCertification;

  const replaceCertification = useMutation({
    mutationFn: (input: { certificationId: string; codeRncp: string }) =>
      graphqlClient.request(replaceCertificationMutation, {
        input,
      }),
  });

  return {
    certification,
    getCertificationQueryStatus,
    fcCertification,
    getFCCertificationQueryStatus,
    replaceCertification,
  };
};
