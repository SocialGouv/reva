module Data.Form.Archive exposing (archive, fromDict, keys, validate)

import Admin.Enum.CandidacyStatusStep as Step
import Admin.Scalar exposing (Id(..), Uuid)
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import Data.Scalar
import Dict exposing (Dict)
import Time


type alias Archive =
    { isNotReoriented : Bool
    , reorientationReasonId : String
    }


keys =
    { isNotReoriented = "isNotReoriented"
    , reorientationReason = "reorientationReason"
    }


validate : ( Candidacy, Referential ) -> FormData -> Result String ()
validate ( _, _ ) formData =
    let
        decode =
            Helper.decode keys formData
    in
    case ( decode.bool .isNotReoriented False, decode.maybe.string .reorientationReason ) of
        ( False, Nothing ) ->
            Err "Veuillez sélectionner une raison avant d'archiver cette candidature"

        _ ->
            Ok ()


fromDict : FormData -> Archive
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    Archive
        (decode.bool .isNotReoriented False)
        (decode.string .reorientationReason "")


archive : Maybe Id -> List Data.Candidacy.CandidacyStatus -> Dict String String
archive maybeReorientationReasonId statuses =
    let
        lastStatus =
            Data.Candidacy.lastStatus statuses |> .status
    in
    [ ( .isNotReoriented, Just <| Helper.booleanToString (lastStatus == Step.Archive && maybeReorientationReasonId == Nothing) )
    , ( .reorientationReason, maybeReorientationReasonId |> Maybe.map (\(Id id) -> id) )
    ]
        |> Helper.toDict keys
