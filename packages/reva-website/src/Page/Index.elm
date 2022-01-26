module Page.Index exposing (Data, Model, Msg, page)

import DataSource exposing (DataSource)
import DataSource.File
import Head
import Head.Seo as Seo
import Html.Styled exposing (Html, h1, text)
import Html.Styled.Attributes exposing (class)
import Page exposing (Page, StaticPayload)
import Pages.PageUrl exposing (PageUrl)
import Pages.Url
import Shared
import View exposing (View)
import View.Markdown


type alias Model =
    ()


type alias Msg =
    Never


type alias RouteParams =
    {}


page : Page RouteParams Data
page =
    Page.single
        { head = head
        , data = data
        }
        |> Page.buildNoState { view = view }


data : DataSource Data
data =
    DataSource.File.rawFile "README.md"
        |> DataSource.map View.Markdown.toHtml


head :
    StaticPayload Data RouteParams
    -> List Head.Tag
head _ =
    Seo.summary
        { canonicalUrlOverride = Nothing
        , siteName = "REVA - Valoriser les compétences"
        , image =
            { url = Pages.Url.external "TODO"
            , alt = "todo"
            , dimensions = Nothing
            , mimeType = Nothing
            }
        , description = "REVA - Valoriser les compétences"
        , locale = Nothing
        , title = "REVA - Page d'accueil"
        }
        |> Seo.website


type alias Data =
    Html Msg


view :
    Maybe PageUrl
    -> Shared.Model
    -> StaticPayload Data RouteParams
    -> View Msg
view _ _ payload =
    { title = "REVA - Page d'accueil"
    , body =
        [ payload.data ]
    }
