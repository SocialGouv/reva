module Data.Form.Training exposing (fromDict, keys)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Data.Form.Helper as Helper
import Data.Referential exposing (MandatoryTraining)
import Dict exposing (Dict)


type alias Training =
    { mandatoryTrainings : List MandatoryTraining
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
        parse =
            Helper.parse keys dict
    in
    Training
        []
        (parse.string .basicSkill1 "")
        (parse.string .basicSkill2 "")
        (parse.string .basicSkill3 "")
        (parse.string .certificateSkills "")
        (parse.bool .digitalSkill False)
        (parse.string .otherTraining "")
        (parse.int .individualHourCount 0)
        (parse.int .collectiveHourCount 0)
        (parse.int .additionalHourCount 0)
