module Data.Form.DossierDeValidation exposing (keys, validate)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)


keys =
    { dossierDeValidationFile = "dossierDeValidationFile"
    , dossierDeValidationFileCheck = "dossierDeValidationFile"
    , otherFilesCheck = "otherFilesCheck"
    , dossierDeValidationOtherFiles = "dossierDeValidationOtherFiles"
    , dossierDeValidationOtherFiles1 = "dossierDeValidationOtherFiles1"
    , dossierDeValidationOtherFiles2 = "dossierDeValidationOtherFiles2"
    , dossierDeValidationOtherFiles3 = "dossierDeValidationOtherFiles3"
    , dossierDeValidationOtherFiles4 = "dossierDeValidationOtherFiles4"
    , dossierDeValidationOtherFiles5 = "dossierDeValidationOtherFiles5"
    }


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( _, _ ) formData =
    let
        decode =
            Helper.decode keys formData

        error =
            Err [ "Veuillez cocher toutes les cases" ]

        isFileEmpty =
            List.isEmpty (Data.Form.getFiles keys.dossierDeValidationOtherFiles1 formData)
    in
    if decode.bool .dossierDeValidationFileCheck False && isFileEmpty == True then
        Ok ()

    else if decode.bool .dossierDeValidationFileCheck False && decode.bool .otherFilesCheck False then
        Ok ()

    else
        error
