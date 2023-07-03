module Api.Form.OrganismSubscription exposing (submitDecision)

import Api.Subscription
import Api.Token exposing (Token)
import Data.Form exposing (FormData)
import Data.Form.OrganismSubscription exposing (Status(..))
import RemoteData exposing (RemoteData(..))


submitDecision :
    String
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ()
    -> FormData
    -> Cmd msg
submitDecision subscriptionId endpointGraphql token toMsg _ formData =
    let
        decision =
            Data.Form.OrganismSubscription.fromDict formData
    in
    case decision of
        Approved ->
            Api.Subscription.validate endpointGraphql token toMsg subscriptionId

        Rejected comment ->
            Api.Subscription.reject endpointGraphql token toMsg subscriptionId comment

        Pending ->
            Cmd.none
