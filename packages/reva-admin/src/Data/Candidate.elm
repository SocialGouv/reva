module Data.Candidate exposing (Candidate, genderFromString, genderToString)

import Admin.Enum.Gender exposing (Gender(..))


type alias Candidate =
    { id : String
    , firstname : String
    , firstname2 : Maybe String
    , firstname3 : Maybe String
    , gender : Maybe Gender
    , lastname : String
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
