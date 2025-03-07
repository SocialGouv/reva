import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";
import { useSuspenseQuery } from "@tanstack/react-query";

const GET_CANDIDATE_WITH_CANDIDACY = graphql(`
  query candidate_getCandidateWithCandidacyForDashboard {
    candidate_getCandidateWithCandidacy {
      phone
      email
      birthDepartment {
        id
      }
      birthCity
      city
      zip
      street
      birthdate
      firstname
      lastname
      gender
      nationality
      candidacy {
        id
        typeAccompagnement
        status
        lastActivityDate
        isCaduque
        firstAppointmentOccuredAt
        candidacyStatuses {
          status
        }
        candidacyDropOut {
          createdAt
          dropOutConfirmedByCandidate
          proofReceivedByAdmin
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
        activeDossierDeValidation {
          id
          decision
          decisionComment
          decisionSentAt
        }
        jury {
          id
          dateOfSession
          timeOfSession
          timeSpecified
        }
        feasibilityFormat
        feasibility {
          id
          feasibilityFileSentAt
          decision
          decisionComment
          decisionSentAt
          dematerializedFeasibilityFile {
            id
            sentToCandidateAt
            isReadyToBeSentToCandidate
            candidateConfirmationAt
            aapDecision
            aapDecisionComment
            candidateDecisionComment
          }
        }
        candidacyContestationsCaducite {
          contestationSentAt
          certificationAuthorityContestationDecision
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
    candidateWithCandidacy: { data, refetch },
  } = useCandidateWithCandidacy();

  const candidate = data?.candidate_getCandidateWithCandidacy;

  const candidacy = candidate?.candidacy;

  const candidacyStatus = candidacy?.status;

  const isCurrentlySubmitted = candidacyStatus === "PARCOURS_ENVOYE";

  const isTrainingConfirmed =
    candidacy?.candidacyStatuses.findIndex(
      (status) => status.status == "PARCOURS_CONFIRME",
    ) != -1 && !isCurrentlySubmitted;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus,
    candidacyDropOut: !!candidacy?.candidacyDropOut,
  });

  const candidacyAlreadySubmitted = candidacyStatus !== "PROJET";

  const feasibility = candidacy?.feasibility;
  const dematerializedFeasibilityFile =
    feasibility?.dematerializedFeasibilityFile;

  return {
    refetch,
    candidate,
    candidacy,
    isTrainingConfirmed,
    canEditCandidacy,
    candidacyAlreadySubmitted,
    candidacyStatus,
    feasibility,
    dematerializedFeasibilityFile,
  };
};
