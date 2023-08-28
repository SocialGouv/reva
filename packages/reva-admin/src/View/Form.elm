module View.Form exposing (..)

import Accessibility exposing (Attribute, div)
import Html exposing (Html)
import Html.Attributes exposing (class)


column : List (Attribute Never) -> List (Html msg) -> Html msg
column extraAttributes content =
    div
        ([ class "w-full lg:w-[180px] xl:w-[190px]" ] ++ extraAttributes)
        content


columnAuto : List (Attribute Never) -> List (Html msg) -> Html msg
columnAuto extraAttributes content =
    div
        ([ class "w-full sm:w-[160px] lg:w-[160px] xl:w-[228px]" ] ++ extraAttributes)
        content
