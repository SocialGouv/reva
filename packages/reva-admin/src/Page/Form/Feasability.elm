module Page.Form.Feasability exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        elements =
            [ ( "heading"
              , Form.Section <|
                    case candidacy.candidate of
                        Just candidate ->
                            String.concat [ candidate.firstname, " ", candidate.lastname ]

                        Nothing ->
                            ""
              )
            , ( "heading2"
              , Form.Section <|
                    case candidacy.certification of
                        Just certification ->
                            certification.label

                        Nothing ->
                            ""
              )
            ]
    in
    { elements = elements
    , saveLabel = Nothing
    , submitLabel = "Valider"
    , title = "Dossier de faisabilité"
    }
