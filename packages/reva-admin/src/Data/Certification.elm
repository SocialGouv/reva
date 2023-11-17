module Data.Certification exposing (Certification, CertificationSummary, CertificationSummaryPage, idToString)

import Admin.Scalar exposing (Id(..))
import Data.Pagination exposing (PaginationInfo)
import Data.Scalar


type alias CertificationSummaryPage =
    { rows : List CertificationSummary
    , info : PaginationInfo
    }


type alias Certification =
    { id : Data.Scalar.Id
    , label : String
    , summary : String
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


idToString : Id -> String
idToString (Id id) =
    id
