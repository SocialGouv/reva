module Data.Form.Appointment exposing (Appointment, appointment, appointmentFromDict, candidateTypologyFromString, candidateTypologyToString, keys)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Data.Candidacy exposing (CandidacyId)
import Data.Form.Helper as Helper exposing (booleanFromString, booleanToString)
import Data.Scalar
import Dict exposing (Dict)
import Time


type alias Appointment =
    { candidacyId : CandidacyId
    , typology : Admin.Enum.CandidateTypology.CandidateTypology
    , additionalInformation : String
    , firstAppointmentOccurredAt : Maybe Data.Scalar.Timestamp
    , appointmentCount : Int
    , wasPresentAtFirstAppointment : Bool
    }


keys :
    { typology : String
    , additionalInformation : String
    , firstAppointmentOccurredAt : String
    , appointmentCount : String
    , wasPresentAtFirstAppointment : String
    }
keys =
    { typology = "typology"
    , additionalInformation = "additionalInformation"
    , firstAppointmentOccurredAt = "firstAppointmentOccurredAt"
    , appointmentCount = "appointmentCount"
    , wasPresentAtFirstAppointment = "wasPresentAtFirstAppointment"
    }


appointmentFromDict : CandidacyId -> Dict String String -> Appointment
appointmentFromDict candidacyId dict =
    let
        required =
            Helper.required keys dict
    in
    Appointment candidacyId
        (required .typology candidateTypologyFromString NonSpecifie)
        (required .additionalInformation identity "")
        (required .firstAppointmentOccurredAt Helper.dateFromString Nothing)
        (required .appointmentCount (String.toInt >> Maybe.withDefault 0) 0)
        (required .wasPresentAtFirstAppointment booleanFromString False)


appointment : Maybe CandidateTypology -> Maybe String -> Maybe Data.Scalar.Timestamp -> Maybe Int -> Maybe Bool -> Dict String String
appointment typology typologyAdditional firstAppointmentOccurredAt appointmentCount wasPresentAtFirstAppointment =
    [ ( .typology, Maybe.map candidateTypologyToString typology )
    , ( .additionalInformation, typologyAdditional )
    , ( .firstAppointmentOccurredAt, Maybe.map Helper.dateToString firstAppointmentOccurredAt )
    , ( .appointmentCount, Maybe.map String.fromInt appointmentCount )
    , ( .wasPresentAtFirstAppointment, Maybe.map booleanToString wasPresentAtFirstAppointment )
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
            "Aidants familiaux"

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

        "Aidants familiaux" ->
            AidantsFamiliaux

        "Autre" ->
            Autre

        _ ->
            Autre
