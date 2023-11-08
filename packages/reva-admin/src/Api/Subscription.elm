module Api.Subscription exposing (get, getSubscriptions, reject, validate)

import Admin.Enum.Sort exposing (Sort)
import Admin.Enum.SubscriptionRequestStatus exposing (SubscriptionRequestStatus(..))
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
import Api.Pagination exposing (pageInfoSelection)
import Api.Referential
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Referential
import Data.Subscription
import Graphql.OptionalArgument as OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))



-- Mutations


validate :
    String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> String
    -> Cmd msg
validate endpointGraphql token toMsg subscriptionId =
    Mutation.subscription_validateSubscriptionRequest
        (Mutation.SubscriptionValidateSubscriptionRequestRequiredArguments (Id subscriptionId))
        |> SelectionSet.map (\_ -> Just ())
        |> Auth.makeMutation "validateSubscription" endpointGraphql token (nothingToError "Cette inscription est introuvable" >> toMsg)


reject :
    String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> String
    -> String
    -> Cmd msg
reject endpointGraphql token toMsg subscriptionId comment =
    Mutation.subscription_rejectSubscriptionRequest
        (Mutation.SubscriptionRejectSubscriptionRequestRequiredArguments (Id subscriptionId) comment)
        |> SelectionSet.map (\_ -> Just ())
        |> Auth.makeMutation "rejectSubscription" endpointGraphql token (nothingToError "Cette inscription est introuvable" >> toMsg)



--- Queries


getSubscriptions :
    String
    -> Token
    -> (RemoteData (List String) Data.Subscription.SubscriptionSummaryPage -> msg)
    -> Int
    -> SubscriptionRequestStatus
    -> Maybe String
    -> Cmd msg
getSubscriptions endpointGraphql token toMsg page status searchFilter =
    Query.subscription_getSubscriptionRequests
        (\optionals ->
            { optionals
                | limit = Present 10
                , offset = Present ((page - 1) * 10)
                , status = Present status
                , searchFilter = OptionalArgument.fromMaybe searchFilter
            }
        )
        subscriptionSummaryPageSelection
        |> Auth.makeQuery "getSubscriptions" endpointGraphql token toMsg


get :
    String
    -> Token
    -> (RemoteData (List String) Data.Subscription.Subscription -> msg)
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
        |> Auth.makeQuery "getSubscription" endpointGraphql token (nothingToError "Cette inscription est introuvable" >> toMsg)


subscriptionSummaryPageSelection : SelectionSet Data.Subscription.SubscriptionSummaryPage Admin.Object.SubscriptionRequestsPaginated
subscriptionSummaryPageSelection =
    SelectionSet.succeed Data.Subscription.SubscriptionSummaryPage
        |> with (Admin.Object.SubscriptionRequestsPaginated.rows subscriptionSummarySelection)
        |> with (Admin.Object.SubscriptionRequestsPaginated.info pageInfoSelection)


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
        |> with
            (SelectionSet.map
                (\website ->
                    if website == Just "" then
                        Nothing

                    else
                        website
                )
                Admin.Object.SubscriptionRequest.companyWebsite
            )
        |> with Admin.Object.SubscriptionRequest.accountFirstname
        |> with Admin.Object.SubscriptionRequest.accountLastname
        |> with Admin.Object.SubscriptionRequest.accountEmail
        |> with Admin.Object.SubscriptionRequest.accountPhoneNumber
        |> with Admin.Object.SubscriptionRequest.typology
        |> with (Admin.Object.SubscriptionRequest.subscriptionRequestOnDomaine subscriptionRequestOnDomainSelection)
        |> with (Admin.Object.SubscriptionRequest.subscriptionRequestOnConventionCollective subscriptionRequestOnConventionCollectiveSelection)
        |> with (Admin.Object.SubscriptionRequest.departmentsWithOrganismMethods Api.Referential.departmentWithOrganismMethodsSelection)
        |> with Admin.Object.SubscriptionRequest.qualiopiCertificateExpiresAt
        |> with Admin.Object.SubscriptionRequest.status
        |> with Admin.Object.SubscriptionRequest.rejectionReason
        |> with Admin.Object.SubscriptionRequest.isCompanyNameUnique


subscriptionRequestOnDomainSelection : SelectionSet Data.Referential.Domain Admin.Object.SubscriptionRequestOnDomaine
subscriptionRequestOnDomainSelection =
    SelectionSet.succeed identity
        |> with (Admin.Object.SubscriptionRequestOnDomaine.domaine Api.Referential.domainSelection)


subscriptionRequestOnConventionCollectiveSelection : SelectionSet Data.Referential.ConventionCollective Admin.Object.SubscriptionRequestOnConventionCollective
subscriptionRequestOnConventionCollectiveSelection =
    SelectionSet.succeed identity
        |> with (Admin.Object.SubscriptionRequestOnConventionCollective.ccn Api.Referential.conventionCollectiveSelection)
