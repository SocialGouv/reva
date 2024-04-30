-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.FundingRequest exposing (..)

import Admin.Object
import Admin.Scalar
import Data.Scalar
import Graphql.Internal.Builder.Object as Object
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode


id : SelectionSet Data.Scalar.Uuid Admin.Object.FundingRequest
id =
    Object.selectionForField "Data.Scalar.Uuid" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder)


numAction : SelectionSet (Maybe String) Admin.Object.FundingRequest
numAction =
    Object.selectionForField "(Maybe String)" "numAction" [] (Decode.string |> Decode.nullable)


companion :
    SelectionSet decodesTo Admin.Object.Organism
    -> SelectionSet (Maybe decodesTo) Admin.Object.FundingRequest
companion object____ =
    Object.selectionForCompositeField "companion" [] object____ (Basics.identity >> Decode.nullable)


diagnosisHourCount : SelectionSet Int Admin.Object.FundingRequest
diagnosisHourCount =
    Object.selectionForField "Int" "diagnosisHourCount" [] Decode.int


diagnosisCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequest
diagnosisCost =
    Object.selectionForField "Data.Scalar.Decimal" "diagnosisCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


postExamHourCount : SelectionSet Int Admin.Object.FundingRequest
postExamHourCount =
    Object.selectionForField "Int" "postExamHourCount" [] Decode.int


postExamCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequest
postExamCost =
    Object.selectionForField "Data.Scalar.Decimal" "postExamCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


individualHourCount : SelectionSet Int Admin.Object.FundingRequest
individualHourCount =
    Object.selectionForField "Int" "individualHourCount" [] Decode.int


individualCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequest
individualCost =
    Object.selectionForField "Data.Scalar.Decimal" "individualCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


collectiveHourCount : SelectionSet Int Admin.Object.FundingRequest
collectiveHourCount =
    Object.selectionForField "Int" "collectiveHourCount" [] Decode.int


collectiveCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequest
collectiveCost =
    Object.selectionForField "Data.Scalar.Decimal" "collectiveCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


basicSkills :
    SelectionSet decodesTo Admin.Object.BasicSkill
    -> SelectionSet (List decodesTo) Admin.Object.FundingRequest
basicSkills object____ =
    Object.selectionForCompositeField "basicSkills" [] object____ (Basics.identity >> Decode.list)


basicSkillsHourCount : SelectionSet Int Admin.Object.FundingRequest
basicSkillsHourCount =
    Object.selectionForField "Int" "basicSkillsHourCount" [] Decode.int


basicSkillsCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequest
basicSkillsCost =
    Object.selectionForField "Data.Scalar.Decimal" "basicSkillsCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


mandatoryTrainings :
    SelectionSet decodesTo Admin.Object.Training
    -> SelectionSet (List decodesTo) Admin.Object.FundingRequest
mandatoryTrainings object____ =
    Object.selectionForCompositeField "mandatoryTrainings" [] object____ (Basics.identity >> Decode.list)


mandatoryTrainingsHourCount : SelectionSet Int Admin.Object.FundingRequest
mandatoryTrainingsHourCount =
    Object.selectionForField "Int" "mandatoryTrainingsHourCount" [] Decode.int


mandatoryTrainingsCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequest
mandatoryTrainingsCost =
    Object.selectionForField "Data.Scalar.Decimal" "mandatoryTrainingsCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


certificateSkills : SelectionSet String Admin.Object.FundingRequest
certificateSkills =
    Object.selectionForField "String" "certificateSkills" [] Decode.string


certificateSkillsHourCount : SelectionSet Int Admin.Object.FundingRequest
certificateSkillsHourCount =
    Object.selectionForField "Int" "certificateSkillsHourCount" [] Decode.int


certificateSkillsCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequest
certificateSkillsCost =
    Object.selectionForField "Data.Scalar.Decimal" "certificateSkillsCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


otherTraining : SelectionSet String Admin.Object.FundingRequest
otherTraining =
    Object.selectionForField "String" "otherTraining" [] Decode.string


otherTrainingHourCount : SelectionSet Int Admin.Object.FundingRequest
otherTrainingHourCount =
    Object.selectionForField "Int" "otherTrainingHourCount" [] Decode.int


otherTrainingCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequest
otherTrainingCost =
    Object.selectionForField "Data.Scalar.Decimal" "otherTrainingCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


examHourCount : SelectionSet Int Admin.Object.FundingRequest
examHourCount =
    Object.selectionForField "Int" "examHourCount" [] Decode.int


examCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequest
examCost =
    Object.selectionForField "Data.Scalar.Decimal" "examCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)
