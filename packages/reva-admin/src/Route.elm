module Route exposing
    ( Route(..)
    , fromRoute
    , fromUrl
    )

import Url
import Url.Parser as Parser exposing ((</>), Parser, map, oneOf, s, top)


type Route
    = Home
    | Login
    | NotFound


parser : String -> Parser (Route -> a) a
parser baseUrl =
    s baseUrl
        </> oneOf
                [ map Home top
                , map Login (s "auth" </> s "login")

                --  Add more routes like this:
                --  , map Comment (s "user" </> string </> s "comment" </> int)
                --  , map BlogQuery (s "blog" <?> Query.string "q")
                --  Learn more: https://guide.elm-lang.org/webapps/url_parsing.html
                ]


fromUrl : String -> Url.Url -> Route
fromUrl baseUrl url =
    Parser.parse (parser baseUrl) url
        |> Maybe.withDefault NotFound


fromRoute : String -> Route -> String
fromRoute baseUrl route =
    case route of
        Home ->
            baseUrl ++ "/"

        Login ->
            baseUrl ++ "/auth/login"

        NotFound ->
            baseUrl ++ "/not-found"
