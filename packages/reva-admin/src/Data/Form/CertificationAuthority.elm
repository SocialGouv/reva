module Data.Form.CertificationAuthority exposing (CertificationAuthority, certificationAuthority, certificationAuthorityFromDict, keys)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Admin.Object.CertificationAuthority exposing (contactEmail, label)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Dict exposing (Dict)


type alias CertificationAuthority =
    { id : String
    , label : String
    , contactFullName : String
    , contactEmail : String
    }


keys =
    { label = "label"
    , contactFullName = "contactFullName"
    , contactEmail = "contactEmail"
    }


certificationAuthorityFromDict : String -> FormData -> CertificationAuthority
certificationAuthorityFromDict certificationAuthorityId formData =
    let
        decode =
            Helper.decode keys formData
    in
    CertificationAuthority certificationAuthorityId
        (decode.string .label "")
        (decode.string .contactFullName "")
        (decode.string .contactEmail "")


certificationAuthority : String -> Maybe String -> Maybe String -> Dict String String
certificationAuthority label contactFullName contactEmail =
    [ ( .label, Just label )
    , ( .contactFullName, contactFullName )
    , ( .contactEmail, contactEmail )
    ]
        |> Helper.toDict keys
