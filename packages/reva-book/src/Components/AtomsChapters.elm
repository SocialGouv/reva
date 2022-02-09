module Components.AtomsChapters exposing (..)

import Components.Atoms.ButtonChapter as ButtonChapter
import ElmBook.ElmCSS exposing (Chapter)


doc : ( String, List (Chapter x) )
doc =
    ( "Atomes"
    , [ ButtonChapter.doc
      ]
    )
