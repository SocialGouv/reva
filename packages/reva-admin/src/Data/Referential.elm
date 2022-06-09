module Data.Referential exposing (Referential, ReferentialGoal)

import Dict exposing (Dict)


type alias ReferentialGoal =
    { id : String
    , label : String
    , order : Int
    , needsAdditionalInformation : Bool
    , isActive : Bool
    }


type alias Referential =
    { goals : Dict String ReferentialGoal
    }
