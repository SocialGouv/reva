module Components.Atoms.SearchInputChapter exposing (..)

import Components.Atoms.SearchInput as SearchInput
import ElmBook.Chapter exposing (chapter, renderComponentList)
import ElmBook.ElmCSS exposing (Chapter)


doc : Chapter x
doc =
    chapter "SearchInput"
        |> renderComponentList
            [ ( "search"
              , SearchInput.default
                    |> SearchInput.view
              )
            ]
