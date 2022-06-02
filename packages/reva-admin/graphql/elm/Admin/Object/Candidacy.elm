-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.Candidacy exposing (..)

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


id : SelectionSet Admin.ScalarCodecs.Id Admin.Object.Candidacy
id =
    Object.selectionForField "ScalarCodecs.Id" "id" [] (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


deviceId : SelectionSet Admin.ScalarCodecs.Id Admin.Object.Candidacy
deviceId =
    Object.selectionForField "ScalarCodecs.Id" "deviceId" [] (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


certificationId : SelectionSet Admin.ScalarCodecs.Id Admin.Object.Candidacy
certificationId =
    Object.selectionForField "ScalarCodecs.Id" "certificationId" [] (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


companionId : SelectionSet (Maybe Admin.ScalarCodecs.Id) Admin.Object.Candidacy
companionId =
    Object.selectionForField "(Maybe ScalarCodecs.Id)" "companionId" [] (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder |> Decode.nullable)


certification :
    SelectionSet decodesTo Admin.Object.Certification
    -> SelectionSet decodesTo Admin.Object.Candidacy
certification object____ =
    Object.selectionForCompositeField "certification" [] object____ Basics.identity


experiences :
    SelectionSet decodesTo Admin.Object.Experience
    -> SelectionSet (List (Maybe decodesTo)) Admin.Object.Candidacy
experiences object____ =
    Object.selectionForCompositeField "experiences" [] object____ (Basics.identity >> Decode.nullable >> Decode.list)


goals :
    SelectionSet decodesTo Admin.Object.CandidateGoal
    -> SelectionSet (List decodesTo) Admin.Object.Candidacy
goals object____ =
    Object.selectionForCompositeField "goals" [] object____ (Basics.identity >> Decode.list)


phone : SelectionSet (Maybe String) Admin.Object.Candidacy
phone =
    Object.selectionForField "(Maybe String)" "phone" [] (Decode.string |> Decode.nullable)


email : SelectionSet (Maybe String) Admin.Object.Candidacy
email =
    Object.selectionForField "(Maybe String)" "email" [] (Decode.string |> Decode.nullable)


candidacyStatuses :
    SelectionSet decodesTo Admin.Object.CandidacyStatus
    -> SelectionSet (List decodesTo) Admin.Object.Candidacy
candidacyStatuses object____ =
    Object.selectionForCompositeField "candidacyStatuses" [] object____ (Basics.identity >> Decode.list)


createdAt : SelectionSet Admin.ScalarCodecs.Date Admin.Object.Candidacy
createdAt =
    Object.selectionForField "ScalarCodecs.Date" "createdAt" [] (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapCodecs |> .codecDate |> .decoder)
