-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.CertificationAuthorityOrLocalAccount exposing (..)

import Admin.Enum.CertificationAuthorityOrLocalAccountType
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


id : SelectionSet Data.Scalar.Id Admin.Object.CertificationAuthorityOrLocalAccount
id =
    Object.selectionForField "Data.Scalar.Id" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


label : SelectionSet String Admin.Object.CertificationAuthorityOrLocalAccount
label =
    Object.selectionForField "String" "label" [] Decode.string


email : SelectionSet String Admin.Object.CertificationAuthorityOrLocalAccount
email =
    Object.selectionForField "String" "email" [] Decode.string


type_ : SelectionSet Admin.Enum.CertificationAuthorityOrLocalAccountType.CertificationAuthorityOrLocalAccountType Admin.Object.CertificationAuthorityOrLocalAccount
type_ =
    Object.selectionForField "Enum.CertificationAuthorityOrLocalAccountType.CertificationAuthorityOrLocalAccountType" "type" [] Admin.Enum.CertificationAuthorityOrLocalAccountType.decoder


certificationAuthorityId : SelectionSet String Admin.Object.CertificationAuthorityOrLocalAccount
certificationAuthorityId =
    Object.selectionForField "String" "certificationAuthorityId" [] Decode.string
