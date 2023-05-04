module Data.Candidacy exposing
    ( Candidacy
    , CandidacyExperience
    , CandidacyGoal
    , CandidacyId
    , CandidacyStatus
    , CandidacySummary
    , DateWithLabels
    , Step
    , candidacyIdFromString
    , candidacyIdToString
    , currentStatusPosition
    , filterByStatus
    , filterByWords
    , isActive
    , isCandidacyArchived
    , isCandidacyReoriented
    , isFundingRequestSent
    , isPaymentRequestSent
    , isStatusEqual
    , isStatusEqualOrAbove
    , isTrainingSent
    , lastStatus
    , sentDate
    , statusToCategoryString
    , statusToProgressPosition
    , toCategoryString
    , toDirectoryPosition
    )

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Admin.Enum.Duration exposing (Duration)
import Css exposing (lowercase)
import Data.Candidate exposing (Candidate)
import Data.Certification exposing (Certification, CertificationSummary)
import Data.Organism exposing (Organism)
import Data.Referential exposing (Department, ReorientationReason)
import Time


type CandidacyId
    = CandidacyId String


type alias Step =
    CandidacyStatusStep


type alias CandidacyStatus =
    { createdAt : DateWithLabels
    , status : Step
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
    , availableCompanions : List Organism
    , candidate : Maybe Candidate
    , certificationId : Maybe String
    , organism : Maybe Organism
    , certification : Maybe Certification
    , department : Maybe Department
    , goals : List CandidacyGoal
    , experiences : List CandidacyExperience
    , firstname : Maybe String
    , lastname : Maybe String
    , phone : Maybe String
    , email : Maybe String
    , dropOutDate : Maybe Time.Posix
    , statuses : List CandidacyStatus
    , createdAt : Time.Posix
    , reorientationReason : Maybe ReorientationReason
    }


type alias CandidacySummary =
    { id : CandidacyId
    , certificationId : Maybe String
    , certification : Maybe CertificationSummary
    , department : Maybe Department
    , organism : Maybe Organism
    , firstname : Maybe String
    , lastname : Maybe String
    , phone : Maybe String
    , email : Maybe String
    , isDroppedOut : Bool
    , lastStatus : CandidacyStatus
    , isReorientation : Bool
    , createdAt : Time.Posix
    , sentAt : Maybe DateWithLabels
    }


type alias DateWithLabels =
    { posix : Time.Posix
    , smallFormat : String
    , fullFormat : String
    }


candidacyIdToString : CandidacyId -> String
candidacyIdToString (CandidacyId id) =
    id


candidacyIdFromString : String -> CandidacyId
candidacyIdFromString id =
    CandidacyId id


toCategoryString : CandidacySummary -> String
toCategoryString candidacy =
    if candidacy.isDroppedOut then
        "Candidatures abandonnées"

    else if candidacy.isReorientation then
        "Candidatures réorientées"

    else
        statusToCategoryString candidacy.lastStatus.status


statusToCategoryString : Step -> String
statusToCategoryString status =
    case status of
        Validation ->
            "Nouvelles candidatures"

        Projet ->
            "Projets en cours d'édition"

        Archive ->
            "Candidatures archivées"

        PriseEnCharge ->
            "Candidatures prises en charge"

        ParcoursEnvoye ->
            "Parcours envoyés"

        ParcoursConfirme ->
            "Parcours confirmés par le candidat"

        DemandeFinancementEnvoye ->
            "Demandes de financement envoyées"

        DemandePaiementEnvoyee ->
            "Demandes de paiement envoyées"

        _ ->
            "Statut inconnu"


toDirectoryPosition : CandidacySummary -> Int
toDirectoryPosition candidacy =
    if candidacy.isDroppedOut then
        7

    else
        statusToDirectoryPosition candidacy.lastStatus.status


statusToDirectoryPosition : Step -> Int
statusToDirectoryPosition status =
    case status of
        Validation ->
            1

        Projet ->
            6

        Archive ->
            7

        PriseEnCharge ->
            2

        ParcoursEnvoye ->
            3

        ParcoursConfirme ->
            4

        DemandeFinancementEnvoye ->
            5

        _ ->
            10


statusToProgressPosition : Step -> Int
statusToProgressPosition status =
    case status of
        Archive ->
            -1

        Projet ->
            -- aka CANDIDATURE_INCOMPLETE
            0

        Validation ->
            -- aka CANDIDATURE_SOUMISE
            1

        PriseEnCharge ->
            -- aka CANDIDATURE_PRISE_EN_CHARGE
            1

        ParcoursEnvoye ->
            3

        ParcoursConfirme ->
            5

        DemandeFinancementEnvoye ->
            7

        DemandePaiementEnvoyee ->
            8

        _ ->
            -1


lastStatus : List CandidacyStatus -> CandidacyStatus
lastStatus statuses =
    List.filter (\status -> status.isActive) statuses
        |> List.head
        |> Maybe.withDefault
            { createdAt = { posix = Time.millisToPosix 0, smallFormat = "", fullFormat = "" }
            , status = Projet
            , isActive = True
            }


sentDate : List CandidacyStatus -> Maybe DateWithLabels
sentDate statuses =
    List.filter (.status >> (==) Validation) statuses
        |> List.head
        |> Maybe.map .createdAt


currentStatusPosition : Candidacy -> Int
currentStatusPosition candidacy =
    (lastStatus >> .status) candidacy.statuses
        |> statusToProgressPosition


isStatusEqualOrAbove : Candidacy -> Step -> Bool
isStatusEqualOrAbove candidacy status =
    currentStatusPosition candidacy >= statusToProgressPosition status


isStatusEqual : Candidacy -> Step -> Bool
isStatusEqual candidacy status =
    currentStatusPosition candidacy == statusToProgressPosition status


isFundingRequestSent : Candidacy -> Bool
isFundingRequestSent candidacy =
    isStatusEqualOrAbove candidacy DemandeFinancementEnvoye


isPaymentRequestSent : Candidacy -> Bool
isPaymentRequestSent candidacy =
    isStatusEqualOrAbove candidacy DemandePaiementEnvoyee


isTrainingSent : Candidacy -> Bool
isTrainingSent candidacy =
    isStatusEqualOrAbove candidacy ParcoursEnvoye


filterByWord : String -> CandidacySummary -> Bool
filterByWord word candidacySummary =
    let
        match s =
            String.toLower s
                |> String.contains (String.toLower word)

        maybeMatch field =
            Maybe.map match (field candidacySummary) |> Maybe.withDefault False
    in
    (Maybe.map (\certification -> match (certification.label ++ " " ++ certification.acronym)) candidacySummary.certification |> Maybe.withDefault False)
        || maybeMatch .firstname
        || maybeMatch .lastname
        || maybeMatch .phone
        || maybeMatch .email
        || maybeMatch (.sentAt >> Maybe.map .smallFormat)
        || maybeMatch (.sentAt >> Maybe.map .fullFormat)
        || (Maybe.map match (Maybe.map .label candidacySummary.department) |> Maybe.withDefault False)
        || (Maybe.map match (Maybe.map .label candidacySummary.organism) |> Maybe.withDefault False)


filterByWords : String -> CandidacySummary -> Bool
filterByWords words candidacySummary =
    let
        matchAll predicate list =
            case list of
                [] ->
                    True

                first :: rest ->
                    if predicate first then
                        matchAll predicate rest

                    else
                        False
    in
    matchAll (\word -> filterByWord word candidacySummary) (String.split " " words)


filterByStatus : String -> CandidacySummary -> Bool
filterByStatus lowerCaseStatus candidacySummary =
    let
        status =
            String.toUpper lowerCaseStatus
                |> Admin.Enum.CandidacyStatusStep.fromString
                |> Maybe.withDefault Projet
    in
    if lowerCaseStatus == "abandon" then
        candidacySummary.isDroppedOut

    else if lowerCaseStatus == "reorientation" then
        candidacySummary.isReorientation

    else
        candidacySummary.lastStatus.status == status && not candidacySummary.isReorientation


isActive : CandidacySummary -> Bool
isActive candidacySummary =
    not <|
        List.member candidacySummary.lastStatus.status [ Archive, Projet ]
            || candidacySummary.isDroppedOut
            || candidacySummary.isReorientation


isCandidacyArchived : Candidacy -> Bool
isCandidacyArchived candidacy =
    candidacy.reorientationReason == Nothing && List.any (\s -> s.isActive && s.status == Admin.Enum.CandidacyStatusStep.Archive) candidacy.statuses


isCandidacyReoriented : Candidacy -> Bool
isCandidacyReoriented candidacy =
    not <| candidacy.reorientationReason == Nothing
