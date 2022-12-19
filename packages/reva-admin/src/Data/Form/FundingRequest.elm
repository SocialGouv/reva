module Data.Form.FundingRequest exposing (FundingRequestInformations, FundingRequestInput, TrainingForm, fromDict, fundingRequest, fundingRequestInformations, keys, validate)

import Data.Candidacy exposing (Candidacy)
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
    { companionId : String
    , diagnosisHourCount : Int
    , diagnosisCost : Int
    , postExamHourCount : Int
    , postExamCost : Int
    , individualHourCount : Int
    , individualCost : Int
    , collectiveHourCount : Int
    , collectiveCost : Int
    , basicSkillsIds : List String
    , basicSkillsHourCount : Int
    , basicSkillsCost : Int
    , mandatoryTrainingIds : List String
    , mandatoryTrainingsHourCount : Int
    , mandatoryTrainingsCost : Int
    , numAction : Maybe String
    , certificateSkills : String
    , certificateSkillsHourCount : Int
    , certificateSkillsCost : Int
    , otherTraining : String
    , examHourCount : Int
    , examCost : Int
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
    , totalTrainingHourCount = "totalTrainingHourCount"
    , examHourCount = "examHourCount"
    , examCost = "examCost"
    }


validate : ( Candidacy, Referential ) -> Dict String String -> Result String ()
validate _ dict =
    let
        decode =
            Helper.decode keys dict

        companionValidation () =
            case decode.maybe.string .companionId of
                Nothing ->
                    Err "Veuillez sélectionner un accompagnateur"

                Just _ ->
                    Ok ()

        confirmationValidation () =
            if decode.bool .isFormConfirmed False then
                Ok ()

            else
                Err "Veuillez confirmer le montant de la prise en charge avant son envoi définitif"
    in
    companionValidation ()
        |> Result.andThen confirmationValidation


fromDict : List BasicSkill -> List MandatoryTraining -> Dict String String -> FundingRequestInput
fromDict basicSkillsIds mandatoryTrainingIds dict =
    let
        decode =
            Helper.decode keys dict
    in
    FundingRequestInput
        (decode.string .companionId "")
        (decode.int .diagnosisHourCount 0)
        (decode.int .diagnosisCost 0)
        (decode.int .postExamHourCount 0)
        (decode.int .postExamCost 0)
        (decode.int .individualHourCount 0)
        (decode.int .individualCost 0)
        (decode.int .collectiveHourCount 0)
        (decode.int .collectiveCost 0)
        (decode.list basicSkillsIds)
        (decode.int .basicSkillsHourCount 0)
        (decode.int .basicSkillsCost 0)
        (decode.list mandatoryTrainingIds)
        (decode.int .mandatoryTrainingsHourCount 0)
        (decode.int .mandatoryTrainingsCost 0)
        (decode.maybe.string .numAction)
        (decode.string .certificateSkills "")
        (decode.int .certificateSkillsHourCount 0)
        (decode.int .certificateSkillsCost 0)
        (decode.string .otherTraining "")
        (decode.int .examHourCount 0)
        (decode.int .examCost 0)


fundingRequest : FundingRequestInput -> Dict String String
fundingRequest funding =
    let
        string key =
            Just <| key funding

        int key =
            Just <| String.fromInt <| key funding

        mandatoryTrainingsChecked =
            Helper.toCheckedList funding.mandatoryTrainingIds

        basicSkillsChecked =
            Helper.toCheckedList funding.basicSkillsIds

        fundingList =
            [ ( .companionId, string .companionId )
            , ( .diagnosisHourCount, int .diagnosisHourCount )
            , ( .diagnosisCost, int .diagnosisCost )
            , ( .postExamHourCount, int .postExamHourCount )
            , ( .postExamCost, int .postExamCost )
            , ( .individualHourCount, int .individualHourCount )
            , ( .individualCost, int .individualCost )
            , ( .collectiveHourCount, int .collectiveHourCount )
            , ( .collectiveCost, int .collectiveCost )
            , ( .basicSkillsHourCount, int .basicSkillsHourCount )
            , ( .basicSkillsCost, int .basicSkillsCost )
            , ( .mandatoryTrainingsHourCount, int .mandatoryTrainingsHourCount )
            , ( .mandatoryTrainingsCost, int .mandatoryTrainingsCost )
            , ( .numAction, funding.numAction )
            , ( .certificateSkills, string .certificateSkills )
            , ( .certificateSkillsHourCount, int .certificateSkillsHourCount )
            , ( .certificateSkillsCost, int .certificateSkillsCost )
            , ( .otherTraining, string .otherTraining )
            , ( .examHourCount, int .examHourCount )
            , ( .examCost, int .examCost )
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
