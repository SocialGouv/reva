module Data.Form.DropOut exposing (dropOut, fromDict, keys)

import Admin.Scalar exposing (Id(..), Uuid)
import Admin.ScalarCodecs exposing (Id)
import Data.Form.Helper as Helper exposing (uuidToCheckedList)
import Data.Referential
import Data.Scalar
import Dict exposing (Dict)
import Time


type alias DropOut =
    { dropOutReasonId : String
    , otherReasonContent : String
    , droppedOutAt : Data.Scalar.Timestamp
    }


keys =
    { dropOutReason = "dropOutReason"
    , droppedOutAt = "droppedOutAt"
    , otherReasonContent = "otherReasonContent"
    }


fromDict : Dict String String -> DropOut
fromDict dict =
    let
        decode =
            Helper.decode keys dict
    in
    DropOut
        (decode.string .dropOutReason "")
        (decode.string .otherReasonContent "")
        (decode.date .droppedOutAt (Time.millisToPosix 0))


dropOut : Id -> Maybe String -> Data.Scalar.Timestamp -> Dict String String
dropOut (Id dropOutReasonId) otherReasonContent droppedOutAt =
    [ ( .dropOutReason, Just dropOutReasonId )
    , ( .otherReasonContent, otherReasonContent )
    , ( .droppedOutAt, Just <| Helper.dateToString droppedOutAt )
    ]
        |> Helper.toDict keys
