module Data.Form.DropOut exposing (appointment, dropOutFromDict, keys)

import Admin.Scalar exposing (Uuid)
import Data.Form.Helper as Helper exposing (uuidToCheckedList)
import Data.Referential
import Data.Scalar
import Dict exposing (Dict)
import Time


type alias DropOut =
    { dropOutReason : String
    , otherReasonContent : String
    , droppedOutAt : Data.Scalar.Timestamp
    }


keys =
    { dropOutReason = "dropOutReason"
    , droppedOutAt = "droppedOutAt"
    , otherReasonContent = "otherReasonContent"
    }


dropOutFromDict : List Data.Referential.DropOutReason -> Dict String String -> DropOut
dropOutFromDict dropOutReasons dict =
    let
        decode =
            Helper.decode keys dict
    in
    DropOut
        (decode.string .dropOutReason "")
        (decode.string .otherReasonContent "")
        (decode.date .droppedOutAt (Time.millisToPosix 0))


appointment : List Uuid -> Maybe String -> Maybe Data.Scalar.Timestamp -> Dict String String
appointment dropOutReasons otherReasonContent droppedOutAt =
    let
        dropOutReasonsIds =
            uuidToCheckedList dropOutReasons

        dropOutOtherFields =
            [ ( .otherReasonContent, otherReasonContent )
            , ( .droppedOutAt, Maybe.map Helper.dateToString droppedOutAt )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList (dropOutReasonsIds ++ dropOutOtherFields)
