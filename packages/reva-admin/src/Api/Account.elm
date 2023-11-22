module Api.Account exposing (get, getAccounts)

-- import Admin.Mutation as Mutation

import Admin.Enum.AccountGroup exposing (AccountGroup(..))
import Admin.Object
import Admin.Object.Account
import Admin.Object.AccountsPaginated
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.CertificationAuthority
import Api.Organism
import Api.Pagination exposing (pageInfoSelection)
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Account
import Graphql.OptionalArgument as OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))



-- Mutations
--- Queries


get :
    String
    -> Token
    -> (RemoteData (List String) Data.Account.Account -> msg)
    -> String
    -> Cmd msg
get endpointGraphql token toMsg accountId =
    let
        requiredArgs =
            Query.AccountGetAccountRequiredArguments (Id accountId)
    in
    Query.account_getAccount
        requiredArgs
        accountSummarySelection
        |> Auth.makeQuery "getAccount" endpointGraphql token (nothingToError "Ce compte utilisateur est introuvable" >> toMsg)


getAccounts :
    String
    -> Token
    -> (RemoteData (List String) Data.Account.AccountSummaryPage -> msg)
    -> Int
    -> AccountGroup
    -> Maybe String
    -> Cmd msg
getAccounts endpointGraphql token toMsg page group searchFilter =
    Query.account_getAccounts
        (\optionals ->
            { optionals
                | limit = Present 10
                , offset = Present ((page - 1) * 10)
                , groupFilter = Present group
                , searchFilter = OptionalArgument.fromMaybe searchFilter
            }
        )
        accountSummaryPageSelection
        |> Auth.makeQuery "getAccounts" endpointGraphql token toMsg


accountSummaryPageSelection : SelectionSet Data.Account.AccountSummaryPage Admin.Object.AccountsPaginated
accountSummaryPageSelection =
    SelectionSet.succeed Data.Account.AccountSummaryPage
        |> with (Admin.Object.AccountsPaginated.rows accountSummarySelection)
        |> with (Admin.Object.AccountsPaginated.info pageInfoSelection)


accountSummarySelection : SelectionSet Data.Account.Account Admin.Object.Account
accountSummarySelection =
    SelectionSet.succeed Data.Account.Account
        |> with (SelectionSet.map (\(Uuid id) -> id) Admin.Object.Account.id)
        |> with Admin.Object.Account.keycloakId
        |> with Admin.Object.Account.email
        |> with Admin.Object.Account.firstname
        |> with Admin.Object.Account.lastname
        |> with (Admin.Object.Account.organism Api.Organism.selection)
        |> with (Admin.Object.Account.certificationAuthority Api.CertificationAuthority.selection)
