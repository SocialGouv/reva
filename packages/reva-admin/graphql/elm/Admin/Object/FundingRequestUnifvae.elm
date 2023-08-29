-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.FundingRequestUnifvae exposing (..)

import Admin.Enum.Gender
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


id : SelectionSet Data.Scalar.Uuid Admin.Object.FundingRequestUnifvae
id =
    Object.selectionForField "Data.Scalar.Uuid" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder)


candidateFirstname : SelectionSet String Admin.Object.FundingRequestUnifvae
candidateFirstname =
    Object.selectionForField "String" "candidateFirstname" [] Decode.string


candidateSecondname : SelectionSet (Maybe String) Admin.Object.FundingRequestUnifvae
candidateSecondname =
    Object.selectionForField "(Maybe String)" "candidateSecondname" [] (Decode.string |> Decode.nullable)


candidateThirdname : SelectionSet (Maybe String) Admin.Object.FundingRequestUnifvae
candidateThirdname =
    Object.selectionForField "(Maybe String)" "candidateThirdname" [] (Decode.string |> Decode.nullable)


candidateLastname : SelectionSet String Admin.Object.FundingRequestUnifvae
candidateLastname =
    Object.selectionForField "String" "candidateLastname" [] Decode.string


candidateGender : SelectionSet Admin.Enum.Gender.Gender Admin.Object.FundingRequestUnifvae
candidateGender =
    Object.selectionForField "Enum.Gender.Gender" "candidateGender" [] Admin.Enum.Gender.decoder


isPartialCertification : SelectionSet Bool Admin.Object.FundingRequestUnifvae
isPartialCertification =
    Object.selectionForField "Bool" "isPartialCertification" [] Decode.bool


individualHourCount : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
individualHourCount =
    Object.selectionForField "Data.Scalar.Decimal" "individualHourCount" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


individualCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
individualCost =
    Object.selectionForField "Data.Scalar.Decimal" "individualCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


collectiveHourCount : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
collectiveHourCount =
    Object.selectionForField "Data.Scalar.Decimal" "collectiveHourCount" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


collectiveCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
collectiveCost =
    Object.selectionForField "Data.Scalar.Decimal" "collectiveCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


basicSkills :
    SelectionSet decodesTo Admin.Object.BasicSkill
    -> SelectionSet (List decodesTo) Admin.Object.FundingRequestUnifvae
basicSkills object____ =
    Object.selectionForCompositeField "basicSkills" [] object____ (Basics.identity >> Decode.list)


basicSkillsHourCount : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
basicSkillsHourCount =
    Object.selectionForField "Data.Scalar.Decimal" "basicSkillsHourCount" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


basicSkillsCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
basicSkillsCost =
    Object.selectionForField "Data.Scalar.Decimal" "basicSkillsCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


mandatoryTrainings :
    SelectionSet decodesTo Admin.Object.Training
    -> SelectionSet (List decodesTo) Admin.Object.FundingRequestUnifvae
mandatoryTrainings object____ =
    Object.selectionForCompositeField "mandatoryTrainings" [] object____ (Basics.identity >> Decode.list)


mandatoryTrainingsHourCount : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
mandatoryTrainingsHourCount =
    Object.selectionForField "Data.Scalar.Decimal" "mandatoryTrainingsHourCount" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


mandatoryTrainingsCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
mandatoryTrainingsCost =
    Object.selectionForField "Data.Scalar.Decimal" "mandatoryTrainingsCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


certificateSkills : SelectionSet String Admin.Object.FundingRequestUnifvae
certificateSkills =
    Object.selectionForField "String" "certificateSkills" [] Decode.string


certificateSkillsHourCount : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
certificateSkillsHourCount =
    Object.selectionForField "Data.Scalar.Decimal" "certificateSkillsHourCount" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


certificateSkillsCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
certificateSkillsCost =
    Object.selectionForField "Data.Scalar.Decimal" "certificateSkillsCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


otherTraining : SelectionSet String Admin.Object.FundingRequestUnifvae
otherTraining =
    Object.selectionForField "String" "otherTraining" [] Decode.string


otherTrainingHourCount : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
otherTrainingHourCount =
    Object.selectionForField "Data.Scalar.Decimal" "otherTrainingHourCount" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


otherTrainingCost : SelectionSet Data.Scalar.Decimal Admin.Object.FundingRequestUnifvae
otherTrainingCost =
    Object.selectionForField "Data.Scalar.Decimal" "otherTrainingCost" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecDecimal |> .decoder)


fundingContactFirstname : SelectionSet (Maybe String) Admin.Object.FundingRequestUnifvae
fundingContactFirstname =
    Object.selectionForField "(Maybe String)" "fundingContactFirstname" [] (Decode.string |> Decode.nullable)


fundingContactLastname : SelectionSet (Maybe String) Admin.Object.FundingRequestUnifvae
fundingContactLastname =
    Object.selectionForField "(Maybe String)" "fundingContactLastname" [] (Decode.string |> Decode.nullable)


fundingContactEmail : SelectionSet (Maybe String) Admin.Object.FundingRequestUnifvae
fundingContactEmail =
    Object.selectionForField "(Maybe String)" "fundingContactEmail" [] (Decode.string |> Decode.nullable)


fundingContactPhone : SelectionSet (Maybe String) Admin.Object.FundingRequestUnifvae
fundingContactPhone =
    Object.selectionForField "(Maybe String)" "fundingContactPhone" [] (Decode.string |> Decode.nullable)
