module Data.Scalar exposing (Date, Id, Void, codecs)

import Admin.Scalar exposing (defaultCodecs)
import Json.Decode as Decode
import Json.Encode as Encode
import Time


type alias Date =
    Time.Posix


type alias Id =
    Admin.Scalar.Id


type alias Void =
    Admin.Scalar.Void


codecs : Admin.Scalar.Codecs Date Id Void
codecs =
    Admin.Scalar.defineCodecs
        { codecDate =
            { encoder = Time.posixToMillis >> String.fromInt >> Encode.string
            , decoder = Decode.int |> Decode.map Time.millisToPosix
            }
        , codecId = defaultCodecs.codecId
        , codecVoid = defaultCodecs.codecVoid
        }
