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
    | Logout
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
                , map Logout (s "auth" </> s "logout")
                , map
                    (Candidacy View.Candidacy.Empty)
                    (s "candidacies")
                , map
                    (\id -> candidacyTab id View.Candidacy.Profil)
                    (s "candidacies" </> string)
                , map
                    (\id -> candidacyTab id View.Candidacy.CandidateInfo)
                    (s "candidacies" </> string </> s "candidate")
                , map
                    (\id -> candidacyTab id View.Candidacy.FundingRequest)
                    (s "candidacies" </> string </> s "funding")
                , map
                    (\id -> candidacyTab id View.Candidacy.Meetings)
                    (s "candidacies" </> string </> s "meetings")
                , map
                    (\id -> candidacyTab id View.Candidacy.Training)
                    (s "candidacies" </> string </> s "training")
                , map
                    (\id -> candidacyTab id View.Candidacy.TrainingSent)
                    (s "candidacies" </> string </> s "training" </> s "confirmation")

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

        Candidacy (View.Candidacy.CandidateInfo candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "candidate" ] []

        Candidacy (View.Candidacy.Profil candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId ] []

        Candidacy (View.Candidacy.Meetings candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "meetings" ] []

        Candidacy (View.Candidacy.FundingRequest candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "funding" ] []

        Candidacy (View.Candidacy.Training candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "training" ] []

        Candidacy (View.Candidacy.TrainingSent candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "training", "confirmation" ] []

        Home ->
            Url.Builder.absolute [ baseUrl, "" ] []

        Login ->
            Url.Builder.absolute [ baseUrl, "auth", "login" ] []

        Logout ->
            Url.Builder.absolute [ baseUrl, "auth", "logout" ] []

        NotFound ->
            Url.Builder.absolute [ baseUrl, "not-found" ] []
