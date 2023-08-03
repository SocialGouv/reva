module Data.Form.Feasibility exposing (Decision(..), decisionFromString, decisionToString, fromDict, keys, validate)

import Data.Feasibility exposing (Feasibility, Status(..))
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper


keys =
    { feasibilityFile = "feasibilityFile"
    , otherFile = "otherFile"
    , decision = "decision"
    , reason = "reason"
    }


type Decision
    = Valid
    | Invalid
    | Unknown


decisionToString reason =
    case reason of
        Valid ->
            "Dossier recevable"

        Invalid ->
            "Dossier non recevable"

        Unknown ->
            "Dossier en attente de validation"


decisionFromString reason =
    case reason of
        "Dossier recevable" ->
            Valid

        "Dossier non recevable" ->
            Invalid

        _ ->
            Unknown


fromDict : FormData -> Status
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    case decisionFromString (decode.string .decision "") of
        Valid ->
            Admissible (decode.string .reason "")

        Invalid ->
            Rejected (decode.string .reason "")

        Unknown ->
            Pending


validate : Feasibility -> FormData -> Result (List String) ()
validate _ formData =
    let
        decode =
            Helper.decode keys formData
    in
    case decisionFromString (decode.string .decision "") of
        Unknown ->
            Err [ "Veuillez cocher la décision prise" ]

        _ ->
            Ok ()
