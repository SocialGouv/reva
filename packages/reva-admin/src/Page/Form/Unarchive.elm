module Page.Form.Unarchive exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Referential exposing (Referential)
import Page.Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( _, referential ) =
    { elements = []
    , saveLabel = Nothing
    , submitLabel = "Confirmer"
    , title = "Restaurer une candidature supprimée"
    }
