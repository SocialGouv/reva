module Route exposing
    ( AccountFilters
    , CandidacyFilters
    , CertificationsFilters
    , Route(..)
    , TypologyFilters
    , emptyAccountFilters
    , emptyCandidacyFilters
    , emptyCertificationsFilters
    , emptyTypologyFilters
    , fromUrl
    , href
    , toString
    )

import Admin.Enum.AccountGroup as AccountGroup exposing (AccountGroup)
import Admin.Enum.CandidacyStatusFilter as CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Data.Candidacy exposing (CandidacyId, candidacyIdFromString, candidacyIdToString)
import Html
import Html.Attributes
import Url
import Url.Builder
import Url.Parser as Parser exposing ((</>), (<?>), Parser, map, oneOf, s, string, top)
import Url.Parser.Query as Query
import View.Candidacy.Tab as Tab


type alias CandidacyFilters =
    { status : CandidacyStatusFilter, page : Int }


type alias TypologyFilters =
    { page : Int }


type alias CertificationsFilters =
    { organismId : Maybe String
    , page : Int
    }


type alias AccountFilters =
    { group : AccountGroup, page : Int }


type Route
    = Candidacy Tab.Tab
    | Typology CandidacyId TypologyFilters
    | Candidacies CandidacyFilters
    | Certifications CertificationsFilters
    | Home
    | Login
    | Logout
    | NotFound
    | Account String -- Account Id
    | Accounts AccountFilters
    | Reorientation CandidacyId CertificationsFilters
    | SiteMap


emptyCandidacyFilters : CandidacyFilters
emptyCandidacyFilters =
    { status = CandidacyStatusFilter.ActiveHorsAbandon, page = 1 }


emptyCertificationsFilters : CertificationsFilters
emptyCertificationsFilters =
    { organismId = Nothing, page = 1 }


emptyTypologyFilters : TypologyFilters
emptyTypologyFilters =
    { page = 1 }


emptyAccountFilters : AccountFilters
emptyAccountFilters =
    { group = AccountGroup.Organism, page = 1 }


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

        toTypologyRoute candidacyId p =
            Typology (candidacyIdFromString candidacyId) (TypologyFilters (p |> Maybe.andThen String.toInt |> Maybe.withDefault 1))

        toCandidaciesRoute s p =
            Candidacies (CandidacyFilters (candidacyStatusStringToStatusFilter s) (p |> Maybe.andThen String.toInt |> Maybe.withDefault 1))

        toCertificationsRoute organismId p =
            Certifications (CertificationsFilters organismId (p |> Maybe.andThen String.toInt |> Maybe.withDefault 1))

        toReorientationRoute candidacyId organismId p =
            Reorientation (candidacyIdFromString candidacyId) (CertificationsFilters organismId (p |> Maybe.andThen String.toInt |> Maybe.withDefault 1))

        accountGroupStringToGroupFilter g =
            Maybe.withDefault AccountGroup.Organism (AccountGroup.fromString (Maybe.withDefault "" g))

        toAccountsRoute g p =
            Accounts (AccountFilters (accountGroupStringToGroupFilter g) (Maybe.withDefault 1 (String.toInt (Maybe.withDefault "1" p))))
    in
    s baseUrl
        </> oneOf
                [ top |> map Home
                , s "auth" </> s "login" |> map Login
                , s "auth" </> s "logout" |> map Logout
                , s "plan-du-site" |> map SiteMap
                , s "candidacies" <?> Query.string "status" <?> Query.string "page" |> map toCandidaciesRoute
                , s "certifications" <?> Query.string "organism" <?> Query.string "page" |> map toCertificationsRoute
                , s "accounts" <?> Query.string "group" <?> Query.string "page" |> map toAccountsRoute
                , s "accounts" </> string |> map Account
                , topLevel "candidacies" string |> candidacyTab Tab.Profile
                , subLevel "candidacies" "admissibility" |> candidacyTab Tab.Admissibility
                , subLevel "candidacies" "ready-for-jury-estimated-date" |> candidacyTab Tab.ReadyForJuryEstimatedDate
                , subLevel "candidacies" "dossier-de-validation" |> candidacyTab Tab.DossierDeValidation
                , subLevel "candidacies" "archive" |> candidacyTab Tab.Archive
                , subLevel "candidacies" "unarchive" |> candidacyTab Tab.Unarchive
                , subLevel "candidacies" "drop-out" |> candidacyTab Tab.DropOut
                , subLevel "candidacies" "cancel-drop-out" |> candidacyTab Tab.CancelDropOut
                , subLevel "candidacies" "funding" |> candidacyTab Tab.FundingRequest
                , subLevel "candidacies" "meetings" |> candidacyTab Tab.Meetings
                , subLevel "candidacies" "payment" |> candidacyTab Tab.PaymentRequest
                , subLevel "candidacies" "payment" </> s "confirmation" |> candidacyTab Tab.PaymentRequestConfirmation
                , subLevel "candidacies" "payment" </> s "uploads" |> candidacyTab Tab.PaymentUploads
                , subLevel "candidacies" "typology" <?> Query.string "page" |> map toTypologyRoute
                , subLevel "candidacies" "training" |> candidacyTab Tab.Training
                , subLevel "candidacies" "training" </> s "confirmation" |> candidacyTab Tab.TrainingSent
                , subLevel "candidacies" "examInfo" |> candidacyTab Tab.ExamInfo
                , subLevel "candidacies" "feasibility" |> candidacyTab Tab.Feasibility
                , subLevel "candidacies" "reorientation" <?> Query.string "organism" <?> Query.string "page" |> map toReorientationRoute
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

        certificationsFiltersToParams filters =
            Url.Builder.int "page" filters.page
                :: (filters.organismId
                        |> Maybe.map (Url.Builder.string "organism" >> List.singleton)
                        |> Maybe.withDefault []
                   )

        typologyFiltersToParams filters =
            [ Url.Builder.int "page" filters.page ]
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

        Certifications filters ->
            topLevel [ "certifications" ] (certificationsFiltersToParams filters)

        Candidacy tab ->
            tabToString topLevel subLevel tab

        Accounts filters ->
            topLevel [ "accounts" ] [ Url.Builder.string "group" (AccountGroup.toString filters.group), Url.Builder.int "page" filters.page ]

        Account accountId ->
            topLevel [ "accounts", accountId ] []

        Reorientation candidacyId filters ->
            subLevel candidacyId [ "reorientation" ] (certificationsFiltersToParams filters)

        Typology candidacyId filters ->
            subLevel candidacyId [ "typology" ] (typologyFiltersToParams filters)


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

        Tab.Archive ->
            default [ "archive" ]

        Tab.Unarchive ->
            default [ "unarchive" ]

        Tab.DropOut ->
            default [ "drop-out" ]

        Tab.CancelDropOut ->
            default [ "cancel-drop-out" ]

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

        Tab.ReadyForJuryEstimatedDate ->
            default [ "ready-for-jury-estimated-date" ]

        Tab.DossierDeValidation ->
            default [ "dossier-de-validation" ]
