module Page.Search exposing
    ( Model
    , Msg(..)
    , init
    , reload
    , update
    , view
    )

import Accessibility exposing (button)
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Pagination
import Data.Context exposing (Context)
import Html exposing (Html, div, form, input, label, li, p, text, ul)
import Html.Attributes exposing (attribute, class, for, id, name, placeholder, type_)
import Html.Attributes.Extra exposing (role)
import Html.Events exposing (onInput, onSubmit)
import RemoteData exposing (RemoteData(..))
import Route exposing (Route)
import String exposing (String)
import View
import View.Helpers exposing (dataTest)


type Msg data
    = GotSearchResponse (RemoteData (List String) (SearchResults data))
    | UserUpdatedKeywords String
    | UserSubmitSearch
    | UserClearedKeywords


type alias Model data =
    { keywords : Keywords
    , onSearch : SearchHandler data
    , results : RemoteData (List String) (SearchResults data)
    , toPageRoute : Int -> Route
    , viewItem : data -> List (Html (Msg data))
    }


type alias Keywords =
    { typed : Maybe String
    , submitted : Maybe String
    }


type alias SearchResults data =
    { rows : List data
    , info : PaginationInfo
    }


type alias PaginationInfo =
    { totalRows : Int
    , currentPage : Int
    , totalPages : Int
    , pageLength : Int
    }


type alias SearchHandler data =
    (RemoteData (List String) (SearchResults data) -> Msg data)
    -> Maybe String
    -> Cmd (Msg data)


emptyKeywords : Keywords
emptyKeywords =
    { typed = Nothing, submitted = Nothing }


init :
    { onSearch : SearchHandler data
    , toPageRoute : Int -> Route
    , viewItem : data -> List (Html (Msg data))
    }
    -> ( Model data, Cmd (Msg data) )
init config =
    let
        defaultModel : Model data
        defaultModel =
            { keywords = emptyKeywords
            , onSearch = config.onSearch
            , results = NotAsked
            , toPageRoute = config.toPageRoute
            , viewItem = config.viewItem
            }
    in
    ( defaultModel, config.onSearch GotSearchResponse Nothing )


reload : Model data -> SearchHandler data -> ( Model data, Cmd (Msg data) )
reload model onSearch =
    ( { model | onSearch = onSearch, results = Loading }
    , onSearch GotSearchResponse model.keywords.submitted
    )



-- VIEW


view : Context -> Model data -> Html (Msg data)
view context model =
    div
        []
        [ viewResults context model
        , div [ class "flex justify-center" ] <|
            case model.results of
                Success results ->
                    [ viewPager context model results.info.currentPage results.info.totalPages ]

                _ ->
                    []
        ]


viewPager : Context -> Model data -> Int -> Int -> Html (Msg data)
viewPager context model currentPage totalPages =
    BetaGouv.DSFR.Pagination.view currentPage
        totalPages
        (\p -> Route.toString context.baseUrl (model.toPageRoute p))


searchBar : Model data -> Html (Msg data)
searchBar model =
    div [ class "mt-6" ]
        [ form
            [ onSubmit UserSubmitSearch ]
            [ label
                [ for "search", class "fr-hint-text mb-1" ]
                [ text "" ]
            , div
                [ role "search", class "fr-search-bar w-full" ]
                [ input
                    [ type_ "search"
                    , name "search"
                    , name "search"
                    , id "search"
                    , class "fr-input w-full h-10"
                    , placeholder "Rechercher"
                    , onInput UserUpdatedKeywords
                    , Maybe.withDefault "" model.keywords.typed
                        |> Html.Attributes.value
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


searchResults : Model data -> Int -> Html (Msg data)
searchResults model totalRows =
    let
        countString =
            if totalRows > 1 then
                String.fromInt totalRows ++ " résultats"

            else
                String.fromInt totalRows ++ " résultat"

        defaultSearchInfo search =
            [ text <| countString ++ " pour « " ++ search ++ " »"
            , Button.new { label = "Réinitialiser le filtre", onClick = Just UserClearedKeywords }
                |> Button.secondary
                |> Button.withAttrs [ class "block mt-2" ]
                |> Button.view
            ]
    in
    div [ class "mt-4 text-xl font-semibold" ] <|
        case model.keywords.submitted of
            Just "" ->
                [ text countString ]

            Nothing ->
                [ text countString ]

            Just search ->
                defaultSearchInfo search


viewResults : Context -> Model data -> Html (Msg data)
viewResults _ model =
    let
        viewItem data =
            li
                [ dataTest "directory-item", attribute "style" "--li-bottom:0" ]
            <|
                model.viewItem data
    in
    div
        []
        [ searchBar model
        , case model.results of
            Success results ->
                div []
                    [ searchResults model results.info.totalRows
                    , List.map viewItem results.rows
                        |> ul
                            [ dataTest "directory-group"
                            , class "list-none pl-0 mt-0 relative z-0"
                            ]
                    ]

            Failure error ->
                div [ class "my-2 font-medium text-red-500", role "alert" ] <| List.map (\e -> div [] [ text e ]) error

            _ ->
                div []
                    [ View.skeleton "mt-5 mb-3 h-5 w-60"
                    , case model.keywords.submitted of
                        Just "" ->
                            text ""

                        Nothing ->
                            text ""

                        _ ->
                            View.skeleton "h-10 w-48"
                    , View.skeleton "mt-8 h-[198px] w-full"
                    , View.skeleton "mt-8 h-[198px] w-full"
                    ]
        ]



-- UPDATE


withKeywordsSubmitted : Keywords -> Keywords
withKeywordsSubmitted keywords =
    { keywords | submitted = keywords.typed }


withKeywordsTyped : Maybe String -> Keywords -> Keywords
withKeywordsTyped typed keywords =
    { keywords | typed = typed }


update : Context -> Msg data -> Model data -> ( Model data, Cmd (Msg data) )
update _ msg model =
    case msg of
        GotSearchResponse results ->
            ( { model | results = results }, Cmd.none )

        UserUpdatedKeywords keywords ->
            ( { model
                | keywords = model.keywords |> withKeywordsTyped (Just keywords)
              }
            , Cmd.none
            )

        UserSubmitSearch ->
            let
                newModel =
                    { model
                        | keywords = model.keywords |> withKeywordsSubmitted
                        , results = Loading
                    }
            in
            ( newModel
            , model.onSearch GotSearchResponse newModel.keywords.submitted
            )

        UserClearedKeywords ->
            ( { model
                | keywords = emptyKeywords
                , results = Loading
              }
            , model.onSearch GotSearchResponse Nothing
            )
