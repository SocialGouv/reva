module Page.Certifications exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (h1)
import Api.Certification
import Data.Certification exposing (Certification)
import Data.Context exposing (Context)
import Html exposing (Html, div, p, text)
import Html.Attributes exposing (attribute, class)
import Page.Search as Search
import Route
import View


type Msg
    = GotSearchMsg (Search.Msg Certification)


type alias Model =
    { search : Search.Model Certification
    , page : Int
    }


init : Context -> Int -> ( Model, Cmd Msg )
init context page =
    let
        ( searchModel, searchCmd ) =
            Search.init
                { onSearch = Api.Certification.getCertifications context.endpoint context.token page
                , toPageRoute = \p -> Route.Certifications (Route.CertificationsFilters p)
                , viewItem = viewItem context
                }
    in
    ( { page = page, search = searchModel }
    , Cmd.map GotSearchMsg searchCmd
    )



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    View.layout
        ""
        []
        (viewDirectoryPanel context model)


viewDirectoryHeader : Context -> Html Msg
viewDirectoryHeader context =
    div
        [ class "sm:px-6 sm:mt-6" ]
        [ h1
            []
            [ text "Changement de certification" ]
        ]


viewDirectoryPanel : Context -> Model -> List (Html Msg)
viewDirectoryPanel context model =
    [ viewDirectoryHeader context
    , div
        [ class "sm:px-6"
        , attribute "aria-label" "Certifications"
        ]
        [ Search.view context model.search |> Html.map GotSearchMsg ]
    ]


viewItem : Context -> Certification -> List (Html msg)
viewItem context certification =
    [ div
        [ class "my-6 border-b pb-6 px-4" ]
        [ div [ class "text-sm text-gray-500" ] [ text certification.codeRncp ]
        , div [ class "text-xl font-semibold" ] [ text certification.label ]
        ]
    ]



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
            , Cmd.map GotSearchMsg searchCmd
            )
