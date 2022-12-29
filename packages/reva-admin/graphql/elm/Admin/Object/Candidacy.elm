-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql
module Admin.Object.Candidacy exposing (..)

import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.SelectionSet exposing (SelectionSet)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Admin.Object
import Admin.Interface
import Admin.Union
import Admin.Scalar
import Admin.InputObject
import Data.Scalar
import Json.Decode as Decode
import Graphql.Internal.Encode as Encode exposing (Value)
import Admin.Enum.CandidateTypology
id : SelectionSet Data.Scalar.Id Admin.Object.Candidacy
id =
      Object.selectionForField "Data.Scalar.Id" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder)


deviceId : SelectionSet (Maybe Data.Scalar.Id) Admin.Object.Candidacy
deviceId =
      Object.selectionForField "(Maybe Data.Scalar.Id)" "deviceId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder |> Decode.nullable)


candidate : SelectionSet decodesTo Admin.Object.Candidate
 -> SelectionSet (Maybe decodesTo) Admin.Object.Candidacy
candidate object____ =
      Object.selectionForCompositeField "candidate" [] (object____) (Basics.identity >> Decode.nullable)


certificationId : SelectionSet (Maybe Data.Scalar.Id) Admin.Object.Candidacy
certificationId =
      Object.selectionForField "(Maybe Data.Scalar.Id)" "certificationId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder |> Decode.nullable)


regionId : SelectionSet (Maybe Data.Scalar.Id) Admin.Object.Candidacy
regionId =
      Object.selectionForField "(Maybe Data.Scalar.Id)" "regionId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecId |> .decoder |> Decode.nullable)


region : SelectionSet decodesTo Admin.Object.Region
 -> SelectionSet (Maybe decodesTo) Admin.Object.Candidacy
region object____ =
      Object.selectionForCompositeField "region" [] (object____) (Basics.identity >> Decode.nullable)


department : SelectionSet decodesTo Admin.Object.Department
 -> SelectionSet (Maybe decodesTo) Admin.Object.Candidacy
department object____ =
      Object.selectionForCompositeField "department" [] (object____) (Basics.identity >> Decode.nullable)


organismId : SelectionSet (Maybe Data.Scalar.Uuid) Admin.Object.Candidacy
organismId =
      Object.selectionForField "(Maybe Data.Scalar.Uuid)" "organismId" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder |> Decode.nullable)


organism : SelectionSet decodesTo Admin.Object.Organism
 -> SelectionSet (Maybe decodesTo) Admin.Object.Candidacy
organism object____ =
      Object.selectionForCompositeField "organism" [] (object____) (Basics.identity >> Decode.nullable)


certification : SelectionSet decodesTo Admin.Object.Certification
 -> SelectionSet (Maybe decodesTo) Admin.Object.Candidacy
certification object____ =
      Object.selectionForCompositeField "certification" [] (object____) (Basics.identity >> Decode.nullable)


isCertificationPartial : SelectionSet Bool Admin.Object.Candidacy
isCertificationPartial =
      Object.selectionForField "Bool" "isCertificationPartial" [] (Decode.bool)


experiences : SelectionSet decodesTo Admin.Object.Experience
 -> SelectionSet (List decodesTo) Admin.Object.Candidacy
experiences object____ =
      Object.selectionForCompositeField "experiences" [] (object____) (Basics.identity >> Decode.list)


goals : SelectionSet decodesTo Admin.Object.CandidateGoal
 -> SelectionSet (List decodesTo) Admin.Object.Candidacy
goals object____ =
      Object.selectionForCompositeField "goals" [] (object____) (Basics.identity >> Decode.list)


firstname : SelectionSet (Maybe String) Admin.Object.Candidacy
firstname =
      Object.selectionForField "(Maybe String)" "firstname" [] (Decode.string |> Decode.nullable)


lastname : SelectionSet (Maybe String) Admin.Object.Candidacy
lastname =
      Object.selectionForField "(Maybe String)" "lastname" [] (Decode.string |> Decode.nullable)


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


candidacyStatuses : SelectionSet decodesTo Admin.Object.CandidacyStatus
 -> SelectionSet (List decodesTo) Admin.Object.Candidacy
candidacyStatuses object____ =
      Object.selectionForCompositeField "candidacyStatuses" [] (object____) (Basics.identity >> Decode.list)


certificateSkills : SelectionSet (Maybe String) Admin.Object.Candidacy
certificateSkills =
      Object.selectionForField "(Maybe String)" "certificateSkills" [] (Decode.string |> Decode.nullable)


otherTraining : SelectionSet (Maybe String) Admin.Object.Candidacy
otherTraining =
      Object.selectionForField "(Maybe String)" "otherTraining" [] (Decode.string |> Decode.nullable)


individualHourCount : SelectionSet (Maybe Int) Admin.Object.Candidacy
individualHourCount =
      Object.selectionForField "(Maybe Int)" "individualHourCount" [] (Decode.int |> Decode.nullable)


collectiveHourCount : SelectionSet (Maybe Int) Admin.Object.Candidacy
collectiveHourCount =
      Object.selectionForField "(Maybe Int)" "collectiveHourCount" [] (Decode.int |> Decode.nullable)


additionalHourCount : SelectionSet (Maybe Int) Admin.Object.Candidacy
additionalHourCount =
      Object.selectionForField "(Maybe Int)" "additionalHourCount" [] (Decode.int |> Decode.nullable)


validatedByCandidate : SelectionSet (Maybe Bool) Admin.Object.Candidacy
validatedByCandidate =
      Object.selectionForField "(Maybe Bool)" "validatedByCandidate" [] (Decode.bool |> Decode.nullable)


basicSkillIds : SelectionSet (List Data.Scalar.Uuid) Admin.Object.Candidacy
basicSkillIds =
      Object.selectionForField "(List Data.Scalar.Uuid)" "basicSkillIds" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder |> Decode.list)


basicSkills : SelectionSet decodesTo Admin.Object.BasicSkill
 -> SelectionSet (List decodesTo) Admin.Object.Candidacy
basicSkills object____ =
      Object.selectionForCompositeField "basicSkills" [] (object____) (Basics.identity >> Decode.list)


mandatoryTrainingIds : SelectionSet (List Data.Scalar.Uuid) Admin.Object.Candidacy
mandatoryTrainingIds =
      Object.selectionForField "(List Data.Scalar.Uuid)" "mandatoryTrainingIds" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder |> Decode.list)


mandatoryTrainings : SelectionSet decodesTo Admin.Object.Training
 -> SelectionSet (List decodesTo) Admin.Object.Candidacy
mandatoryTrainings object____ =
      Object.selectionForCompositeField "mandatoryTrainings" [] (object____) (Basics.identity >> Decode.list)


candidacyDropOut : SelectionSet decodesTo Admin.Object.CandidacyDropOut
 -> SelectionSet (Maybe decodesTo) Admin.Object.Candidacy
candidacyDropOut object____ =
      Object.selectionForCompositeField "candidacyDropOut" [] (object____) (Basics.identity >> Decode.nullable)


createdAt : SelectionSet Data.Scalar.Timestamp Admin.Object.Candidacy
createdAt =
      Object.selectionForField "Data.Scalar.Timestamp" "createdAt" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecTimestamp |> .decoder)
