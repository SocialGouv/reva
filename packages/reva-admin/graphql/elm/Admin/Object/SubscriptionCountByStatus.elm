-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.SubscriptionCountByStatus exposing (..)

import Admin.InputObject
import Admin.Interface
import Admin.Object
import Admin.Scalar
import Admin.Union
import Data.Scalar
import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode


pendingSubscription : SelectionSet Int Admin.Object.SubscriptionCountByStatus
pendingSubscription =
    Object.selectionForField "Int" "PENDING_SUBSCRIPTION" [] Decode.int


rejectedSubscription : SelectionSet Int Admin.Object.SubscriptionCountByStatus
rejectedSubscription =
    Object.selectionForField "Int" "REJECTED_SUBSCRIPTION" [] Decode.int


pendingLegalVerification : SelectionSet Int Admin.Object.SubscriptionCountByStatus
pendingLegalVerification =
    Object.selectionForField "Int" "PENDING_LEGAL_VERIFICATION" [] Decode.int


needLegalVerification : SelectionSet Int Admin.Object.SubscriptionCountByStatus
needLegalVerification =
    Object.selectionForField "Int" "NEED_LEGAL_VERIFICATION" [] Decode.int


approved : SelectionSet Int Admin.Object.SubscriptionCountByStatus
approved =
    Object.selectionForField "Int" "APPROVED" [] Decode.int