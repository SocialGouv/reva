module Data.Admissibility exposing (Admissibility, admissibilitySatusFromString, admissibilitySatusToString)

import Admin.Enum.AdmissibilityStatus exposing (..)
import Data.Scalar exposing (Timestamp)


type alias Admissibility =
    { isCandidateAlreadyAdmissible : Bool
    , reportSentAt : Maybe Timestamp
    , certifierRespondedAt : Maybe Timestamp
    , responseAvailableToCandidateAt : Maybe Timestamp
    , status : Maybe AdmissibilityStatus
    }


admissibilitySatusFromString : String -> Maybe AdmissibilityStatus
admissibilitySatusFromString admissibilityStatus =
    case admissibilityStatus of
        "Recevable" ->
            Just Admissible

        "Non recevable" ->
            Just NotAdmissible

        _ ->
            Nothing


admissibilitySatusToString : AdmissibilityStatus -> String
admissibilitySatusToString admissibilityStatus =
    case admissibilityStatus of
        Admissible ->
            "Recevable"

        NotAdmissible ->
            "Non recevable"
