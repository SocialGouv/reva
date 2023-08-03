module Data.Feasibility exposing (Candidate, Feasibility, FeasibilityCountByCategory, FeasibilitySummary, FeasibilitySummaryPage, Status(..), feasibilityCategoryFilterToReadableString)

import Admin.Enum.FeasibilityCategoryFilter exposing (FeasibilityCategoryFilter)
import Data.File exposing (File)
import Data.Organism exposing (Organism)
import Data.Pagination exposing (PaginationInfo)
import Data.Scalar


type alias Candidate =
    { firstname : String
    , lastname : String
    }


type Status
    = Admissible String
    | Rejected String
    | Pending


type alias Feasibility =
    { id : String
    , file : File
    , otherFile : Maybe File
    , candidate : Maybe Candidate
    , organism : Maybe Organism
    , certificationLabel : Maybe String
    , status : Status
    }


type alias FeasibilitySummary =
    { id : Data.Scalar.Id
    , feasibilityFileSentAt : Data.Scalar.Timestamp
    , certificationLabel : Maybe String
    , candidateFirstname : Maybe String
    , candidateLastname : Maybe String
    , departmentLabel : Maybe String
    , departmentCode : Maybe String
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
