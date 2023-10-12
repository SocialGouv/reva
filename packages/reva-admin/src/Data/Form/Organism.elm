module Data.Form.Organism exposing (Organism, OrganismStatus(..), keys, organism, organismFromDict, organismStatusToString)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Admin.Enum.Duration exposing (Duration(..))
import Admin.Object.BasicSkill exposing (label)
import Data.Candidacy exposing (isActive)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Dict exposing (Dict)


type alias Organism =
    { id : String
    , label : String
    , contactAdministrativeEmail : String
    , contactAdministrativePhone : String
    , website : String
    , isActive : Bool
    }


type OrganismStatus
    = Enabled
    | Disabled


organismStatusToString status =
    case status of
        Enabled ->
            "Activé"

        Disabled ->
            "Désactivé"


organismStatusFromString status =
    case status of
        "Activé" ->
            Enabled

        "Désactivé" ->
            Disabled

        _ ->
            Disabled


keys =
    { label = "label"
    , contactAdministrativeEmail = "contactAdministrativeEmail"
    , contactAdministrativePhone = "contactAdministrativePhone"
    , website = "website"
    , isActive = "isActive"
    }


organismFromDict : String -> FormData -> Organism
organismFromDict organismId formData =
    let
        decode =
            Helper.decode keys formData

        isActive =
            case organismStatusFromString (decode.string .isActive "") of
                Enabled ->
                    True

                Disabled ->
                    False
    in
    Organism organismId
        (decode.string .label "")
        (decode.string .contactAdministrativeEmail "")
        (decode.string .contactAdministrativePhone "")
        (decode.string .website "")
        isActive


organism : String -> String -> Maybe String -> Maybe String -> Bool -> Dict String String
organism label contactAdministrativeEmail contactAdministrativePhone website isActive =
    [ ( .label, Just label )
    , ( .contactAdministrativeEmail, Just contactAdministrativeEmail )
    , ( .contactAdministrativePhone, contactAdministrativePhone )
    , ( .website, website )
    , ( .isActive
      , if isActive == True then
            Just "Activé"

        else
            Just "Désactivé"
      )
    ]
        |> Helper.toDict keys
