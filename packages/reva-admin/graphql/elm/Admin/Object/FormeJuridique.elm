-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.FormeJuridique exposing (..)

import Admin.Enum.LegalStatus
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


code : SelectionSet Data.Scalar.Id Admin.Object.FormeJuridique
code =
    Object.selectionForField "Data.Scalar.Id" "code" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


libelle : SelectionSet String Admin.Object.FormeJuridique
libelle =
    Object.selectionForField "String" "libelle" [] Decode.string


legalStatus : SelectionSet Admin.Enum.LegalStatus.LegalStatus Admin.Object.FormeJuridique
legalStatus =
    Object.selectionForField "Enum.LegalStatus.LegalStatus" "legalStatus" [] Admin.Enum.LegalStatus.decoder
