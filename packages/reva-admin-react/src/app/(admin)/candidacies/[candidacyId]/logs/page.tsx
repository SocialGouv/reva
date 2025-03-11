"use client";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { Log, DayLog } from "../../../../../components/logs/day-log/DayLog";
import { fr } from "date-fns/locale";

const getCandidacyLogsQuery = graphql(`
  query getCandidacyLogs($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      certification {
        label
      }
      candidate {
        firstname
        lastname
      }
      candidacyLogs {
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

const CandidacyLogsPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyLogsResponse } = useQuery({
    queryKey: ["getCandidacyLogs", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyLogsQuery, {
        candidacyId,
      }),
  });

  const candidacy = getCandidacyLogsResponse?.getCandidacyById;
  const candidate = candidacy?.candidate;
  const candidacyLogs = candidacy?.candidacyLogs || [];

  const logsGroupedByDay = candidacyLogs.reduce(
    (acc: Record<string, Log[]>, log) => {
      const dayKey = format(log.createdAt, "do MMMM yyyy", { locale: fr });

      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(log);

      return acc;
    },
    {},
  );

  return (
    candidacy && (
      <div className="flex flex-col">
        <CandidacyBackButton candidacyId={candidacyId} />
        <h1>
          {candidate?.firstname} {candidate?.lastname} - Suivi de la candidature
        </h1>
        <p className="text-xl text-gray-700 font-bold mb-11">
          {candidacy.certification?.label}
        </p>
        <div>
          {Object.keys(logsGroupedByDay).map((day) => {
            return <DayLog key={day} day={day} logs={logsGroupedByDay[day]} />;
          })}
        </div>
      </div>
    )
  );
};

export default CandidacyLogsPage;
