module Data.Referential exposing (MandatoryTraining, Referential, ReferentialGoal, ReferentialGoals)

import Data.Certification exposing (CertificationSummary)
import Dict exposing (Dict)


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
    { certifications : List CertificationSummary
    , goals : Dict String ReferentialGoal
    , training : List MandatoryTraining
    }
