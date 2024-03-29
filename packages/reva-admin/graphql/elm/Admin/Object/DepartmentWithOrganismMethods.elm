-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.DepartmentWithOrganismMethods exposing (..)

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


department :
    SelectionSet decodesTo Admin.Object.Department
    -> SelectionSet decodesTo Admin.Object.DepartmentWithOrganismMethods
department object____ =
    Object.selectionForCompositeField "department" [] object____ Basics.identity


isOnSite : SelectionSet Bool Admin.Object.DepartmentWithOrganismMethods
isOnSite =
    Object.selectionForField "Bool" "isOnSite" [] Decode.bool


isRemote : SelectionSet Bool Admin.Object.DepartmentWithOrganismMethods
isRemote =
    Object.selectionForField "Bool" "isRemote" [] Decode.bool
