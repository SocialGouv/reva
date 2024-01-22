module Page.Form.ReadyForJuryEstimatedDate exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.ReadyForJuryEstimatedDate
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        keys =
            Data.Form.ReadyForJuryEstimatedDate.keys
    in
    { elements =
        if candidacy.readyForJuryEstimatedAt /= Nothing then
            [ ( ""
              , Form.Text "Date prévisionnelle à laquelle le candidat sera potentiellement prêt pour son passage devant le jury." Nothing
              )
            , ( keys.estimatedDate, Form.ReadOnlyElement <| Form.Date "Date prévisionnelle" )
            ]

        else
            [ ( ""
              , Form.Text "Afin de faciliter la tenue du jury pour le candidat, merci de renseigner la date prévisionnelle à laquelle le candidat sera potentiellement prêt pour son passage devant le jury." Nothing
              )
            , ( keys.estimatedDate, Form.Date "Date prévisionnelle" )
            ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Date de disponibilité estimée"
    }
