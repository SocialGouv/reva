module Data.Form.Appointment exposing (Appointment, appointment, appointmentFromDict, candidateTypologyFromString, candidateTypologyToString, keys)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Scalar
import Dict exposing (Dict)


type alias Appointment =
    { candidacyId : CandidacyId
    , typology : Admin.Enum.CandidateTypology.CandidateTypology
    , additionalInformation : String
    , firstAppointmentOccurredAt : Maybe Data.Scalar.Timestamp
    , appointmentCount : Int
    }


keys =
    { typology = "typology"
    , additionalInformation = "additionalInformation"
    , firstAppointmentOccurredAt = "firstAppointmentOccurredAt"
    , appointmentCount = "appointmentCount"
    }


appointmentFromDict : CandidacyId -> FormData -> Appointment
appointmentFromDict candidacyId formData =
    let
        decode =
            Helper.decode keys formData
    in
    Appointment candidacyId
        (decode.generic .typology candidateTypologyFromString NonSpecifie)
        (decode.string .additionalInformation "")
        (decode.maybe.date .firstAppointmentOccurredAt Nothing)
        (decode.int .appointmentCount 0)


appointment : Maybe CandidateTypology -> Maybe String -> Maybe Data.Scalar.Timestamp -> Maybe Int -> Dict String String
appointment typology typologyAdditional firstAppointmentOccurredAt appointmentCount =
    [ ( .typology, Maybe.map candidateTypologyToString typology )
    , ( .additionalInformation, typologyAdditional )
    , ( .firstAppointmentOccurredAt, Maybe.map Helper.dateToString firstAppointmentOccurredAt )
    , ( .appointmentCount, Maybe.map String.fromInt appointmentCount )
    ]
        |> Helper.toDict keys


candidateTypologyToString : CandidateTypology -> String
candidateTypologyToString candidateTypology =
    case candidateTypology of
        NonSpecifie ->
            ""

        SalariePrive ->
            "Salarié du privé"

        SalariePublicHospitalier ->
            "Salarié de la fonction publique hospitalière"

        DemandeurEmploi ->
            "Demandeur d’emploi"

        AidantsFamiliaux ->
            "Aidant familial"

        SalariePublic ->
            "Salarié du public"

        SalarieAlternant ->
            "Salarié alternant"

        SalarieInterimaire ->
            "Salarié intérimaire"

        SalarieIntermittent ->
            "Salarié intermittent"

        SalarieEnContratsAides ->
            "Salariés en contrat aidés (CAE, IAE, service civique...)"

        TravailleurNonSalarie ->
            "Travailleur non salarié (artisan, gérant, micro entrepreneur...)"

        ConjointCollaborateur ->
            "Conjoint collaborateur"

        Benevole ->
            "Bénévole"

        Stagiaire ->
            "Stagiaire"

        Autre ->
            "Autre"


candidateTypologyFromString : String -> CandidateTypology
candidateTypologyFromString candidateTypology =
    case candidateTypology of
        "" ->
            NonSpecifie

        "Salarié du privé" ->
            SalariePrive

        "Salarié de la fonction publique hospitalière" ->
            SalariePublicHospitalier

        "Demandeur d’emploi" ->
            DemandeurEmploi

        "Aidant familial" ->
            AidantsFamiliaux

        "Salarié du public" ->
            SalariePublic

        "Salarié alternant" ->
            SalarieAlternant

        "Salarié intérimaire" ->
            SalarieInterimaire

        "Salarié intermittent" ->
            SalarieIntermittent

        "Salariés en contrat aidés (CAE, IAE, service civique...)" ->
            SalarieEnContratsAides

        "Travailleur non salarié (artisan, gérant, micro entrepreneur...)" ->
            TravailleurNonSalarie

        "Conjoint collaborateur" ->
            ConjointCollaborateur

        "Bénévole" ->
            Benevole

        "Stagiaire" ->
            Stagiaire

        "Autre" ->
            Autre

        _ ->
            Autre
