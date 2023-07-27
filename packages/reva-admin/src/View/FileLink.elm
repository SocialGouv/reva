module View.FileLink exposing (viewFileLink)

import Html exposing (Html, a, div, text)
import Html.Attributes exposing (class, href, name, target, title)


viewFileLink : String -> String -> Html msg
viewFileLink name url =
    if name /= "" then
        div [ class "bg-gray-50 p-8 border-2 border-solid border-black rounded-md border-dsfrBlue-300 " ]
            [ a
                [ href url, target "_blank", class "fr-link text-2xl font-bold", title (name ++ " - nouvelle fenêtre") ]
                [ text ("Fichier: " ++ name) ]
            ]

    else
        text ""
