module Data.Form.OrganismSubscription exposing (Decision(..), Subscription(..), decisionToString, fromDict, keys)

import Admin.Scalar exposing (Uuid)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper exposing (booleanToString, uuidToCheckedList)
import Data.Referential exposing (BasicSkill, MandatoryTraining)
import Dict exposing (Dict)


type Subscription
    = Rejected String
    | Approved


type Decision
    = Valid
    | Invalid


decisionToString reason =
    case reason of
        Valid ->
            "Dossier valide"

        Invalid ->
            "Dossier incomplet ou en erreur"


decisionFromString reason =
    case reason of
        "Dossier valide" ->
            Valid

        "Dossier incomplet ou en erreur" ->
            Invalid

        _ ->
            Invalid


keys =
    { decision = "decision"
    , comment = "comment"
    }


fromDict : FormData -> Subscription
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    if decisionFromString (decode.string .decision "") == Valid then
        Approved

    else
        Rejected (decode.string .comment "")
