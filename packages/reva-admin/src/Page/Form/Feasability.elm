module Page.Form.Feasability exposing (..)

import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Form exposing (FormData)
import Data.Referential exposing (Referential)
import Page.Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form formData _ =
    { elements = []
    , saveLabel = Nothing
    , submitLabel = "Valider"
    , title = "Dossier de faisabilité"
    }
