module View.Helpers exposing (dataTest)

import Html.Styled exposing (Attribute)
import Html.Styled.Attributes exposing (attribute)


dataTest : String -> Attribute msg
dataTest =
    attribute "data-test"
