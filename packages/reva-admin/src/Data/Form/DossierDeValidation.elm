module Data.Form.DossierDeValidation exposing (keys, validate)

import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.Form exposing (FormData)
import Data.Referential exposing (Referential)
import Dict exposing (Dict)


keys =
    { dossierDeValidationFile = "dossierDeValidationFile" }


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( _, _ ) formData =
    Ok ()
