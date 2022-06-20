module Route exposing
    ( Route(..)
    , fromUrl
    , href
    , toString
    )

import Html.Styled exposing (Html)
import Html.Styled.Attributes
import Url
import Url.Builder
import Url.Parser as Parser exposing ((</>), Parser, map, oneOf, s, string, top)


type Route
    = Candidacy String
    | Home
    | Login
    | Meetings String
    | NotFound


parser : String -> Parser (Route -> a) a
parser baseUrl =
    s baseUrl
        </> oneOf
                [ map Home top
                , map Login (s "auth" </> s "login")
                , map Candidacy (s "candidacy" </> string)
                , map Meetings (s "candidacy" </> string </> s "meetings")

                --  Add more routes like this:
                --  , map Comment (s "user" </> string </> s "comment" </> int)
                --  , map BlogQuery (s "blog" <?> Query.string "q")
                --  Learn more: https://guide.elm-lang.org/webapps/url_parsing.html
                ]


fromUrl : String -> Url.Url -> Route
fromUrl baseUrl url =
    Parser.parse (parser baseUrl) url
        |> Maybe.withDefault NotFound


href : String -> Route -> Html.Styled.Attribute msg
href baseUrl route =
    Html.Styled.Attributes.href <| toString baseUrl route


toString : String -> Route -> String
toString baseUrl route =
    case route of
        Candidacy candiacyId ->
            Url.Builder.absolute [ baseUrl, "candidacy", candiacyId ] []

        Home ->
            Url.Builder.absolute [ baseUrl ] []

        Login ->
            Url.Builder.absolute [ baseUrl, "auth", "login" ] []

        Meetings candiacyId ->
            Url.Builder.absolute [ baseUrl, "candidacy", candiacyId, "meetings" ] []

        NotFound ->
            Url.Builder.absolute [ baseUrl, "not-found" ] []
