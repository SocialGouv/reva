module Data.Scalar exposing (Id, Timestamp, Uuid, Void, codecs)

import Admin.Scalar exposing (defaultCodecs)
import Json.Decode as Decode
import Json.Encode as Encode
import Time


type alias Timestamp =
    Time.Posix


type alias Id =
    Admin.Scalar.Id


type alias Uuid =
    Admin.Scalar.Uuid


type alias Void =
    Admin.Scalar.Void


codecs : Admin.Scalar.Codecs Id Timestamp Uuid Void
codecs =
    Admin.Scalar.defineCodecs
        { codecTimestamp =
            { encoder = Time.posixToMillis >> Encode.int
            , decoder = Decode.int |> Decode.map Time.millisToPosix
            }
        , codecId = defaultCodecs.codecId
        , codecUuid = defaultCodecs.codecUuid
        , codecVoid = defaultCodecs.codecVoid
        }
