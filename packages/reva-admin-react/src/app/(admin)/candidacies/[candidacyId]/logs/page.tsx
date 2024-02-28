"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { ADMIN_ELM_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";

const getCandidacyLogsQuery = graphql(`
  query getCandidacyLogs($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      certification {
        label
      }
      candidacyLogs {
        id
        createdAt
        message
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

  const candidacyLogs =
    getCandidacyLogsResponse?.getCandidacyById?.candidacyLogs;
  return (
    <div className="flex flex-col">
      <Link
        href={`${ADMIN_ELM_URL}/candidacies/${candidacyId}`}
        className="fr-icon-arrow-go-back-line fr-link--icon-left text-blue-900 text-lg mr-auto mb-8"
      >
        Résumé de la candidature
      </Link>
      <PageTitle>Journal des actions</PageTitle>
      {candidacyLogs?.map((l) => (
        <div key={l.id}>
          {format(l.createdAt, "dd/MM/yyyy HH:mm")} - {l.message}
        </div>
      ))}
    </div>
  );
};

export default CandidacyLogsPage;
