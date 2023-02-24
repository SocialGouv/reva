module KeycloakConfiguration exposing (KeycloakConfiguration, iframeKeycloak, keycloakConfiguration)

import Api.Token exposing (Token)
import Html exposing (Html, node)
import Html.Attributes exposing (attribute, class, id, property)
import Html.Events exposing (on)
import Json.Decode as Decode exposing (Decoder, succeed)
import Json.Decode.Pipeline exposing (required)
import Json.Encode as Encode


type alias KeycloakConfiguration =
    { clientId : String
    , realm : String
    , url : String
    }


keycloakConfiguration : Decoder KeycloakConfiguration
keycloakConfiguration =
    succeed KeycloakConfiguration
        |> required "clientId" Decode.string
        |> required "realm" Decode.string
        |> required "url" Decode.string


getEncodedKeycloakConfiguration : Maybe KeycloakConfiguration -> Encode.Value
getEncodedKeycloakConfiguration maybeKeycloakConfiguration =
    case maybeKeycloakConfiguration of
        Nothing ->
            Encode.null

        Just value ->
            Encode.object
                [ ( "clientId", Encode.string value.clientId )
                , ( "realm", Encode.string value.realm )
                , ( "url", Encode.string value.url )
                ]


tokenDecoder : Decoder Token
tokenDecoder =
    Decode.map2 Api.Token.init
        (Decode.field "isAdmin" Decode.bool)
        (Decode.field "token" Decode.string)


iframeKeycloak : { onLoggedIn : Token -> msg, onLoggedOut : msg, onTokenRefreshed : Token -> msg } -> Maybe KeycloakConfiguration -> Bool -> Html msg
iframeKeycloak events maybeKeycloakConfiguration isLoggingOut =
    node "keycloak-element"
        [ class "block h-0 w-0"
        , id "keycloak-element"
        , property "configuration" <| getEncodedKeycloakConfiguration maybeKeycloakConfiguration
        , Decode.field "detail" tokenDecoder
            |> Decode.map events.onLoggedIn
            |> on "loggedIn"
        , Decode.field "detail" tokenDecoder
            |> Decode.map events.onTokenRefreshed
            |> on "tokenRefreshed"
        , on "loggedOut" <|
            Decode.succeed events.onLoggedOut
        , if isLoggingOut then
            attribute "logout" ""

          else
            class ""
        ]
        []
