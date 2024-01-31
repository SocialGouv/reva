module Page.Form.ReadyForJuryEstimatedDate exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.ReadyForJuryEstimatedDate
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)
import View.Date


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        keys =
            Data.Form.ReadyForJuryEstimatedDate.keys
    in
    { elements =
        case candidacy.readyForJuryEstimatedAt of
            Just date ->
                [ ( ""
                  , Form.Text "Date prévisionnelle à laquelle le candidat sera potentiellement prêt pour son passage devant le jury." Nothing
                  )
                , ( keys.estimatedDate, Form.Info "Date prévisionnelle" (View.Date.toFullFormat date) )
                ]

            Nothing ->
                [ ( ""
                  , Form.Text "Afin de faciliter la tenue du jury pour le candidat, merci de renseigner la date prévisionnelle à laquelle le candidat sera potentiellement prêt pour son passage devant le jury." Nothing
                  )
                  , ("", Form.Text "Pour toute précision, merci de vous rapprocher du certificateur." Nothing)
                , ( keys.estimatedDate, Form.Date "Date prévisionnelle" )
                ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = ""
    }
