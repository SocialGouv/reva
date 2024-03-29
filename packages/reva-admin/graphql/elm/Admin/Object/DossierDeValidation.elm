-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.DossierDeValidation exposing (..)

import Admin.Enum.DossierDeValidationDecision
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


id : SelectionSet Data.Scalar.Id Admin.Object.DossierDeValidation
id =
    Object.selectionForField "Data.Scalar.Id" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


candidacy :
    SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet decodesTo Admin.Object.DossierDeValidation
candidacy object____ =
    Object.selectionForCompositeField "candidacy" [] object____ Basics.identity


dossierDeValidationFile :
    SelectionSet decodesTo Admin.Object.File
    -> SelectionSet decodesTo Admin.Object.DossierDeValidation
dossierDeValidationFile object____ =
    Object.selectionForCompositeField "dossierDeValidationFile" [] object____ Basics.identity


dossierDeValidationOtherFiles :
    SelectionSet decodesTo Admin.Object.File
    -> SelectionSet (List decodesTo) Admin.Object.DossierDeValidation
dossierDeValidationOtherFiles object____ =
    Object.selectionForCompositeField "dossierDeValidationOtherFiles" [] object____ (Basics.identity >> Decode.list)


dossierDeValidationSentAt : SelectionSet Data.Scalar.Timestamp Admin.Object.DossierDeValidation
dossierDeValidationSentAt =
    Object.selectionForField "Data.Scalar.Timestamp" "dossierDeValidationSentAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder)


decision : SelectionSet Admin.Enum.DossierDeValidationDecision.DossierDeValidationDecision Admin.Object.DossierDeValidation
decision =
    Object.selectionForField "Enum.DossierDeValidationDecision.DossierDeValidationDecision" "decision" [] Admin.Enum.DossierDeValidationDecision.decoder


decisionComment : SelectionSet (Maybe String) Admin.Object.DossierDeValidation
decisionComment =
    Object.selectionForField "(Maybe String)" "decisionComment" [] (Decode.string |> Decode.nullable)


decisionSentAt : SelectionSet (Maybe Data.Scalar.Timestamp) Admin.Object.DossierDeValidation
decisionSentAt =
    Object.selectionForField "(Maybe Data.Scalar.Timestamp)" "decisionSentAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder |> Decode.nullable)


isActive : SelectionSet Bool Admin.Object.DossierDeValidation
isActive =
    Object.selectionForField "Bool" "isActive" [] Decode.bool


createdAt : SelectionSet Data.Scalar.Timestamp Admin.Object.DossierDeValidation
createdAt =
    Object.selectionForField "Data.Scalar.Timestamp" "createdAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder)


updatedAt : SelectionSet (Maybe Data.Scalar.Timestamp) Admin.Object.DossierDeValidation
updatedAt =
    Object.selectionForField "(Maybe Data.Scalar.Timestamp)" "updatedAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder |> Decode.nullable)


history :
    SelectionSet decodesTo Admin.Object.DossierDeValidation
    -> SelectionSet (List decodesTo) Admin.Object.DossierDeValidation
history object____ =
    Object.selectionForCompositeField "history" [] object____ (Basics.identity >> Decode.list)
