module Data.Form.Appointment exposing (Appointment, appointment, candidateTypologyFromString, candidateTypologyToString, keys)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Data.Form.Helper exposing (booleanToString)
import Data.Scalar
import Dict exposing (Dict)


type alias Appointment =
    Dict String String


keys =
    { typology = "typology"
    , typologyAdditional = "typologyAdditional"
    , firstAppointmentOccuredAt = "firstAppointmentOccurredAt"
    , appointmentCount = "appointmentCount"
    , wasPresentAtFirstAppointment = "wasPresentAtFirstAppointment"
    }


appointment : Maybe CandidateTypology -> Maybe String -> Maybe Data.Scalar.Date -> Maybe Int -> Maybe Bool -> Appointment
appointment typology typologyAdditional firstAppointmentOccurredAt appointmentCount wasPresentAtFirstAppointment =
    [ ( keys.typology, Maybe.map candidateTypologyToString typology |> Maybe.withDefault "" )
    , ( keys.typologyAdditional, typologyAdditional |> Maybe.withDefault "" )
    , ( keys.firstAppointmentOccuredAt, "TODO" )
    , ( keys.appointmentCount, Maybe.map String.fromInt appointmentCount |> Maybe.withDefault "" )
    , ( keys.wasPresentAtFirstAppointment, Maybe.map booleanToString wasPresentAtFirstAppointment |> Maybe.withDefault "" )
    ]
        |> Dict.fromList


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
