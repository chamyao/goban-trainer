"""The stills: painted images for the moments a pixel map can't show.

A scene shows one with the story step ["still", id, move] (tk-cutscene.js):
it fades in over the map, drifts (a Ken Burns pan or zoom) while the lines
play over it, then fades back. tools/gen_stills.py makes the images from
the prompts below; a still that hasn't been made yet is simply skipped.

Three things keep the set looking like one hand and the people like
themselves:

    STYLE  one short style line, the end of every request (portraits too)
    CAST   each person's fixed look, added to every request that names them
    refs   a portrait of each person in CAST (assets/tk/stills/refs/<key>.jpg),
           made first and approved by eye, then sent with every still that
           names them as a reference image, on models that take references

A request is built in this order, most important first (models weigh the
start of a prompt most, and flux-schnell cuts off after ~256 tokens): the
scene, then the cast it names, then the style. Keep a scene to about 60
words and name people only; their look belongs in CAST.
"""
import re

STYLE = ("Style: anime fantasy game key art, clean cel shading, vivid saturated colours, soft glow and bloom, "
         "luminous sky, richly detailed painterly background. Ancient China, 184 AD. "
         "No text, no lettering, no borders, no letterbox bars.")

# key -> (name as the scenes write it, look)
CAST = {
    "liubei": ("Liu Bei", "a gentle young man of twenty-three with a short neat black beard, long earlobes and "
                          "kind eyes, hair in a topknot, in a white robe trimmed with gold"),
    "guanyu": ("Guan Yu", "a tall, broad man with a deep red face, a very long black beard down to his chest and "
                          "narrow eyes, hair in a topknot, in a green robe"),
    "zhangfei": ("Zhang Fei", "a huge, burly man with a round fierce face, big round eyes and wild bristling black "
                              "whiskers, hair in a topknot, in black and dark brown clothes"),
    "luzhi": ("Lu Zhi", "a dignified old scholar-general with a long grey beard, in plain grey clothes"),
    "zhangbao": ("Zhang Bao", "a sorcerer general with long loose black hair and a yellow headscarf, "
                              "in a yellow robe"),
}


def portrait(key):
    """The request for a person's reference portrait."""
    name, look = CAST[key]
    return (f"Character reference portrait of {name}, {look}. Full body, standing, facing the viewer, "
            f"neutral pose, plain light background, even lighting. {STYLE}")


STILLS = {
    "oath": {
        "scene": "oath",
        "prompt": "Three sworn brothers kneel side by side at an altar in a peach orchard in full pink blossom, "
                  "burning incense; a black ox and a white horse stand tethered for the sacrifice; petals drift "
                  "in spring light. Liu Bei in the middle, Guan Yu on the left, Zhang Fei on the right.",
    },
    # the feast after the oath: "Three hundred village braves join them, and they drink in the garden
    # until they can drink no more." Three framings to choose from.
    "feast_wide": {
        "scene": "oath",
        "prompt": "A joyful feast in a peach orchard in full pink blossom at golden dusk: Liu Bei, Guan Yu and "
                  "Zhang Fei sit at a low wooden table heaped with wine jars and bowls, surrounded by cheering "
                  "village volunteers in rough hemp clothes raising cups; paper lanterns hang in the branches.",
    },
    "feast_toast": {
        "scene": "oath",
        "prompt": "Close, warm shot of three sworn brothers raising wine bowls together in a toast under "
                  "blossoming peach trees, wine splashing, soft evening light: Liu Bei in the middle smiling "
                  "gently, Guan Yu calm and proud, Zhang Fei roaring with laughter.",
    },
    "feast_night": {
        "scene": "oath",
        "prompt": "Night in a peach orchard after a feast: village volunteers dance and sing around a bonfire, "
                  "sparks rising into the blossoms. Zhang Fei has fallen asleep sitting against a giant wine "
                  "jar, eyes closed; Liu Bei and Guan Yu watch from the table, smiling.",
    },
    "yellow_turbans": {
        "scene": "daxing",
        "prompt": "A vast rebel host of fifty thousand men in yellow headscarves fills a valley below Daxing "
                  "Mountain, banners of yellow cloth, dust rising, seen from a ridge where five hundred volunteer "
                  "soldiers wait in a small dark line.",
    },
    "black_wind": {
        "scene": "blackwind",
        "prompt": "Zhang Bao raises a sword and chants on a hilltop; a black whirlwind of storm cloud, sand and "
                  "stones pours from the sky onto a line of soldiers, with ghostly paper figures of men and horses "
                  "riding in the wind.",
    },
    "cage_cart": {
        "scene": "cart",
        "prompt": "On a dusty road Lu Zhi sits inside a wooden prisoner's cage cart guarded by soldiers with "
                  "spears; Liu Bei, Guan Yu and Zhang Fei have reined in their horses beside it, Zhang Fei "
                  "gripping his spear in fury.",
    },
    "yangcheng": {
        "scene": "bosswin",
        "prompt": "The walled city of Yangcheng under siege at dusk, the government army's red banners ringing the "
                  "walls, the city gate opening from within as a traitor officer surrenders; smoke over the roofs.",
    },
}


def cast_in(sid):
    """The CAST keys a still's scene names, in the order they appear."""
    scene = STILLS[sid]["prompt"]
    found = [(scene.find(name), key) for key, (name, _) in CAST.items() if re.search(rf"\b{name}\b", scene)]
    return [key for _, key in sorted(found)]


def prompt(sid, refs=()):
    """The full request for a still: scene, then the cast it names (pointing at their reference
    images when refs, the keys sent as images in that order, are given), then the style."""
    parts = [STILLS[sid]["prompt"]]
    for key in cast_in(sid):
        name, look = CAST[key]
        ref = f" (reference image {list(refs).index(key) + 1}: keep his face, hair and clothes)" if key in refs else ""
        parts.append(f"{name} is {look}{ref}.")
    return " ".join(parts + [STYLE])
