# World 1 staging audit: is everything the text mentions on stage?

Checked `tools/tk_story.py` on `main` (3069d16) scene by scene: every person and object named in the narration and dialogue, against what the staging steps put on stage (party, `spawn`, `army`, `prop`, `give`, `fx`, speakers). A keyword pass found candidates; the table below is the curated result after reading each scene. The cutscenes were not watched, so a gap listed here may be partly covered by something the generator adds (a speaker is brought on stage automatically).

**Status: every gap below is now staged in `tools/tk_story.py`** (props and characters the generator lacked were added by Graphics; `python3 tools/check_story.py --needs` is empty). The inspector sequence is two normal scenes at Anxi (`hostel`, `post`). This file is the record of the audit.

Fix types: **S** = script only (existing actors and props are enough), **C** = needs a new character or sprite, **P** = needs a new prop kind from Graphics, **G** = needs generator support.

## Gaps, by scene

| Scene | Mentioned but not on stage | Fix |
|---|---|---|
| tree | The fortune-teller; the village children Liu Bei plays with; his mother | S (folk kinds `elder`/`child`/`woman`) |
| council | The notice going up (map object, not a prop) | none needed |
| notice | The crowd at the notice; the notice itself (a map landmark, not in the script) | S (folk crowd) |
| inn | Guan Yu's cart; the wine he calls for | P (plain cart); S (`winejars` prop exists) |
| oath | The black ox and the white horse for the sacrifice | P (animal props) |
| horses | Su Shuang (only one of the two merchants is staged); the silver and the steel (only `gain`, nothing visible) | S (second `merchant`); P (a chest or bars) |
| peace1 | The three books (Essentials of Great Peace) | P (book/scroll prop) |
| peace2 | The sick, the charmed water, the disciples in thirty-six divisions | S (folk crowd, an `army` of disciples) |
| peace3 | Tang Zhou and Ma Yuanyi (the informer and the beheaded agent), Zhang Bao and Zhang Liang, the host in yellow scarves | C (two officials); S (`army` of rebels) |
| daxing | Liu Yan, whom Liu Bei reports to | S (`f_noble` stand-in, as in council) |
| qingzhou | Gong Jing and his letter | S (`f_official` stand-in); P (letter) |
| caocao1 | Cao Cao's father, whom the uncle addresses ("Brother!") | C (Cao Song) or S (`elder` stand-in) |
| caocao2 | The coloured staves at the gates; Jian Shuo's uncle being flogged | P (staves); S (`noble` stand-in) |
| fireplan | The soldiers ordered to bundle straw; the straw | S (`army`); P (straw bundles) |
| caocao3 | Zhang Bao and Zhang Liang fleeing; Cao Cao's column under red banners; the Yellow Turban camp | S (`army` of rebels, `army` of militia); P (red banners) |
| office | The routed Han troops and the banners reading GENERAL OF HEAVEN; the brothers riding in | S (`army` of fleeing `soldier`s and `rebel`s); P (banners) |
| blackwind | Gao Sheng's death at Zhang Fei's spear; the buckets of blood; Guan Yu and Zhang Fei's thousand men on the ridge | S (a `rebel` falls; two `army` groups on the ridge); P (buckets) |
| boss | Liu Bei's arrow hitting Zhang Bao; the signal gun; Guan Yu and Zhang Fei on the ridge | S (`pose` strike by Liu Bei, `fx`); G (arrow) |
| closing (inspector) | Everything: the inspector on his horse, the hostel hall, the clerks, the villagers at the gate, the hitching post, the willow switches, the seal | G (closing is not a generated scene; the steps play as plain dialogue); P (post, switches, seal) |

## What is fine

- Every named speaker is on stage (the generator brings a speaker on if needed).
- The scene-defining objects are staged: the cage cart with Lu Zhi aboard, the forge with the smith and gifts, the city gates at Qingzhou and Yangcheng, the table and wine at the oath, incense and petals, fire, the whip, the black wind and the paper soldiers.
- Reported or background mentions that don't need to be seen: Zheng Xuan, Lu Zhi and Gongsun Zan in Liu Bei's youth; Zhang Liang, Huangfu Song and Zhu Jun in Lu Zhi's briefing; Dong Zhuo taking Lu Zhi's army.

## Suggested order of work

1. **S fixes first (no one else needed):** Su Shuang, Liu Yan at Daxing, Gong Jing at Qingzhou, the crowd at the notice, the tree's children, mother and fortune-teller, Gao Sheng's death, Liu Bei's arrow, the ridge ambush forces, the fleeing Han troops and the rebel armies.
2. **P requests to Graphics, in one batch:** plain cart, ox, horse (as a sacrifice), book or scroll, letter, chest or bars, straw bundles, banners (red, yellow), buckets, hitching post, willow switches, seal, coloured staves.
3. **G request to Graphics and Integration:** make the closing sequence a staged scene, so the inspector scene can be acted out.
4. **C decisions for the user:** whether Tang Zhou, Ma Yuanyi, Cao Song, Liu Yan and Zou Jing get their own sprites and voices, or stay stand-ins.
