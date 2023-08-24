module Page.Form.Admissibility exposing (..)

import Admin.Enum.AdmissibilityStatus exposing (..)
import Data.Admissibility exposing (admissibilitySatusToString)
import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Form exposing (FormData)
import Data.Form.Admissibility
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form formData _ =
    let
        keys =
            Data.Form.Admissibility.keys

        statusList =
            [ ( "admissible", Admissible )
            , ( "not-admissible", NotAdmissible )
            ]
                |> List.map (\( id, status ) -> ( id, admissibilitySatusToString status ))

        admissibilityFromForm =
            Data.Form.Admissibility.fromDict formData

        elements =
            List.append
                [ ( keys.isCandidateAlreadyAdmissible
                  , Form.CheckboxWithAriaLabel
                        "Le candidat a déjà une recevabilité acquise et en cours de validité, le formulaire disparait à son activation, il revient à la désactivation de cette même case à cocher"
                        "Le candidat a déjà une recevabilité acquise et en cours de validité"
                  )
                ]
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
    , saveLabel = Nothing
    , submitLabel = "Valider"
    , title = "Recevabilité"
    }
