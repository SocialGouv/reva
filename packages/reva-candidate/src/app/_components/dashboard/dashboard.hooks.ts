import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useSuspenseQuery } from "@tanstack/react-query";

const GET_CANDIDATE_WITH_CANDIDACY = graphql(`
  query candidate_getCandidateWithCandidacyForDashboard {
    candidate_getCandidateWithCandidacy {
      candidacy {
        readyForJuryEstimatedAt
        activeDossierDeValidation {
          decision
        }
        candidacyContestationsCaducite {
          contestationSentAt
          certificationAuthorityContestationDecision
        }
        lastActivityDate
        status
        typeAccompagnement
        firstAppointmentOccuredAt
        isCaduque
        candidacyStatuses {
          status
        }
        candidacyDropOut {
          proofReceivedByAdmin
          createdAt
          dropOutConfirmedByCandidate
        }
        certification {
          id
          label
          codeRncp
        }
        goals {
          id
        }
        experiences {
          id
        }
        organism {
          id
          label
          contactAdministrativeEmail
          contactAdministrativePhone
          nomPublic
          emailContact
          telephone
          adresseNumeroEtNomDeRue
          adresseInformationsComplementaires
          adresseCodePostal
          adresseVille
        }
        feasibility {
          decision
          feasibilityFormat
          dematerializedFeasibilityFile {
            candidateConfirmationAt
            sentToCandidateAt
          }
          certificationAuthority {
            contactEmail
            contactFullName
            label
          }
        }
        jury {
          dateOfSession
          timeOfSession
          timeSpecified
          result
        }
      }
    }
  }
`);

export const useCandidacyForDashboard = () => {
  const { graphqlClient } = useGraphQlClient();
  const { data } = useSuspenseQuery({
    queryKey: ["candidate", "dashboard"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;

  const candidacy = candidate?.candidacy;

  const candidacyStatus = candidacy?.status;

  const candidacyAlreadySubmitted = candidacyStatus !== "PROJET";

  const feasibility = candidacy?.feasibility;

  return {
    candidacy,
    candidacyAlreadySubmitted,
    feasibility,
  };
};

type CandidateForDashboardHookReturnType = ReturnType<
  typeof useCandidacyForDashboard
>;
export type CandidacyUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"];
export type JuryUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["jury"];
export type FeasibilityUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["feasibility"];
export type ExperiencesUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["experiences"];
export type OrganismUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["organism"];
export type DossierDeValidationUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["activeDossierDeValidation"];
export type CandidacyDropOutUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["candidacyDropOut"];
export type CandidacyContestationsCaduciteUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["candidacyContestationsCaducite"];
