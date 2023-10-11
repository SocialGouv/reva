module Data.Form.Organism exposing (Organism, keys, organism, organismFromDict)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Admin.Object.Organism exposing (contactAdministrativeEmail, contactAdministrativePhone, website)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Dict exposing (Dict)


type alias Organism =
    { id : String
    , contactAdministrativeEmail : String
    , contactAdministrativePhone : String
    , website : String
    }


keys =
    { contactAdministrativeEmail = "contactAdministrativeEmail"
    , contactAdministrativePhone = "contactAdministrativePhone"
    , website = "website"
    }


organismFromDict : String -> FormData -> Organism
organismFromDict organismId formData =
    let
        decode =
            Helper.decode keys formData
    in
    Organism organismId
        (decode.string .contactAdministrativeEmail "")
        (decode.string .contactAdministrativePhone "")
        (decode.string .website "")


organism : String -> Maybe String -> Maybe String -> Dict String String
organism contactAdministrativeEmail contactAdministrativePhone website =
    [ ( .contactAdministrativeEmail, Just contactAdministrativeEmail )
    , ( .contactAdministrativePhone, contactAdministrativePhone )
    , ( .website, website )
    ]
        |> Helper.toDict keys
