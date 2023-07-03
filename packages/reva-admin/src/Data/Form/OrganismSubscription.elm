module Data.Form.OrganismSubscription exposing (Decision(..), Status(..), decisionToString, fromDict, keys, validate)

import Data.Form exposing (FormData)
import Data.Form.Helper as Helper


type Status
    = Approved
    | Rejected String
    | Pending


type Decision
    = Valid
    | Invalid
    | Unknown


decisionToString reason =
    case reason of
        Valid ->
            "Dossier valide"

        Invalid ->
            "Dossier incomplet ou en erreur"

        Unknown ->
            "Inscription en attente de validation"


decisionFromString reason =
    case reason of
        "Dossier valide" ->
            Valid

        "Dossier incomplet ou en erreur" ->
            Invalid

        _ ->
            Unknown


keys =
    { decision = "decision"
    , comment = "comment"
    }


fromDict : FormData -> Status
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    case decisionFromString (decode.string .decision "") of
        Valid ->
            Approved

        Invalid ->
            Rejected (decode.string .comment "")

        Unknown ->
            Pending


validate : () -> FormData -> Result (List String) ()
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
