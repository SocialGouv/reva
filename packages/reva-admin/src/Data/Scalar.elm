module Data.Scalar exposing (Id, Timestamp, Void, codecs)

import Admin.Scalar exposing (defaultCodecs)
import Json.Decode as Decode
import Json.Encode as Encode
import Time


type alias Timestamp =
    Time.Posix


type alias Id =
    Admin.Scalar.Id


type alias Void =
    Admin.Scalar.Void


codecs : Admin.Scalar.Codecs Id Timestamp Void
codecs =
    Admin.Scalar.defineCodecs
        { codecTimestamp =
            { encoder = Time.posixToMillis >> Encode.int
            , decoder = Decode.int |> Decode.map Time.millisToPosix
            }
        , codecId = defaultCodecs.codecId
        , codecVoid = defaultCodecs.codecVoid
        }
