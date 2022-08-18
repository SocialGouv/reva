module Data.Form.Training exposing (keys)


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
