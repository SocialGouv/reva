-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.CandidacySummary exposing (..)

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


id : SelectionSet Data.Scalar.Id Admin.Object.CandidacySummary
id =
    Object.selectionForField "Data.Scalar.Id" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


deviceId : SelectionSet Data.Scalar.Id Admin.Object.CandidacySummary
deviceId =
    Object.selectionForField "Data.Scalar.Id" "deviceId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


certificationId : SelectionSet (Maybe Data.Scalar.Id) Admin.Object.CandidacySummary
certificationId =
    Object.selectionForField "(Maybe Data.Scalar.Id)" "certificationId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder |> Decode.nullable)


organismId : SelectionSet (Maybe Data.Scalar.Id) Admin.Object.CandidacySummary
organismId =
    Object.selectionForField "(Maybe Data.Scalar.Id)" "organismId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder |> Decode.nullable)


organism :
    SelectionSet decodesTo Admin.Object.Organism
    -> SelectionSet (Maybe decodesTo) Admin.Object.CandidacySummary
organism object____ =
    Object.selectionForCompositeField "organism" [] object____ (Basics.identity >> Decode.nullable)


certification :
    SelectionSet decodesTo Admin.Object.Certification
    -> SelectionSet (Maybe decodesTo) Admin.Object.CandidacySummary
certification object____ =
    Object.selectionForCompositeField "certification" [] object____ (Basics.identity >> Decode.nullable)


firstname : SelectionSet (Maybe String) Admin.Object.CandidacySummary
firstname =
    Object.selectionForField "(Maybe String)" "firstname" [] (Decode.string |> Decode.nullable)


lastname : SelectionSet (Maybe String) Admin.Object.CandidacySummary
lastname =
    Object.selectionForField "(Maybe String)" "lastname" [] (Decode.string |> Decode.nullable)


phone : SelectionSet (Maybe String) Admin.Object.CandidacySummary
phone =
    Object.selectionForField "(Maybe String)" "phone" [] (Decode.string |> Decode.nullable)


email : SelectionSet (Maybe String) Admin.Object.CandidacySummary
email =
    Object.selectionForField "(Maybe String)" "email" [] (Decode.string |> Decode.nullable)


lastStatus :
    SelectionSet decodesTo Admin.Object.CandidacyStatus
    -> SelectionSet decodesTo Admin.Object.CandidacySummary
lastStatus object____ =
    Object.selectionForCompositeField "lastStatus" [] object____ Basics.identity


createdAt : SelectionSet Data.Scalar.Timestamp Admin.Object.CandidacySummary
createdAt =
    Object.selectionForField "Data.Scalar.Timestamp" "createdAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder)


sentAt : SelectionSet (Maybe Data.Scalar.Timestamp) Admin.Object.CandidacySummary
sentAt =
    Object.selectionForField "(Maybe Data.Scalar.Timestamp)" "sentAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder |> Decode.nullable)
