module View.Markdown exposing (toHtml)

import Html.Attributes
import Html.Styled exposing (Html)
import Markdown


toHtml : String -> Html msg
toHtml content =
    Markdown.toHtml [ Html.Attributes.class "prose lg:prose-lg" ] content
        |> Html.Styled.fromUnstyled
