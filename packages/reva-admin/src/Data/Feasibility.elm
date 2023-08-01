module Data.Feasibility exposing (Feasibility, FeasibilityCountByCategory, FeasibilitySummary, FeasibilitySummaryPage, File)

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
    }


type alias FeasibilitySummaryPage =
    { rows : List FeasibilitySummary
    , info : PaginationInfo
    }


type alias FeasibilityCountByCategory =
    { all : Int
    }
