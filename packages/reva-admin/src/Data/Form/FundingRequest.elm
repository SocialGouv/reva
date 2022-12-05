module Data.Form.FundingRequest exposing (FundingRequestInformations, FundingRequestInput, TrainingForm, fromDict, fundingRequest, fundingRequestInformations, keys)

import Admin.Scalar exposing (Uuid)
import Data.Form.Helper as Helper exposing (uuidToCheckedList)
import Data.Form.Training exposing (Training)
import Data.Referential exposing (BasicSkill, MandatoryTraining)
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
    , certificateSkills : String
    , certificateSkillsHourCount : Int
    , certificateSkillsCost : Int
    , otherTraining : String
    , otherTrainingHourCount : Int
    , examHourCount : Int
    , examCost : Int
    }


keys :
    { companionId : String
    , diagnosisHourCount : String
    , diagnosisCost : String
    , postExamHourCount : String
    , postExamCost : String
    , individualHourCount : String
    , individualCost : String
    , collectiveHourCount : String
    , collectiveCost : String
    , basicSkillsIds : String
    , basicSkillsHourCount : String
    , basicSkillsCost : String
    , mandatoryTrainingIds : String
    , mandatoryTrainingsHourCount : String
    , mandatoryTrainingsCost : String
    , certificateSkills : String
    , certificateSkillsHourCount : String
    , certificateSkillsCost : String
    , otherTraining : String
    , otherTrainingHourCount : String
    , examHourCount : String
    , examCost : String
    }
keys =
    { companionId = "companionId"
    , diagnosisHourCount = "diagnosisHourCount"
    , diagnosisCost = "diagnosisCost"
    , postExamHourCount = "postExamHourCount"
    , postExamCost = "postExamCost"
    , individualHourCount = "individualHourCount"
    , individualCost = "individualCost"
    , collectiveHourCount = "collectiveHourCount"
    , collectiveCost = "collectiveCost"
    , basicSkillsIds = "basicSkillsIds"
    , basicSkillsHourCount = "basicSkillsHourCount"
    , basicSkillsCost = "basicSkillsCost"
    , mandatoryTrainingIds = "mandatoryTrainingIds"
    , mandatoryTrainingsHourCount = "mandatoryTrainingsHourCount"
    , mandatoryTrainingsCost = "mandatoryTrainingsCost"
    , certificateSkills = "certificateSkills"
    , certificateSkillsHourCount = "certificateSkillsHourCount"
    , certificateSkillsCost = "certificateSkillsCost"
    , otherTraining = "otherTraining"
    , otherTrainingHourCount = "otherTrainingHourCount"
    , examHourCount = "examHourCount"
    , examCost = "examCost"
    }


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
        (decode.string .certificateSkills "")
        (decode.int .certificateSkillsHourCount 0)
        (decode.int .certificateSkillsCost 0)
        (decode.string .otherTraining "")
        (decode.int .otherTrainingHourCount 0)
        (decode.int .examHourCount 0)
        (decode.int .examCost 0)


fundingRequest : FundingRequestInput -> Dict String String
fundingRequest funding =
    let
        string key =
            Just <| key funding

        int key =
            Just <| String.fromInt <| key funding
    in
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
    , ( .certificateSkills, string .certificateSkills )
    , ( .certificateSkillsHourCount, int .certificateSkillsHourCount )
    , ( .certificateSkillsCost, int .certificateSkillsCost )
    , ( .otherTraining, string .otherTraining )
    , ( .otherTrainingHourCount, int .otherTrainingHourCount )
    , ( .examHourCount, int .examHourCount )
    , ( .examCost, int .examCost )
    ]
        |> Helper.toDict keys


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
