import { useMutation, useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateCompetenceBlocInput } from "@/graphql/generated/graphql";

const getCertificationQuery = graphql(`
  query getCertificationForAddCompetenceBlocPage($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
    }
  }
`);

const createCertificationCompetenceBlocMutation = graphql(`
  mutation createCertificationCompetenceBlocForAddCertificationCompetenceBlocPage(
    $input: CreateCompetenceBlocInput!
  ) {
    referential_createCertificationCompetenceBloc(input: $input) {
      id
    }
  }
`);

export const useAddCompetenceBlocPage = ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationResponse,
    status: getCertificationQueryStatus,
  } = useQuery({
    queryKey: [
      certificationId,
      "competenceBlocs",
      "getCertificationForAddCompetenceBlocPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const createCertificationCompetenceBloc = useMutation({
    mutationFn: (input: Omit<CreateCompetenceBlocInput, "certificationId">) =>
      graphqlClient.request(createCertificationCompetenceBlocMutation, {
        input: { ...input, certificationId },
      }),
  });

  const certification = getCertificationResponse?.getCertification;

  return {
    certification,
    getCertificationQueryStatus,
    createCertificationCompetenceBloc,
  };
};
