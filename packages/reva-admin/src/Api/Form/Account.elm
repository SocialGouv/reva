module Api.Form.Account exposing (get, update)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Account
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Form exposing (FormData)
import Data.Form.Account
import Dict exposing (Dict)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


get :
    String
    -> String
    -> Token
    -> (RemoteData (List String) (Dict String String) -> msg)
    -> Cmd msg
get accountId endpointGraphql token toMsg =
    let
        requiredArgs =
            Query.AccountGetAccountRequiredArguments (Id accountId)
    in
    Query.account_getAccount
        requiredArgs
        selection
        |> Auth.makeQuery "getAccount" endpointGraphql token (nothingToError "Ce compte utilisateur est introuvable" >> toMsg)


update :
    String
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ()
    -> FormData
    -> Cmd msg
update accountId endpointGraphql token toMsg _ formData =
    let
        account =
            Data.Form.Account.accountFromDict accountId formData

        accountData =
            Admin.InputObject.UpdateAccountInput
                account.email
                (Present account.firstname)
                (Present account.lastname)

        accountRequiredArs =
            Mutation.AccountUpdateAccountRequiredArguments
                (Id <| accountId)
                accountData
    in
    Mutation.account_updateAccount accountRequiredArs SelectionSet.empty
        |> Auth.makeMutation "updateAccount" endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.Account
selection =
    SelectionSet.succeed Data.Form.Account.account
        |> with Admin.Object.Account.email
        |> with Admin.Object.Account.firstname
        |> with Admin.Object.Account.lastname
