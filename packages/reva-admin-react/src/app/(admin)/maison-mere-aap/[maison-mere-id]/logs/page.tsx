"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { fr } from "date-fns/locale";
import { Log, DayLog } from "@/components/logs/day-log/DayLog";
import { Button } from "@codegouvfr/react-dsfr/Button";

const getAAPLogsQuery = graphql(`
  query getAAPLogs($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      raisonSociale
      aapLogs {
        id
        createdAt
        message
        details
        userProfile
        user {
          firstname
          lastname
        }
      }
    }
  }
`);

const AAPLogsPage = () => {
  const { "maison-mere-id": maisonMereAAPId } = useParams<{
    "maison-mere-id": string;
  }>();

  const { graphqlClient } = useGraphQlClient();

  const { data: getAAPLogsResponse } = useQuery({
    queryKey: ["getAAPLogs", maisonMereAAPId],
    queryFn: () =>
      graphqlClient.request(getAAPLogsQuery, {
        maisonMereAAPId,
      }),
  });

  const maisonMere = getAAPLogsResponse?.organism_getMaisonMereAAPById;
  const aapLogs = maisonMere?.aapLogs || [];

  const logsGroupedByDay = aapLogs.reduce((acc: Record<string, Log[]>, log) => {
    const dayKey = format(log.createdAt, "do MMMM yyyy", { locale: fr });

    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(log);

    return acc;
  }, {});

  return (
    maisonMere && (
      <div className="flex flex-col w-full">
        <Button
          className="mb-6"
          priority="tertiary"
          iconId="fr-icon-arrow-go-back-line"
          linkProps={{
            href: `/maison-mere-aap/${maisonMereAAPId}/`,
            target: "_self",
          }}
        >
          Retour
        </Button>
        <h1 className="mb-11">
          {maisonMere.raisonSociale} - Journal des actions
        </h1>
        <div>
          {Object.keys(logsGroupedByDay).map((day) => {
            return <DayLog key={day} day={day} logs={logsGroupedByDay[day]} />;
          })}
        </div>
      </div>
    )
  );
};

export default AAPLogsPage;
