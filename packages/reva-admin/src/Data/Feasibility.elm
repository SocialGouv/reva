module Data.Feasibility exposing (Candidate, Decision(..), Feasibility)

import Data.CertificationAuthority exposing (CertificationAuthority)
import Data.File exposing (File)
import Data.Organism exposing (Organism)
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
    , certificationAuthority : Maybe CertificationAuthority
    , file : File
    , iDFile : Maybe File
    , documentaryProofFile : Maybe File
    , certificateOfAttendanceFile : Maybe File
    , candidate : Maybe Candidate
    , organism : Maybe Organism
    , certificationLabel : Maybe String
    , decision : Decision
    , decisionSentAt : Maybe Data.Scalar.Timestamp
    }
