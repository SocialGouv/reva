module Route exposing
    ( Filters
    , Route(..)
    , emptyFilters
    , fromUrl
    , href
    , toString
    )

import Data.Candidacy exposing (CandidacyId, candidacyIdFromString, candidacyIdToString)
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
        candidacyTab value p =
            map (\rawId -> Candidacy { value = value, candidacyId = candidacyIdFromString rawId }) p

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
                , s "candidacies" <?> Query.string "status" |> map (Filters >> Candidacies)
                , topLevel string |> candidacyTab Tab.Profile
                , subLevel "admissibility" |> candidacyTab Tab.Admissibility
                , subLevel "candidate" |> candidacyTab Tab.CandidateInfo
                , subLevel "drop-out" |> candidacyTab Tab.DropOut
                , subLevel "funding" |> candidacyTab Tab.FundingRequest
                , subLevel "meetings" |> candidacyTab Tab.Meetings
                , subLevel "payment" |> candidacyTab Tab.PaymentRequest
                , subLevel "payment" </> s "uploads" |> candidacyTab Tab.PaymentUploads
                , subLevel "training" |> candidacyTab Tab.Training
                , subLevel "training" </> s "confirmation" |> candidacyTab Tab.TrainingSent
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

        Candidacy tab ->
            tabToString topLevel subLevel tab


tabToString :
    (List String -> List Url.Builder.QueryParameter -> String)
    -> (Data.Candidacy.CandidacyId -> List String -> List Url.Builder.QueryParameter -> String)
    -> Tab.Tab
    -> String
tabToString topLevel subLevel tab =
    let
        default path =
            subLevel tab.candidacyId path []
    in
    case tab.value of
        Tab.Profile ->
            topLevel [ "candidacies", candidacyIdToString tab.candidacyId ] []

        Tab.CandidateInfo ->
            default [ "candidate" ]

        Tab.DropOut ->
            default [ "drop-out" ]

        Tab.Meetings ->
            default [ "meetings" ]

        Tab.PaymentRequest ->
            default [ "payment" ]

        Tab.PaymentUploads ->
            default [ "payment", "uploads" ]

        Tab.FundingRequest ->
            default [ "funding" ]

        Tab.Training ->
            default [ "training" ]

        Tab.TrainingSent ->
            default [ "training", "confirmation" ]

        Tab.Admissibility ->
            default [ "admissibility" ]
