-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.Goal exposing (..)

import Admin.InputObject
import Admin.Interface
import Admin.Object
import Admin.Scalar
import Admin.ScalarCodecs
import Admin.Union
import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode


id : SelectionSet Admin.ScalarCodecs.Id Admin.Object.Goal
id =
    Object.selectionForField "ScalarCodecs.Id" "id" [] (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


label : SelectionSet String Admin.Object.Goal
label =
    Object.selectionForField "String" "label" [] Decode.string


order : SelectionSet Int Admin.Object.Goal
order =
    Object.selectionForField "Int" "order" [] Decode.int


needsAdditionalInformation : SelectionSet Bool Admin.Object.Goal
needsAdditionalInformation =
    Object.selectionForField "Bool" "needsAdditionalInformation" [] Decode.bool


isActive : SelectionSet Bool Admin.Object.Goal
isActive =
    Object.selectionForField "Bool" "isActive" [] Decode.bool
