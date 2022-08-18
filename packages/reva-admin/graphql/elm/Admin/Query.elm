-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Query exposing (..)

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
import Json.Decode as Decode exposing (Decoder)


type alias GetCandidacyRequiredArguments =
    { deviceId : Data.Scalar.Id }


getCandidacy :
    GetCandidacyRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet (Maybe decodesTo) RootQuery
getCandidacy requiredArgs____ object____ =
    Object.selectionForCompositeField "getCandidacy" [ Argument.required "deviceId" requiredArgs____.deviceId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


type alias GetCandidacyByIdRequiredArguments =
    { id : Data.Scalar.Id }


getCandidacyById :
    GetCandidacyByIdRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet (Maybe decodesTo) RootQuery
getCandidacyById requiredArgs____ object____ =
    Object.selectionForCompositeField "getCandidacyById" [ Argument.required "id" requiredArgs____.id (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


getCandidacies :
    SelectionSet decodesTo Admin.Object.CandidacySummary
    -> SelectionSet (List decodesTo) RootQuery
getCandidacies object____ =
    Object.selectionForCompositeField "getCandidacies" [] object____ (Basics.identity >> Decode.list)


getCompanions :
    SelectionSet decodesTo Admin.Object.Companion
    -> SelectionSet (List decodesTo) RootQuery
getCompanions object____ =
    Object.selectionForCompositeField "getCompanions" [] object____ (Basics.identity >> Decode.list)


getTrainings :
    SelectionSet decodesTo Admin.Object.Training
    -> SelectionSet (List decodesTo) RootQuery
getTrainings object____ =
    Object.selectionForCompositeField "getTrainings" [] object____ (Basics.identity >> Decode.list)


getReferential :
    SelectionSet decodesTo Admin.Object.Referential
    -> SelectionSet decodesTo RootQuery
getReferential object____ =
    Object.selectionForCompositeField "getReferential" [] object____ Basics.identity


getCertifications :
    SelectionSet decodesTo Admin.Object.Certification
    -> SelectionSet (List decodesTo) RootQuery
getCertifications object____ =
    Object.selectionForCompositeField "getCertifications" [] object____ (Basics.identity >> Decode.list)


getRegions :
    SelectionSet decodesTo Admin.Object.Region
    -> SelectionSet (List decodesTo) RootQuery
getRegions object____ =
    Object.selectionForCompositeField "getRegions" [] object____ (Basics.identity >> Decode.list)


type alias SearchCertificationsAndProfessionsOptionalArguments =
    { query : OptionalArgument String }


searchCertificationsAndProfessions :
    (SearchCertificationsAndProfessionsOptionalArguments -> SearchCertificationsAndProfessionsOptionalArguments)
    -> SelectionSet decodesTo Admin.Object.SearchCertificationsAndProfessionsResult
    -> SelectionSet (Maybe decodesTo) RootQuery
searchCertificationsAndProfessions fillInOptionals____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { query = Absent }

        optionalArgs____ =
            [ Argument.optional "query" filledInOptionals____.query Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "searchCertificationsAndProfessions" optionalArgs____ object____ (Basics.identity >> Decode.nullable)


type alias GetCertificationRequiredArguments =
    { id : Data.Scalar.Id }


getCertification :
    GetCertificationRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Certification
    -> SelectionSet (Maybe decodesTo) RootQuery
getCertification requiredArgs____ object____ =
    Object.selectionForCompositeField "getCertification" [ Argument.required "id" requiredArgs____.id (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)
