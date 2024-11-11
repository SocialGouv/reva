import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

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
        codeRncp
      }
    }
  }
`);

export const useUpdateCompetenceBlocPage = ({
  certificationCompetenceBlocId,
}: {
  certificationCompetenceBlocId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

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

  const competenceBloc =
    getCompetenceBlocResponse?.getCertificationCompetenceBloc;

  return { competenceBloc, getCompetenceBlocQueryStatus };
};
