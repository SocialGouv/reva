module Data.DossierDeValidation exposing (DossierDeValidation)

import Admin.Enum.DossierDeValidationDecision exposing (DossierDeValidationDecision)
import Data.File exposing (File)
import Data.Scalar


type alias DossierDeValidation =
    { id : Data.Scalar.Id
    , dossierDeValidationSentAt : Data.Scalar.Timestamp
    , decision : DossierDeValidationDecision
    , dossierDeValidationFile : File
    , dossierDeValidationOtherFiles : List File
    }
