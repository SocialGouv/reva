module Api.Candidacy exposing (get, getCandidacies, getCandidacyCountByStatus, statusSelection, takeOver)

import Admin.Enum.CandidacyStatusFilter
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.CandidacyCountByStatus
import Admin.Object.CandidacyDropOut
import Admin.Object.CandidacyStatus
import Admin.Object.CandidacySummary
import Admin.Object.CandidacySummaryPage
import Admin.Object.Candidate
import Admin.Object.CandidateGoal
import Admin.Object.Certification
import Admin.Object.CertificationSummary
import Admin.Object.Experience
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.CertificationAuthority as CertificationAuthority
import Api.Feasibility
import Api.Organism as Organism
import Api.Pagination exposing (pageInfoSelection)
import Api.Referential exposing (departmentSelection, reorientationReasonSelection)
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Candidate
import Data.Certification
import Graphql.Operation
import Graphql.OptionalArgument as OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))
import View.Date exposing (toDateWithLabels)


getCandidacies :
    String
    -> Token
    -> (RemoteData (List String) Data.Candidacy.CandidacySummaryPage -> msg)
    -> Int
    -> Maybe Admin.Enum.CandidacyStatusFilter.CandidacyStatusFilter
    -> Maybe String
    -> Cmd msg
getCandidacies endpointGraphql token toMsg page statusFilter searchFilter =
    Query.getCandidacies
        (\optionals ->
            { optionals
                | limit = Present 10
                , offset = Present ((page - 1) * 10)
                , statusFilter = OptionalArgument.fromMaybe statusFilter
                , searchFilter = OptionalArgument.fromMaybe searchFilter
            }
        )
        summaryPageSelection
        |> Auth.makeQuery "getCandidacies" endpointGraphql token toMsg


get :
    String
    -> Token
    -> (RemoteData (List String) Data.Candidacy.Candidacy -> msg)
    -> CandidacyId
    -> Cmd msg
get endpointGraphql token toMsg candidacyId =
    let
        id =
            Data.Candidacy.candidacyIdToString candidacyId
    in
    selection id
        |> Auth.makeQuery "getCandidacy" endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


takeOver :
    String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> CandidacyId
    -> Cmd msg
takeOver endpointGraphql token toMsg candidacyId =
    let
        id =
            Data.Candidacy.candidacyIdToString candidacyId
    in
    Mutation.candidacy_takeOver (Mutation.CandidacyTakeOverRequiredArguments (Id id)) (SelectionSet.succeed ())
        |> Auth.makeMutation "takeOverCandidacy" endpointGraphql token toMsg


getCandidacyCountByStatus :
    String
    -> Token
    -> (RemoteData (List String) Data.Candidacy.CandidacyCountByStatus -> msg)
    -> Cmd msg
getCandidacyCountByStatus endpointGraphql token toMsg =
    Query.candidacy_candidacyCountByStatus candidacyCountByStatusSelection
        |> Auth.makeQuery "getCandidacyCountByStatus" endpointGraphql token toMsg


selection : String -> SelectionSet (Maybe Data.Candidacy.Candidacy) Graphql.Operation.RootQuery
selection id =
    let
        candidacyRequiredArgs =
            Query.GetCandidacyByIdRequiredArguments (Id id)

        getCompanionsRequiredArg =
            Query.GetCompanionsForCandidacyRequiredArguments (Uuid id)

        droppedOutDateSelection =
            SelectionSet.succeed identity
                |> with Admin.Object.CandidacyDropOut.droppedOutAt

        candidacySelectionWithoutCompanions =
            SelectionSet.succeed Data.Candidacy.Candidacy
                |> with (SelectionSet.map (\(Id candidacyId) -> Data.Candidacy.candidacyIdFromString candidacyId) Admin.Object.Candidacy.id)
                |> with (SelectionSet.succeed [])
                |> with (Admin.Object.Candidacy.candidate candidateSelection)
                |> with (SelectionSet.map (Maybe.map (\(Id certificationId) -> certificationId)) Admin.Object.Candidacy.certificationId)
                |> with (Admin.Object.Candidacy.organism Organism.selection)
                |> with (Admin.Object.Candidacy.certification certificationSelection)
                |> with (Admin.Object.Candidacy.department departmentSelection)
                |> with (Admin.Object.Candidacy.goals goalSelection)
                |> with (Admin.Object.Candidacy.experiences experienceSelection)
                |> with Admin.Object.Candidacy.firstname
                |> with Admin.Object.Candidacy.lastname
                |> with Admin.Object.Candidacy.phone
                |> with Admin.Object.Candidacy.email
                |> with (Admin.Object.Candidacy.candidacyDropOut droppedOutDateSelection)
                |> with (Admin.Object.Candidacy.candidacyStatuses statusSelection)
                |> with Admin.Object.Candidacy.createdAt
                |> with (Admin.Object.Candidacy.reorientationReason reorientationReasonSelection)
                |> with (Admin.Object.Candidacy.certificationAuthorities CertificationAuthority.selection)
                |> with (Admin.Object.Candidacy.feasibility Api.Feasibility.selection)
                |> with Admin.Object.Candidacy.financeModule
    in
    SelectionSet.succeed
        (\maybeCandidacy companions ->
            maybeCandidacy
                |> Maybe.map (\candidacy -> { candidacy | availableCompanions = companions })
        )
        |> with (Query.getCandidacyById candidacyRequiredArgs candidacySelectionWithoutCompanions)
        |> with (Query.getCompanionsForCandidacy getCompanionsRequiredArg Organism.selection)



-- CANDIDATE


candidateSelection : SelectionSet Data.Candidate.Candidate Admin.Object.Candidate
candidateSelection =
    SelectionSet.succeed Data.Candidate.Candidate
        |> with (SelectionSet.map (\(Uuid id) -> id) Admin.Object.Candidate.id)
        |> with Admin.Object.Candidate.firstname
        |> with Admin.Object.Candidate.firstname2
        |> with Admin.Object.Candidate.firstname3
        |> with Admin.Object.Candidate.gender
        |> with Admin.Object.Candidate.lastname



-- CANDIDACY SUMMARY


summaryPageSelection : SelectionSet Data.Candidacy.CandidacySummaryPage Admin.Object.CandidacySummaryPage
summaryPageSelection =
    SelectionSet.succeed Data.Candidacy.CandidacySummaryPage
        |> with (Admin.Object.CandidacySummaryPage.rows summarySelection)
        |> with (Admin.Object.CandidacySummaryPage.info pageInfoSelection)


summarySelection : SelectionSet Data.Candidacy.CandidacySummary Admin.Object.CandidacySummary
summarySelection =
    SelectionSet.succeed Data.Candidacy.CandidacySummary
        |> with (SelectionSet.map (\(Id id) -> Data.Candidacy.candidacyIdFromString id) Admin.Object.CandidacySummary.id)
        |> with (SelectionSet.map (Maybe.map (\(Id id) -> id)) Admin.Object.CandidacySummary.certificationId)
        |> with (Admin.Object.CandidacySummary.certification certificationSummarySelection)
        |> with (Admin.Object.CandidacySummary.department departmentSelection)
        |> with (Admin.Object.CandidacySummary.organism Organism.selection)
        |> with Admin.Object.CandidacySummary.firstname
        |> with Admin.Object.CandidacySummary.lastname
        |> with Admin.Object.CandidacySummary.phone
        |> with Admin.Object.CandidacySummary.email
        |> with Admin.Object.CandidacySummary.isDroppedOut
        |> with (Admin.Object.CandidacySummary.lastStatus statusSelection)
        |> with Admin.Object.CandidacySummary.isReorientation
        |> with Admin.Object.CandidacySummary.createdAt
        |> with
            (SelectionSet.map
                (Maybe.map toDateWithLabels)
                Admin.Object.CandidacySummary.sentAt
            )


candidacyCountByStatusSelection : SelectionSet Data.Candidacy.CandidacyCountByStatus Admin.Object.CandidacyCountByStatus
candidacyCountByStatusSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyCountByStatus
        |> with Admin.Object.CandidacyCountByStatus.activeHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.abandon
        |> with Admin.Object.CandidacyCountByStatus.reorientee
        |> with Admin.Object.CandidacyCountByStatus.archiveHorsAbandonHorsReorientation
        |> with Admin.Object.CandidacyCountByStatus.parcoursConfirmeHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.priseEnChargeHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.parcoursEnvoyeHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.dossierFaisabiliteEnvoyeHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.dossierFaisabiliteRecevableHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.dossierFaisabiliteIncompletHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.dossierFaisabiliteNonRecevableHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.demandeFinancementEnvoyeHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.demandePaiementEnvoyeeHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.validationHorsAbandon
        |> with Admin.Object.CandidacyCountByStatus.projetHorsAbandon



-- GOAL


goalSelection : SelectionSet Data.Candidacy.CandidacyGoal Admin.Object.CandidateGoal
goalSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyGoal
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.CandidateGoal.goalId)
        |> with Admin.Object.CandidateGoal.additionalInformation



-- EXPERIENCE


experienceSelection : SelectionSet Data.Candidacy.CandidacyExperience Admin.Object.Experience
experienceSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyExperience
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Experience.id)
        |> with Admin.Object.Experience.title
        |> with Admin.Object.Experience.startedAt
        |> with Admin.Object.Experience.duration
        |> with Admin.Object.Experience.description



-- STATUS


statusSelection : SelectionSet Data.Candidacy.CandidacyStatus Admin.Object.CandidacyStatus
statusSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyStatus
        |> with (SelectionSet.map toDateWithLabels Admin.Object.CandidacyStatus.createdAt)
        |> with Admin.Object.CandidacyStatus.status
        |> with Admin.Object.CandidacyStatus.isActive



-- CERTIFICATIONS


certificationSelection : SelectionSet Data.Certification.Certification Admin.Object.Certification
certificationSelection =
    SelectionSet.succeed Data.Certification.Certification
        |> with Admin.Object.Certification.id
        |> with Admin.Object.Certification.label
        |> with Admin.Object.Certification.summary
        |> with Admin.Object.Certification.level
        |> with Admin.Object.Certification.activities
        |> with Admin.Object.Certification.activityArea
        |> with Admin.Object.Certification.accessibleJobType
        |> with Admin.Object.Certification.abilities


certificationSummarySelection : SelectionSet Data.Certification.CertificationSummary Admin.Object.CertificationSummary
certificationSummarySelection =
    SelectionSet.succeed Data.Certification.CertificationSummary
        |> with Admin.Object.CertificationSummary.id
        |> with Admin.Object.CertificationSummary.label
