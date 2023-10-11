module Data.Form.Account exposing (Account, account, accountFromDict, keys)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Admin.Object.Account exposing (email, lastname)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Dict exposing (Dict)


type alias Account =
    { id : String
    , email : String
    , firstname : String
    , lastname : String
    }


keys =
    { email = "email"
    , firstname = "firstname"
    , lastname = "lastname"
    }


accountFromDict : String -> FormData -> Account
accountFromDict accountId formData =
    let
        decode =
            Helper.decode keys formData
    in
    Account accountId
        (decode.string .email "")
        (decode.string .firstname "")
        (decode.string .lastname "")


account : String -> Maybe String -> Maybe String -> Dict String String
account email firstname lastname =
    [ ( .email, Just email )
    , ( .firstname, firstname )
    , ( .lastname, lastname )
    ]
        |> Helper.toDict keys
