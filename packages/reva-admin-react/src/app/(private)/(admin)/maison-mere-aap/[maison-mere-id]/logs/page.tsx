"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { DayLog, groupLogsByDay } from "@/components/logs/day-log/DayLog";

import { graphql } from "@/graphql/generated";

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
          email
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

  const logsGroupedByDay = groupLogsByDay(aapLogs);

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
