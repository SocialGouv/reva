import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getMaisonMereAAPRasionSocialeAdminQuery = graphql(`
  query getMaisonMereAAPRasionSocialeAdminQuery($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      raisonSociale
    }
  }
`);

export const useMaisonMereAAP = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: maisonMereAAPData } = useQuery({
    queryKey: [maisonMereAAPId, "maisonMereAAP"],
    queryFn: () =>
      graphqlClient.request(getMaisonMereAAPRasionSocialeAdminQuery, {
        maisonMereAAPId,
      }),
  });

  return { maisonMereAAP: maisonMereAAPData?.organism_getMaisonMereAAPById };
};

interface Props {
  maisonMereAAPId: string;
}

export const MaisonMereAAP = (props: Props): React.ReactNode => {
  const { maisonMereAAPId } = props;

  const { maisonMereAAP } = useMaisonMereAAP({ maisonMereAAPId });

  if (!maisonMereAAP) return null;

  return (
    <div className="flex gap-2">
      <span className="fr-icon-home-4-fill" aria-hidden="true"></span>
      <strong className="text-xl">{maisonMereAAP.raisonSociale}</strong>
    </div>
  );
};
