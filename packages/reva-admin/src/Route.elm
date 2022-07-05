module Route exposing
    ( Route(..)
    , fromUrl
    , href
    , toString
    )

import Data.Candidacy exposing (candidacyIdFromString, candidacyIdToString)
import Html.Styled exposing (Html)
import Html.Styled.Attributes
import Url
import Url.Builder
import Url.Parser as Parser exposing ((</>), Parser, map, oneOf, s, string, top)
import View.Candidacy


type Route
    = Candidacy View.Candidacy.Tab
    | Home
    | Login
    | NotFound


parser : String -> Parser (Route -> a) a
parser baseUrl =
    let
        candidacyTab : String -> (Data.Candidacy.CandidacyId -> View.Candidacy.Tab) -> Route
        candidacyTab rawId tab =
            Candidacy <| tab <| candidacyIdFromString rawId
    in
    s baseUrl
        </> oneOf
                [ map Home top
                , map Login (s "auth" </> s "login")
                , map
                    (Candidacy View.Candidacy.Empty)
                    (s "candidacies")
                , map
                    (\id -> candidacyTab id View.Candidacy.Profil)
                    (s "candidacies" </> string)
                , map
                    (\id -> candidacyTab id View.Candidacy.Meetings)
                    (s "candidacies" </> string </> s "meetings")

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
        Candidacy View.Candidacy.Empty ->
            Url.Builder.absolute [ baseUrl, "candidacies" ] []

        Candidacy (View.Candidacy.Profil candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId ] []

        Candidacy (View.Candidacy.Meetings candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "meetings" ] []

        Home ->
            Url.Builder.absolute [ baseUrl, "" ] []

        Login ->
            Url.Builder.absolute [ baseUrl, "auth", "login" ] []

        NotFound ->
            Url.Builder.absolute [ baseUrl, "not-found" ] []
