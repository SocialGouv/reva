module Page.Form.Admissibility exposing (..)

import Admin.Enum.AdmissibilityStatus exposing (..)
import Data.Admissibility exposing (admissibilitySatusToString)
import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Form.Admissibility
import Data.Referential exposing (Referential)
import Dict exposing (Dict)
import Page.Form as Form exposing (Form)
import String exposing (String)


form : Dict String String -> ( Candidacy, Referential ) -> Form
form formData _ =
    let
        keys =
            Data.Form.Admissibility.keys

        statusList =
            [ Admissible
            , NotAdmissible
            ]
                |> List.map (\el -> ( "status", admissibilitySatusToString el ))

        admissibilityFromForm =
            Data.Form.Admissibility.fromDict formData

        elements =
            List.append [ ( keys.isCandidateAlreadyAdmissible, Form.Checkbox "Le candidat a déjà une recevabilité acquise et en cours de validité" ) ]
                (if not admissibilityFromForm.isCandidateAlreadyAdmissible then
                    [ ( keys.reportSentAt, Form.Date "Date d'envoi du dossier de la faisabilité" )
                    , ( keys.certifierRespondedAt, Form.Date "Date du prononcé de la recevabilité" )
                    , ( keys.responseAvailableToCandidateAt, Form.Date "Date de réception de l'avis de recevabilité" )
                    , ( keys.status, Form.RadioList "Avis de recevabilité du certificateur" statusList )
                    ]

                 else
                    []
                )
    in
    { elements = elements
    , saveLabel = "Valider"
    , title = "Recevabilité"
    }
