module Page.Form.ReadyForJuryEstimatedDate exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.ReadyForJuryEstimatedDate
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( _, _ ) =
    let
        keys =
            Data.Form.ReadyForJuryEstimatedDate.keys
    in
    { elements =
        [ ( ""
          , Form.Text "Afin de faciliter la tenue du jury pour le candidat, merci de renseigner la date prévisionnelle à laquelle le candidat sera potentiellement prêt pour son passage devant le jury." Nothing
          )
        , ( keys.estimatedDate, Form.Date "Date prévisionnelle" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Dossier de validation"
    }
