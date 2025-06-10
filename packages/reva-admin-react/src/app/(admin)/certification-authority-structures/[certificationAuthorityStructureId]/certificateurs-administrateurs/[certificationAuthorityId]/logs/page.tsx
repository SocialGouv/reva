"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { DayLog, groupLogsByDay } from "@/components/logs/day-log/DayLog";
import { Button } from "@codegouvfr/react-dsfr/Button";

const getCertificationAuthorityLogsQuery = graphql(`
  query getCertificationAuthorityLogs($certificationAuthorityId: ID!) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
      certificationAuthorityLogs {
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

const CertificationAuthorityLogsPage = () => {
  const { certificationAuthorityStructureId, certificationAuthorityId } =
    useParams<{
      certificationAuthorityStructureId: string;
      certificationAuthorityId: string;
    }>();

  const { graphqlClient } = useGraphQlClient();

  const { data: getCertificationAuthorityLogsResponse } = useQuery({
    queryKey: ["getCertificationAuthorityLogs", certificationAuthorityId],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLogsQuery, {
        certificationAuthorityId,
      }),
  });

  const certificationAuthority =
    getCertificationAuthorityLogsResponse?.certification_authority_getCertificationAuthority;
  const certificationAuthorityLogs =
    certificationAuthority?.certificationAuthorityLogs || [];

  const logsGroupedByDay = groupLogsByDay(certificationAuthorityLogs);

  return (
    certificationAuthority && (
      <div className="flex flex-col w-full">
        <Button
          className="mb-6"
          priority="tertiary"
          iconId="fr-icon-arrow-go-back-line"
          linkProps={{
            href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`,
            target: "_self",
          }}
        >
          Retour
        </Button>
        <h1 className="mb-11">
          {certificationAuthority.label} - Journal des actions
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

export default CertificationAuthorityLogsPage;
