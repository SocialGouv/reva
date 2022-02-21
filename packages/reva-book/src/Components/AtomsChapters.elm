module Components.AtomsChapters exposing (..)

import Components.Atoms.ButtonChapter as ButtonChapter
import Components.Atoms.SearchInputChapter as SearchInputChapter
import ElmBook.ElmCSS exposing (Chapter)


doc : ( String, List (Chapter x) )
doc =
    ( "Atomes"
    , [ ButtonChapter.doc
      , SearchInputChapter.doc
      ]
    )
