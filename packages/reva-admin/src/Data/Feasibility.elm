module Data.Feasibility exposing (Feasibility)

import Data.Scalar


type alias Feasibility =
    { id : Data.Scalar.Id
    , feasibilityFileSentAt : Data.Scalar.Timestamp
    }
