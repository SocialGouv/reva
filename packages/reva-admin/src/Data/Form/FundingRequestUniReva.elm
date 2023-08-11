module Data.Form.FundingRequestUniReva exposing (FundingRequestInformations, FundingRequestInput, TrainingForm, fromDict, fundingRequest, fundingRequestInformations, keys, validate)

import Admin.Scalar exposing (Decimal)
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Form.Training exposing (Training)
import Data.Referential exposing (BasicSkill, MandatoryTraining, Referential)
import Dict exposing (Dict)


type alias TrainingForm =
    { mandatoryTrainingIds : List String
    , basicSkillsIds : List String
    , certificateSkills : String
    , otherTraining : String
    , individualHourCount : Int
    , collectiveHourCount : Int
    }


type alias FundingRequestInformations =
    { fundingRequest : FundingRequestInput
    , training : Training
    }


type alias FundingRequestInput =
    { companionId : Maybe String
    , diagnosisHourCount : Int
    , diagnosisCost : Decimal
    , postExamHourCount : Int
    , postExamCost : Decimal
    , individualHourCount : Int
    , individualCost : Decimal
    , collectiveHourCount : Int
    , collectiveCost : Decimal
    , basicSkillsIds : List String
    , basicSkillsHourCount : Int
    , basicSkillsCost : Decimal
    , mandatoryTrainingIds : List String
    , mandatoryTrainingsHourCount : Int
    , mandatoryTrainingsCost : Decimal
    , numAction : Maybe String
    , certificateSkills : String
    , certificateSkillsHourCount : Int
    , certificateSkillsCost : Decimal
    , otherTraining : String
    , otherTrainingHourCount : Int
    , otherTrainingCost : Decimal
    , examHourCount : Int
    , examCost : Decimal
    }


keys =
    { companionId = "companionId"
    , diagnosisHourCount = "diagnosisHourCount"
    , diagnosisCost = "diagnosisCost"
    , postExamHourCount = "postExamHourCount"
    , postExamCost = "postExamCost"
    , individualHourCount = "individualHourCount"
    , individualCost = "individualCost"
    , isFormConfirmed = "isFormConfirmed"
    , collectiveHourCount = "collectiveHourCount"
    , collectiveCost = "collectiveCost"
    , basicSkillsIds = "basicSkillsIds"
    , basicSkillsHourCount = "basicSkillsHourCount"
    , basicSkillsCost = "basicSkillsCost"
    , mandatoryTrainingIds = "mandatoryTrainingIds"
    , mandatoryTrainingsHourCount = "mandatoryTrainingsHourCount"
    , mandatoryTrainingsCost = "mandatoryTrainingsCost"
    , numAction = "numAction"
    , certificateSkills = "certificateSkills"
    , certificateSkillsHourCount = "certificateSkillsHourCount"
    , certificateSkillsCost = "certificateSkillsCost"
    , otherTraining = "otherTraining"
    , otherTrainingHourCount = "otherTrainingHourCount"
    , otherTrainingCost = "otherTrainingCost"
    , totalTrainingHourCount = "totalTrainingHourCount"
    , examHourCount = "examHourCount"
    , examCost = "examCost"
    }


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( candidacy, _ ) formData =
    let
        decode =
            Helper.decode keys formData

        companionValidation () =
            case ( candidacy.dropOutDate, decode.maybe.string .companionId ) of
                ( Nothing, Nothing ) ->
                    Err [ "Veuillez sélectionner un accompagnateur" ]

                _ ->
                    Ok ()

        confirmationValidation () =
            if decode.bool .isFormConfirmed False then
                Ok ()

            else
                Err [ "Veuillez confirmer le montant de la prise en charge avant son envoi définitif" ]
    in
    companionValidation ()
        |> Result.andThen confirmationValidation


fromDict : List BasicSkill -> List MandatoryTraining -> FormData -> FundingRequestInput
fromDict basicSkillsIds mandatoryTrainingIds formData =
    let
        decode =
            Helper.decode keys formData
    in
    FundingRequestInput
        (decode.maybe.string .companionId)
        (decode.int .diagnosisHourCount 0)
        (decode.decimal .diagnosisCost (Admin.Scalar.Decimal "0"))
        (decode.int .postExamHourCount 0)
        (decode.decimal .postExamCost (Admin.Scalar.Decimal "0"))
        (decode.int .individualHourCount 0)
        (decode.decimal .individualCost (Admin.Scalar.Decimal "0"))
        (decode.int .collectiveHourCount 0)
        (decode.decimal .collectiveCost (Admin.Scalar.Decimal "0"))
        (decode.list basicSkillsIds)
        (decode.int .basicSkillsHourCount 0)
        (decode.decimal .basicSkillsCost (Admin.Scalar.Decimal "0"))
        (decode.list mandatoryTrainingIds)
        (decode.int .mandatoryTrainingsHourCount 0)
        (decode.decimal .mandatoryTrainingsCost (Admin.Scalar.Decimal "0"))
        (decode.maybe.string .numAction)
        (decode.string .certificateSkills "")
        (decode.int .certificateSkillsHourCount 0)
        (decode.decimal .certificateSkillsCost (Admin.Scalar.Decimal "0"))
        (decode.string .otherTraining "")
        (decode.int .otherTrainingHourCount 0)
        (decode.decimal .otherTrainingCost (Admin.Scalar.Decimal "0"))
        (decode.int .examHourCount 0)
        (decode.decimal .examCost (Admin.Scalar.Decimal "0"))


fundingRequest : FundingRequestInput -> Dict String String
fundingRequest funding =
    let
        string key =
            Just <| key funding

        int key =
            Just <| String.fromInt <| key funding

        decimal key =
            Just <| Helper.decimalToString <| key funding

        mandatoryTrainingsChecked =
            Helper.toCheckedList funding.mandatoryTrainingIds

        basicSkillsChecked =
            Helper.toCheckedList funding.basicSkillsIds

        fundingList =
            [ ( .companionId, string (.companionId >> Maybe.withDefault "") )
            , ( .diagnosisHourCount, int .diagnosisHourCount )
            , ( .diagnosisCost, decimal .diagnosisCost )
            , ( .postExamHourCount, int .postExamHourCount )
            , ( .postExamCost, decimal .postExamCost )
            , ( .individualHourCount, int .individualHourCount )
            , ( .individualCost, decimal .individualCost )
            , ( .collectiveHourCount, int .collectiveHourCount )
            , ( .collectiveCost, decimal .collectiveCost )
            , ( .basicSkillsHourCount, int .basicSkillsHourCount )
            , ( .basicSkillsCost, decimal .basicSkillsCost )
            , ( .mandatoryTrainingsHourCount, int .mandatoryTrainingsHourCount )
            , ( .mandatoryTrainingsCost, decimal .mandatoryTrainingsCost )
            , ( .numAction, funding.numAction )
            , ( .certificateSkills, string .certificateSkills )
            , ( .certificateSkillsHourCount, int .certificateSkillsHourCount )
            , ( .certificateSkillsCost, decimal .certificateSkillsCost )
            , ( .otherTraining, string .otherTraining )
            , ( .otherTrainingHourCount, int .otherTrainingHourCount )
            , ( .otherTrainingCost, decimal .otherTrainingCost )
            , ( .examHourCount, int .examHourCount )
            , ( .examCost, decimal .examCost )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList (mandatoryTrainingsChecked ++ basicSkillsChecked ++ fundingList)


defaultFundingRequest : TrainingForm -> Dict String String
defaultFundingRequest training =
    let
        string key =
            Just <| key training

        int key =
            Just <| String.fromInt <| key training
    in
    let
        mandatoryTrainingsChecked =
            Helper.toCheckedList training.mandatoryTrainingIds

        basicSkillsChecked =
            Helper.toCheckedList training.basicSkillsIds

        otherTrainings =
            [ ( .individualHourCount, int .individualHourCount )
            , ( .collectiveHourCount, int .collectiveHourCount )
            , ( .certificateSkills, string .certificateSkills )
            , ( .otherTraining, string .otherTraining )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList (mandatoryTrainingsChecked ++ basicSkillsChecked ++ otherTrainings)


fundingRequestInformations : Maybe FundingRequestInput -> TrainingForm -> Dict String String
fundingRequestInformations maybeFundingRequest training =
    case maybeFundingRequest of
        Just funding ->
            fundingRequest funding

        Nothing ->
            defaultFundingRequest training
