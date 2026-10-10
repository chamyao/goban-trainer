# Feedback inbox

This draft pull request is a mailbox, never merged. The Goban Apps Script (docs/goban-apps-script.gs) posts
every note from the game's feedback box as a comment here. The Integration session watches the PR, so each
note wakes it at once, and it routes the note to the session that owns it (Plot, Places, Graphics, Testing)
or fixes it itself.
