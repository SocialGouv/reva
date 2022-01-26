module Shared exposing (Data, Model, Msg(..), SharedMsg(..), template)

import Browser.Dom
import Browser.Navigation
import DataSource
import Html exposing (Html)
import Html.Styled
import Machine.Menu exposing (State(..))
import Pages.Flags
import Pages.PageUrl exposing (PageUrl)
import Path exposing (Path)
import Route exposing (Route)
import SharedTemplate exposing (SharedTemplate)
import Task
import View exposing (View)
import View.Layout


template : SharedTemplate Msg Model Data msg
template =
    { init = init
    , update = update
    , view = view
    , data = data
    , subscriptions = subscriptions
    , onPageChange = Just OnPageChange
    }


type Msg
    = OnPageChange
        { path : Path
        , query : Maybe String
        , fragment : Maybe String
        }
    | SharedMsg SharedMsg


type alias Data =
    ()


type SharedMsg
    = UserOpenMobileMenu
    | UserCloseMobileMenu


type alias Model =
    { mobileMenu : Machine.Menu.State
    }


init :
    Maybe Browser.Navigation.Key
    -> Pages.Flags.Flags
    ->
        Maybe
            { path :
                { path : Path
                , query : Maybe String
                , fragment : Maybe String
                }
            , metadata : route
            , pageUrl : Maybe PageUrl
            }
    -> ( Model, Cmd Msg )
init navigationKey flags maybePagePath =
    ( { mobileMenu = Closed }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        scrollToElement id =
            Browser.Dom.getElement id
                |> Task.andThen (\el -> Browser.Dom.setViewport 0 el.element.y)
                |> Task.attempt (\_ -> SharedMsg UserCloseMobileMenu)
    in
    case msg of
        OnPageChange url ->
            let
                cmd =
                    url.fragment
                        |> Maybe.map scrollToElement
                        |> Maybe.withDefault Cmd.none
            in
            ( { model | mobileMenu = Closed }, cmd )

        SharedMsg UserOpenMobileMenu ->
            ( { model | mobileMenu = Machine.Menu.Opened }, Cmd.none )

        SharedMsg UserCloseMobileMenu ->
            ( { model | mobileMenu = Machine.Menu.Closed }, Cmd.none )


subscriptions : Path -> Model -> Sub Msg
subscriptions _ _ =
    Sub.none


data : DataSource.DataSource Data
data =
    DataSource.succeed ()


view :
    Data
    ->
        { path : Path
        , route : Maybe Route
        }
    -> Model
    -> (Msg -> msg)
    -> View msg
    -> { body : Html msg, title : String }
view sharedData page model toMsg pageView =
    { body =
        View.Layout.view
            { onCloseMobileMenu = SharedMsg UserCloseMobileMenu |> toMsg
            , onOpenMobileMenu = SharedMsg UserOpenMobileMenu |> toMsg
            , mobileMenu = model.mobileMenu
            }
            pageView.body
            |> Html.Styled.toUnstyled
    , title = pageView.title
    }
