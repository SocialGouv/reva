module Page.Search.Candidacies exposing
    ( Model
    , Msg
    , init
    , update
    , view
    , withFilters
    )

import Accessibility exposing (a, h1, h3)
import Admin.Enum.CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Admin.Enum.CandidacyStatusStep
import Api.Candidacy
import Api.Token
import BetaGouv.DSFR.Button as Button
import Data.Candidacy exposing (Candidacy, CandidacyCountByStatus, CandidacySummary, candidacyStatusFilterToReadableString)
import Data.Context exposing (Context)
import Data.Organism exposing (Organism)
import Data.Referential
import Html exposing (Html, div, li, nav, p, text, ul)
import Html.Attributes exposing (attribute, class, classList, href, target)
import Html.Attributes.Extra exposing (role)
import Page.Search as Search
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Candidacy
import View.Candidacy.Filters exposing (Filters)
import View.Candidacy.Tab exposing (Value(..))
import View.Helpers exposing (dataTest)


type Msg
    = GotCandidacyCountByStatus (RemoteData (List String) CandidacyCountByStatus)
    | GotSearchMsg (Search.Msg CandidacySummary Msg)


type alias Model =
    { search : Search.Model CandidacySummary Msg
    , filters : Filters
    , candidacyCountByStatus : RemoteData (List String) CandidacyCountByStatus
    }


withFilters : Context -> Int -> CandidacyStatusFilter -> Model -> ( Model, Cmd Msg )
withFilters context page status model =
    let
        statusChanged =
            model.filters.status /= status

        pageChanged =
            model.filters.page /= page

        withNewStatus : Filters -> Filters
        withNewStatus filters =
            { filters | status = status }

        withNewPage : Filters -> Filters
        withNewPage filters =
            { filters | page = page }

        ( newSearchModel, searchCmd ) =
            if statusChanged || pageChanged then
                Search.reload context
                    model.search
                    (getCandidacies page (Just status))
                    (\p -> Route.Candidacies (Route.CandidacyFilters status p))

            else
                ( model.search, Cmd.none )
    in
    ( { model
        | filters = model.filters |> withNewPage |> withNewStatus
        , search = newSearchModel
      }
    , Cmd.map GotSearchMsg searchCmd
    )


init : Context -> CandidacyStatusFilter -> Int -> ( Model, Cmd Msg )
init context statusFilter page =
    let
        ( searchModel, searchCmd ) =
            Search.init
                context
                { onSearch = getCandidacies page (Just statusFilter)
                , toMsg = GotSearchMsg
                , toPageRoute = \p -> Route.Candidacies (Route.CandidacyFilters statusFilter p)
                , viewItem = viewItem
                }

        defaultModel : Model
        defaultModel =
            { candidacyCountByStatus = RemoteData.Loading
            , filters = { status = statusFilter, page = page }
            , search = searchModel
            }

        defaultCmd =
            Cmd.batch
                [ searchCmd
                , Api.Candidacy.getCandidacyCountByStatus context.endpoint
                    context.token
                    defaultModel.search.keywords.submitted
                    GotCandidacyCountByStatus
                ]
    in
    ( defaultModel, defaultCmd )


getCandidacies :
    Int
    -> Maybe CandidacyStatusFilter
    -> Context
    -> (RemoteData (List String) Data.Candidacy.CandidacySummaryPage -> msg)
    -> Maybe String
    -> Cmd msg
getCandidacies page filters context toMsg searchFilter =
    Api.Candidacy.getCandidacies context.endpoint
        context.token
        page
        filters
        toMsg
        searchFilter



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    let
        viewWithFilters filterContent =
            View.layoutWithLargeSidebar
                filterByStatusTitle
                filterContent
                (viewDirectoryPanel context model (candidacyStatusFilterToReadableString model.filters.status))
    in
    case ( context.isMobile && context.isScrollingToTop, model.candidacyCountByStatus ) of
        ( _, NotAsked ) ->
            div [] []

        ( _, Loading ) ->
            viewWithFilters []

        ( True, _ ) ->
            viewWithFilters []

        ( _, Failure errors ) ->
            viewWithFilters <| [ div [ class "m-4 font-medium text-red-500", role "alert" ] <| List.map (\e -> div [] [ text e ]) errors ]

        ( _, Success candidacyCountByStatus ) ->
            viewWithFilters <| View.Candidacy.Filters.view candidacyCountByStatus model.filters context


filterByStatusTitle : String
filterByStatusTitle =
    "Filtrer les candidatures par statut"


viewDirectoryHeader : Context -> Html Msg
viewDirectoryHeader context =
    div
        [ class "sm:px-6 sm:mt-6" ]
        [ h1
            [ class "text-4xl" ]
            [ if Api.Token.isAdmin context.token then
                text "Espace pro administrateur"

              else
                text "Espace Professionnel - Architecte Accompagnateur de parcours"
            ]
        , p
            []
            [ if Api.Token.isAdmin context.token then
                text "En tant qu’administrateur, vous pouvez gérer toutes les candidatures et faire une recherche par architecte de parcours."

              else
                text "En tant qu’architecte accompagnateur de parcours, vous pouvez gérer les différentes candidatures des usagers dans le cadre de leur projet professionnel."
            ]
        ]


viewDirectoryPanel : Context -> Model -> String -> List (Html Msg)
viewDirectoryPanel context model title =
    [ viewDirectoryHeader context
    , nav
        [ dataTest "directory"
        , class "min-h-0 overflow-y-auto"
        , class "sm:px-6"
        , attribute "aria-label" "Candidats"
        ]
        [ Search.view context model.search ]
    ]


viewItem : Context -> CandidacySummary -> List (Html msg)
viewItem context candidacy =
    let
        candidatureName =
            case ( candidacy.firstname, candidacy.lastname ) of
                ( Just firstname, Just lastname ) ->
                    String.concat [ firstname, " ", lastname ]

                _ ->
                    Maybe.withDefault "" candidacy.email
    in
    [ div
        [ class "text-lg flex-1 min-w-0" ]
        [ div
            [ class "border py-5 pl-6 pr-4 my-8" ]
            [ h3
                [ class "text-xl font-semibold truncate mb-2"
                , classList [ ( "italic", candidacy.certification == Nothing ) ]
                ]
                [ Maybe.map .label candidacy.certification
                    |> Maybe.withDefault "Certification non sélectionnée"
                    |> text
                ]
            , p
                [ class "text-lg flex my-3" ]
                [ div [ class "flex items-center space-x-12" ]
                    [ div [ class "flex items-center space-x-2" ]
                        [ div
                            [ class "flex space-x-2" ]
                            [ text candidatureName ]
                        ]
                    , case candidacy.department of
                        Just department ->
                            div [ class "flex items-center space-x-2" ]
                                [ div
                                    []
                                    [ Data.Referential.departmentToString department |> text ]
                                ]

                        _ ->
                            div [] []
                    ]
                ]
            , div
                [ class "flex items-end justify-between mb-2" ]
                [ if candidacy.lastStatus.status == Admin.Enum.CandidacyStatusStep.Projet then
                    div [ class "mb-2" ] [ View.Candidacy.viewCreatedAt candidacy.createdAt ]

                  else
                    View.Candidacy.viewSentAt candidacy.sentAt
                ]
            , div
                [ class "sm:flex justify-between items-end max-w-auto" ]
              <|
                case candidacy.organism of
                    Just organism ->
                        viewOrganism context candidacy candidatureName organism

                    _ ->
                        [ div [] [], candidacyAccessButton context candidacy candidatureName ]
            ]
        ]
    ]


viewOrganism : Context -> CandidacySummary -> String -> Organism -> List (Html msg)
viewOrganism context candidacy candidatureName organism =
    let
        nomCommercial =
            case organism.informationsCommerciales of
                Just ic ->
                    Maybe.withDefault "" ic.nom

                Nothing ->
                    ""

        accessButton =
            candidacyAccessButton context candidacy candidatureName

        textBlock =
            div
                [ class "my-4 mr-2 sm:my-0 truncate"
                , class "text-base text-gray-500"
                ]
    in
    case ( Api.Token.isAdmin context.token, Api.Token.isGestionnaireMaisonMereAAP context.token ) of
        ( True, _ ) ->
            [ div [ class "min-w-0" ]
                [ textBlock [ text organism.label ]
                , textBlock [ text nomCommercial ]
                ]
            , accessButton
            ]

        ( False, True ) ->
            [ textBlock [ text nomCommercial ], accessButton ]

        _ ->
            [ div [] [], accessButton ]


candidacyAccessButton : Context -> CandidacySummary -> String -> Accessibility.Html msg
candidacyAccessButton context candidacy candidatureName =
    let
        newCandidacySummaryPageActive =
            List.member "NEW_CANDIDACY_SUMMARY_PAGE" context.activeFeatures

        url =
            if newCandidacySummaryPageActive then
                "/admin2/candidacies/" ++ Data.Candidacy.candidacyIdToString candidacy.id ++ "/summary"

            else
                Route.toString context.baseUrl (Route.Candidacy { value = Profile, candidacyId = candidacy.id })
    in
    Button.new { onClick = Nothing, label = "Accéder\u{00A0}à\u{00A0}la\u{00A0}candidature" }
        |> Button.linkButton url
        |> Button.withAttrs [ attribute "title" ("Accéder à la candidature de " ++ candidatureName), attribute "target" url ]
        |> Button.view



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotSearchMsg searchMsg ->
            let
                ( newSearchModel, searchCmd ) =
                    Search.update context searchMsg model.search
            in
            ( { model | search = newSearchModel }
            , Cmd.batch
                [ Cmd.map GotSearchMsg searchCmd
                , if
                    List.member searchMsg
                        [ Search.UserSubmitSearch
                        , Search.UserClearedKeywords
                        ]
                  then
                    Api.Candidacy.getCandidacyCountByStatus context.endpoint
                        context.token
                        newSearchModel.keywords.submitted
                        GotCandidacyCountByStatus

                  else
                    Cmd.none
                ]
            )

        GotCandidacyCountByStatus remoteCandidacyCountByStatus ->
            ( { model | candidacyCountByStatus = remoteCandidacyCountByStatus }
            , Cmd.none
            )
