module Page.Form.Appointment exposing (..)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Appointment exposing (appointmentFromDict, candidateTypologyToString)
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

        typologies =
            Admin.Enum.CandidateTypology.list
                |> List.filter (\el -> el /= NonSpecifie)
                |> List.map (\el -> ( candidateTypologyToString el, candidateTypologyToString el ))
    in
    { elements =
        [ ( "candidat", Form.Title1 "1 - Informations du candidat" )
        , ( keys.typology, Form.Select "Typologie" typologies )
        , ( keys.additionalInformation, Form.SelectOther "typology" (candidateTypologyToString Autre) "Autre typologie" )
        , ( "appointment", Form.Title1 "2 - Rendez-vous" )
        , ( keys.firstAppointmentOccurredAt, Form.Date "Date du premier rendez-vous pédagogique" )
        , ( keys.appointmentCount, Form.Number "Nombre de rendez-vous réalisés avec le candidat" )
        , ( "appointmentDateWarning"
          , Form.StaticHtml <|
                if firstAppointmentOccurredAtEmpty then
                    div [ class "text-[#B34000] flex text-sm" ] [ span [ class "fr-icon--sm fr-icon-warning-fill mr-2" ] [], text "Cette information est obligatoire pour continuer le parcours. Le candidat pourra modifier sa candidature jusqu'à cette date, au-delà de laquelle toute modification sera bloquée." ]

                else
                    div [ class "text-[#0063CB] flex text-sm" ] [ span [ class "fr-icon--sm fr-icon-info-fill mr-2" ] [], text "Le candidat pourra modifier sa candidature jusqu'à cette date, au-delà de laquelle toute modification sera bloquée." ]
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Rendez-vous pédagogique"
    }
