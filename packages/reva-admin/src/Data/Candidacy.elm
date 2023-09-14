module Data.Candidacy exposing
    ( Candidacy
    , CandidacyCountByStatus
    , CandidacyExperience
    , CandidacyGoal
    , CandidacyId
    , CandidacyStatus
    , CandidacySummary
    , CandidacySummaryPage
    , DateWithLabels
    , Step
    , canCancelDropoutCandidacy
    , canDropoutCandidacy
    , candidacyIdFromString
    , candidacyIdToString
    , candidacyStatusFilterToReadableString
    , currentStatusPosition
    , isActive
    , isCandidacyArchived
    , isCandidacyReoriented
    , isFeasibilityFileSent
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

import Admin.Enum.CandidacyStatusFilter as CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Admin.Enum.Duration exposing (Duration)
import Admin.Enum.FinanceModule exposing (FinanceModule)
import Data.Candidate exposing (Candidate)
import Data.Certification exposing (Certification, CertificationSummary)
import Data.CertificationAuthority exposing (CertificationAuthority)
import Data.Feasibility exposing (Feasibility)
import Data.Organism exposing (Organism)
import Data.Pagination exposing (PaginationInfo)
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
    , certificationAuthorities : List CertificationAuthority
    , feasibility : Maybe Feasibility
    , financeModule : FinanceModule
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


type alias CandidacySummaryPage =
    { rows : List CandidacySummary
    , info : PaginationInfo
    }


type alias CandidacyCountByStatus =
    { activeHorsAbandon : Int
    , abandon : Int
    , reorientee : Int
    , archiveHorsAbandonHorsReorientation : Int
    , parcourConfirmeHorsAbandon : Int
    , priseEnChargeHorsAbandon : Int
    , parcoursEnvoyeHorsAbandon : Int
    , dossierFaisabiliteEnvoyeHorsAbandon : Int
    , dossierFaisabiliteRecevableHorsAbandon : Int
    , dossierFaisabiliteIncompletHorsAbandon : Int
    , dossierFaisabiliteNonRecevableHorsAbandon : Int
    , demandeFinancementEnvoyeHorsAbandon : Int
    , demandePaiementEnvoyeHorsAbandon : Int
    , validationHorsAbandon : Int
    , projetHorsAbandon : Int
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
            "Candidatures supprimées"

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


candidacyStatusFilterToReadableString : CandidacyStatusFilter -> String
candidacyStatusFilterToReadableString status =
    case status of
        CandidacyStatusFilter.ActiveHorsAbandon ->
            "Toutes les candidatures actives "

        CandidacyStatusFilter.Abandon ->
            "Toutes les candidatures abandonnées"

        CandidacyStatusFilter.Reorientee ->
            "Toutes les candidatures réorientées"

        CandidacyStatusFilter.ArchiveHorsAbandonHorsReorientation ->
            "Toutes les candidatures supprimées"

        CandidacyStatusFilter.ParcoursConfirmeHorsAbandon ->
            "Parcours confirmés par le candidat"

        CandidacyStatusFilter.DossierFaisabiliteEnvoyeHorsAbandon ->
            "Dossier de faisabilité envoyé"

        CandidacyStatusFilter.DossierFaisabiliteIncompletHorsAbandon ->
            "Dossier de faisabilité incomplet"

        CandidacyStatusFilter.DossierFaisabiliteRecevableHorsAbandon ->
            "Dossier de faisabilité recevable"

        CandidacyStatusFilter.DossierFaisabiliteNonRecevableHorsAbandon ->
            "Toutes les candidatures non recevables"

        CandidacyStatusFilter.PriseEnChargeHorsAbandon ->
            "Candidatures prises en charge"

        CandidacyStatusFilter.ParcoursEnvoyeHorsAbandon ->
            "Parcours envoyés"

        CandidacyStatusFilter.DemandeFinancementEnvoyeHorsAbandon ->
            "Demandes de financement envoyées"

        CandidacyStatusFilter.DemandePaiementEnvoyeeHorsAbandon ->
            "Demandes de paiement envoyées"

        CandidacyStatusFilter.ValidationHorsAbandon ->
            "Nouvelles candidatures"

        CandidacyStatusFilter.ProjetHorsAbandon ->
            "Tous les projets en cours d'édition"


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

        DossierFaisabiliteIncomplet ->
            5

        DossierFaisabiliteEnvoye ->
            6

        DossierFaisabiliteRecevable ->
            7

        DossierFaisabiliteNonRecevable ->
            7

        DemandeFinancementEnvoye ->
            8

        DemandePaiementEnvoyee ->
            9

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


isFeasibilityFileSent : Candidacy -> Bool
isFeasibilityFileSent candidacy =
    isStatusEqualOrAbove candidacy DossierFaisabiliteEnvoye


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


canDropoutCandidacy : Candidacy -> Bool
canDropoutCandidacy candidacy =
    candidacy.dropOutDate == Nothing && (not <| isCandidacyArchived candidacy)


canCancelDropoutCandidacy : Candidacy -> Bool
canCancelDropoutCandidacy candidacy =
    candidacy.dropOutDate /= Nothing && (not <| isCandidacyArchived candidacy)
