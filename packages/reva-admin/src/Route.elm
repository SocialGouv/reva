module Route exposing
    ( CandidacyFilters
    , Route(..)
    , emptyCandidacyFilters
    , fromUrl
    , href
    , toString
    )

import Admin.Enum.CandidacyStatusFilter as CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Data.Candidacy exposing (CandidacyId, candidacyIdFromString, candidacyIdToString)
import Html exposing (Html)
import Html.Attributes
import Url
import Url.Builder
import Url.Parser as Parser exposing ((</>), (<?>), Parser, map, oneOf, s, string, top)
import Url.Parser.Query as Query
import View.Candidacy.Tab as Tab


type alias CandidacyFilters =
    { status : CandidacyStatusFilter, page : Int }


type Route
    = Candidacy Tab.Tab
    | Candidacies CandidacyFilters
    | Login
    | Logout
    | NotFound
    | Subscription String -- Subscription Id
    | Subscriptions
    | SiteMap


emptyCandidacyFilters : CandidacyFilters
emptyCandidacyFilters =
    { status = CandidacyStatusFilter.ActiveHorsAbandon, page = 1 }


parser : String -> Parser (Route -> a) a
parser baseUrl =
    let
        candidacyTab value p =
            map (\rawId -> Candidacy { value = value, candidacyId = candidacyIdFromString rawId }) p

        topLevel p =
            s "candidacies" </> p

        subLevel path =
            topLevel (string </> s path)

        statusStringToStatusFilter s =
            Maybe.withDefault CandidacyStatusFilter.ActiveHorsAbandon (CandidacyStatusFilter.fromString (Maybe.withDefault "" s))

        toCandidaciesRoute s p =
            Candidacies (CandidacyFilters (statusStringToStatusFilter s) (Maybe.withDefault 1 (String.toInt (Maybe.withDefault "1" p))))
    in
    s baseUrl
        </> oneOf
                [ top |> map (Candidacies emptyCandidacyFilters)
                , s "auth" </> s "login" |> map Login
                , s "auth" </> s "logout" |> map Logout
                , s "plan-du-site" |> map SiteMap
                , s "candidacies" <?> Query.string "status" <?> Query.string "page" |> map toCandidaciesRoute
                , s "subscriptions" |> map Subscriptions
                , s "subscriptions" </> string |> map Subscription
                , topLevel string |> candidacyTab Tab.Profile
                , subLevel "admissibility" |> candidacyTab Tab.Admissibility
                , subLevel "archive" |> candidacyTab Tab.Archive
                , subLevel "unarchive" |> candidacyTab Tab.Unarchive
                , subLevel "candidate" |> candidacyTab Tab.CandidateInfo
                , subLevel "drop-out" |> candidacyTab Tab.DropOut
                , subLevel "funding" |> candidacyTab Tab.FundingRequest
                , subLevel "meetings" |> candidacyTab Tab.Meetings
                , subLevel "payment" |> candidacyTab Tab.PaymentRequest
                , subLevel "payment" </> s "confirmation" |> candidacyTab Tab.PaymentRequestConfirmation
                , subLevel "payment" </> s "uploads" |> candidacyTab Tab.PaymentUploads
                , subLevel "training" |> candidacyTab Tab.Training
                , subLevel "training" </> s "confirmation" |> candidacyTab Tab.TrainingSent
                , subLevel "examInfo" |> candidacyTab Tab.ExamInfo
                ]


fromUrl : String -> Url.Url -> Route
fromUrl baseUrl url =
    Parser.parse (parser baseUrl) url
        |> Maybe.withDefault NotFound


href : String -> Route -> Html.Attribute msg
href baseUrl route =
    Html.Attributes.href <| toString baseUrl route


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

        SiteMap ->
            topLevel [ "plan-du-site" ] []

        Candidacies filters ->
            topLevel [ "candidacies" ]
                [ Url.Builder.string "status" (CandidacyStatusFilter.toString filters.status), Url.Builder.int "page" filters.page ]

        Candidacy tab ->
            tabToString topLevel subLevel tab

        Subscriptions ->
            topLevel [ "subscriptions" ] []

        Subscription subscriptionId ->
            topLevel [ "subscriptions", subscriptionId ] []


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

        Tab.Archive ->
            default [ "archive" ]

        Tab.Unarchive ->
            default [ "unarchive" ]

        Tab.DropOut ->
            default [ "drop-out" ]

        Tab.Meetings ->
            default [ "meetings" ]

        Tab.PaymentRequest ->
            default [ "payment" ]

        Tab.PaymentRequestConfirmation ->
            default [ "payment", "confirmation" ]

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

        Tab.ExamInfo ->
            default [ "examInfo" ]
