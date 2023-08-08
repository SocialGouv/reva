module Data.Form.Feasibility exposing (Decision(..), decisionFromString, decisionToString, fromDict, keys, validate)

import Data.Feasibility exposing (Feasibility)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper


keys =
    { feasibilityFile = "feasibilityFile"
    , documentaryProofFile = "documentaryProofFile"
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


fromDict : FormData -> Data.Feasibility.Decision
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    case decisionFromString (decode.string .decision "") of
        Valid ->
            Data.Feasibility.Admissible (decode.string .reason "")

        Invalid ->
            Data.Feasibility.Rejected (decode.string .reason "")

        Unknown ->
            Data.Feasibility.Pending


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
