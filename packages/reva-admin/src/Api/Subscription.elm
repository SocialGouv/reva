module Api.Subscription exposing (getSubscriptions, reject, validate)

import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.SubscriptionRequestSummary
import Admin.Object.SubscriptionRequestsPaginated
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Subscription
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))



-- Mutations


validate :
    String
    -> Token
    -> (RemoteData String String -> msg)
    -> String
    -> Cmd msg
validate endpointGraphql token toMsg subscriptionId =
    Mutation.subscription_validateSubscriptionRequest
        (Mutation.SubscriptionValidateSubscriptionRequestRequiredArguments (Id subscriptionId))
        |> Auth.makeMutation endpointGraphql token (nothingToError "Cette inscription est introuvable" >> toMsg)


reject :
    String
    -> Token
    -> (RemoteData String String -> msg)
    -> String
    -> Cmd msg
reject endpointGraphql token toMsg subscriptionId =
    Mutation.subscription_rejectSubscriptionRequest
        (Mutation.SubscriptionRejectSubscriptionRequestRequiredArguments (Id subscriptionId))
        |> Auth.makeMutation endpointGraphql token (nothingToError "Cette inscription est introuvable" >> toMsg)



--- Queries


getSubscriptions :
    String
    -> Token
    -> (RemoteData String (List Data.Subscription.SubscriptionSummary) -> msg)
    -> Cmd msg
getSubscriptions endpointGraphql token toMsg =
    Query.subscription_getSubscriptionRequests identity selection
        |> Auth.makeQuery endpointGraphql token toMsg


selection : SelectionSet (List Data.Subscription.SubscriptionSummary) Admin.Object.SubscriptionRequestsPaginated
selection =
    SelectionSet.succeed identity
        |> with (Admin.Object.SubscriptionRequestsPaginated.rows subscriptionSelection)


subscriptionSelection : SelectionSet Data.Subscription.SubscriptionSummary Admin.Object.SubscriptionRequestSummary
subscriptionSelection =
    SelectionSet.succeed Data.Subscription.SubscriptionSummary
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.SubscriptionRequestSummary.id)
        |> with Admin.Object.SubscriptionRequestSummary.accountLastname
        |> with Admin.Object.SubscriptionRequestSummary.accountFirstname
        |> with Admin.Object.SubscriptionRequestSummary.accountEmail
        |> with Admin.Object.SubscriptionRequestSummary.companyName
        |> with Admin.Object.SubscriptionRequestSummary.companyAddress
