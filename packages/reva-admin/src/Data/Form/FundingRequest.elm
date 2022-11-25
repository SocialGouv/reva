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
    , additionalHourCount : Int
    , additionalCost : Int
    , basicSkillsIds : List String
    , basicSkillsHourCount : Int
    , basicSkillsCost : Int
    , mandatoryTrainingsIds : List String
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
    , additionalHourCount : String
    , additionalCost : String
    , basicSkillsIds : String
    , basicSkillsHourCount : String
    , basicSkillsCost : String
    , mandatoryTrainingsIds : String
    , certificateSkills : String
    , certificateSkillsHourCount : String
    , certificateSkillsCost : String
    , otherTraining : String
    , otherTrainingHourCount : String
    , otherTrainingCost : String
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
    , additionalHourCount = "additionalHourCount"
    , additionalCost = "additionalCost"
    , basicSkillsIds = "basicSkillsIds"
    , basicSkillsHourCount = "basicSkillsHourCount"
    , basicSkillsCost = "basicSkillsCost"
    , mandatoryTrainingsIds = "mandatoryTrainingsIds"
    , certificateSkills = "certificateSkills"
    , certificateSkillsHourCount = "certificateSkillsHourCount"
    , certificateSkillsCost = "certificateSkillsCost"
    , otherTraining = "otherTraining"
    , otherTrainingHourCount = "otherTrainingHourCount"
    , otherTrainingCost = "otherTrainingCost"
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
        (decode.int .additionalHourCount 0)
        (decode.int .additionalCost 0)
        (decode.list basicSkills)
        (decode.int .basicSkillsHourCount 0)
        (decode.int .basicSkillsCost 0)
        (decode.list mandatoryTrainings)
        (decode.string .certificateSkills "")
        (decode.int .certificateSkillsHourCount 0)
        (decode.int .certificateSkillsCost 0)
        (decode.string .otherTraining "")
        (decode.int .otherTrainingHourCount 0)
        (decode.int .otherTrainingCost 0)
        (decode.int .examHourCount 0)
        (decode.int .examCost 0)


fundingRequest : String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> String -> p -> String -> String -> String -> String -> String -> Dict String String
fundingRequest companion diagnosisHourCount diagnosisCost postExamHourCount postExamCost individualHourCount individualCost collectiveHourCount collectiveCost additionalHourCount additionalCost basicSkillsHourCount basicSkillsCost certificateSkills certificateSkillsHourCount certificateSkillsCost otherTraining otherTrainingHourCount otherTrainingCost examHourCount examCost =
    [ ( .companion, Just companion )
    , ( .diagnosisHourCount, Just diagnosisHourCount )
    , ( .diagnosisCost, Just diagnosisCost )
    , ( .postExamHourCount, Just postExamHourCount )
    , ( .postExamCost, Just postExamCost )
    , ( .individualHourCount, Just individualHourCount )
    , ( .individualCost, Just individualCost )
    , ( .collectiveHourCount, Just collectiveHourCount )
    , ( .collectiveCost, Just collectiveCost )
    , ( .additionalHourCount, Just additionalHourCount )
    , ( .additionalCost, Just additionalCost )
    , ( .basicSkillsHourCount, Just basicSkillsHourCount )
    , ( .basicSkillsCost, Just basicSkillsCost )
    , ( .certificateSkills, Just certificateSkills )
    , ( .certificateSkillsHourCount, Just certificateSkillsHourCount )
    , ( .otherTraining, Just otherTraining )
    , ( .additionalCost, Just additionalCost )
    , ( .otherTrainingHourCount, Just otherTrainingHourCount )
    , ( .otherTrainingCost, Just otherTrainingCost )
    , ( .examHourCount, Just examHourCount )
    , ( .examCost, Just examCost )
    ]
        |> Helper.toDict keys
