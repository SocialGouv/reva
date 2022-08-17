module Data.Certification exposing (Certification, CertificationSummary)

import Data.Scalar


type alias Certification =
    { id : Data.Scalar.Id
    , label : String
    , summary : String
    , acronym : String
    , level : Int
    , activities : Maybe String
    , activityArea : Maybe String
    , accessibleJobType : Maybe String
    , abilities : Maybe String

    --, codeRncp : String
    }


type alias CertificationSummary =
    { id : Data.Scalar.Id
    , label : String
    }
