module Data.Candidacy exposing
    ( Candidacy
    , CandidacyExperience
    , CandidacyGoal
    , CandidacyId
    , CandidacyStatus
    , CandidacySummary
    , candidacyIdFromString
    , candidacyIdToString
    , isStatusAbove
    , lastStatus
    , statusToDirectoryPosition
    , statusToProgressPosition
    , statusToString
    , toCandidacySummary
    )

import Admin.Enum.Duration exposing (Duration)
import Data.Certification exposing (Certification)
import Data.Organism exposing (Organism, OrganismId)
import Time


type CandidacyId
    = CandidacyId String


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
    { id : CandidacyId
    , deviceId : String
    , certificationId : String
    , organism : Maybe Organism
    , certification : Certification
    , goals : List CandidacyGoal
    , experiences : List CandidacyExperience
    , phone : Maybe String
    , email : Maybe String
    , statuses : List CandidacyStatus
    , createdAt : Time.Posix
    }


type alias CandidacySummary =
    { id : CandidacyId
    , deviceId : String
    , certificationId : String
    , certification : Certification
    , phone : Maybe String
    , email : Maybe String
    , lastStatus : CandidacyStatus
    , createdAt : Time.Posix
    }


candidacyIdToString : CandidacyId -> String
candidacyIdToString (CandidacyId id) =
    id


candidacyIdFromString : String -> CandidacyId
candidacyIdFromString id =
    CandidacyId id


statusToString : String -> String
statusToString status =
    case status of
        "VALIDATION" ->
            "Candidatures soumises"

        "PROJET" ->
            "Projet en cours d'édition"

        "ARCHIVE" ->
            "Candidatures archivées"

        "PRISE_EN_CHARGE" ->
            "Candidatures prises en charge"

        "PARCOURS_ENVOYE" ->
            "Parcours envoyé"

        "PARCOURS_CONFIRME" ->
            "Parcours confirmé par le candidat"

        _ ->
            "Statut inconnu"


statusToDirectoryPosition : String -> Int
statusToDirectoryPosition status =
    case status of
        "VALIDATION" ->
            1

        "PROJET" ->
            5

        "ARCHIVE" ->
            6

        "PRISE_EN_CHARGE" ->
            2

        "PARCOURS_ENVOYE" ->
            4

        "PARCOURS_CONFIRME" ->
            3

        _ ->
            10


statusToProgressPosition : String -> Int
statusToProgressPosition status =
    case status of
        "ARCHIVE" ->
            -1

        "PROJET" ->
            -- aka CANDIDATURE_INCOMPLETE
            0

        "VALIDATION" ->
            -- aka CANDIDATURE_SOUMISE
            1

        "PRISE_EN_CHARGE" ->
            -- aka CANDIDATURE_PRISE_EN_CHARGE
            1

        "PARCOURS_ENVOYE" ->
            3

        "PARCOURS_CONFIRME" ->
            4

        _ ->
            10


toCandidacySummary : Candidacy -> CandidacySummary
toCandidacySummary candidacy =
    { id = candidacy.id
    , deviceId = candidacy.deviceId
    , certificationId = candidacy.certificationId
    , certification = candidacy.certification
    , phone = candidacy.phone
    , email = candidacy.email
    , lastStatus = lastStatus candidacy.statuses
    , createdAt = candidacy.createdAt
    }


lastStatus : List CandidacyStatus -> CandidacyStatus
lastStatus statuses =
    List.filter (\status -> status.isActive) statuses
        |> List.head
        |> Maybe.withDefault
            { createdAt = Time.millisToPosix 0
            , status = ""
            , isActive = True
            }


isStatusAbove : Candidacy -> String -> Bool
isStatusAbove candidacy status =
    let
        currentStatusPosition =
            (lastStatus >> .status) candidacy.statuses
                |> statusToProgressPosition
    in
    currentStatusPosition >= statusToProgressPosition status
