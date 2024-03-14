-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.Jury exposing (..)

import Admin.Enum.JuryResult
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


id : SelectionSet Data.Scalar.Id Admin.Object.Jury
id =
    Object.selectionForField "Data.Scalar.Id" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


candidacy :
    SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet decodesTo Admin.Object.Jury
candidacy object____ =
    Object.selectionForCompositeField "candidacy" [] object____ Basics.identity


dateOfSession : SelectionSet Data.Scalar.Timestamp Admin.Object.Jury
dateOfSession =
    Object.selectionForField "Data.Scalar.Timestamp" "dateOfSession" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder)


timeOfSession : SelectionSet (Maybe String) Admin.Object.Jury
timeOfSession =
    Object.selectionForField "(Maybe String)" "timeOfSession" [] (Decode.string |> Decode.nullable)


addressOfSession : SelectionSet (Maybe String) Admin.Object.Jury
addressOfSession =
    Object.selectionForField "(Maybe String)" "addressOfSession" [] (Decode.string |> Decode.nullable)


informationOfSession : SelectionSet (Maybe String) Admin.Object.Jury
informationOfSession =
    Object.selectionForField "(Maybe String)" "informationOfSession" [] (Decode.string |> Decode.nullable)


convocationFile :
    SelectionSet decodesTo Admin.Object.File
    -> SelectionSet (Maybe decodesTo) Admin.Object.Jury
convocationFile object____ =
    Object.selectionForCompositeField "convocationFile" [] object____ (Basics.identity >> Decode.nullable)


result : SelectionSet (Maybe Admin.Enum.JuryResult.JuryResult) Admin.Object.Jury
result =
    Object.selectionForField "(Maybe Enum.JuryResult.JuryResult)" "result" [] (Admin.Enum.JuryResult.decoder |> Decode.nullable)


dateOfResult : SelectionSet (Maybe Data.Scalar.Timestamp) Admin.Object.Jury
dateOfResult =
    Object.selectionForField "(Maybe Data.Scalar.Timestamp)" "dateOfResult" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder |> Decode.nullable)


informationOfResult : SelectionSet (Maybe String) Admin.Object.Jury
informationOfResult =
    Object.selectionForField "(Maybe String)" "informationOfResult" [] (Decode.string |> Decode.nullable)
