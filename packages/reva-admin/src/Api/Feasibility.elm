module Api.Feasibility exposing (get, selection)

import Admin.Enum.FeasibilityDecision
import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.Candidate
import Admin.Object.Certification
import Admin.Object.Feasibility
import Admin.Object.FeasibilityHistory
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.CertificationAuthority as CertificationAuthority
import Api.File as File
import Api.Organism as Organism
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.CertificationAuthority
import Data.Feasibility
import Data.File exposing (File)
import Data.Organism exposing (Organism)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))
import Time


get :
    String
    -> Token
    -> (RemoteData (List String) Data.Feasibility.Feasibility -> msg)
    -> String
    -> Cmd msg
get endpointGraphql token toMsg feasibilityId =
    let
        feasibilityRequiredArgs =
            Query.FeasibilityRequiredArguments (Id feasibilityId)
    in
    Query.feasibility feasibilityRequiredArgs selection
        |> Auth.makeQuery "feasibility" endpointGraphql token (nothingToError "Ce dossier est introuvable" >> toMsg)


selection : SelectionSet Data.Feasibility.Feasibility Admin.Object.Feasibility
selection =
    SelectionSet.succeed toFeasibility
        |> with Admin.Object.Feasibility.id
        |> with (Admin.Object.Feasibility.certificationAuthority CertificationAuthority.selection)
        |> with (Admin.Object.Feasibility.feasibilityFile File.selection)
        |> with (Admin.Object.Feasibility.iDFile File.selection)
        |> with (Admin.Object.Feasibility.documentaryProofFile File.selection)
        |> with (Admin.Object.Feasibility.certificateOfAttendanceFile File.selection)
        |> with (Admin.Object.Feasibility.candidacy candidacySelection)
        |> with Admin.Object.Feasibility.decision
        |> with Admin.Object.Feasibility.decisionComment
        |> with Admin.Object.Feasibility.decisionSentAt
        |> with (Admin.Object.Feasibility.history feasibilityHistorySelection)


type alias Candidacy =
    { candidate : Maybe Data.Feasibility.Candidate
    , organism : Maybe Organism
    , certificationLabel : Maybe String
    }


toFeasibility :
    Id
    -> Maybe Data.CertificationAuthority.CertificationAuthority
    -> File
    -> Maybe File
    -> Maybe File
    -> Maybe File
    -> Candidacy
    -> Admin.Enum.FeasibilityDecision.FeasibilityDecision
    -> Maybe String
    -> Maybe Time.Posix
    -> List Data.Feasibility.FeasibilityHistory
    -> Data.Feasibility.Feasibility
toFeasibility (Id feasibilityId) certificationAuthority file iDFile documentaryProofFile certificateOfAttendanceFile candidacy decision maybeDecisionComment decisionSentAt history =
    Data.Feasibility.Feasibility
        feasibilityId
        certificationAuthority
        file
        iDFile
        documentaryProofFile
        certificateOfAttendanceFile
        candidacy.candidate
        candidacy.organism
        candidacy.certificationLabel
        (toDecision decision maybeDecisionComment)
        decisionSentAt
        history


toDecision : Admin.Enum.FeasibilityDecision.FeasibilityDecision -> Maybe String -> Data.Feasibility.Decision
toDecision decision maybeDecisionComment =
    case decision of
        Admin.Enum.FeasibilityDecision.Admissible ->
            Data.Feasibility.Admissible (Maybe.withDefault "" maybeDecisionComment)

        Admin.Enum.FeasibilityDecision.Rejected ->
            Data.Feasibility.Rejected (Maybe.withDefault "" maybeDecisionComment)

        Admin.Enum.FeasibilityDecision.Incomplete ->
            Data.Feasibility.Incomplete (Maybe.withDefault "" maybeDecisionComment)

        Admin.Enum.FeasibilityDecision.Pending ->
            Data.Feasibility.Pending


feasibilityHistorySelection : SelectionSet Data.Feasibility.FeasibilityHistory Admin.Object.FeasibilityHistory
feasibilityHistorySelection =
    SelectionSet.succeed
        (\decision maybeDecisionComment decisionSentAt ->
            Data.Feasibility.FeasibilityHistory
                (toDecision
                    decision
                    maybeDecisionComment
                )
                decisionSentAt
        )
        |> with Admin.Object.FeasibilityHistory.decision
        |> with Admin.Object.FeasibilityHistory.decisionComment
        |> with Admin.Object.FeasibilityHistory.decisionSentAt


candidacySelection : SelectionSet Candidacy Admin.Object.Candidacy
candidacySelection =
    SelectionSet.succeed Candidacy
        |> with (Admin.Object.Candidacy.candidate candidateSelection)
        |> with (Admin.Object.Candidacy.organism Organism.selection)
        |> with (Admin.Object.Candidacy.certification Admin.Object.Certification.label)


candidateSelection : SelectionSet Data.Feasibility.Candidate Admin.Object.Candidate
candidateSelection =
    SelectionSet.succeed Data.Feasibility.Candidate
        |> with Admin.Object.Candidate.firstname
        |> with Admin.Object.Candidate.lastname
