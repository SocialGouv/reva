module Page.Form.Archive exposing (..)

import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Form exposing (FormData)
import Data.Form.Archive
import Data.Form.Helper
import Data.Referential exposing (Referential)
import List.Extra
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form formData ( _, referential ) =
    let
        keys =
            Data.Form.Archive.keys

        reorientationReasons =
            referential.reorientationReasons |> Data.Form.Helper.toIdList

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
    , title = "Archiver une candidature"
    }
