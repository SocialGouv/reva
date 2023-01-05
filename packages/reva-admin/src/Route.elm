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
import View.Candidacy.Tab


type Route
    = Candidacy View.Candidacy.Tab.Tab
    | Home
    | Login
    | Logout
    | NotFound


parser : String -> Parser (Route -> a) a
parser baseUrl =
    let
        candidacyTab : String -> (Data.Candidacy.CandidacyId -> View.Candidacy.Tab.Tab) -> Route
        candidacyTab rawId tab =
            Candidacy <| tab <| candidacyIdFromString rawId
    in
    s baseUrl
        </> oneOf
                [ map Home top
                , map Login (s "auth" </> s "login")
                , map Logout (s "auth" </> s "logout")
                , map
                    (Candidacy View.Candidacy.Tab.Empty)
                    (s "candidacies")
                , map
                    (\id -> candidacyTab id View.Candidacy.Tab.Profil)
                    (s "candidacies" </> string)
                , map
                    (\id -> candidacyTab id View.Candidacy.Tab.CandidateInfo)
                    (s "candidacies" </> string </> s "candidate")
                , map
                    (\id -> candidacyTab id View.Candidacy.Tab.DropOut)
                    (s "candidacies" </> string </> s "drop-out")
                , map
                    (\id -> candidacyTab id View.Candidacy.Tab.FundingRequest)
                    (s "candidacies" </> string </> s "funding")
                , map
                    (\id -> candidacyTab id View.Candidacy.Tab.Meetings)
                    (s "candidacies" </> string </> s "meetings")
                , map
                    (\id -> candidacyTab id View.Candidacy.Tab.Training)
                    (s "candidacies" </> string </> s "training")
                , map
                    (\id -> candidacyTab id View.Candidacy.Tab.TrainingSent)
                    (s "candidacies" </> string </> s "training" </> s "confirmation")
                , map
                    (\id -> candidacyTab id View.Candidacy.Tab.Admissibility)
                    (s "candidacies" </> string </> s "admissibility")

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
        Candidacy View.Candidacy.Tab.Empty ->
            Url.Builder.absolute [ baseUrl, "candidacies" ] []

        Candidacy (View.Candidacy.Tab.CandidateInfo candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "candidate" ] []

        Candidacy (View.Candidacy.Tab.DropOut candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "drop-out" ] []

        Candidacy (View.Candidacy.Tab.Profil candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId ] []

        Candidacy (View.Candidacy.Tab.Meetings candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "meetings" ] []

        Candidacy (View.Candidacy.Tab.FundingRequest candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "funding" ] []

        Candidacy (View.Candidacy.Tab.Training candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "training" ] []

        Candidacy (View.Candidacy.Tab.TrainingSent candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "training", "confirmation" ] []

        Candidacy (View.Candidacy.Tab.Admissibility candidacyId) ->
            Url.Builder.absolute [ baseUrl, "candidacies", candidacyIdToString candidacyId, "admissibility" ] []

        Home ->
            Url.Builder.absolute [ baseUrl, "" ] []

        Login ->
            Url.Builder.absolute [ baseUrl, "auth", "login" ] []

        Logout ->
            Url.Builder.absolute [ baseUrl, "auth", "logout" ] []

        NotFound ->
            Url.Builder.absolute [ baseUrl, "not-found" ] []
