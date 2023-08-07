module Route exposing
    ( CandidacyFilters
    , FeasibilityFilters
    , Route(..)
    , SubscriptionFilters
    , emptyCandidacyFilters
    , emptyFeasibilityFilters
    , emptySubscriptionFilters
    , fromUrl
    , href
    , toString
    )

import Admin.Enum.CandidacyStatusFilter as CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Admin.Enum.FeasibilityCategoryFilter as FeasibilityCategoryFilter exposing (FeasibilityCategoryFilter)
import Admin.Enum.SubscriptionRequestStatus as SubscriptionRequestStatus exposing (SubscriptionRequestStatus(..))
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


type alias SubscriptionFilters =
    { status : SubscriptionRequestStatus, page : Int }


type alias FeasibilityFilters =
    { category : FeasibilityCategoryFilter
    , page : Int
    }


type Route
    = Candidacy Tab.Tab
    | Candidacies CandidacyFilters
    | Feasibility String -- Candidacy Id
    | Feasibilities FeasibilityFilters
    | Home
    | Login
    | Logout
    | NotFound
    | Subscription String -- Subscription Id
    | Subscriptions SubscriptionFilters
    | SiteMap


emptyCandidacyFilters : CandidacyFilters
emptyCandidacyFilters =
    { status = CandidacyStatusFilter.ActiveHorsAbandon, page = 1 }


emptySubscriptionFilters : SubscriptionFilters
emptySubscriptionFilters =
    { status = SubscriptionRequestStatus.Pending, page = 1 }


emptyFeasibilityFilters : FeasibilityFilters
emptyFeasibilityFilters =
    { category = FeasibilityCategoryFilter.All, page = 1 }


parser : String -> Parser (Route -> a) a
parser baseUrl =
    let
        candidacyTab value p =
            map (\rawId -> Candidacy { value = value, candidacyId = candidacyIdFromString rawId }) p

        topLevel topName p =
            s topName </> p

        subLevel topName path =
            topLevel topName (string </> s path)

        candidacyStatusStringToStatusFilter s =
            Maybe.withDefault CandidacyStatusFilter.ActiveHorsAbandon (CandidacyStatusFilter.fromString (Maybe.withDefault "" s))

        toCandidaciesRoute s p =
            Candidacies (CandidacyFilters (candidacyStatusStringToStatusFilter s) (Maybe.withDefault 1 (String.toInt (Maybe.withDefault "1" p))))

        subscriptionStatusStringToStatusFilter s =
            Maybe.withDefault SubscriptionRequestStatus.Pending (SubscriptionRequestStatus.fromString (Maybe.withDefault "" s))

        toSubscriptionsRoute s p =
            Subscriptions (SubscriptionFilters (subscriptionStatusStringToStatusFilter s) (Maybe.withDefault 1 (String.toInt (Maybe.withDefault "1" p))))

        feasibilityCategoryStringToCategoryFilter c =
            Maybe.withDefault FeasibilityCategoryFilter.All (FeasibilityCategoryFilter.fromString (Maybe.withDefault "" c))

        toFeasibilitiesRoute c p =
            Feasibilities (FeasibilityFilters (feasibilityCategoryStringToCategoryFilter c) (Maybe.withDefault 1 (String.toInt (Maybe.withDefault "1" p))))
    in
    s baseUrl
        </> oneOf
                [ top |> map Home
                , s "auth" </> s "login" |> map Login
                , s "auth" </> s "logout" |> map Logout
                , s "plan-du-site" |> map SiteMap
                , s "candidacies" <?> Query.string "status" <?> Query.string "page" |> map toCandidaciesRoute
                , s "feasibilities" <?> Query.string "category" <?> Query.string "page" |> map toFeasibilitiesRoute
                , s "subscriptions" <?> Query.string "status" <?> Query.string "page" |> map toSubscriptionsRoute
                , s "subscriptions" </> string |> map Subscription
                , topLevel "candidacies" string |> candidacyTab Tab.Profile
                , topLevel "feasibilities" string |> map Feasibility
                , subLevel "candidacies" "admissibility" |> candidacyTab Tab.Admissibility
                , subLevel "candidacies" "archive" |> candidacyTab Tab.Archive
                , subLevel "candidacies" "unarchive" |> candidacyTab Tab.Unarchive
                , subLevel "candidacies" "candidate" |> candidacyTab Tab.CandidateInfo
                , subLevel "candidacies" "drop-out" |> candidacyTab Tab.DropOut
                , subLevel "candidacies" "funding" |> candidacyTab Tab.FundingRequest
                , subLevel "candidacies" "meetings" |> candidacyTab Tab.Meetings
                , subLevel "candidacies" "payment" |> candidacyTab Tab.PaymentRequest
                , subLevel "candidacies" "payment" </> s "confirmation" |> candidacyTab Tab.PaymentRequestConfirmation
                , subLevel "candidacies" "payment" </> s "uploads" |> candidacyTab Tab.PaymentUploads
                , subLevel "candidacies" "training" |> candidacyTab Tab.Training
                , subLevel "candidacies" "training" </> s "confirmation" |> candidacyTab Tab.TrainingSent
                , subLevel "candidacies" "examInfo" |> candidacyTab Tab.ExamInfo
                , subLevel "candidacies" "feasibility" |> candidacyTab Tab.Feasibility
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
        Home ->
            topLevel [ "" ] []

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

        Feasibilities filters ->
            topLevel [ "feasibilities" ] [ Url.Builder.string "category" (FeasibilityCategoryFilter.toString filters.category), Url.Builder.int "page" filters.page ]

        Feasibility feasibilityId ->
            topLevel [ "feasibilities", feasibilityId ] []

        Subscriptions filters ->
            topLevel [ "subscriptions" ] [ Url.Builder.string "status" (SubscriptionRequestStatus.toString filters.status), Url.Builder.int "page" filters.page ]

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

        Tab.Feasibility ->
            default [ "feasibility" ]
