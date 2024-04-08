module Data.Form.Feasibility exposing (Decision(..), decisionFromString, decisionToString, fromDict, hasOptionalFiles, keys, validate, validateSubmittedFiles)

import Data.Candidacy exposing (Candidacy)
import Data.Feasibility exposing (Feasibility)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import File exposing (File)


keys =
    { feasibilityFile = "feasibilityFile"
    , idFile = "IDFile"
    , documentaryProofFile = "documentaryProofFile"
    , certificateOfAttendanceFile = "certificateOfAttendanceFile"
    , certificationAuthorityId = "certificationAuthorityId"
    , decision = "decision"
    , reason = "reason"
    , infoFile = "infoFile"
    , feasibilityFileChecked = "feasibilityFileChecked"
    , iDFileChecked = "iDFileChecked"
    , optionalFileChecked = "optionalFileChecked"
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


hasOptionalFiles : FormData -> Bool
hasOptionalFiles formData =
    case
        ( Data.Form.getFiles keys.documentaryProofFile formData
        , Data.Form.getFiles keys.certificateOfAttendanceFile formData
        )
    of
        ( [], [] ) ->
            False

        _ ->
            True


validateSubmittedFiles : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validateSubmittedFiles _ formData =
    let
        decode =
            Helper.decode keys formData

        error =
            Err [ "Veuillez vérifier les pièces jointes et cocher toutes les cases" ]
    in
    if hasOptionalFiles formData then
        case
            ( decode.bool .feasibilityFileChecked False
            , decode.bool .iDFileChecked False
            , decode.bool .optionalFileChecked False
            )
        of
            ( True, True, True ) ->
                Ok ()

            _ ->
                error

    else if decode.bool .feasibilityFileChecked False && decode.bool .iDFileChecked False then
        Ok ()

    else
        error


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
