module View.Markdown exposing (toHtml)

import Html.Styled exposing (Html, div, text)
import Html.Styled.Attributes exposing (class)
import Markdown.Parser
import Markdown.Renderer


toHtml : String -> Html msg
toHtml markdown =
    let
        deadEndsToString deadEnds =
            deadEnds
                |> List.map Markdown.Parser.deadEndToString
                |> String.join "\n"

        result =
            markdown
                |> Markdown.Parser.parse
                |> Result.mapError deadEndsToString
                |> Result.andThen (\ast -> Markdown.Renderer.render Markdown.Renderer.defaultHtmlRenderer ast)
                |> Result.map (List.map Html.Styled.fromUnstyled)
    in
    case result of
        Ok content ->
            div [ class "prose lg:prose-lg" ]
                content

        Err err ->
            div [ class "bg-red-400 text-white p-2" ]
                [ text err ]
