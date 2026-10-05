"""Place briefs for the map factory (tools/mapfactory).

The story file (tk_story.py) already says where each story point happens
(every node has a "place"). This file says what those places are like, so
the factory can lay them out:

  archetype   the template: village, town, city, garden, road, mountain, hills, camp
  landmarks   things that must be there. A landmark with "node" hosts that
              node's story spot (the player walks up to it to play the scene).
              Nodes without a landmark get a spot at the place's centre.
  npcs        people. kind "hero.<id>" is a story character, "folk.*" townsfolk.
              "say" is what they say when you talk to them.
              A story spot's "trigger" says how its scene starts: "near" (walking
              into its area; the default), "arrive" (entering the map) or "talk"
              (pressing Enter at it, for things you'd read or use).
              A challenger ("challenge": an id) sets an optional Go problem from
              the world's pools: "intro" before the board, "win" after a
              flawless solve, "done" when you talk to them again.
              "until": a node; once it is cleared they are gone. "face": a direction.
  Lines are strings (narration) or [who, text] (a character speaks).
  A landmark with a node can have "intro" lines (before its problem opens)
  and "outro" lines (after the win, before the story scene).
  banners     colour of the banners about the place (red: Han, yellow: Yellow Turbans)
  objectives  the quest line for each node here, shown at the top of the screen

Everything is optional; a place with no brief is laid out from its name.
"""

PLACES = {
    1: {
        "Lousang Village": {
            "archetype": "village",
            "landmarks": [
                {"kind": "building.hut", "id": "home", "label": "Liu Bei's home"},
                {"kind": "tree.big", "id": "mulberry", "node": "1-start", "trigger": "arrive", "label": "The great mulberry tree"},
                # live games against real players (tk-table.js); last, so the story landmarks keep their places
                {"kind": "furniture.gotable", "id": "gotable", "use": "ogs", "label": "The travellers' go table"},
            ],
            "objectives": {"1-start": "Sit under the great mulberry tree by your home."},
            "npcs": [
                {"kind": "folk.woman", "say": "“Off to sell your sandals in town, Xuande? Mind the road.”"},
                {"kind": "folk.child", "say": "“That mulberry looks like a carriage canopy! Mother says someone from this house will ride under one.”"},
                {"kind": "folk.girl", "near": "home", "say": "“Brother Xuande! When you're rich, will you buy me a hairpin with a flower on it?”"},
                {"kind": "folk.elder", "say": "“The Yellow Turbans are burning villages in the south. Strange times.”"},
                {"kind": "folk.villager", "near": "mulberry", "challenge": "neighbour",
                 "intro": ["Your neighbour has scratched a weiqi board into the dirt under the mulberry. “Before you go to town, Xuande, one game.”"],
                 "win": ["“Ha! Sharper than your sandals. Go on, then.”"], "done": ["“Bring me back a story from town.”"]},
            ],
        },
        "Zhuo County": {
            "archetype": "town",
            "landmarks": [
                {"kind": "landmark.notice", "id": "notice", "node": "1-n1", "trigger": "talk", "label": "The notice board",
                 "intro": ["Liu Bei answers by reading the rest of the notice. Below the governor's call for volunteers is a weiqi problem: “Let any man who would lead volunteers show he can read a battle.”"]},
                {"kind": "furniture.gotable", "id": "board", "near": "notice"},
                {"kind": "building.inn", "id": "inn", "label": "The village inn"},
                {"kind": "building.shop", "id": "teahouse", "label": "The teahouse"},
                {"kind": "building.hall", "id": "office", "label": "The county office"},
                {"kind": "building.lodge", "id": "farm", "label": "Zhang Fei's farm"},
            ],
            "npcs": [
                {"kind": "folk.elder", "near": "teahouse", "say": "An old storyteller taps his clapper-board. “Sit, sit! Tales of the Yellow Heaven…”"},
                {"kind": "folk.villager", "say": "“They say the Yellow Turbans wear scarves the colour of the earth.”"},
                {"kind": "folk.woman", "say": "“Liu Bei? The sandal-seller? Kind man. Ears down to his shoulders, you know.”"},
                {"kind": "folk.lady", "near": "teahouse", "say": "“They say the volunteers march next month. Half the girls in town will be weeping at the gate.”"},
                {"kind": "folk.maiden", "near": "inn", "say": "“A man nine feet tall, with a face as red as a ripe date, just walked into the inn. Who do you suppose he is?”"},
                {"kind": "folk.villager", "near": "farm", "say": "“Zhang Fei sells wine and pork. Loud as thunder, but his heart is good.”"},
                {"kind": "folk.official", "near": "office", "say": "“The governor wants volunteers. Read the notice.”"},
                {"kind": "folk.elder", "near": "board", "challenge": "elder", "face": "down",
                 "intro": ["An old man sits over a weiqi board in the square. “You have the look of a thinker. Sit, play me one.”"],
                 "win": ["“Ha! Quick eyes. The governor could use a man like you.”"], "done": ["“Go on. I'll sit here a while yet, still thinking about that board.”"]},
                {"kind": "folk.villager", "near": "inn", "challenge": "innkeeper",
                 "intro": ["“Wine's on the house if you can solve the one my regulars can't.”"],
                 "win": ["“Well I never. Drink up, then!”"], "done": ["“Still the only one who's cracked it.”"]},
                {"kind": "folk.villager", "near": "farm", "challenge": "farmer",
                 "intro": ["“Weiqi's like farming: you claim the land, then you have to hold it. Try this.”"],
                 "win": ["“Held it, and well.”"], "done": ["“Fine soil this year.”"]},
                {"kind": "folk.noble", "near": "office", "challenge": "clerk",
                 "intro": ["A clerk from the county office looks up. “The magistrate set this one. Nobody here has solved it.”"],
                 "win": ["“Remarkable. I'll tell the magistrate a sandal-seller did it.”"], "done": ["“The magistrate still doesn't believe me.”"]},
            ],
            "banners": "red",
            "objectives": {"1-n1": "Read the notice in the town square.", "1-c1": "Go into the county town. The governor is calling for men.",
                           "1-i1": "Go into the village inn."},
        },
        "The Peach Garden": {
            "archetype": "garden",
            "landmarks": [
                {"kind": "tree.peach_big", "id": "altar", "label": "The great peach tree"},
                {"kind": "furniture.gotable", "id": "board", "near": "altar", "node": "1-n2", "label": "The weiqi board",
                 "trigger": "talk",
                 # everything the old men say comes before the board opens; when it closes they are simply gone
                 "intro": ["Under the great peach tree two old men sit over a weiqi board, one in grey, one in red.",
                           ["starred", "Three young men, come to swear before Heaven? Heaven is listening. But first, show us how you read the stones."],
                           ["stargrey", "Fortune favours the one who reads the stones."]],
                 "outro": ["When the brothers look up, the two old men are gone. Only the board remains, and a drift of petals."]},
                {"kind": "building.moongate", "id": "gate"},
            ],
            # The Star Lords of the plan (docs/three-kingdoms-plan.md), unnamed until World 11.
            "npcs": [
                {"kind": "hero.stargrey", "near": "board", "until": "1-n2", "face": "right",
                 "say": "The old man in grey studies the board and says nothing."},
                {"kind": "hero.starred", "near": "board", "until": "1-n2", "face": "left",
                 "say": "“Patience. Heaven is in no hurry.”"},
            ],
            "objectives": {"1-n2": "Sit at the old men's weiqi board under the great peach tree."},
        },
        "Road to Julu": {
            "archetype": "road",
            "landmarks": [{"kind": "building.hut", "id": "cave", "node": "1-a1", "label": "A hermit's shelter"}],
            "npcs": [{"kind": "folk.hunter", "say": "“An old man lives up in the hills. Gathers herbs. Some say he's an immortal.”"}],
            "objectives": {"1-a1": "Side story: find the old man in the hills."},
        },
        "Julu": {
            "archetype": "village",
            "banners": "yellow",
            "landmarks": [{"kind": "camp.firepit", "id": "sermon", "node": "1-a2", "label": "Where Zhang Jiao preaches"}],
            "npcs": [
                {"kind": "folk.monk", "say": "“The Way of Great Peace heals the sick. Drink the charm-water, brother.”"},
                {"kind": "folk.villager", "say": "“Half the county wears yellow now.”"},
            ],
            "objectives": {"1-a2": "Side story: hear Zhang Jiao's sermon in Julu."},
        },
        "Yellow Hills": {
            "archetype": "hills",
            "banners": "yellow",
            "landmarks": [{"kind": "building.tent", "id": "tent", "node": "1-a3", "label": "A Yellow Turban tent"}],
            "objectives": {"1-a3": "Side story: the betrayal in the Yellow Hills."},
        },
        "Horse Trail": {
            "archetype": "road",
            "landmarks": [{"kind": "camp.hay", "id": "dealers", "node": "1-as", "label": "The horse dealers' camp"}],
            "npcs": [{"kind": "folk.noble", "near": "dealers", "say": "“Fine northern horses, but the roads are full of bandits.”"}],
            "objectives": {"1-as": "Meet the horse dealers on the northern trail."},
        },
        "Daxing Mountain": {
            "archetype": "mountain",
            "banners": "yellow",
            "shrine": True,   # one of the four that light in World 1
            "landmarks": [{"kind": "rock.crag", "id": "pass", "node": "1-n3", "label": "The Yellow Turban line"}],
            "objectives": {"1-n3": "Go to Daxing Mountain. The Yellow Turbans are marching on Zhuo."},
        },
        "Qingzhou": {
            "archetype": "city",
            "banners": "red",
            "landmarks": [
                {"kind": "building.gate", "id": "citygate", "node": "1-n4", "label": "The besieged city"},
                {"kind": "rock.big", "id": "field", "node": "1-n4b", "label": "The field before the city"},
                # the two brothers go to their hills before the ambush (Guan Yu left, Zhang Fei right)
                {"kind": "rock.crag", "id": "flank_left", "label": "The left hill", "needs": ["node:n4"], "delivers": "flank_left", "when": "node:n4",
                 "empty": ["No one is on this hill yet. Hear the messenger first."],
                 "call": [["guanyu", "Brother, send me! The left hill is mine."]],
                 "deliver": [["guanyu", "A thousand men, hidden on the left. I wait for the gongs."]]},
                {"kind": "rock.crag", "id": "flank_right", "label": "The right hill", "needs": ["node:n4"], "delivers": "flank_right", "when": "node:n4",
                 "empty": ["No one is on this hill yet. Hear the messenger first."],
                 "call": [["zhangfei", "Brother, send me! Put me on the right hill."]],
                 "deliver": [["zhangfei", "The right hill is mine. I will hear the gongs from a mile off."]]},
            ],
            "npcs": [{"kind": "folk.soldier", "say": "“The rebels have us surrounded. If only someone could draw them off…”"}],
            "objectives": {"1-n4": "Hear the messenger from Qingzhou.", "1-n4b": "Lift the siege of Qingzhou."},
        },
        "Guangzong Road": {
            "archetype": "road",
            "landmarks": [{"kind": "camp.logs", "id": "cart", "node": "1-n5", "label": "A prisoner's cart"},
                          {"kind": "building.tent", "id": "luzhi-tent", "label": "Lu Zhi's tent"}],
            "objectives": {"1-n5": "Go to Guangzong, where Lu Zhi besieges Zhang Jiao.", "1-t1": "Report to Lu Zhi in his tent."},
        },
        "Qiao": {
            "archetype": "village",
            "landmarks": [{"kind": "building.hall", "id": "caohome", "node": "1-b1", "label": "The Cao family house"}],
            "objectives": {"1-b1": "Side story: the boyhood of Cao Cao."},
        },
        "Luoyang Gates": {
            "archetype": "city",
            "landmarks": [{"kind": "building.gate", "id": "northgate", "node": "1-b2", "label": "The north gate of Luoyang"}],
            "npcs": [{"kind": "folk.official", "say": "“The new commandant of the north gate beats curfew-breakers to death. Even the eunuchs' uncles.”"}],
            "objectives": {"1-b2": "Side story: Cao Cao at the gates of Luoyang.", "1-b2g": "Side story: the five-coloured staves at the city gates."},
        },
        "Changshe": {
            "archetype": "camp",
            "banners": "red",
            "landmarks": [{"kind": "building.tent", "id": "camp", "node": "1-e1", "label": "The Han camp"},
                          {"kind": "rock.big", "id": "fieldcamp", "node": "1-b3", "label": "The burnt grass"}],
            "objectives": {"1-f1": "Side story: the fire plan in the Han camp.", "1-b3": "Side story: red banners at Changshe.",
                           "1-e1": "Go to Changshe, in Yingchuan, and learn how Huangfu Song and Zhu Jun stand."},
        },
        "Envoy's Road": {
            "archetype": "road",
            "landmarks": [{"kind": "camp.table", "id": "envoy", "node": "1-bs", "label": "The envoy's rest"}],
            "objectives": {"1-bs": "Shortcut: the envoy on the road."},
        },
        "The Hills North of Guangzong": {
            "archetype": "camp",
            "banners": "red",
            "landmarks": [{"kind": "building.tent", "id": "command", "node": "1-n6", "label": "The command tent"}],
            "npcs": [{"kind": "folk.soldier", "say": "“The general is in his tent. He doesn't like visitors without rank.”"}],
            "objectives": {"1-n6": "Head home to Zhuo."},
        },
        "Hills of Black Wind": {
            "archetype": "hills",
            "banners": "yellow",
            "landmarks": [
                {"kind": "rock.big", "id": "altar", "node": "1-n7", "label": "Zhang Bao's sorcery"},
                # the shrine that lights after the first try fails (scene "shrine")
                {"kind": "landmark.shrine", "id": "shrine", "node": "1-n7b", "near": "altar", "label": "The shrine under the pine",
                 "intro": ["Under the old pine by the road, a game has been laid out on the little shrine's offering table, with wine cups and dried meat beside it."],
                 "outro": ["The old men are gone. Only the game remains."]},
                {"kind": "building.hut", "id": "pens", "label": "The farm east of the pine"},   # where the blood comes from
                # a ridge on each flank, each with room before it for a thousand men (Guan Yu left, Zhang Fei right)
                {"kind": "rock.crag", "id": "ridge_left", "label": "The left ridge", "use": "ridge", "side": "W", "clear": [8, 4],
                 "needs": ["item:pigblood", "item:sheepblood", "item:dogblood"], "delivers": "ridge_left", "when": "node:n7b",
                 "empty": ["The ridge is empty. Go to the shrine under the pine first."],
                 "waiting": [["guanyu", "We hold the ridge. The blood is still to come."]],
                 "call": [["guanyu", "Brother! Is that the blood? Up here, quickly!"]],
                 "deliver": [["guanyu", "Blood and filth for every paper horse. We wait for the gun."]]},
                {"kind": "rock.crag", "id": "ridge_right", "label": "The right ridge", "use": "ridge", "side": "E", "clear": [8, 4],
                 "needs": ["item:pigblood", "item:sheepblood", "item:dogblood"], "delivers": "ridge_right", "when": "node:n7b",
                 "empty": ["The ridge is empty. Go to the shrine under the pine first."],
                 "waiting": [["zhangfei", "A thousand men, and nothing to throw. Hurry, brother."]],
                 "call": [["zhangfei", "Brother! Is that the blood? Bring it up here!"]],
                 "deliver": [["zhangfei", "Let his spirits come. I'll soak every one."]]},
            ],
            "npcs": [
                {"kind": "folk.villager", "near": "pens", "say": "“The black wind has been bad this month.”",
                 "gives": "pigblood", "gives_when": "node:n7b",
                 "call": ["“General! The pigs' blood is ready for you!”"],
                 "give": ["“The black wind took my roof. Take the pigs' blood, if it ends this.”"],
                 "given": ["“You have my pigs' blood. Go, and stop this wind.”"]},
                {"kind": "folk.elder", "near": "pens", "say": "“Keep off the hills, general.”",
                 "gives": "sheepblood", "gives_when": "node:n7b",
                 "call": ["“General, over here! Take a sheep, if it helps.”"],
                 "give": ["“My flock hasn't grazed since the storm. Take a sheep, general. Take what you need.”"],
                 "given": ["“You've had the best of my flock, general. Go on.”"]},
                {"kind": "folk.hunter", "near": "pens", "say": "“My hounds won't go near that hill.”",
                 "gives": "dogblood", "gives_when": "node:n7b",
                 "call": ["“General! My hounds are yours, if it ends this.”"],
                 "give": ["“My hounds won't go near that hill. If their blood breaks the spell, take it.”"],
                 "given": ["“You have the dog's blood. May it do what it must.”"]},
                # once the shrine is read, the brothers and their men take the ridges
                {"kind": "hero.guanyu", "near": "ridge_left", "when": "node:n7b", "say": "“Bring the blood, brother. We hold the left.”"},
                {"kind": "hero.zhangfei", "near": "ridge_right", "when": "node:n7b", "say": "“Bring the blood, brother. We hold the right.”"},
                {"kind": "folk.soldier", "near": "ridge_left", "when": "node:n7b", "face": "down", "say": "“Waiting for the gun, sir.”"},
                {"kind": "folk.soldier", "near": "ridge_left", "when": "node:n7b", "face": "down", "say": "“A bucket each, and every man ready.”"},
                {"kind": "folk.soldier", "near": "ridge_left", "when": "node:n7b", "face": "down", "say": "“Let the paper horses come.”"},
                {"kind": "folk.soldier", "near": "ridge_right", "when": "node:n7b", "face": "down", "say": "“Waiting for the gun, sir.”"},
                {"kind": "folk.soldier", "near": "ridge_right", "when": "node:n7b", "face": "down", "say": "“A bucket each, and every man ready.”"},
                {"kind": "folk.soldier", "near": "ridge_right", "when": "node:n7b", "face": "down", "say": "“Let the paper horses come.”"},
            ],
            "objectives": {"1-n7": "Join Zhu Jun in the hills, against Zhang Bao.",
                           "1-n7b": "Go to the shrine under the old pine, where a game has been laid out."},
        },
        "Anxi": {   # Liu Bei's first post, where the inspector comes (the closing)
            "archetype": "town",
            "landmarks": [
                {"kind": "building.hall", "id": "hostel", "label": "The posting station"},   # a hall: the inspector sits high, facing south
                {"kind": "building.hall", "id": "office", "node": "1-ax2", "label": "The Anxi county office"},   # the hitching post before it
            ],
            "objectives": {"1-ax1": "Meet the inspector at the posting station.",
                           "1-ax2": "Go to the county office, where the old villagers are gathering."},
        },
        "Yangcheng": {
            "archetype": "city",
            "banners": "yellow",
            "landmarks": [{"kind": "building.hall", "id": "keep", "node": "1-boss", "label": "Zhang Bao's stronghold"}],
            "npcs": [{"kind": "hero.zhangbao", "near": "keep", "say": "“Wind and thunder answer to me!”"}],
            "objectives": {"1-boss": "Defeat Zhang Bao at Yangcheng."},
        },
    },
}

# Who you meet inside each kind of building (tools/mapfactory/interiors.py
# furnishes the rooms). Lines need Chinese in tools/tk_story_zh.py.
ROOMS = {
    "building.inn": {"people": [
        {"kind": "folk.villager", "say": "“Wine, pork, a bed for the night — we have it all.”"},
        {"kind": "folk.hunter", "say": "“They say the governor is raising volunteers. I've half a mind to join.”"},
    ]},
    "building.shop": {"people": [
        {"kind": "folk.woman", "say": "“Sit, have some tea. The storyteller starts soon.”"},
        {"kind": "folk.elder", "say": "“Another pot, and another tale of the old days.”"},
        {"kind": "folk.lady", "say": "“More tea? The storyteller's tale of the Yellow Turbans is the talk of the county.”"},
    ]},
    "building.hall": {"people": [
        {"kind": "folk.official", "say": "“This is the county office. State your business.”"},
    ]},
    "building.house": {"people": [
        {"kind": "folk.woman", "say": "“Mind the floor — I've only just swept it.”"},
    ]},
    "building.hut": {"people": [
        {"kind": "folk.elder", "say": "“It isn't much, but the roof keeps the rain off.”"},
    ]},
    "building.lodge": {"people": [
        {"kind": "folk.villager", "say": "“The harvest is in, if the rebels don't take it.”"},
    ]},
    "building.tent": {"people": [
        {"kind": "folk.soldier", "say": "“Orders come at dawn. Keep your weapon close.”"},
    ]},
}


# ---- World 2 (tk_story_w2.py) ----
import pathlib as _pl, sys as _sys  # noqa: E402
_sys.path.insert(0, str(_pl.Path(__file__).resolve().parent))
from tk_story_w2 import PLACES2 as _PLACES2  # noqa: E402
PLACES[2] = _PLACES2
from tk_story_w3 import PLACES3 as _PLACES3  # noqa: E402
PLACES[3] = _PLACES3
