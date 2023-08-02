module Data.Feasibility exposing (Feasibility, FeasibilityCountByCategory, FeasibilitySummary, FeasibilitySummaryPage, File, feasibilityCategoryFilterToReadableString)

import Admin.Enum.FeasibilityCategoryFilter exposing (FeasibilityCategoryFilter)
import Data.Pagination exposing (PaginationInfo)
import Data.Scalar


type alias File =
    { name : String
    , url : String
    }


type alias Feasibility =
    { id : Data.Scalar.Id
    , feasibilityFileSentAt : Data.Scalar.Timestamp
    , feasibilityFile : File
    , otherFile : Maybe File
    }


type alias FeasibilitySummary =
    { id : Data.Scalar.Id
    , feasibilityFileSentAt : Data.Scalar.Timestamp
    }


type alias FeasibilitySummaryPage =
    { rows : List FeasibilitySummary
    , info : PaginationInfo
    }


type alias FeasibilityCountByCategory =
    { all : Int
    }


feasibilityCategoryFilterToReadableString : FeasibilityCategoryFilter -> String
feasibilityCategoryFilterToReadableString categoryFilter =
    case categoryFilter of
        _ ->
            "Tous les dossiers"
