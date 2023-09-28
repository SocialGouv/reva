module Page.Form.Archive exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Archive
import Data.Form.Helper
import Data.Referential exposing (Referential)
import Html exposing (p, text)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)
import View exposing (AlertType(..))


form : Form.Status -> FormData -> ( Candidacy, Referential ) -> Form
form status formData ( _, referential ) =
    let
        keys =
            Data.Form.Archive.keys

        reorientationReasons =
            Data.Form.Helper.toIdList <|
                case status of
                    Form.Editable ->
                        referential.reorientationReasons
                            |> List.filter (not << .disabled)

                    Form.ReadOnly ->
                        referential.reorientationReasons

        archive =
            Data.Form.Archive.fromDict formData

        title =
            case status of
                Form.Editable ->
                    "Suppression d'une candidature"

                Form.ReadOnly ->
                    if not archive.isNotReoriented then
                        "Réorientation d’une candidature"

                    else
                        "Suppression d'une candidature"

        elements =
            case status of
                Form.Editable ->
                    [ ( "info"
                      , Form.StaticHtml <|
                            View.alert View.Info
                                [ class "mb-10" ]
                                ""
                                [ p []
                                    [ text "La suppression permet au candidat de refaire une candidature dans le cadre de France VAE (modification du diplôme, changement d’AAP, modification de ses coordonnées, …)"
                                    ]
                                ]
                      )
                    ]

                Form.ReadOnly ->
                    if not archive.isNotReoriented then
                        [ ( keys.reorientationReason, Form.Select "Le candidat a été réorienté vers :" reorientationReasons ) ]

                    else
                        [ ( keys.isNotReoriented, Form.Checkbox "Le candidat n'a pas été réorienté" ) ]
    in
    { elements = elements
    , saveLabel = Nothing
    , submitLabel = "Supprimer la candidature"
    , title = title
    }
