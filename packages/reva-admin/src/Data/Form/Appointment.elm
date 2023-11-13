module Data.Form.Appointment exposing (Appointment, appointment, appointmentFromDict, keys, validate)

import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import Data.Scalar
import Dict exposing (Dict)


type alias Appointment =
    { candidacyId : CandidacyId
    , firstAppointmentOccurredAt : Maybe Data.Scalar.Timestamp
    }


keys =
    { firstAppointmentOccurredAt = "firstAppointmentOccurredAt"
    }


appointmentFromDict : CandidacyId -> FormData -> Appointment
appointmentFromDict candidacyId formData =
    let
        decode =
            Helper.decode keys formData
    in
    Appointment candidacyId
        (decode.maybe.date .firstAppointmentOccurredAt Nothing)


appointment : Maybe Data.Scalar.Timestamp -> Dict String String
appointment firstAppointmentOccurredAt =
    [ ( .firstAppointmentOccurredAt, Maybe.map Helper.dateToString firstAppointmentOccurredAt )
    ]
        |> Helper.toDict keys


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( _, _ ) formData =
    let
        decode =
            Helper.decode keys formData
    in
    case decode.maybe.date .firstAppointmentOccurredAt Nothing of
        Nothing ->
            Err [ "Veuillez saisir une date de premier rendez-vous pédagogique" ]

        _ ->
            Ok ()
