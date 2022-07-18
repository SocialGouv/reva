module Data.Form.Training exposing (keys)


keys :
    { certificates : String
    , mandatoryTrainings : String
    , basicSkill1 : String
    , basicSkill2 : String
    , basicSkill3 : String
    , certificateSkills : String
    , digitalSkill1 : String
    , digitalSkill2 : String
    , digitalSkill3 : String
    , otherTraining : String
    , individualHourCount : String
    , collectiveHourCount : String
    , additionalHourCount : String
    }
keys =
    { certificates = "certificates"
    , mandatoryTrainings = "mandatory"
    , basicSkill1 = "basicSkill1"
    , basicSkill2 = "basicSkill2"
    , basicSkill3 = "basicSkill3"
    , certificateSkills = "certificateSkills"
    , digitalSkill1 = "digitalSkill1"
    , digitalSkill2 = "digitalSkill2"
    , digitalSkill3 = "digitalSkill3"
    , otherTraining = "otherTraining"
    , individualHourCount = "individualHourCount"
    , collectiveHourCount = "collectiveHourCount"
    , additionalHourCount = "additionalHourCount"
    }
