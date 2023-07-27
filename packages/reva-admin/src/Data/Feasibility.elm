module Data.Feasibility exposing (Feasibility, File)

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
