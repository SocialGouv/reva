module Data.Jury exposing (Jury)

import Time exposing (Posix)


type alias Jury =
    { dateOfSession : Posix
    , timeOfSession : Maybe String
    , addressOfSession : Maybe String
    , informationOfSession : Maybe String
    }
