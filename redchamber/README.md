# Dream of the Red Chamber (红楼梦)

A separate area for books drawn from *Dream of the Red Chamber*. Like the Three Kingdoms books it is a go trainer: the
story files use the same engine format (nodes, scenes, dilemmas), kept apart from the `tk*` story files. Nothing here
is registered in the game yet; that is Integration's step.

| Book | Chapters | Leads | Files |
|---|---|---|---|
| 1 · 侯门深似海 *Deep as the Sea* | 1–6 (played: 3 and 6) | Lin Daiyu, then Granny Liu | `book1/story.py` (the world), `book1/design.md`, `book1/script.md` (generated) |

Check: `python3 redchamber/book1/check.py`. Regenerate the script: `python3 redchamber/tools/script_md.py`.

Source text: zh.wikisource.org, 紅樓夢/第NNN回 (the 120-chapter text). Chinese lines in the scripts are the novel's own
vernacular in simplified characters, lightly modernised only where a word would stop a reader.
