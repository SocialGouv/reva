module Data.Form.Training exposing (fromDict, keys)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Data.Form.Helper as Helper
import Data.Referential exposing (MandatoryTraining)
import Dict exposing (Dict)


type alias Training =
    { mandatoryTrainingIds : List String
    , basicSkill1 : String
    , basicSkill2 : String
    , basicSkill3 : String
    , certificateSkills : String
    , digitalSkill : Bool
    , otherTraining : String
    , individualHourCount : Int
    , collectiveHourCount : Int
    , additionalHourCount : Int
    }


keys :
    { certificate : String
    , mandatoryTrainings : String
    , basicSkill1 : String
    , basicSkill2 : String
    , basicSkill3 : String
    , certificateSkills : String
    , digitalSkill : String
    , otherTraining : String
    , individualHourCount : String
    , collectiveHourCount : String
    , additionalHourCount : String
    }
keys =
    { certificate = "certificate"
    , mandatoryTrainings = "mandatory-training"
    , basicSkill1 = "basicSkill1"
    , basicSkill2 = "basicSkill2"
    , basicSkill3 = "basicSkill3"
    , certificateSkills = "certificateSkills"
    , digitalSkill = "digitalSkill"
    , otherTraining = "otherTraining"
    , individualHourCount = "individualHourCount"
    , collectiveHourCount = "collectiveHourCount"
    , additionalHourCount = "additionalHourCount"
    }


fromDict : List MandatoryTraining -> Dict String String -> Training
fromDict mandatoryTrainings dict =
    let
        decode =
            Helper.decode keys dict
    in
    Training
        (decode.list mandatoryTrainings)
        (decode.string .basicSkill1 "")
        (decode.string .basicSkill2 "")
        (decode.string .basicSkill3 "")
        (decode.string .certificateSkills "")
        (decode.bool .digitalSkill False)
        (decode.string .otherTraining "")
        (decode.int .individualHourCount 0)
        (decode.int .collectiveHourCount 0)
        (decode.int .additionalHourCount 0)
