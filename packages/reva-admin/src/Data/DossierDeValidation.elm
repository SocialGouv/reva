module Data.DossierDeValidation exposing (DossierDeValidation)

import Data.File exposing (File)
import Data.Scalar


type alias DossierDeValidation =
    { id : Data.Scalar.Id
    , dossierDeValidationSentAt : Data.Scalar.Timestamp
    , dossierDeValidationFile : File
    }
