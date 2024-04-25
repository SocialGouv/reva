module Page.Form.ReadyForJuryEstimatedDate exposing (..)

import Accessibility exposing (li, text, ul)
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.ReadyForJuryEstimatedDate
import Data.Referential exposing (Referential)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)
import View.Date


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        keys =
            Data.Form.ReadyForJuryEstimatedDate.keys
    in
    { elements =
        [ ( ""
          , Form.Text "La date prévisionnelle correspond :" Nothing
          )
        , ( ""
          , Form.StaticHtml <|
                ul [ class "mb-8" ]
                    [ li [] [ text "à la date à laquelle le candidat aura finalisé son dossier de validation pour les certifications du Ministère du Travail et des Branches Professionnelles" ]
                    , li [] [ text "à la date de dépôt du dossier de validation pour les autres certifications" ]
                    ]
          )
        , ( keys.estimatedDate, Form.Date "Date prévisionnelle" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = ""
    }
