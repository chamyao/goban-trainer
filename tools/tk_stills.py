"""The stills: painted images for the moments a pixel map can't show.

A scene shows one with the story step ["still", id, move] (tk-cutscene.js):
it fades in over the map, drifts (a Ken Burns pan or zoom) while the lines
play over it, then fades back. tools/gen_stills.py makes the images from
the prompts below; a still that hasn't been made yet is simply skipped.

STYLE is said before every prompt, so the set looks like one hand: bright
anime fantasy key art (the look the user wants, in the vein of Genshin
Impact), described in plain words rather than by a game's name.
Each still: the scene it belongs to (for reference) and what it shows.
"""

STYLE = ("Anime-style fantasy game key art: clean cel shading, vivid saturated colours, soft glow and bloom, "
         "luminous skies, richly detailed painterly backgrounds, expressive characters with flowing hair and "
         "robes. Setting: ancient China, late Eastern Han, 184 AD, with jade-green hills, red lacquered halls "
         "and drifting petals. Cinematic wide composition, 16:9. No text, no lettering, no logos, no borders.")


STILLS = {
    "oath": {
        "scene": "oath",
        "prompt": "Three sworn brothers kneel at an altar in a peach orchard in full pink blossom, burning incense; "
                  "a black ox and a white horse stand tethered for the sacrifice; petals drift in spring light. "
                  "Liu Bei in a pale robe in the middle, Guan Yu with a long black beard and a red face in green on "
                  "the left, Zhang Fei with a bristling black beard and a fierce face on the right.",
    },
    "yellow_turbans": {
        "scene": "daxing",
        "prompt": "A vast rebel host of fifty thousand men in yellow headscarves fills a valley below Daxing "
                  "Mountain, banners of yellow cloth, dust rising, seen from a ridge where five hundred volunteer "
                  "soldiers wait in a small dark line.",
    },
    "black_wind": {
        "scene": "blackwind",
        "prompt": "A sorcerer general with loose hair raises a sword and chants on a hilltop; a black whirlwind of "
                  "storm cloud, sand and stones pours from the sky onto a line of soldiers, with ghostly paper "
                  "figures of men and horses riding in the wind.",
    },
    "cage_cart": {
        "scene": "cart",
        "prompt": "On a dusty road an old, dignified general in plain clothes sits inside a wooden prisoner's cage "
                  "cart guarded by soldiers with spears; three horsemen have reined in beside it, the youngest "
                  "brother, black-bearded, gripping his spear in fury.",
    },
    "yangcheng": {
        "scene": "bosswin",
        "prompt": "The walled city of Yangcheng under siege at dusk, the government army's red banners ringing the "
                  "walls, the city gate opening from within as a traitor officer surrenders; smoke over the roofs.",
    },
}
