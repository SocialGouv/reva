module Api.Subscription exposing (getSubscriptions, reject, validate)

import Admin.Enum.Sort exposing (Sort)
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.SubscriptionRequest
import Admin.Object.SubscriptionRequestOnConventionCollective
import Admin.Object.SubscriptionRequestOnDomaine
import Admin.Object.SubscriptionRequestSummary
import Admin.Object.SubscriptionRequestsPaginated
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.Referential
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Referential
import Data.Subscription
import Graphql.OptionalArgument exposing (OptionalArgument(..))
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
    Query.subscription_getSubscriptionRequests
        (\optionals -> { optionals | limit = Present 50, orderBy = Present { accountLastname = Absent, companyName = Absent, createdAt = Present Admin.Enum.Sort.Desc } })
        subscriptionsSelection
        |> Auth.makeQuery endpointGraphql token toMsg


get :
    String
    -> Token
    -> (RemoteData String Data.Subscription.Subscription -> msg)
    -> String
    -> Cmd msg
get endpointGraphql token toMsg subscriptionId =
    let
        requiredArgs =
            Query.SubscriptionGetSubscriptionRequestRequiredArguments (Id subscriptionId)
    in
    Query.subscription_getSubscriptionRequest
        requiredArgs
        selection
        |> Auth.makeQuery endpointGraphql token (nothingToError "Cette inscription est introuvable" >> toMsg)


subscriptionsSelection : SelectionSet (List Data.Subscription.SubscriptionSummary) Admin.Object.SubscriptionRequestsPaginated
subscriptionsSelection =
    SelectionSet.succeed identity
        |> with (Admin.Object.SubscriptionRequestsPaginated.rows subscriptionSummarySelection)


subscriptionSummarySelection : SelectionSet Data.Subscription.SubscriptionSummary Admin.Object.SubscriptionRequestSummary
subscriptionSummarySelection =
    SelectionSet.succeed Data.Subscription.SubscriptionSummary
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.SubscriptionRequestSummary.id)
        |> with Admin.Object.SubscriptionRequestSummary.accountLastname
        |> with Admin.Object.SubscriptionRequestSummary.accountFirstname
        |> with Admin.Object.SubscriptionRequestSummary.accountEmail
        |> with Admin.Object.SubscriptionRequestSummary.companyName
        |> with Admin.Object.SubscriptionRequestSummary.companyAddress
        |> with Admin.Object.SubscriptionRequestSummary.createdAt


selection : SelectionSet Data.Subscription.Subscription Admin.Object.SubscriptionRequest
selection =
    SelectionSet.succeed Data.Subscription.Subscription
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.SubscriptionRequest.id)
        |> with Admin.Object.SubscriptionRequest.companySiret
        |> with Admin.Object.SubscriptionRequest.companyLegalStatus
        |> with Admin.Object.SubscriptionRequest.companyName
        |> with Admin.Object.SubscriptionRequest.companyAddress
        |> with Admin.Object.SubscriptionRequest.companyZipCode
        |> with Admin.Object.SubscriptionRequest.companyCity
        |> with Admin.Object.SubscriptionRequest.companyBillingContactFirstname
        |> with Admin.Object.SubscriptionRequest.companyBillingContactLastname
        |> with Admin.Object.SubscriptionRequest.companyBillingEmail
        |> with Admin.Object.SubscriptionRequest.companyBillingPhoneNumber
        |> with Admin.Object.SubscriptionRequest.companyBic
        |> with Admin.Object.SubscriptionRequest.companyIban
        |> with Admin.Object.SubscriptionRequest.accountFirstname
        |> with Admin.Object.SubscriptionRequest.accountLastname
        |> with Admin.Object.SubscriptionRequest.accountEmail
        |> with Admin.Object.SubscriptionRequest.accountPhoneNumber
        |> with Admin.Object.SubscriptionRequest.typology
        |> with (Admin.Object.SubscriptionRequest.subscriptionRequestOnDomaine subscriptionRequestOnDomainSelection)
        |> with (Admin.Object.SubscriptionRequest.subscriptionRequestOnConventionCollective subscriptionRequestOnConventionCollectiveSelection)
        |> with (Admin.Object.SubscriptionRequest.departmentsWithOrganismMethods Api.Referential.departmentWithOrganismMethodsSelection)


subscriptionRequestOnDomainSelection : SelectionSet Data.Referential.Domain Admin.Object.SubscriptionRequestOnDomaine
subscriptionRequestOnDomainSelection =
    SelectionSet.succeed identity
        |> with (Admin.Object.SubscriptionRequestOnDomaine.domaine Api.Referential.domainSelection)


subscriptionRequestOnConventionCollectiveSelection : SelectionSet Data.Referential.ConventionCollective Admin.Object.SubscriptionRequestOnConventionCollective
subscriptionRequestOnConventionCollectiveSelection =
    SelectionSet.succeed identity
        |> with (Admin.Object.SubscriptionRequestOnConventionCollective.ccn Api.Referential.conventionCollectiveSelection)
