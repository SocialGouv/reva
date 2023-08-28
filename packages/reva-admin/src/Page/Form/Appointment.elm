module Page.Form.Appointment exposing (..)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Form exposing (FormData)
import Data.Form.Appointment exposing (candidateTypologyToString)
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ _ =
    let
        keys =
            Data.Form.Appointment.keys

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
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Rendez-vous pédagogique"
    }
