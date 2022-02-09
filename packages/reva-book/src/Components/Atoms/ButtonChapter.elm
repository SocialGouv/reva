module Components.Atoms.ButtonChapter exposing (..)

import Components.Atoms.Button as Button
import ElmBook.Chapter exposing (chapter, renderComponentList)
import ElmBook.ElmCSS exposing (Chapter)


doc : Chapter x
doc =
    chapter "Button"
        |> renderComponentList
            [ ( "button enable"
              , Button.newArgs "Submit"
                    |> Button.view
              )
            , ( "button disable"
              , Button.newArgs "Submit"
                    |> Button.withType Button.Submit
                    |> Button.withDisabled True
                    |> Button.view
              )
            ]
