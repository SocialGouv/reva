module Api.Feasibility exposing (get, getFeasibilities, getFeasibilityCountByCategory, selection)

import Admin.Enum.FeasibilityDecision
import Admin.Enum.FeasibilityDecisionFilter
import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.Candidate
import Admin.Object.Certification
import Admin.Object.Department
import Admin.Object.Feasibility
import Admin.Object.FeasibilityCountByCategory
import Admin.Object.FeasibilityPage
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.CertificationAuthority as CertificationAuthority
import Api.File as File
import Api.Organism as Organism
import Api.Pagination exposing (pageInfoSelection)
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Feasibility
import Data.Organism exposing (Organism)
import File
import Graphql.OptionalArgument as OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


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
    SelectionSet.succeed
        (\(Id feasibilityId) certificationAuthority file documentaryProofFile certificateOfAttendanceFile candidacy decision maybeDecisionComment decisionSentAt ->
            Data.Feasibility.Feasibility feasibilityId
                certificationAuthority
                file
                documentaryProofFile
                certificateOfAttendanceFile
                candidacy.candidate
                candidacy.organism
                candidacy.certificationLabel
                (case decision of
                    Admin.Enum.FeasibilityDecision.Admissible ->
                        Data.Feasibility.Admissible (Maybe.withDefault "" maybeDecisionComment)

                    Admin.Enum.FeasibilityDecision.Rejected ->
                        Data.Feasibility.Rejected (Maybe.withDefault "" maybeDecisionComment)

                    Admin.Enum.FeasibilityDecision.Pending ->
                        Data.Feasibility.Pending
                )
                decisionSentAt
        )
        |> with Admin.Object.Feasibility.id
        |> with (Admin.Object.Feasibility.certificationAuthority CertificationAuthority.selection)
        |> with (Admin.Object.Feasibility.feasibilityFile File.selection)
        |> with (Admin.Object.Feasibility.documentaryProofFile File.selection)
        |> with (Admin.Object.Feasibility.certificateOfAttendanceFile File.selection)
        |> with (Admin.Object.Feasibility.candidacy candidacySelection)
        |> with Admin.Object.Feasibility.decision
        |> with Admin.Object.Feasibility.decisionComment
        |> with Admin.Object.Feasibility.decisionSentAt


type alias Candidacy =
    { candidate : Maybe Data.Feasibility.Candidate
    , organism : Maybe Organism
    , certificationLabel : Maybe String
    }


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



-- FEASIBILITIES


getFeasibilities :
    String
    -> Token
    -> (RemoteData (List String) Data.Feasibility.FeasibilitySummaryPage -> msg)
    -> Int
    -> Maybe Admin.Enum.FeasibilityDecisionFilter.FeasibilityDecisionFilter
    -> Maybe String
    -> Cmd msg
getFeasibilities endpointGraphql token toMsg page decision searchFilter =
    Query.feasibilities
        (\optionals ->
            { optionals
                | limit = Present 10
                , offset = Present ((page - 1) * 10)
                , decision = OptionalArgument.fromMaybe decision
                , searchFilter = OptionalArgument.fromMaybe searchFilter
            }
        )
        summaryPageSelection
        |> Auth.makeQuery "feasibilities" endpointGraphql token toMsg


summaryPageSelection : SelectionSet Data.Feasibility.FeasibilitySummaryPage Admin.Object.FeasibilityPage
summaryPageSelection =
    SelectionSet.succeed Data.Feasibility.FeasibilitySummaryPage
        |> with (Admin.Object.FeasibilityPage.rows summarySelection)
        |> with (Admin.Object.FeasibilityPage.info pageInfoSelection)


summarySelection : SelectionSet Data.Feasibility.FeasibilitySummary Admin.Object.Feasibility
summarySelection =
    SelectionSet.succeed Data.Feasibility.FeasibilitySummary
        |> with Admin.Object.Feasibility.id
        |> with Admin.Object.Feasibility.feasibilityFileSentAt
        |> with (Admin.Object.Feasibility.candidacy (Admin.Object.Candidacy.certification Admin.Object.Certification.label))
        |> with (Admin.Object.Feasibility.candidacy (Admin.Object.Candidacy.candidate Admin.Object.Candidate.firstname))
        |> with (Admin.Object.Feasibility.candidacy (Admin.Object.Candidacy.candidate Admin.Object.Candidate.lastname))
        |> with (Admin.Object.Feasibility.candidacy (Admin.Object.Candidacy.department Admin.Object.Department.label))
        |> with (Admin.Object.Feasibility.candidacy (Admin.Object.Candidacy.department Admin.Object.Department.code))


getFeasibilityCountByCategory :
    String
    -> Token
    -> (RemoteData (List String) Data.Feasibility.FeasibilityCountByCategory -> msg)
    -> Cmd msg
getFeasibilityCountByCategory endpointGraphql token toMsg =
    Query.feasibilityCountByCategory feasibilityCountByCategorySelection
        |> Auth.makeQuery "feasibilityCountByCategory" endpointGraphql token toMsg


feasibilityCountByCategorySelection : SelectionSet Data.Feasibility.FeasibilityCountByCategory Admin.Object.FeasibilityCountByCategory
feasibilityCountByCategorySelection =
    SelectionSet.succeed Data.Feasibility.FeasibilityCountByCategory
        |> with Admin.Object.FeasibilityCountByCategory.all
        |> with Admin.Object.FeasibilityCountByCategory.pending
        |> with Admin.Object.FeasibilityCountByCategory.admissible
        |> with Admin.Object.FeasibilityCountByCategory.rejected
