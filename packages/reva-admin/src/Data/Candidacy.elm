module Data.Candidacy exposing
    ( Candidacy
    , CandidacyExperience
    , CandidacyGoal
    , CandidacyStatus
    , CandidacySummary
    , statusToString
    , toCandidacySummary
    )

import Admin.Enum.Duration exposing (Duration)
import Data.Certification exposing (Certification)
import Time


type alias CandidacyStatus =
    { createdAt : Time.Posix
    , status : String
    , isActive : Bool
    }


type alias CandidacyGoal =
    { goalId : String
    , additionalInformation : Maybe String
    }


type alias CandidacyExperience =
    { id : String
    , title : String
    , startedAt : Time.Posix
    , duration : Duration
    , description : String
    }


type alias Candidacy =
    { id : String
    , deviceId : String
    , certificationId : String
    , companionId : Maybe String
    , certification : Certification
    , goals : List CandidacyGoal
    , experiences : List CandidacyExperience
    , phone : Maybe String
    , email : Maybe String
    , statuses : List CandidacyStatus
    , createdAt : Time.Posix
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
    , createdAt : Time.Posix
    }


statusToString : String -> String
statusToString status =
    case status of
        "VALIDATION" ->
            "Candidatures soumises"

        "PROJET" ->
            "Projet en cours d'édition"

        "ARCHIVE" ->
            "Candidatures archivées"

        _ ->
            "Statut inconnu"


toCandidacySummary : Candidacy -> CandidacySummary
toCandidacySummary candidacy =
    { id = candidacy.id
    , deviceId = candidacy.deviceId
    , certificationId = candidacy.certificationId
    , companionId = candidacy.companionId
    , certification = candidacy.certification
    , phone = candidacy.phone
    , email = candidacy.email
    , lastStatus =
        List.filter (\c -> c.isActive) candidacy.statuses
            |> List.head
            |> Maybe.withDefault
                { createdAt = Time.millisToPosix 0
                , status = ""
                , isActive = True
                }
    , createdAt = candidacy.createdAt
    }
