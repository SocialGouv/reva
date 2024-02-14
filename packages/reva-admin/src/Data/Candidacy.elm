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
    , lastStatusDate
    , sentDate
    , statusToCategoryString
    , statusToProgressPosition
    , toCategoryString
    , toDirectoryPosition
    )

import Admin.Enum.CandidacyStatusFilter as CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Admin.Enum.CandidateTypology exposing (CandidateTypology)
import Admin.Enum.Duration exposing (Duration)
import Admin.Enum.FinanceModule exposing (FinanceModule)
import Admin.Object.Candidacy exposing (activeDossierDeValidation, conventionCollective, typology, typologyAdditional)
import Admin.Object.DossierDeValidation exposing (dossierDeValidationFile)
import Data.CandidacyConventionCollective exposing (CandidacyConventionCollective)
import Data.Candidate exposing (Candidate)
import Data.Certification exposing (Certification, CertificationSummary)
import Data.CertificationAuthority exposing (CertificationAuthority)
import Data.DossierDeValidation exposing (DossierDeValidation)
import Data.Feasibility exposing (Feasibility)
import Data.Jury exposing (Jury)
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
    , email : Maybe String
    , dropOutDate : Maybe Time.Posix
    , statuses : List CandidacyStatus
    , createdAt : Time.Posix
    , reorientationReason : Maybe ReorientationReason
    , certificationAuthorities : List CertificationAuthority
    , feasibility : Maybe Feasibility
    , activeDossierDeValidation : Maybe DossierDeValidation
    , financeModule : FinanceModule
    , firstAppointmentOccuredAt : Maybe Time.Posix
    , typology : CandidateTypology
    , typologyAdditional : Maybe String
    , ccnId : Maybe String
    , conventionCollective : Maybe CandidacyConventionCollective
    , readyForJuryEstimatedAt : Maybe Time.Posix -- legacy jury date for Reva XP
    , jury : Maybe Jury
    }


type alias CandidacySummary =
    { id : CandidacyId
    , certificationId : Maybe String
    , certification : Maybe CertificationSummary
    , department : Maybe Department
    , organism : Maybe Organism
    , firstname : Maybe String
    , lastname : Maybe String
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
    , dossierDeValidationEnvoyeHorsAbandon : Int
    , dossierDeValidationSignaleHorsAbandon : Int
    , juryProgrammeHorsAbandon : Int
    , juryPasseHorsAbandon : Int
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
            "Demandes de prise en charge envoyées"

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

        CandidacyStatusFilter.DossierDeValidationEnvoyeHorsAbandon ->
            "Dossier de validation envoyé"

        CandidacyStatusFilter.DossierDeValidationSignaleHorsAbandon ->
            "Dossier de validation signalé"

        CandidacyStatusFilter.JuryProgrammeHorsAbandon ->
            "Jury programmé"

        CandidacyStatusFilter.JuryPasseHorsAbandon ->
            "Jury passé"

        CandidacyStatusFilter.PriseEnChargeHorsAbandon ->
            "Candidatures prises en charge"

        CandidacyStatusFilter.ParcoursEnvoyeHorsAbandon ->
            "Parcours envoyés"

        CandidacyStatusFilter.DemandeFinancementEnvoyeHorsAbandon ->
            "Demandes de prise en charge envoyées"

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

        DossierDeValidationSignale ->
            9

        DossierDeValidationEnvoye ->
            10

        DemandePaiementEnvoyee ->
            11

        _ ->
            -1


lastStatusHelper : List CandidacyStatus -> CandidacyStatus
lastStatusHelper statuses =
    List.filter (\status -> status.isActive) statuses
        |> List.head
        |> Maybe.withDefault
            { createdAt = { posix = Time.millisToPosix 0, smallFormat = "", fullFormat = "" }
            , status = Projet
            , isActive = True
            }


lastStatus : List CandidacyStatus -> Step
lastStatus statuses =
    statuses |> lastStatusHelper >> .status


lastStatusDate : List CandidacyStatus -> DateWithLabels
lastStatusDate statuses =
    statuses |> lastStatusHelper >> .createdAt


sentDate : List CandidacyStatus -> Maybe DateWithLabels
sentDate statuses =
    List.filter (.status >> (==) Validation) statuses
        |> List.head
        |> Maybe.map .createdAt


currentStatusPosition : Candidacy -> Int
currentStatusPosition candidacy =
    (lastStatusHelper >> .status) candidacy.statuses
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
