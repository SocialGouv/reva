module Page.Form.DossierDeValidation exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    { elements =
        []
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Dossier de validation"
    }
