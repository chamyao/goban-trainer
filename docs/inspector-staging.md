# The inspector at Anxi: staging draft

The closing sequence (the Anxi interlude and the inspector) is the only part of World 1 that cannot be acted
out, because the closing is not a generated scene. This is the staging, ready to use once it is two normal
scenes at a place called Anxi: **hostel** (a room, indoors) and **post** (outdoors, before the county office).
Each needs one `["problem"]`; both would be main nodes after the boss, or the closing is made a staged scene.
Needs a new place brief in `tools/tk_places.py` (a hall landmark `hostel`, a `post` marker) and the props
`post`, `switches` and `seal` from the graphics build. Lines are the ones already in `tk_story.py`.

```python
"hostel": {"title": "The Inspector's Visit", "kind": "main", "setting": "indoor", "steps": [
    ["n", "At Anxi, Liu Bei governs for a month and wrongs no one. The three eat at one table and sleep in one bed. When Liu Bei sits among crowds, Guan Yu and Zhang Fei stand at his side all day without tiring."],
    ["prop", "tbl", "table", "ax1", 0, 8],
    ["pose", "party", "sit"], ["wait", 1000], ["pose", "party", "stand"],
    ["n", "Less than four months after he took office, an edict orders officers with military merit to be culled. Liu Bei fears he is among them. An inspector arrives."],
    ["prop", "hall", "hall", "ax1", 20, -6], ["prop", "dk", "desk", "ax1", 20, -2],
    ["spawn", "ins", "inspector", "ax1", 20, -2], ["pose", "ins", "sit"],
    ["n", "At the hostel the inspector sits facing south; Liu Bei stands below the steps."],
    ["say", "inspector", "What is your origin, Sheriff Liu?"],
    ["say", "liubei", "I descend from Prince Jing of Zhongshan. I fought the Yellow Turbans from Zhuo County in over thirty battles."],
    ["problem"],
    ["say", "inspector", "You claim imperial blood and invent your merits! The court is purging frauds like you."],
    ["wait", 1000],
]},
"post": {"title": "The Hitching Post", "kind": "main", "setting": "outdoor", "steps": [
    ["army", "elders", "f_villager", 5, "ax2", -30, 6],
    ["n", "Zhang Fei, a few cups of gloomy wine in, rides past the hostel and finds fifty or sixty old villagers weeping at the gate."],
    ["spawn", "ins", "inspector", "ax2", 24, 0], ["prop", "post", "post", "ax2", 18, 0],
    ["say", "zhangfei", "Plunderer of the people! Do you know who I am?"],
    ["move", "ins", "ax2", 18, 0],
    ["problem"],
    ["fx", "whip", "ax2", 18, 0], ["fx", "whip", "ax2", 18, 0], ["fx", "whip", "ax2", 18, 0],
    ["prop", "sw", "switches", "ax2", 14, 6],
    ["n", "Zhang Fei breaks ten or more willow switches across his legs."],
    ["say", "inspector", "Lord Xuande! Save my life!"],
    ["say", "guanyu", "Brother, you won great merit and were given only a sheriff's post, and now an inspector insults you. A phoenix does not roost among thorns. Let us kill him, give up the office, and make greater plans elsewhere."],
    ["prop", "seal", "seal", "ax2", 10, -4],
    ["n", "He hangs the seal around the inspector's neck."],
    ["say", "liubei", "For what you have done to the people you deserve to die. I spare your life. I return my seal of office, and I am gone."],
]},
```

Chinese for every line is already in `tools/tk_story_zh.py`.
