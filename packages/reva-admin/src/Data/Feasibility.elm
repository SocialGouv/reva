module Data.Feasibility exposing (Candidate, Decision(..), Feasibility, FeasibilityCountByCategory, FeasibilitySummary, FeasibilitySummaryPage, feasibilityCategoryFilterToReadableString)

import Admin.Enum.FeasibilityCategoryFilter as FeasibilityCategoryFilter exposing (FeasibilityCategoryFilter)
import Data.CertificationAuthority exposing (CertificationAuthority)
import Data.File exposing (File)
import Data.Organism exposing (Organism)
import Data.Pagination exposing (PaginationInfo)
import Data.Scalar


type alias Candidate =
    { firstname : String
    , lastname : String
    }


type Decision
    = Admissible String
    | Rejected String
    | Incomplete String
    | Pending


type alias Feasibility =
    { id : String
    , file : File
    , documentaryProofFile : Maybe File
    , certificateOfAttendanceFile : Maybe File
    , candidate : Maybe Candidate
    , organism : Maybe Organism
    , certificationLabel : Maybe String
    , decision : Decision
    , decisionSentAt : Maybe Data.Scalar.Timestamp
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
    , pending : Int
    , admissible : Int
    , rejected : Int
    }


feasibilityCategoryFilterToReadableString : FeasibilityCategoryFilter -> String
feasibilityCategoryFilterToReadableString categoryFilter =
    case categoryFilter of
        FeasibilityCategoryFilter.Pending ->
            "Dossiers en attente de recevabilité"

        FeasibilityCategoryFilter.Admissible ->
            "Dossiers recevables"

        FeasibilityCategoryFilter.Rejected ->
            "Dossiers non recevables"

        _ ->
            "Tous les dossiers"
