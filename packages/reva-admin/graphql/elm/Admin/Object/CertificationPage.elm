-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.CertificationPage exposing (..)

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


rows :
    SelectionSet decodesTo Admin.Object.Certification
    -> SelectionSet (List decodesTo) Admin.Object.CertificationPage
rows object____ =
    Object.selectionForCompositeField "rows" [] object____ (Basics.identity >> Decode.list)


info :
    SelectionSet decodesTo Admin.Object.PaginationInfo
    -> SelectionSet decodesTo Admin.Object.CertificationPage
info object____ =
    Object.selectionForCompositeField "info" [] object____ Basics.identity
