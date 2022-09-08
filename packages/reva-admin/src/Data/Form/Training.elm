module Data.Form.Training exposing (fromDict, keys)

import Data.Form.Helper as Helper
import Data.Referential exposing (BasicSkill, MandatoryTraining)
import Dict exposing (Dict)


type alias Training =
    { mandatoryTrainingIds : List String
    , basicSkills : List String
    , certificateSkills : String
    , otherTraining : String
    , individualHourCount : Int
    , collectiveHourCount : Int
    , additionalHourCount : Int
    }


keys :
    { certificate : String
    , mandatoryTrainings : String
    , basicSkills : String
    , certificateSkills : String
    , otherTraining : String
    , individualHourCount : String
    , collectiveHourCount : String
    , additionalHourCount : String
    , consent : String
    }
keys =
    { certificate = "certificate"
    , mandatoryTrainings = "mandatory-training"
    , basicSkills = "basicSkills"
    , certificateSkills = "certificateSkills"
    , otherTraining = "otherTraining"
    , individualHourCount = "individualHourCount"
    , collectiveHourCount = "collectiveHourCount"
    , additionalHourCount = "additionalHourCount"
    , consent = "consent"
    }


fromDict : List BasicSkill -> List MandatoryTraining -> Dict String String -> Training
fromDict basicSkills mandatoryTrainings dict =
    let
        decode =
            Helper.decode keys dict
    in
    Training
        (decode.list mandatoryTrainings)
        (decode.list basicSkills)
        (decode.string .certificateSkills "")
        (decode.string .otherTraining "")
        (decode.int .individualHourCount 0)
        (decode.int .collectiveHourCount 0)
        (decode.int .additionalHourCount 0)
