import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const feasibilityGetActiveFeasibilityByCandidacyId = graphql(`
  query feasibilityGetActiveFeasibilityByCandidacyId($candidacyId: ID!) {
    feasibility_getActiveFeasibilityByCandidacyId(candidacyId: $candidacyId) {
      dematerializedFeasibilityFile {
        id
        swornStatementFile {
          name
          previewUrl
          mimeType
        }
        sentToCandidateAt
        sentToCertificationAuthorityAt
        aapDecision
        aapDecisionComment
        prerequisites {
          label
          state
        }
        firstForeignLanguage
        secondForeignLanguage
        option
        blocsDeCompetences {
          certificationCompetenceBloc {
            id
            code
            label
            isOptional
            FCCompetences
            competences {
              id
              label
            }
          }
        }
        certificationCompetenceDetails {
          text
          state
          certificationCompetence {
            id
            label
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
      candidacy {
        certificationAuthorities {
          label
        }
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
          certificationAuthorities {
            id
            label
          }
          label
          codeRncp
          level
          degree {
            longLabel
            level
          }
        }
        goals {
          id
          label
          isActive
        }
        experiences {
          id
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
    }
  }
`);

export const useDematerializedFeasibility = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse } = useQuery({
    queryKey: [
      candidacyId,
      "dematerializedFeasibilityFileSendFileCertificationAuthorityByCandidacyId",
    ],
    queryFn: () =>
      graphqlClient.request(feasibilityGetActiveFeasibilityByCandidacyId, {
        candidacyId,
      }),
  });

  const feasibility =
    getCandidacyByIdResponse?.feasibility_getActiveFeasibilityByCandidacyId;
  const dematerializedFeasibilityFile =
    feasibility?.dematerializedFeasibilityFile;
  const dematerializedFeasibilityFileId = dematerializedFeasibilityFile?.id;

  return {
    dematerializedFeasibilityFileId,
    dematerializedFeasibilityFile,
  };
};
