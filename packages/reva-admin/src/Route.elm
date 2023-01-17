module Route exposing
    ( Filters
    , Route(..)
    , emptyFilters
    , fromUrl
    , href
    , toString
    )

import Data.Candidacy exposing (candidacyIdFromString, candidacyIdToString)
import Html.Styled exposing (Html)
import Html.Styled.Attributes
import Url
import Url.Builder
import Url.Parser as Parser exposing ((</>), (<?>), Parser, map, oneOf, s, string, top)
import Url.Parser.Query as Query
import View.Candidacy.Tab as Tab


type alias Filters =
    { status : Maybe String }


type Route
    = Candidacy Tab.Tab
    | Candidacies Filters
    | Login
    | Logout
    | NotFound


emptyFilters : Filters
emptyFilters =
    { status = Nothing }


parser : String -> Parser (Route -> a) a
parser baseUrl =
    let
        candidacyTab tab p =
            map (\rawId -> Candidacy <| tab <| candidacyIdFromString rawId) p

        topLevel p =
            s "candidacies" </> p

        subLevel path =
            topLevel (string </> s path)
    in
    s baseUrl
        </> oneOf
                [ top |> map (Candidacies emptyFilters)
                , s "auth" </> s "login" |> map Login
                , s "auth" </> s "logout" |> map Logout
                , s "candidacies"
                    <?> Query.string "status"
                    |> map (Filters >> Candidacies)
                , topLevel string
                    |> candidacyTab Tab.Profil
                , subLevel "admissibility"
                    |> candidacyTab Tab.Admissibility
                , subLevel "candidate"
                    |> candidacyTab Tab.CandidateInfo
                , subLevel "drop-out"
                    |> candidacyTab Tab.DropOut
                , subLevel "funding"
                    |> candidacyTab Tab.FundingRequest
                , subLevel "meetings"
                    |> candidacyTab Tab.Meetings
                , subLevel "payment"
                    |> candidacyTab Tab.PaymentRequest
                , subLevel "training"
                    |> candidacyTab Tab.Training
                , subLevel "training"
                    </> s "confirmation"
                    |> candidacyTab Tab.TrainingSent
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
    let
        topLevel path params =
            Url.Builder.absolute (baseUrl :: path) params

        subLevel candidacyId path params =
            topLevel ([ "candidacies", candidacyIdToString candidacyId ] ++ path) params
    in
    case route of
        Login ->
            topLevel [ "auth", "login" ] []

        Logout ->
            topLevel [ "auth", "logout" ] []

        NotFound ->
            topLevel [ "not-found" ] []

        Candidacies filters ->
            topLevel [ "candidacies" ]
                (filters.status
                    |> Maybe.map (\status -> [ Url.Builder.string "status" status ])
                    |> Maybe.withDefault []
                )

        Candidacy (Tab.Profil id) ->
            topLevel [ "candidacies", candidacyIdToString id ] []

        Candidacy (Tab.CandidateInfo id) ->
            subLevel id [ "candidate" ] []

        Candidacy (Tab.DropOut id) ->
            subLevel id [ "drop-out" ] []

        Candidacy (Tab.Meetings id) ->
            subLevel id [ "meetings" ] []

        Candidacy (Tab.PaymentRequest id) ->
            subLevel id [ "payment" ] []

        Candidacy (Tab.FundingRequest id) ->
            subLevel id [ "funding" ] []

        Candidacy (Tab.Training id) ->
            subLevel id [ "training" ] []

        Candidacy (Tab.TrainingSent id) ->
            subLevel id [ "training", "confirmation" ] []

        Candidacy (Tab.Admissibility id) ->
            subLevel id [ "admissibility" ] []
