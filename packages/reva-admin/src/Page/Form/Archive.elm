module Page.Form.Archive exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Archive
import Data.Form.Helper
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


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
    in
    { elements =
        List.append
            [ ( keys.isNotReoriented, Form.Checkbox "Le candidat n'a pas été réorienté" ), ( "", Form.Title "" ) ]
            (if not archive.isNotReoriented then
                [ ( keys.reorientationReason, Form.Select "Le candidat a été réorienté vers :" reorientationReasons ) ]

             else
                []
            )
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Suppression ou réorientation d’une candidature"
    }
