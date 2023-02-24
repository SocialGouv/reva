module View.Helpers exposing (dataTest)

import Html exposing (Attribute)
import Html.Attributes exposing (attribute)


dataTest : String -> Attribute msg
dataTest =
    attribute "data-test"
