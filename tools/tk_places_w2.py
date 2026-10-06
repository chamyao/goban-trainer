"""Book 2 places (Hulao Pass), the Diaochan arc: a STOPGAP in today's format, for testing only.

The main work is the plan grids in tools/tk_plans_w2.py (the user's direction: a good job first).

Unwired: tk_places.py still reads Book 2 from tk_story_w2.py; Plot switches both
imports in one commit. Same shape as PLACES[1] in tk_places.py (see its docstring),
so the current map factory can lay it out. Check it with
    python3 tools/check_places_w2.py        (imports, keys, kinds, and a real factory layout of every place)

The fuller design (one city in several states, stealth with sight cones, the
curtain puzzle, the procession, coarse plan grids) is the next pass:
docs/book2/places-design.md, tools/tk_plans_w2.py.

Rooms: a story node's "room" is a building landmark's id here, and only building
kinds with an interior (hall, house, shop, inn, lodge, hut, tent) have one. So
Wang Yun's and the Chancellor's houses appear as several buildings side by side,
each labelled as the room it holds.

"inside": True on a person: they stand in the room of their "near" building (the steward
by the family chest, the jeweller at his bench). Requested from Integration; until the
factory does it, it ignores the flag and they stand outside the building, 2-3 tiles off.

Road challengers (14; 6 blocking): today a challenger can't block a path or spot
you, so the blocking ones stand by the landmark you must reach next, and only
for that walk (when/until). Marked "blocking" in a comment.
"""

PLACES2 = {
    # =========================================================================================
    "Chang'an": {
        "archetype": "city",
        "shrine": False,
        "banners": "red",
        "landmarks": [
            # outside the north wall
            {"kind": "building.gate", "id": "hengmen", "node": "2-a1", "label": "The Heng Gate: the farewell banquet"},
            {"kind": "rock.big", "id": "ridge", "node": "2-a11", "near": "hengmen", "label": "The earthen ridge"},
            # Wang Yun's residence: three rooms and the garden, side by side
            {"kind": "building.hall", "id": "wy-hall", "label": "Wang Yun's residence: the front hall"},
            {"kind": "building.hall", "id": "wy-rearhall", "near": "wy-hall", "label": "Wang Yun's residence: the rear hall"},
            {"kind": "building.house", "id": "wy-secret", "near": "wy-rearhall", "label": "Wang Yun's residence: the secret room"},
            {"kind": "building.moongate", "id": "wy-garden", "node": "2-a2", "near": "wy-rearhall", "label": "Wang Yun's rear garden"},
            # the Chancellor's residence
            {"kind": "building.hall", "id": "xf-hall", "label": "The Chancellor's residence: the middle hall"},
            {"kind": "building.house", "id": "xf-bedroom", "near": "xf-hall", "label": "The Chancellor's residence: the bedchamber"},
            {"kind": "building.moongate", "id": "xf-garden", "node": "2-a9", "near": "xf-hall",
             "label": "The Chancellor's rear garden: the Phoenix Pavilion"},
            {"kind": "lamp.post", "id": "lanterns", "node": "2-a6", "near": "xf-hall", "label": "The red lanterns on the avenue"},
            # Lü Bu's quarters, next door
            {"kind": "building.house", "id": "lubu", "node": "2-a3", "near": "xf-hall", "label": "Lü Bu's quarters"},
            # the market
            {"kind": "building.shop", "id": "jeweller", "label": "The jeweller's"},
            {"kind": "lamp.post", "id": "market", "node": "2-a15", "near": "jeweller", "label": "The market crossroads"},
            {"kind": "furniture.gotable", "id": "gotable", "near": "market", "label": "The market go table"},
            # the ministers' houses
            {"kind": "building.house", "id": "shisun", "node": "2-a12a", "label": "Shisun Rui's house"},
            {"kind": "building.house", "id": "huangwan", "node": "2-a12b", "label": "Huang Wan's house"},
            # the palace quarter
            {"kind": "building.hall", "id": "palace", "label": "Weiyang Palace"},
            {"kind": "building.house", "id": "side-hall", "near": "palace", "label": "The emperor's side hall"},
            {"kind": "building.gate", "id": "north-gate", "node": "2-a14", "near": "palace", "label": "The North Side Gate"},
            {"kind": "building.hall", "id": "dutang", "near": "palace", "label": "The great hall of state"},
            {"kind": "building.house", "id": "caiyong", "near": "palace", "label": "Cai Yong's house"},
            # the east wall
            {"kind": "building.gate", "id": "xuanping", "node": "2-a18", "label": "The Xuanping Gate"},
        ],
        "npcs": [
            # --- items: the family pearls, then the crown --------------------------------------------
            {"kind": "folk.elder", "near": "wy-rearhall", "inside": True, "face": "down",
             "say": "“The master hasn't slept. He walks the garden and sighs.”",
             "gives": "pearls", "gives_when": "node:a2",
             "give": ["The old steward unlocks the family chest. “The pearls your father kept, master. Whatever you need them for, I never saw.”"],
             "given": ["“The chest is locked again, master. No one will know.”"]},
            {"kind": "folk.noble", "near": "jeweller", "inside": True, "face": "down",
             "say": "“Pearls like these, Minister? Set in gold, they'd crown a general.”",
             "gives": "crown", "gives_when": "item:pearls",
             "give": ["“Pearls from your own house, Minister? Then the crown will be the best thing I ever made.”"],
             "given": ["“That crown was the best work of my life. I hope it went to someone worth it.”"]},
            # --- road challengers: the crown errand (before A3) --------------------------------------
            {"kind": "folk.official", "near": "lubu", "face": "left", "challenge": "runner", "when": "node:a2", "until": "2-a3",   # blocking
             "intro": ["A runner in the Chancellor's colours steps into your path. “Minister Wang, out on foot? The Grand Preceptor likes to know who walks where.”"],
             "win": ["“Nothing worth reporting, then. Good day, Minister.”"], "done": ["The runner watches you pass, and says nothing."]},
            {"kind": "folk.soldier", "near": "jeweller", "challenge": "flyingbear", "when": "node:a2", "until": "2-a3",
             "intro": ["A Flying Bear soldier lounges against the wall, dice in his fist. “Bored, old man? Play me. Lose, and you buy the wine.”"],
             "win": ["“Hah! The old man bites. Go on.”"], "done": ["“Not again, old man. My purse can't take it.”"]},
            # --- road challengers: the conspirators' errands (before A12a/A12b) ------------------------
            {"kind": "folk.soldier", "near": "huangwan", "face": "down", "challenge": "patrol", "when": "node:a11", "until": "2-a12b",   # blocking
             "intro": ["A Flying Bear patrol fills the lane to Huang Wan's gate. “Visiting late, Minister? Every lane in Chang'an answers to the Grand Preceptor.”"],
             "win": ["“On your way, then. Quickly.”"], "done": ["The patrol has moved on to the next lane."]},
            {"kind": "folk.villager", "near": "shisun", "challenge": "informer", "when": "node:a11", "until": "2-a12a",
             "intro": ["A man in a plain coat has sat by Shisun Rui's gate all morning. “A game while you wait, Minister? I have time. I have nothing but time.”"],
             "win": ["“You play like a man with nothing to hide.”"], "done": ["The man in the plain coat has gone."]},
            # --- Chang'an optionals: the old scholar, the officer in the night lane --------------------
            {"kind": "folk.elder", "near": "gotable", "challenge": "scholar", "until": "2-a17",
             "intro": ["“Sit, Minister. In this city it's safer to talk about stones than people.”"],
             "win": ["“Ha. You read the board the way you read a room.”"], "done": ["“Another day, Minister. The stones keep.”"]},
            {"kind": "folk.soldier", "near": "lanterns", "challenge": "officer", "when": "node:a5", "until": "2-a6",
             "intro": ["A Liangzhou officer steps out of a dark lane. “Out after the drum, Minister? Play me for your way home.”"],
             "win": ["“Go on, then. I never saw you.”"], "done": ["“Still out, Minister?”"]},
            # --- townsfolk: about half everyday life; lines change as the story moves -------------------
            {"kind": "folk.soldier", "near": "market", "until": "2-a14",
             "say": "“Keep to the side lanes. The middle of the avenue is the Son of Heaven's. And the Grand Preceptor's.”"},
            {"kind": "folk.villager", "near": "market", "until": "2-a14",
             "say": "“Two hundred and fifty thousand of us built Meiwu. Walls as high as these. Twenty years of grain inside, they say.”"},
            {"kind": "folk.woman", "near": "jeweller", "until": "2-a14",
             "say": "“They drove us west from Luoyang like geese. My house is ash, and here I sell turnips.”"},
            {"kind": "folk.official", "near": "hengmen", "when": "node:a1", "until": "2-a14",
             "say": "“He laughed, and went on eating. I couldn't hold my chopsticks. I still can't, some days.”"},
            {"kind": "folk.child", "until": "2-a14", "say": "“Mother says don't look at the soldiers with the long halberds.”"},
            {"kind": "folk.soldier", "near": "xf-hall", "face": "down", "until": "2-a14",
             "say": "“The Grand Preceptor receives no one today.”"},
            {"kind": "folk.soldier", "near": "lubu", "until": "2-a14",
             "say": "“In Liangzhou we ride before we walk. These Chang'an streets are too narrow for a horse to stretch.”"},
            {"kind": "folk.maiden", "near": "wy-hall", "when": "node:a5", "until": "2-a10",
             "say": "“They say Lady Diaochan went in the covered carriage, straight to the Grand Preceptor's.”"},
            {"kind": "folk.maiden", "near": "xf-bedroom", "when": "node:a6", "until": "2-a8",
             "say": "“The Grand Preceptor spent the night with the new girl and hasn't got up.”"},
            {"kind": "folk.woman", "near": "xf-bedroom", "when": "node:a6", "until": "2-a10",
             "say": "“Walk softly near the middle hall. He throws things when he's woken.”"},
            {"kind": "folk.soldier", "near": "hengmen", "when": "node:a10", "until": "2-a12",
             "say": "“General Lü stood on that ridge till the dust was gone. Didn't say a word.”"},
            {"kind": "folk.villager", "near": "market", "when": "node:a10", "until": "2-a13",
             "say": "“The Grand Preceptor's at Meiwu. The streets breathe again.”"},
            {"kind": "folk.official", "near": "palace", "when": "node:a13c", "until": "2-a14",
             "say": "“The Son of Heaven is recovered from his illness! All officials to the Weiyang Hall!”"},
            {"kind": "folk.official", "near": "north-gate", "when": "node:a13c", "until": "2-a14",
             "say": "“Why are we all wearing swords to a celebration?”"},
            {"kind": "folk.villager", "near": "market", "when": "node:a14", "until": "2-a16",
             "say": "“Sell the coat! Buy wine! The old traitor is dead!”"},
            {"kind": "folk.villager", "near": "market", "when": "node:a14", "until": "2-a16",
             "say": "“That one's for my brother, who died on the road from Luoyang.”"},
            {"kind": "folk.child", "near": "market", "when": "node:a14", "until": "2-a16", "say": "“Ten thousand years! Ten thousand years!”"},
            {"kind": "folk.official", "near": "jeweller", "when": "node:a14", "until": "2-a16",
             "say": "“I held a cup today. My hand didn't shake once.”"},
            {"kind": "folk.villager", "near": "market", "when": "node:a17",
             "say": "“The Liangzhou men are inside! Li Meng and Wang Fang opened the gates!”"},
            {"kind": "folk.woman", "near": "xuanping", "when": "node:a17", "say": "“East! Get to the Xuanping Gate, the Son of Heaven is there!”"},
            {"kind": "folk.villager", "near": "xuanping", "when": "node:a17", "say": "“I built his walls. Now his men burn mine.”"},
        ],
        "objectives": {
            "2-a1": "See the Grand Preceptor off at the Heng Gate.",
            "2-a2": "Walk out into the rear garden.",
            "2-a3": "Have the family pearls set into a gold crown, and get it to Lü Bu unseen.",
            "2-a4": "Receive Lü Bu in the rear hall.",
            "2-a5": "Dance for the Grand Preceptor in the front hall.",
            "2-a6": "Ride home past the red lanterns.",
            "2-a7": "Go to the window.",
            "2-a8": "Nurse the Grand Preceptor.",
            "2-a9": "Meet Lü Bu at the Phoenix Pavilion.",
            "2-a10": "Answer the Grand Preceptor in the middle hall.",
            "2-a11": "Find Lü Bu outside the Heng Gate.",
            "2-a12a": "Sound out Shisun Rui.",
            "2-a12b": "Sound out Huang Wan.",
            "2-a12y": "Call on Cai Yong.",
            "2-a12p": "Meet in the secret room.",
            "2-a12c": "Reach the Son of Heaven unseen.",
            "2-a12": "Bring Li Su into the plan.",
            "2-a14": "Wait at the North Side Gate.",
            "2-a15": "Walk the city.",
            "2-a15c": "Go to the victory feast in the great hall of state.",
            "2-a18": "Go to the Son of Heaven at the Xuanping Gate.",
        },
    },
    # =========================================================================================
    "Meiwu Road": {
        "archetype": "road",
        "landmarks": [
            {"kind": "building.hut", "id": "post", "label": "The thirty-li post"},
            {"kind": "camp.logs", "id": "wheel", "node": "2-a13a", "label": "The rutted bend"},
            {"kind": "rock.big", "id": "fog", "node": "2-a13b", "label": "The open plain"},
            {"kind": "camp.firepit", "id": "fields", "node": "2-a13c", "label": "The night camp outside the walls"},
            {"kind": "tree.big", "id": "taoist", "node": "2-a13d", "label": "The roadside before the city"},
        ],
        "npcs": [
            # --- road challengers: Li Su's ride out to Meiwu (before A13) --------------------------------
            {"kind": "folk.soldier", "near": "fog", "face": "left", "challenge": "roadpatrol", "when": "node:a12", "until": "2-a13",   # blocking
             "intro": ["A patrol of the Grand Preceptor's horsemen bars the road. “Rider from Chang'an! Halt, and show us what you carry.”"],
             "win": ["“An edict for the Grand Preceptor? Ride on, then, and ride fast.”"], "done": ["The patrol waves you through."]},
            {"kind": "folk.elder", "near": "post", "challenge": "postkeeper", "when": "node:a12", "until": "2-a13",
             "say": "“Thirty li to the next post, sir. Mind the ruts after the bridge.”",
             "intro": ["The post keeper has a board out on the bench. “Long nights out here. Sit a moment, sir.”"],
             "win": ["“The road's yours. Mind the ruts.”"], "done": ["“Safe road, sir.”"]},
            # --- townsfolk ---------------------------------------------------------------------------
            {"kind": "folk.villager", "near": "post", "when": "node:a12", "until": "2-a13",
             "say": "“We built Meiwu, and they sent us home with nothing but a sore back.”"},
            {"kind": "folk.villager", "near": "wheel", "when": "node:a13", "until": "2-a13c", "face": "down",
             "say": "“Heads down, heads down. Don't let him see your face.”"},
            {"kind": "folk.soldier", "near": "wheel", "when": "node:a13a", "until": "2-a13c",
             "say": "“A new carriage by noon. The Grand Preceptor says it's a sign: the new for the old.”"},
            {"kind": "folk.soldier", "near": "fog", "when": "node:a13a", "until": "2-a13b",
             "say": "“I can't see the horse in front of me. Where's the carriage?”"},
            {"kind": "folk.villager", "near": "fields", "when": "node:a13b", "until": "2-a13c",
             "say": "“Children in the fields at this hour? Whose children?”"},
        ],
        "objectives": {"2-a13a": "Ride beside the Grand Preceptor's carriage.", "2-a13b": "Find the Grand Preceptor in the fog.",
                       "2-a13c": "Follow the singing into the fields.", "2-a13d": "Ride on toward the city."},
    },
    # =========================================================================================
    "Meiwu": {
        "archetype": "town",
        "shrine": False,
        "landmarks": [
            {"kind": "building.gate", "id": "gate", "label": "The gate of Meiwu"},
            {"kind": "building.hall", "id": "hall", "label": "Dong Zhuo's hall"},
            {"kind": "building.house", "id": "mother", "near": "hall", "label": "His mother's rooms"},
            {"kind": "building.lodge", "id": "treasury", "label": "The treasury"},
            {"kind": "building.house", "id": "diaochan", "near": "hall", "label": "Diaochan's rooms"},
            {"kind": "camp.hay", "id": "granary", "label": "The granaries: twenty years of grain"},
            {"kind": "camp.hay", "id": "granary-2", "near": "granary"},
        ],
        "npcs": [
            # --- road challenger: Li Su at the gate (before A13) ---------------------------------------
            {"kind": "folk.soldier", "near": "gate", "face": "down", "challenge": "gateguard", "when": "node:a12", "until": "2-a13",   # blocking
             "intro": ["The gate captain turns the edict over in his hands. “Seals can be made in Chang'an. Prove you're who you say.”"],
             "win": ["“Pass, Commandant Li. Open the gate!”"], "done": ["The gate stands open for you."]},
            # --- road challengers: the raid, as Lü Bu (before A15m) ------------------------------------
            {"kind": "folk.soldier", "near": "treasury", "face": "down", "challenge": "straggler", "when": "node:a15", "until": "2-a15m",   # blocking
             "intro": ["One of Dong Zhuo's guards still holds the treasury door, spear levelled. “The Grand Preceptor's gold! Nobody touches it!”"],
             "win": ["“…He's dead, isn't he. Take it. Take all of it.”"], "done": ["The guard has thrown down his spear."]},
            {"kind": "folk.soldier", "near": "mother", "challenge": "bearofficer", "when": "node:a15", "until": "2-a15m",
             "intro": ["A Flying Bear officer crouches in a side court, sword half drawn. “General Lü. I always wondered which of us was better.”"],
             "win": ["“So now I know.”"], "done": ["The officer sits against the wall and does not look up."]},
            # --- townsfolk ---------------------------------------------------------------------------
            {"kind": "folk.soldier", "near": "gate", "until": "2-a14",
             "say": "“Walls as thick as Chang'an's. Nothing comes through this gate he doesn't want.”"},
            {"kind": "folk.elder", "near": "granary", "until": "2-a14",
             "say": "“Twenty years of grain. ‘If I succeed I hold the empire,’ he says, ‘and if not, I grow old here.’”"},
            {"kind": "folk.maiden", "near": "hall", "until": "2-a14",
             "say": "“They took me from my mother's door in Chang'an. Eight hundred of us, picked like peaches.”"},
            {"kind": "folk.woman", "near": "mother", "until": "2-a14",
             "say": "“The old lady is ninety. She says her flesh trembles. She hasn't slept in days.”"},
            {"kind": "folk.maiden", "near": "gate", "when": "node:a15", "say": "“The gate is open. Which road goes home?”"},
            {"kind": "folk.official", "near": "treasury", "when": "node:a15m",
             "say": "“Gold, tens of thousands of jin. Silver, millions. I've stopped counting the silk.”"},
        ],
        "objectives": {"2-a13": "Bring the edict to Dong Zhuo in his hall.", "2-a15m": "Find Diaochan."},
    },
    # =========================================================================================
    "Liangzhou": {
        "archetype": "road",
        "banners": "purple",
        "landmarks": [
            {"kind": "building.tent", "id": "camp", "node": "2-a16", "side": "W", "label": "Li Jue's camp"},
            {"kind": "building.tent", "id": "tent-2", "near": "camp", "label": "Guo Si's tent"},
            {"kind": "building.hut", "id": "v1", "node": "2-a16a", "label": "The herders' village"},
            {"kind": "building.lodge", "id": "v2", "node": "2-a16b", "label": "The walled farm"},
            {"kind": "building.house", "id": "v3", "node": "2-a16c", "label": "The post town: the pavilion"},
            {"kind": "camp.logs", "id": "road-out", "node": "2-a16m", "label": "The road east"},
            {"kind": "rock.crag", "id": "rengu", "node": "2-a17", "side": "E", "label": "The mouth of Ren Valley"},
        ],
        "npcs": [
            # --- road challengers: Jia Xu between the villages ------------------------------------------
            {"kind": "folk.elder", "near": "v2", "challenge": "headman", "when": "node:a16a", "until": "2-a16b",
             "intro": ["A headman sits on a stone by the road, a stick across his knees. “You're spreading tales from Chang'an. Convince me first.”"],
             "win": ["“…Then it's true. I'll tell the others myself.”"], "done": ["“I've told them. They're coming.”"]},
            {"kind": "folk.official", "near": "v3", "face": "left", "challenge": "constable", "when": "node:a16b", "until": "2-a16c",   # blocking
             "intro": ["The constable stands at the pavilion, arms folded. “A man without an army is just a man on a road. I've tied up better.”"],
             "win": ["“…That's no road gang behind you. That's Liangzhou.”"], "done": ["The constable has taken down his rope."]},
            # --- road challenger: Li Jue before Ren Valley -----------------------------------------------
            {"kind": "folk.soldier", "near": "rengu", "challenge": "scout", "when": "node:a16m", "until": "2-a17",
             "intro": ["A scout calls down from his post on the hill. “General! Lü Bu's dust on the east road. Want to know how many?”"],
             "win": ["“Then you know as well as I do. Ready the gongs and drums.”"], "done": ["The scout watches the east road."]},
            # --- townsfolk ---------------------------------------------------------------------------
            {"kind": "folk.soldier", "near": "camp", "until": "2-a16",
             "say": "“No pardon. The envoy came back with nothing. I'm going home to my mother.”"},
            {"kind": "folk.elder", "near": "v1", "until": "2-a16a", "say": "“Wang Yun? A man of the east. What does he know of Liangzhou?”"},
            {"kind": "folk.elder", "near": "v1", "when": "node:a16a", "say": "“Then we're dead men either way. Better on horseback.”"},
            {"kind": "folk.woman", "near": "v2", "say": "“We have a wall. Walls kept out the Qiang. Will they keep out Chang'an?”"},
            {"kind": "folk.soldier", "near": "road-out", "when": "node:a16c", "say": "“Better die marching than in our beds.”"},
        ],
        "objectives": {"2-a16": "Hear the envoy at Li Jue's camp.", "2-a16a": "Spread the word in the herders' village.",
                       "2-a16b": "Spread the word at the walled farm.", "2-a16c": "Win over the post town.",
                       "2-a16m": "March east.", "2-a17": "Hold the mouth of Ren Valley."},
    },
}

from tk_places_w2_zh import ZH_PLACES2  # noqa: E402,F401  (Plot's file: English line -> Chinese)
