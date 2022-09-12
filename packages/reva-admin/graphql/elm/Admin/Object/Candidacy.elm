-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.Candidacy exposing (..)

import Admin.Enum.CandidateTypology
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


id : SelectionSet Data.Scalar.Id Admin.Object.Candidacy
id =
    Object.selectionForField "Data.Scalar.Id" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


deviceId : SelectionSet Data.Scalar.Id Admin.Object.Candidacy
deviceId =
    Object.selectionForField "Data.Scalar.Id" "deviceId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


certificationId : SelectionSet Data.Scalar.Id Admin.Object.Candidacy
certificationId =
    Object.selectionForField "Data.Scalar.Id" "certificationId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


regionId : SelectionSet Data.Scalar.Id Admin.Object.Candidacy
regionId =
    Object.selectionForField "Data.Scalar.Id" "regionId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


region :
    SelectionSet decodesTo Admin.Object.Region
    -> SelectionSet decodesTo Admin.Object.Candidacy
region object____ =
    Object.selectionForCompositeField "region" [] object____ Basics.identity


organismId : SelectionSet (Maybe Data.Scalar.Uuid) Admin.Object.Candidacy
organismId =
    Object.selectionForField "(Maybe Data.Scalar.Uuid)" "organismId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder |> Decode.nullable)


organism :
    SelectionSet decodesTo Admin.Object.Organism
    -> SelectionSet (Maybe decodesTo) Admin.Object.Candidacy
organism object____ =
    Object.selectionForCompositeField "organism" [] object____ (Basics.identity >> Decode.nullable)


certification :
    SelectionSet decodesTo Admin.Object.Certification
    -> SelectionSet decodesTo Admin.Object.Candidacy
certification object____ =
    Object.selectionForCompositeField "certification" [] object____ Basics.identity


experiences :
    SelectionSet decodesTo Admin.Object.Experience
    -> SelectionSet (List decodesTo) Admin.Object.Candidacy
experiences object____ =
    Object.selectionForCompositeField "experiences" [] object____ (Basics.identity >> Decode.list)


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


typology : SelectionSet (Maybe Admin.Enum.CandidateTypology.CandidateTypology) Admin.Object.Candidacy
typology =
    Object.selectionForField "(Maybe Enum.CandidateTypology.CandidateTypology)" "typology" [] (Admin.Enum.CandidateTypology.decoder |> Decode.nullable)


typologyAdditional : SelectionSet (Maybe String) Admin.Object.Candidacy
typologyAdditional =
    Object.selectionForField "(Maybe String)" "typologyAdditional" [] (Decode.string |> Decode.nullable)


firstAppointmentOccuredAt : SelectionSet (Maybe Data.Scalar.Timestamp) Admin.Object.Candidacy
firstAppointmentOccuredAt =
    Object.selectionForField "(Maybe Data.Scalar.Timestamp)" "firstAppointmentOccuredAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder |> Decode.nullable)


appointmentCount : SelectionSet (Maybe Int) Admin.Object.Candidacy
appointmentCount =
    Object.selectionForField "(Maybe Int)" "appointmentCount" [] (Decode.int |> Decode.nullable)


wasPresentAtFirstAppointment : SelectionSet (Maybe Bool) Admin.Object.Candidacy
wasPresentAtFirstAppointment =
    Object.selectionForField "(Maybe Bool)" "wasPresentAtFirstAppointment" [] (Decode.bool |> Decode.nullable)


candidacyStatuses :
    SelectionSet decodesTo Admin.Object.CandidacyStatus
    -> SelectionSet (List decodesTo) Admin.Object.Candidacy
candidacyStatuses object____ =
    Object.selectionForCompositeField "candidacyStatuses" [] object____ (Basics.identity >> Decode.list)


createdAt : SelectionSet Data.Scalar.Timestamp Admin.Object.Candidacy
createdAt =
    Object.selectionForField "Data.Scalar.Timestamp" "createdAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder)


certificateSkills : SelectionSet String Admin.Object.Candidacy
certificateSkills =
    Object.selectionForField "String" "certificateSkills" [] Decode.string


otherTraining : SelectionSet String Admin.Object.Candidacy
otherTraining =
    Object.selectionForField "String" "otherTraining" [] Decode.string


individualHourCount : SelectionSet Int Admin.Object.Candidacy
individualHourCount =
    Object.selectionForField "Int" "individualHourCount" [] Decode.int


collectiveHourCount : SelectionSet Int Admin.Object.Candidacy
collectiveHourCount =
    Object.selectionForField "Int" "collectiveHourCount" [] Decode.int


additionalHourCount : SelectionSet Int Admin.Object.Candidacy
additionalHourCount =
    Object.selectionForField "Int" "additionalHourCount" [] Decode.int


validatedByCandidate : SelectionSet Bool Admin.Object.Candidacy
validatedByCandidate =
    Object.selectionForField "Bool" "validatedByCandidate" [] Decode.bool


basicSkillIds : SelectionSet (List Data.Scalar.Uuid) Admin.Object.Candidacy
basicSkillIds =
    Object.selectionForField "(List Data.Scalar.Uuid)" "basicSkillIds" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder |> Decode.list)


mandatoryTrainingIds : SelectionSet (List Data.Scalar.Uuid) Admin.Object.Candidacy
mandatoryTrainingIds =
    Object.selectionForField "(List Data.Scalar.Uuid)" "mandatoryTrainingIds" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder |> Decode.list)
