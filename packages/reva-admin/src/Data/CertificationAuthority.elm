module Data.CertificationAuthority exposing (CertificationAuthority)

import Data.Scalar


type alias CertificationAuthority =
    { id : Data.Scalar.Id
    , label : String
    , contactFullName : Maybe String
    , contactEmail : Maybe String
    }
