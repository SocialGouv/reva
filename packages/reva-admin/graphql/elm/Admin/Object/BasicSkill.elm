-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql
module Admin.Object.BasicSkill exposing (..)

import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.SelectionSet exposing (SelectionSet)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Admin.Object
import Admin.Interface
import Admin.Union
import Admin.Scalar
import Admin.InputObject
import Data.Scalar
import Json.Decode as Decode
import Graphql.Internal.Encode as Encode exposing (Value)

id : SelectionSet Data.Scalar.Uuid Admin.Object.BasicSkill
id =
      Object.selectionForField "Data.Scalar.Uuid" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder)


label : SelectionSet String Admin.Object.BasicSkill
label =
      Object.selectionForField "String" "label" [] (Decode.string)
