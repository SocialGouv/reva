module Data.Context exposing (Context)

import Api.Token exposing (Token)
import Browser.Navigation


type alias Context =
    { baseUrl : String
    , endpoint : String
    , navKey : Browser.Navigation.Key
    , token : Token
    , uploadEndpoint : String
    , isScrollingToTop : Bool
    }
