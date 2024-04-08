module Api.CandidacyConventionCollective exposing (getCandidacyConventionCollectives, selection)

import Admin.Object
import Admin.Object.CandidacyConventionCollective
import Admin.Object.CandidacyConventionCollectivePaginated
import Admin.Query as Query
import Api.Auth as Auth
import Api.Pagination exposing (pageInfoSelection)
import Api.Token exposing (Token)
import Data.CandidacyConventionCollective
import Graphql.OptionalArgument as OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


getCandidacyConventionCollectives :
    String
    -> Token
    -> Int
    -> (RemoteData (List String) Data.CandidacyConventionCollective.CandidacyConventionCollectivePaginated -> msg)
    -> Maybe String
    -> Cmd msg
getCandidacyConventionCollectives endpointGraphql token page toMsg searchText =
    Query.candidacy_getCandidacyCcns
        (\optionals ->
            { optionals
                | limit = Present 10
                , offset = Present ((page - 1) * 10)
                , searchFilter = OptionalArgument.fromMaybe searchText
            }
        )
        pageSelection
        |> Auth.makeQuery "getCandidacyConventionCollectives" endpointGraphql token toMsg


pageSelection : SelectionSet Data.CandidacyConventionCollective.CandidacyConventionCollectivePaginated Admin.Object.CandidacyConventionCollectivePaginated
pageSelection =
    SelectionSet.succeed Data.CandidacyConventionCollective.CandidacyConventionCollectivePaginated
        |> with (Admin.Object.CandidacyConventionCollectivePaginated.rows selection)
        |> with (Admin.Object.CandidacyConventionCollectivePaginated.info pageInfoSelection)


selection : SelectionSet Data.CandidacyConventionCollective.CandidacyConventionCollective Admin.Object.CandidacyConventionCollective
selection =
    SelectionSet.succeed Data.CandidacyConventionCollective.CandidacyConventionCollective
        |> with Admin.Object.CandidacyConventionCollective.id
        |> with Admin.Object.CandidacyConventionCollective.idcc
        |> with Admin.Object.CandidacyConventionCollective.label
