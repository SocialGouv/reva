module Page.Accounts exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Admin.Enum.AccountGroup as AccountGroup exposing (AccountGroup(..))
import Api.Account
import Api.Token
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Pagination
import Data.Account exposing (Account, AccountSummaryPage)
import Data.Context exposing (Context)
import Html exposing (Html, a, button, div, form, h2, h4, input, label, li, p, text, ul)
import Html.Attributes exposing (attribute, class, classList, for, id, name, placeholder, type_)
import Html.Attributes.Extra exposing (role)
import Html.Events exposing (onInput, onSubmit)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Date exposing (toFullFormat)
import View.Helpers exposing (dataTest)


type Msg
    = GotAccountsResponse (RemoteData (List String) AccountSummaryPage)
    | ClickedViewMore String
    | UserUpdatedSearch String
    | UserValidatedSearch
    | UserClearedSearch


type alias State =
    { accounts : RemoteData (List String) AccountSummaryPage
    , errors : List String
    , search : Maybe String
    }


type alias Filters =
    { page : Int, group : AccountGroup, search : Maybe String }


type alias Model =
    { state : State
    , filters : Filters
    }


init : Context -> AccountGroup -> Int -> ( Model, Cmd Msg )
init context groupFilter page =
    let
        defaultModel : Model
        defaultModel =
            { state =
                { accounts = RemoteData.Loading
                , errors = []
                , search = Nothing
                }
            , filters = { page = page, group = groupFilter, search = Nothing }
            }

        defaultCmd =
            Api.Account.getAccounts context.endpoint context.token GotAccountsResponse page groupFilter defaultModel.filters.search
    in
    ( defaultModel, defaultCmd )



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    let
        accountSkeleton =
            div
                []
                [ View.skeleton "h-4 w-120"
                , View.skeleton "mt-2 mb-12 h-12 w-96"
                ]
    in
    case model.state.accounts of
        NotAsked ->
            div [] []

        Loading ->
            View.layout
                ""
                [ viewCandidaciesLink context ]
                [ viewFilterLinks context model.filters.group
                ]
                [ viewDirectoryHeader context 0 model
                , div
                    [ class "py-3 px-10" ]
                    [ View.skeleton "mb-10 h-6 w-56"
                    , accountSkeleton
                    , accountSkeleton
                    , accountSkeleton
                    , accountSkeleton
                    ]
                ]

        Failure errors ->
            View.errors errors

        Success accounts ->
            accounts
                |> viewContent context model.state.errors model


viewContent :
    Context
    -> List String
    -> Model
    -> AccountSummaryPage
    -> Html Msg
viewContent context actionErrors model accountPage =
    View.layout
        ""
        [ viewCandidaciesLink context ]
        [ viewFilterLinks context model.filters.group
        ]
        (viewDirectoryPanel context accountPage model actionErrors)


viewDirectoryHeader :
    Context
    -> Int
    -> Model
    -> Html Msg
viewDirectoryHeader context accountsCount model =
    let
        groupString =
            case model.filters.group of
                Organism ->
                    "AAP"

                Certification_authority ->
                    "Certificateur"

                Admin ->
                    "Admin"
    in
    div
        [ class "px-8 pt-10 pb-4" ]
        [ h2
            []
            [ if Api.Token.isAdmin context.token then
                text "Espace pro administrateur"

              else
                text "Espace pro architecte de parcours"
            ]
        , h4
            [ class "mb-2" ]
            [ text
                ("Comptes "
                    ++ groupString
                    ++ " ("
                    ++ String.fromInt accountsCount
                    ++ ")"
                )
            ]
        , searchBar model
        , searchResults model accountsCount
        ]


viewDirectoryPanel : Context -> AccountSummaryPage -> Model -> List String -> List (Html Msg)
viewDirectoryPanel context accountSummaryPage model actionErrors =
    [ viewDirectoryHeader context accountSummaryPage.info.totalRows model
    , List.map (viewItem context) accountSummaryPage.rows
        |> ul
            [ dataTest "directory"
            , class "min-h-0 overflow-y-auto mx-8 px-0"
            , attribute "aria-label" "Comptes"
            ]
    , div [ class "flex justify-center" ] [ viewPager context accountSummaryPage.info.currentPage accountSummaryPage.info.totalPages model.filters.group ]
    , View.popupErrors actionErrors
    ]


viewPager : Context -> Int -> Int -> AccountGroup -> Html Msg
viewPager context currentPage totalPages groupFilter =
    BetaGouv.DSFR.Pagination.view currentPage totalPages (\p -> Route.toString context.baseUrl (Route.Accounts { group = groupFilter, page = p }))


searchBar : Model -> Html Msg
searchBar model =
    div [ class "mt-6" ]
        [ form
            [ onSubmit UserValidatedSearch ]
            [ label
                [ for "search", class "fr-hint-text mb-1" ]
                [ text "" ]
            , div
                [ role "search", class "fr-search-bar w-full" ]
                [ input
                    [ type_ "search"
                    , name "search"
                    , id "search"
                    , class "fr-input w-full h-10"
                    , placeholder "Rechercher"
                    , onInput UserUpdatedSearch
                    , Html.Attributes.value <| Maybe.withDefault "" model.state.search
                    ]
                    []
                , button
                    [ type_ "submit"
                    , class "fr-btn"
                    , Html.Attributes.title "Rechercher"
                    ]
                    [ text "Rechercher" ]
                ]
            ]
        ]


searchResults : Model -> Int -> Html Msg
searchResults model totalRows =
    let
        countString =
            if totalRows > 1 then
                String.fromInt totalRows ++ " résultats"

            else
                String.fromInt totalRows ++ " résultat"

        defaultSearchInfo search =
            [ text <| countString ++ " pour « " ++ search ++ " »"
            , Button.new { label = "Réinitialiser le filtre", onClick = Just UserClearedSearch }
                |> Button.secondary
                |> Button.withAttrs [ class "block mt-2" ]
                |> Button.view
            ]
    in
    div [ class "mt-4 text-xl font-semibold" ] <|
        case model.filters.search of
            Just "" ->
                [ text countString ]

            Nothing ->
                [ text countString ]

            Just search ->
                defaultSearchInfo search


withAccountPage : RemoteData (List String) AccountSummaryPage -> State -> State
withAccountPage accountPage state =
    { state | accounts = accountPage }


withSearch : Maybe String -> State -> State
withSearch search state =
    { state | search = search }


viewItem : Context -> Account -> Html Msg
viewItem context account =
    let
        username =
            Maybe.withDefault "" account.lastname ++ " " ++ Maybe.withDefault "" account.firstname

        email =
            account.email
    in
    li
        [ dataTest "directory-item"
        , class "list-none mb-4"
        ]
        [ div
            [ class "relative p-6 bg-neutral-100 flex hover:bg-gray-50"
            , class "focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500"
            ]
            [ div [ class "flex flex-col text-sm mb-2" ]
                [ p [ class "font-bold mb-0" ] [ text "Nom et Prénom" ]
                , p [] [ text username ]
                , p [ class "font-bold mb-0" ] [ text "Mail" ]
                , p [] [ text email ]
                ]
            , div
                [ class "flex items-center space-x-4 ml-auto mt-auto" ]
                [ Button.new { onClick = Nothing, label = "Voir plus" }
                    |> Button.primary
                    |> Button.linkButton (Route.toString context.baseUrl <| Route.Account account.id)
                    |> Button.view
                ]
            ]
        ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotAccountsResponse remoteAccounts ->
            ( model, Cmd.none ) |> withAccounts remoteAccounts

        ClickedViewMore id ->
            ( model, Cmd.none )

        UserUpdatedSearch search ->
            let
                state =
                    model.state
            in
            ( { model | state = { state | search = Just search } }, Cmd.none )

        UserValidatedSearch ->
            let
                filters =
                    model.filters
            in
            ( { model
                | filters = { filters | search = model.state.search, page = 1 }
                , state = model.state |> withAccountPage Loading
              }
            , Api.Account.getAccounts context.endpoint context.token GotAccountsResponse 1 model.filters.group model.state.search
            )

        UserClearedSearch ->
            let
                filters =
                    model.filters
            in
            ( { model
                | filters = { filters | search = Nothing, page = 1 }
                , state =
                    model.state
                        |> withAccountPage Loading
                        |> withSearch Nothing
              }
            , Api.Account.getAccounts context.endpoint context.token GotAccountsResponse 1 model.filters.group Nothing
            )


withErrors : List String -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withErrors errors ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | errors = errors } }, cmd )


withAccounts : RemoteData (List String) AccountSummaryPage -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withAccounts accounts ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | accounts = accounts } }, cmd )


viewCandidaciesLink : Context -> Html msg
viewCandidaciesLink context =
    Button.new { onClick = Nothing, label = "Voir les candidatures" }
        |> Button.linkButton (Route.toString context.baseUrl <| Route.Candidacies Route.emptyCandidacyFilters)
        |> Button.tertiary
        |> Button.view


viewFilterLinks : Context -> AccountGroup -> Html msg
viewFilterLinks context groupFilter =
    ul
        []
        [ viewFilterLink context groupFilter AccountGroup.Organism "AAP"
        , viewFilterLink context groupFilter AccountGroup.Certification_authority "Certificateur"
        ]


viewFilterLink : Context -> AccountGroup -> AccountGroup -> String -> Html msg
viewFilterLink context currentStatus linkStatus label =
    let
        isSelected =
            currentStatus == linkStatus
    in
    li
        []
        [ a
            [ class "block group my-4 py-1 px-2"
            , class "flex items-start justify-between transition"
            , class "border-l-2 border-transparent"
            , classList
                [ ( "text-blue-900 border-blue-900"
                  , isSelected
                  )
                , ( "hover:text-blue-900"
                  , not isSelected
                  )
                ]
            , Route.href context.baseUrl <|
                Route.Accounts { group = linkStatus, page = 1 }
            ]
            [ text label ]
        ]
