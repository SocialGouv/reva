import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const dematerializedFeasibilityFileDffSummaryByCandidacyId = graphql(`
  query dematerializedFeasibilityFileDffSummaryByCandidacyId(
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_getByCandidacyId(
      candidacyId: $candidacyId
    ) {
      certificationCompetenceDetails {
        certificationCompetence {
          label
        }
        text
      }
      decision
      decisionComment
      prerequisites {
        label
        state
      }
      certificationCompetenceDetails {
        certificationCompetence {
          label
        }
        text
      }
      firstForeignLanguage
      secondForeignLanguage
      option
      candidacy {
        individualHourCount
        collectiveHourCount
        additionalHourCount
        basicSkills {
          label
          id
        }
        mandatoryTrainings {
          label
          id
        }
        certification {
          label
          codeRncp
          level
          degree {
            longLabel
            level
          }
          competenceBlocs {
            code
            label
            isOptional
            FCCompetences
            competences {
              label
            }
          }
        }
        goals {
          label
          isActive
        }
        experiences {
          title
          startedAt
          duration
          description
        }
        certificateSkills
        candidate {
          highestDegree {
            level
            longLabel
          }
          niveauDeFormationLePlusEleve {
            level
          }
          firstname
          firstname2
          firstname3
          lastname
          email
          givenName
          birthdate
          birthCity
          birthDepartment {
            label
            code
            region {
              code
              label
            }
          }
          nationality
          gender
          phone
          city
          street
          zip
        }
      }
      attachments {
        type
        file {
          name
          previewUrl
          mimeType
        }
      }
    }
  }
`);

export const useDffSummary = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse, status: getCandidacyByIdStatus } =
    useQuery({
      queryKey: [
        candidacyId,
        "dematerializedFeasibilityFileDffSummaryByCandidacyId",
      ],
      queryFn: () =>
        graphqlClient.request(
          dematerializedFeasibilityFileDffSummaryByCandidacyId,
          {
            candidacyId,
          },
        ),
    });

  const dematerializedFeasibilityFile =
    getCandidacyByIdResponse?.dematerialized_feasibility_file_getByCandidacyId;
  const candidacy = dematerializedFeasibilityFile?.candidacy;
  const candidate = candidacy?.candidate;
  return {
    queryStatus: getCandidacyByIdStatus,
    candidate,
    candidacy,
    dematerializedFeasibilityFile,
  };
};
