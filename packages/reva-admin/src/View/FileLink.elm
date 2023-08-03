module View.FileLink exposing (viewFileLink)

import Api.Token
import Data.Context exposing (Context)
import Html exposing (Html, div, node, text)
import Html.Attributes exposing (class, name, property)
import Json.Encode as Encode


viewFileLink : Context -> String -> String -> Html msg
viewFileLink context name url =
    if name /= "" then
        div [ class "bg-gray-50 p-8 border-2 border-solid border-black rounded-md border-dsfrBlue-300 " ]
            [ node "authenticated-link"
                [ property "params" <|
                    Encode.object
                        [ ( "text", Encode.string ("Fichier: " ++ name) )
                        , ( "title", Encode.string ("Fichier: " ++ name ++ " - nouvelle fenêtre") )
                        , ( "url", Encode.string url )
                        , ( "token", Encode.string (Api.Token.toString context.token) )
                        , ( "class", Encode.string "fr-link text-2xl font-bold" )
                        ]
                ]
                []
            ]

    else
        text ""
