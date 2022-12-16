module Page.Form.Appointment exposing (..)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Form.Appointment exposing (candidateTypologyToString)
import Data.Referential exposing (Referential)
import Dict exposing (Dict)
import Page.Form as Form exposing (Form)
import String exposing (String)


form : Dict String String -> ( Candidacy, Referential ) -> Form
form _ _ =
    let
        keys =
            Data.Form.Appointment.keys

        typologies =
            [ SalariePrive
            , DemandeurEmploi
            , AidantsFamiliaux
            , Autre
            ]
                |> List.map (\el -> ( candidateTypologyToString el, candidateTypologyToString el ))
    in
    { elements =
        [ ( keys.typology, Form.Select "Typologie" typologies )
        , ( keys.additionalInformation, Form.SelectOther "typology" "Autre typologie" )
        , ( keys.firstAppointmentOccurredAt, Form.Date "Date du premier rendez-vous pédagogique" )
        , ( keys.appointmentCount, Form.Number "Nombre de rendez-vous réalisés avec le candidat" )
        , ( keys.wasPresentAtFirstAppointment, Form.Checkbox "Le candidat a bien effectué le rendez-vous d'étude de faisabilité" )
        ]
    , saveLabel = "Enregistrer"
    , title = "Rendez-vous pédagogique"
    }
