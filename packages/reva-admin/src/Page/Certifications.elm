module Page.Certifications exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (h1)
import Data.Context exposing (Context)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class)
import View


type alias Msg =
    ()


type alias Model =
    ()


init : Context -> Int -> ( Model, Cmd Msg )
init context page =
    ( (), Cmd.none )



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
    [ viewDirectoryHeader context ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    ( model, Cmd.none )
