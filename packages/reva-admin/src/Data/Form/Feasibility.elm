module Data.Form.Feasibility exposing (Decision(..), decisionFromString, decisionToString, fromDict, keys, validate)

import Data.Feasibility exposing (Feasibility)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import File exposing (File)


keys =
    { feasibilityFile = "feasibilityFile"
    , documentaryProofFile = "documentaryProofFile"
    , certificateOfAttendanceFile = "certificateOfAttendanceFile"
    , certificationAuthorityId = "certificationAuthorityId"
    , decision = "decision"
    , reason = "reason"
    , infoFile = "infoFile"
    }


type Decision
    = Valid
    | Invalid
    | Incomplete
    | Unknown


decisionToString reason =
    case reason of
        Valid ->
            "Dossier recevable"

        Invalid ->
            "Dossier non recevable"

        Incomplete ->
            "Dossier incomplet"

        Unknown ->
            "Dossier en attente de validation"


decisionFromString reason =
    case reason of
        "Dossier recevable" ->
            Valid

        "Dossier non recevable" ->
            Invalid

        "Dossier incomplet" ->
            Incomplete

        _ ->
            Unknown


fromDict : FormData -> ( Data.Feasibility.Decision, Maybe File )
fromDict formData =
    let
        decode =
            Helper.decode keys formData

        infoFile =
            Data.Form.getFiles keys.infoFile formData
                |> List.map (\( _, file ) -> file)
                |> List.head
    in
    case decisionFromString (decode.string .decision "") of
        Valid ->
            ( Data.Feasibility.Admissible (decode.string .reason ""), infoFile )

        Invalid ->
            ( Data.Feasibility.Rejected (decode.string .reason ""), infoFile )

        Incomplete ->
            ( Data.Feasibility.Incomplete (decode.string .reason ""), infoFile )

        Unknown ->
            ( Data.Feasibility.Pending, Nothing )


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
