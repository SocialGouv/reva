"use client";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { graphql } from "@/graphql/generated";
import {
  CandidacyLogUser,
  CandidacyLogUserProfile,
} from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { capitalize, toLower, toUpper, truncate } from "lodash";
import { useParams } from "next/navigation";

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
  const candidacyLogs = candidacy?.candidacyLogs;

  const getUserProfileText = ({
    userProfile,
    user,
  }: {
    userProfile: CandidacyLogUserProfile;
    user: CandidacyLogUser;
  }) => {
    switch (userProfile) {
      case "ADMIN":
        return `Administrateur (${toUpper(
          truncate(user.firstname, { length: 2, omission: "." }),
        )} ${capitalize(toLower(user.lastname))})`;
      case "AAP":
        return "AAP";
      case "CERTIFICATEUR":
        return "Certificateur";
      case "CANDIDAT":
        return "Candidat";
    }
    return "Inconnu";
  };

  return (
    candidacy && (
      <div className="flex flex-col">
        <CandidacyBackButton candidacyId={candidacyId} />
        <PageTitle className="!mb-4">
          {candidate?.firstname} {candidate?.lastname} - Suivi de la candidature
        </PageTitle>
        <p className="text-xl text-gray-700 font-bold mb-11">
          {candidacy.certification?.label}
        </p>
        <ul>
          {candidacyLogs?.map((l) => (
            <li key={l.id} className="flex flex-col my-2">
              <span className="text-sm font-bold">
                {format(l.createdAt, "dd/MM/yyyy - HH:mm")}
              </span>
              <span>
                <strong>
                  {getUserProfileText({
                    userProfile: l.userProfile,
                    user: l.user,
                  })}{" "}
                  :{" "}
                </strong>
                {l.message}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default CandidacyLogsPage;
