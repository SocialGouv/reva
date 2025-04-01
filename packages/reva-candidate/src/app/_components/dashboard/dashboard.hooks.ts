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
        }
      }
    }
  }
`);

const useCandidateWithCandidacy = () => {
  const { graphqlClient } = useGraphQlClient();

  const candidateWithCandidacy = useSuspenseQuery({
    queryKey: ["dashboard"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY),
  });

  return {
    candidateWithCandidacy,
  };
};

export const useCandidacyForDashboard = () => {
  const {
    candidateWithCandidacy: { data },
  } = useCandidateWithCandidacy();

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
