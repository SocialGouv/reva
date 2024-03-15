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


type Msg data userMsg
    = GotSearchResponse (RemoteData (List String) (SearchResults data))
    | UserUpdatedKeywords String
    | UserSubmitSearch
    | UserClearedKeywords
    | UserMsg userMsg


type alias Model data userMsg =
    { keywords : Keywords
    , onSearch : SearchHandler data userMsg
    , results : RemoteData (List String) (SearchResults data)
    , toMsg : Msg data userMsg -> userMsg
    , toPageRoute : Int -> Route
    , viewItem : Context -> data -> List (Html userMsg)
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


type alias SearchHandler data userMsg =
    Context
    -> (RemoteData (List String) (SearchResults data) -> Msg data userMsg)
    -> Maybe String
    -> Cmd (Msg data userMsg)


emptyKeywords : Keywords
emptyKeywords =
    { typed = Nothing, submitted = Nothing }


init :
    Context
    ->
        { onSearch : SearchHandler data userMsg
        , toMsg : Msg data userMsg -> userMsg
        , toPageRoute : Int -> Route
        , viewItem : Context -> data -> List (Html userMsg)
        }
    -> ( Model data userMsg, Cmd userMsg )
init context config =
    let
        defaultModel : Model data userMsg
        defaultModel =
            { keywords = emptyKeywords
            , onSearch = config.onSearch
            , results = NotAsked
            , toMsg = config.toMsg
            , toPageRoute = config.toPageRoute
            , viewItem = config.viewItem
            }
    in
    ( defaultModel, Cmd.map config.toMsg (config.onSearch context GotSearchResponse Nothing) )


reload :
    Context
    -> Model data userMsg
    -> SearchHandler data userMsg
    -> (Int -> Route)
    -> ( Model data userMsg, Cmd (Msg data userMsg) )
reload context model onSearch newToPageRoute =
    ( { model | onSearch = onSearch, results = Loading, toPageRoute = newToPageRoute }
    , onSearch context GotSearchResponse model.keywords.submitted
    )



-- VIEW


view : Context -> Model data userMsg -> Html userMsg
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


viewPager : Context -> Model data userMsg -> Int -> Int -> Html userMsg
viewPager context model currentPage totalPages =
    BetaGouv.DSFR.Pagination.view currentPage
        totalPages
        (\p -> Route.toString context.baseUrl (model.toPageRoute p))


searchBar : Model data userMsg -> Html userMsg
searchBar model =
    form
        [ onSubmit (model.toMsg UserSubmitSearch) ]
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
                , onInput (model.toMsg << UserUpdatedKeywords)
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


searchResults : Model data userMsg -> Int -> Html userMsg
searchResults model totalRows =
    let
        countString =
            if totalRows > 1 then
                String.fromInt totalRows ++ " résultats"

            else
                String.fromInt totalRows ++ " résultat"

        defaultSearchInfo search =
            [ text <| countString ++ " pour « " ++ search ++ " »"
            , Button.new { label = "Réinitialiser le filtre", onClick = Just (model.toMsg UserClearedKeywords) }
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


viewResults : Context -> Model data userMsg -> Html userMsg
viewResults context model =
    let
        viewItem data =
            li
                [ dataTest "directory-item", attribute "style" "--li-bottom:0" ]
            <|
                model.viewItem context data
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


update : Context -> Msg data userMsg -> Model data userMsg -> ( Model data userMsg, Cmd (Msg data userMsg) )
update context msg model =
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
            , model.onSearch context GotSearchResponse newModel.keywords.submitted
            )

        UserClearedKeywords ->
            ( { model
                | keywords = emptyKeywords
                , results = Loading
              }
            , model.onSearch context GotSearchResponse Nothing
            )

        UserMsg _ ->
            ( model, Cmd.none )
