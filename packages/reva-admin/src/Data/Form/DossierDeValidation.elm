module Data.Form.DossierDeValidation exposing (keys, validate)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)


keys =
    { dossierDeValidationFile = "dossierDeValidationFile", dossierDeValidationFileCheck = "dossierDeValidationFile", otherFilesCheck = "otherFilesCheck" }


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( _, _ ) formData =
    let
        decode =
            Helper.decode keys formData

        error =
            Err [ "Veuillez vérifier les pièces jointes et cocher toutes les cases" ]
    in
    if decode.bool .dossierDeValidationFileCheck False && decode.bool .otherFilesCheck False then
        Ok ()

    else
        error
