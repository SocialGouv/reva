module Data.DossierDeValidation exposing (DossierDeValidation, DossierDeValidationHistory)

import Admin.Enum.DossierDeValidationDecision exposing (DossierDeValidationDecision)
import Data.File exposing (File)
import Data.Scalar


type alias DossierDeValidationHistory =
    { id : Data.Scalar.Id
    , decisionSentAt : Maybe Data.Scalar.Timestamp
    , decisionComment : Maybe String
    }


type alias DossierDeValidation =
    { id : Data.Scalar.Id
    , dossierDeValidationSentAt : Data.Scalar.Timestamp
    , decision : DossierDeValidationDecision
    , decisionSentAt : Maybe Data.Scalar.Timestamp
    , decisionComment : Maybe String
    , dossierDeValidationFile : File
    , dossierDeValidationOtherFiles : List File
    , history : List DossierDeValidationHistory
    }
