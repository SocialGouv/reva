module Data.Referential exposing (BasicSkill, MandatoryTraining, Referential, ReferentialGoal, ReferentialGoals)

import Dict exposing (Dict)


type alias BasicSkill =
    { id : String
    , label : String
    }


type alias ReferentialGoal =
    { id : String
    , label : String
    , order : Int
    , needsAdditionalInformation : Bool
    , isActive : Bool
    }


type alias ReferentialGoals =
    { goals : Dict String ReferentialGoal }


type alias MandatoryTraining =
    { id : String
    , label : String
    }


type alias Referential =
    { basicSkills : List BasicSkill
    , goals : Dict String ReferentialGoal
    , mandatoryTrainings : List MandatoryTraining
    }
