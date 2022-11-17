module Data.Candidate exposing (Candidate, Degree, DegreeId, VulnerabilityIndicator, VulnerabilityIndicatorId, degreeIdFromString, degreeIdToString)

import Admin.Enum.Gender exposing (Gender)


type alias Degree =
    { id : String
    , code : String
    , label : String
    , longLabel : String
    , level : Int
    }


type alias VulnerabilityIndicator =
    { id : String
    , label : String
    }


type alias Candidate =
    { id : String
    , firstname : String
    , firstname2 : Maybe String
    , firstname3 : Maybe String
    , gender : Maybe Gender
    , highestDegree : Maybe Degree
    , lastname : String
    , vulnerabilityIndicator : Maybe VulnerabilityIndicator
    }
