module Data.Form.FundingRequest exposing (FundingRequestInput, fromDict, fundingRequest, keys)

import Data.Form.Helper as Helper
import Data.Referential exposing (BasicSkill, MandatoryTraining)
import Dict exposing (Dict)


type alias FundingRequestInput =
    { companion : String
    , diagnosisHourCount : Int
    , diagnosisCost : Int
    , postExamHourCount : Int
    , postExamCost : Int
    , individualHourCount : Int
    , individualCost : Int
    , collectiveHourCount : Int
    , collectiveCost : Int
    , basicSkills : List String
    , basicSkillsHourCount : Int
    , basicSkillsCost : Int
    , mandatoryTrainings : List String
    , mandatoryTrainingsHourCount : Int
    , mandatoryTrainingsCost : Int
    , certificateSkills : String
    , certificateSkillsHourCount : Int
    , certificateSkillsCost : Int
    , otherTraining : String
    , otherTrainingHourCount : Int
    , otherTrainingCost : Int
    , examHourCount : Int
    , examCost : Int
    }


keys :
    { companion : String
    , diagnosisHourCount : String
    , diagnosisCost : String
    , postExamHourCount : String
    , postExamCost : String
    , individualHourCount : String
    , individualCost : String
    , collectiveHourCount : String
    , collectiveCost : String
    , basicSkills : String
    , basicSkillsHourCount : String
    , basicSkillsCost : String
    , mandatoryTrainings : String
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
    { companion = "companion"
    , diagnosisHourCount = "diagnosisHourCount"
    , diagnosisCost = "diagnosisCost"
    , postExamHourCount = "postExamHourCount"
    , postExamCost = "postExamCost"
    , individualHourCount = "individualHourCount"
    , individualCost = "individualCost"
    , collectiveHourCount = "collectiveHourCount"
    , collectiveCost = "collectiveCost"
    , basicSkills = "basicSkills"
    , basicSkillsHourCount = "basicSkillsHourCount"
    , basicSkillsCost = "basicSkillsCost"
    , mandatoryTrainings = "mandatoryTrainings"
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
fromDict basicSkills mandatoryTrainings dict =
    let
        decode =
            Helper.decode keys dict
    in
    FundingRequestInput
        (decode.string .companion "")
        (decode.int .diagnosisHourCount 0)
        (decode.int .diagnosisCost 0)
        (decode.int .postExamHourCount 0)
        (decode.int .postExamCost 0)
        (decode.int .individualHourCount 0)
        (decode.int .individualCost 0)
        (decode.int .collectiveHourCount 0)
        (decode.int .collectiveCost 0)
        (decode.list basicSkills)
        (decode.int .basicSkillsHourCount 0)
        (decode.int .basicSkillsCost 0)
        (decode.list mandatoryTrainings)
        (decode.int .mandatoryTrainingsHourCount 0)
        (decode.int .mandatoryTrainingsCost 0)
        (decode.string .certificateSkills "")
        (decode.int .certificateSkillsHourCount 0)
        (decode.int .certificateSkillsCost 0)
        (decode.string .otherTraining "")
        (decode.int .otherTrainingHourCount 0)
        (decode.int .otherTrainingCost 0)
        (decode.int .examHourCount 0)
        (decode.int .examCost 0)


fundingRequest : String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> Dict String String
fundingRequest companion diagnosisHourCount diagnosisCost postExamHourCount postExamCost individualHourCount individualCost collectiveHourCount collectiveCost basicSkillsHourCount basicSkillsCost mandatoryTrainingsHourCount mandatoryTrainingsCost certificateSkills certificateSkillsHourCount certificateSkillsCost otherTraining otherTrainingHourCount otherTrainingCost examHourCount examCost =
    [ ( .companion, Just companion )
    , ( .diagnosisHourCount, Just diagnosisHourCount )
    , ( .diagnosisCost, Just diagnosisCost )
    , ( .postExamHourCount, Just postExamHourCount )
    , ( .postExamCost, Just postExamCost )
    , ( .individualHourCount, Just individualHourCount )
    , ( .individualCost, Just individualCost )
    , ( .collectiveHourCount, Just collectiveHourCount )
    , ( .collectiveCost, Just collectiveCost )
    , ( .basicSkillsHourCount, Just basicSkillsHourCount )
    , ( .basicSkillsCost, Just basicSkillsCost )
    , ( .mandatoryTrainingsHourCount, Just mandatoryTrainingsHourCount )
    , ( .mandatoryTrainingsCost, Just mandatoryTrainingsCost )
    , ( .certificateSkills, Just certificateSkills )
    , ( .certificateSkillsHourCount, Just certificateSkillsHourCount )
    , ( .certificateSkillsCost, Just certificateSkillsCost )
    , ( .otherTraining, Just otherTraining )
    , ( .otherTrainingHourCount, Just otherTrainingHourCount )
    , ( .otherTrainingCost, Just otherTrainingCost )
    , ( .examHourCount, Just examHourCount )
    , ( .examCost, Just examCost )
    ]
        |> Helper.toDict keys
