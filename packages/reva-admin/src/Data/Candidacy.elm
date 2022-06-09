module Data.Candidacy exposing (Candidacy, CandidacyGoal, CandidacyStatus, CandidacySummary, statusToString)

import Data.Certification exposing (Certification)


type alias CandidacyStatus =
    { createdAt : String
    , status : String
    }


type alias CandidacyGoal =
    { goalId : String
    , additionalInformation : Maybe String
    }


type alias Candidacy =
    { id : String
    , deviceId : String
    , certificationId : String
    , companionId : Maybe String
    , certification : Certification
    , goals : List CandidacyGoal
    , phone : Maybe String
    , email : Maybe String
    , statuses : List CandidacyStatus
    , createdAt : String --TODO: Time.Posix
    }


type alias CandidacySummary =
    { id : String
    , deviceId : String
    , certificationId : String
    , companionId : Maybe String
    , certification : Certification
    , phone : Maybe String
    , email : Maybe String
    , lastStatus : CandidacyStatus
    , createdAt : String --TODO: Time.Posix
    }


statusToString : String -> String
statusToString status =
    case status of
        "VALIDATION" ->
            "Candidatures soumises"

        "PROJET" ->
            "Projet en cours d'édition"

        _ ->
            "Statut inconnu"
