module Data.Context exposing (Context)

import Api exposing (Token)
import Browser.Navigation


type alias Context =
    { baseUrl : String
    , endpoint : String
    , navKey : Browser.Navigation.Key
    , token : Token
    }
