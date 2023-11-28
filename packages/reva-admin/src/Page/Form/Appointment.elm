module Page.Form.Appointment exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Appointment exposing (appointmentFromDict)
import Data.Referential exposing (Referential)
import Html exposing (div, span, text)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)
import View exposing (AlertType(..))


form : FormData -> ( Candidacy, Referential ) -> Form
form formdata ( candidacy, _ ) =
    let
        keys =
            Data.Form.Appointment.keys

        firstAppointmentOccurredAtEmpty =
            (appointmentFromDict candidacy.id formdata).firstAppointmentOccurredAt == Nothing
    in
    { elements =
        [ ( keys.firstAppointmentOccurredAt, Form.Date "Date du premier rendez-vous pédagogique" )
        , ( "appointmentDateWarning"
          , Form.StaticHtml <|
                if firstAppointmentOccurredAtEmpty then
                    View.warningHint "Cette information est obligatoire pour continuer le parcours. Le candidat pourra modifier sa candidature jusqu'à cette date, au-delà de laquelle toute modification sera bloquée."

                else
                    View.infoHint "Le candidat pourra modifier sa candidature jusqu'à cette date, au-delà de laquelle toute modification sera bloquée."
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Rendez-vous pédagogique"
    }
