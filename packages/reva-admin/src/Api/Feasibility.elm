module Api.Feasibility exposing (get, getFeasibilities, getFeasibilityCountByCategory)

import Admin.Enum.FeasibilityCategoryFilter
import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.Candidate
import Admin.Object.Certification
import Admin.Object.Department
import Admin.Object.Feasibility
import Admin.Object.FeasibilityCountByCategory
import Admin.Object.FeasibilityPage
import Admin.Query as Query
import Api.Auth as Auth
import Api.Pagination exposing (pageInfoSelection)
import Api.Token exposing (Token)
import Data.Feasibility
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


get :
    String
    -> Token
    -> (RemoteData (List String) Data.Feasibility.Feasibility -> msg)
    -> String
    -> Cmd msg
get endpointGraphql token toMsg feasibilityId =
    -- TODO
    Cmd.none


getFeasibilities :
    String
    -> Token
    -> (RemoteData (List String) Data.Feasibility.FeasibilitySummaryPage -> msg)
    -> Int
    -> Maybe Admin.Enum.FeasibilityCategoryFilter.FeasibilityCategoryFilter
    -> Cmd msg
getFeasibilities endpointGraphql token toMsg page category =
    Query.feasibilities
        (\optionals ->
            { optionals
                | limit = Present 10
                , offset = Present ((page - 1) * 10)
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
