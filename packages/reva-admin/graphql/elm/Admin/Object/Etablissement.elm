-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.Etablissement exposing (..)

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


siret : SelectionSet Data.Scalar.Id Admin.Object.Etablissement
siret =
    Object.selectionForField "Data.Scalar.Id" "siret" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


siegeSocial : SelectionSet Bool Admin.Object.Etablissement
siegeSocial =
    Object.selectionForField "Bool" "siegeSocial" [] Decode.bool


dateFermeture : SelectionSet (Maybe Data.Scalar.Timestamp) Admin.Object.Etablissement
dateFermeture =
    Object.selectionForField "(Maybe Data.Scalar.Timestamp)" "dateFermeture" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder |> Decode.nullable)


raisonSociale : SelectionSet String Admin.Object.Etablissement
raisonSociale =
    Object.selectionForField "String" "raisonSociale" [] Decode.string


formeJuridique :
    SelectionSet decodesTo Admin.Object.FormeJuridique
    -> SelectionSet decodesTo Admin.Object.Etablissement
formeJuridique object____ =
    Object.selectionForCompositeField "formeJuridique" [] object____ Basics.identity


qualiopiStatus : SelectionSet (Maybe Bool) Admin.Object.Etablissement
qualiopiStatus =
    Object.selectionForField "(Maybe Bool)" "qualiopiStatus" [] (Decode.bool |> Decode.nullable)