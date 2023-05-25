module Data.Form.DropOut exposing (dropOut, fromDict, keys, validate)

import Admin.Scalar exposing (Id(..), Uuid)
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
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


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( _, _ ) formData =
    let
        decode =
            Helper.decode keys formData
    in
    case decode.maybe.string .dropOutReason of
        Nothing ->
            Err [ "Veuillez sélectionner une raison d'abandon" ]

        _ ->
            Ok ()


fromDict : FormData -> DropOut
fromDict formData =
    let
        decode =
            Helper.decode keys formData
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
