module Data.Candidate exposing (Candidate, Degree, VulnerabilityIndicator, genderFromString, genderToString)

import Admin.Enum.Gender exposing (Gender(..))


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


genderToString : Gender -> String
genderToString gender =
    case gender of
        Man ->
            "Homme"

        Undisclosed ->
            "Non précisé"

        Woman ->
            "Femme"


genderFromString : String -> Gender
genderFromString gender =
    case gender of
        "Homme" ->
            Man

        "Non précisé" ->
            Undisclosed

        "Femme" ->
            Woman

        _ ->
            Undisclosed
