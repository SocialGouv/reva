-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.SubscriptionRequestSummary exposing (..)

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


id : SelectionSet Data.Scalar.Id Admin.Object.SubscriptionRequestSummary
id =
    Object.selectionForField "Data.Scalar.Id" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


accountLastname : SelectionSet String Admin.Object.SubscriptionRequestSummary
accountLastname =
    Object.selectionForField "String" "accountLastname" [] Decode.string


accountFirstname : SelectionSet String Admin.Object.SubscriptionRequestSummary
accountFirstname =
    Object.selectionForField "String" "accountFirstname" [] Decode.string


accountEmail : SelectionSet String Admin.Object.SubscriptionRequestSummary
accountEmail =
    Object.selectionForField "String" "accountEmail" [] Decode.string


companyName : SelectionSet String Admin.Object.SubscriptionRequestSummary
companyName =
    Object.selectionForField "String" "companyName" [] Decode.string


companyAddress : SelectionSet String Admin.Object.SubscriptionRequestSummary
companyAddress =
    Object.selectionForField "String" "companyAddress" [] Decode.string


createdAt : SelectionSet Data.Scalar.Timestamp Admin.Object.SubscriptionRequestSummary
createdAt =
    Object.selectionForField "Data.Scalar.Timestamp" "createdAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder)