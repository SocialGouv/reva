import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdateCompetenceBlocInput } from "@/graphql/generated/graphql";

const getCompetenceBlocQuery = graphql(`
  query getCompetenceBlocForUpdateCompetenceBlocPage(
    $certificationCompetenceBlocId: ID!
  ) {
    getCertificationCompetenceBloc(
      certificationCompetenceBlocId: $certificationCompetenceBlocId
    ) {
      id
      label
      code
      FCCompetences
      competences {
        id
        label
      }
      certification {
        id
        label
        codeRncp
      }
    }
  }
`);

const updateCertificationCompetenceBlocMutation = graphql(`
  mutation updateCertificationCompetenceBlocForUpdateCertificationCompetenceBlocPage(
    $input: UpdateCompetenceBlocInput!
  ) {
    referential_updateCertificationCompetenceBloc(input: $input) {
      id
    }
  }
`);

const deleteCertificationCompetenceBlocMutation = graphql(`
  mutation deleteCertificationCompetenceBlocForUpdateCompetenceBlocPage(
    $certificationId: ID!
    $certificationCompetenceBlocId: ID!
  ) {
    referential_deleteCertificationCompetenceBloc(
      certificationId: $certificationId
      certificationCompetenceBlocId: $certificationCompetenceBlocId
    ) {
      id
    }
  }
`);

export const useUpdateCompetenceBlocPage = ({
  certificationCompetenceBlocId,
}: {
  certificationCompetenceBlocId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: getCompetenceBlocResponse,
    status: getCompetenceBlocQueryStatus,
  } = useQuery({
    queryKey: [
      certificationCompetenceBlocId,
      "competenceBlocs",
      "getCompetenceBlocForUpdateCompetenceBlocPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCompetenceBlocQuery, {
        certificationCompetenceBlocId,
      }),
  });

  const updateCertificationCompetenceBloc = useMutation({
    mutationFn: (
      input: Omit<UpdateCompetenceBlocInput, "id" | "certificationId">,
    ) =>
      graphqlClient.request(updateCertificationCompetenceBlocMutation, {
        input: {
          ...input,
          certificationId: competenceBloc?.certification.id || "",
          id: certificationCompetenceBlocId,
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationCompetenceBlocId],
      }),
  });

  const deleteCertificationCompetenceBloc = useMutation({
    mutationFn: () =>
      graphqlClient.request(deleteCertificationCompetenceBlocMutation, {
        certificationId: competenceBloc?.certification.id || "",
        certificationCompetenceBlocId,
      }),
  });

  const competenceBloc =
    getCompetenceBlocResponse?.getCertificationCompetenceBloc;

  return {
    competenceBloc,
    getCompetenceBlocQueryStatus,
    updateCertificationCompetenceBloc,
    deleteCertificationCompetenceBloc,
  };
};
