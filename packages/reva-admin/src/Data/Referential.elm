module Data.Referential exposing (Referential, ReferentialGoal)


type alias ReferentialGoal =
    { id : String
    , label : String
    , order : Int
    , needsAdditionalInformation : Bool
    , isActive : Bool
    }


type alias Referential =
    { goals : List ReferentialGoal
    }
