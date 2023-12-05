module Data.CandidacyConventionCollective exposing (CandidacyConventionCollective, CandidacyConventionCollectivePaginated, idToString)

import Admin.Scalar exposing (Id(..))
import Data.Pagination exposing (PaginationInfo)
import Data.Scalar


type alias CandidacyConventionCollective =
    { id : Data.Scalar.Id
    , idcc : String
    , label : String
    }


type alias CandidacyConventionCollectivePaginated =
    { rows : List CandidacyConventionCollective
    , info : PaginationInfo
    }


idToString : Id -> String
idToString (Id id) =
    id
