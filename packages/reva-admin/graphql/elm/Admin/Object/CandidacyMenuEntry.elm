-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.CandidacyMenuEntry exposing (..)

import Admin.Enum.CandidacyMenuEntryStatus
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


label : SelectionSet String Admin.Object.CandidacyMenuEntry
label =
    Object.selectionForField "String" "label" [] Decode.string


url : SelectionSet String Admin.Object.CandidacyMenuEntry
url =
    Object.selectionForField "String" "url" [] Decode.string


status : SelectionSet Admin.Enum.CandidacyMenuEntryStatus.CandidacyMenuEntryStatus Admin.Object.CandidacyMenuEntry
status =
    Object.selectionForField "Enum.CandidacyMenuEntryStatus.CandidacyMenuEntryStatus" "status" [] Admin.Enum.CandidacyMenuEntryStatus.decoder
