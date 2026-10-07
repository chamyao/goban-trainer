# Jade portraits: screenshot pass (Book 12)

Graphics' painted cut-outs in Jade's parchment box, as on main 0017151 and later.

How the screenshots were taken:
- Book 12 walked end to end, 35/35 beats.
- The first line of every speaker was captured: 20 speakers, 9 of them with a painted portrait. The other 11 keep the pixel bust.
- Four screens:
  - desktop: 1390x745, apo110's window;
  - iPhone 13: 390x664;
  - 360x640;
  - iPhone 13 on its side: landscape.
- Rerun with:
  `KIT=jade VIEW=desktop|phone|360|landscape SHOTS=<dir> node tests/playtest/walk-playthrough.js`

| screen | sheet | verdict |
|---|---|---|
| desktop 1390x745 | `sheet-desktop.png`, `desktop-wangyun.png` | Good. The head and shoulders stand clear at the box's left end, and the text is never covered. |
| landscape | `sheet-landscape.png`, `landscape-dongzhuo.png` | Good. The portrait is large and clear beside the box, and the goal panel is not covered. |
| iPhone 13 upright | `sheet-phone.png`, `phone-wangyun-tab-over-chin.png` | Mostly hidden. Only the head shows above the box, and the 主线 · Story tab crosses the chin or beard (Wang Yun). Lü Bu, Li Ru and the Emperor show little more than a hat. |
| 360 upright | `sheet-360.png`, `360-diaochan-head-behind-tab.png` | Mostly hidden. Diaochan shows only the top of her hair, behind the tab. |

## Findings, in order
1. **Phones upright: the portrait sits too low.**
   - The cut-out is anchored to the box's left end, and on a phone the box takes the lower third of the screen with a lot of empty space below the line.
   - Only the head clears the box, and the 主线 tab lands on the face.
   - Suggestions:
     - On an upright phone, lift the portrait so the head and shoulders clear the top of the box, about the box's height above where it stands now.
     - Or shrink the box's empty lower half. That is about 40% of the box, unchanged from before the portraits.
     - Or move the tab right of the portrait.
2. **The text is never covered.**
   - Every speaker with a portrait was flagged "portrait over the text" by the bounding-box check, but in every screenshot the cut-out is behind the parchment.
   - So it's a layering overlap only, not a readability problem.
3. **11 speakers have no painting and keep the pixel bust:** old man, gentleman, soldier, porter, Shisun Rui, Huang Wan, Ma Midi, Li Jue, Jia Xu, the clerk, Guo Si.
   - That is consistent, but Li Jue and Jia Xu lead beats a16–a17, so they're the most visible gaps.
4. **No clash with the duel's lead portrait:**
   - board-layout passes 25/25 in Jade at 5 sizes, including a pinned tall crop.
   - framing, full-window, stills-phone, duel-desktop and window-sizes pass.

The goal box's lead chip followed the party in every view: Wang Yun → Diaochan → Wang Yun → Diaochan → Wang Yun → Li Su → Wang Yun → Lü Bu → Wang Yun → Jia Xu → Li Jue → Wang Yun.
- At 360 it was empty once, for a moment at the start of a1 (the first frame the player could walk).
- It was right everywhere after that.
