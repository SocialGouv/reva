module Api exposing (..)

import Http
import Json.Decode as Decode
import Json.Encode as Encode


login : (Result Http.Error String -> msg) -> { email : String, password : String } -> Cmd msg
login msg payload =
    Http.post
        { url = "/api/auth/login"
        , body = Http.jsonBody (Encode.object [ ( "email", Encode.string payload.email ), ( "password", Encode.string payload.password ) ])
        , expect = Http.expectJson msg (Decode.at [ "token" ] Decode.string)
        }
