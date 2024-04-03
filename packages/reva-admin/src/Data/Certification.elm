module Data.Certification exposing (Certification, CertificationPage, CertificationSummary)

import Data.Pagination exposing (PaginationInfo)
import Data.Scalar


type alias CertificationPage =
    { rows : List Certification
    , info : PaginationInfo
    }


type alias Certification =
    { id : Data.Scalar.Id
    , codeRncp : String
    , label : String
    }


type alias CertificationSummary =
    { id : Data.Scalar.Id
    , label : String
    }
