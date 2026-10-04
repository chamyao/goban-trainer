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
                {"kind": "tree.big", "id": "mulberry", "label": "The great mulberry tree"},
            ],
            "npcs": [
                {"kind": "folk.woman", "say": "“Off to sell your sandals in town, Xuande? Mind the road.”"},
                {"kind": "folk.child", "say": "“That mulberry looks like a carriage canopy! Mother says someone from this house will ride under one.”"},
                {"kind": "folk.elder", "say": "“The Yellow Turbans are burning villages in the south. Strange times.”"},
                {"kind": "folk.villager", "near": "mulberry", "challenge": "neighbour",
                 "intro": ["Your neighbour has scratched a weiqi board into the dirt under the mulberry. “Before you go to town, Xuande, one game.”"],
                 "win": ["“Ha! Sharper than your sandals. Go on, then.”"], "done": ["“Bring me back a story from town.”"]},
            ],
        },
        "Zhuo County": {
            "archetype": "town",
            "landmarks": [
                {"kind": "landmark.notice", "id": "notice", "node": "1-n1", "label": "The notice board",
                 "intro": ["The governor of You Province calls for volunteers against the Yellow Turbans. At the bottom, a weiqi problem: “Let any man who would lead volunteers show he can read a battle.”"]},
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
                {"kind": "folk.villager", "near": "farm", "say": "“Zhang Fei sells wine and pork. Loud as thunder, but his heart is good.”"},
                {"kind": "folk.official", "near": "office", "say": "“The governor wants volunteers. Read the notice.”"},
                {"kind": "folk.elder", "near": "board", "challenge": "elder", "face": "down",
                 "intro": ["An old man sits over a weiqi board in the square. “You have the look of a thinker. Sit, play me one.”"],
                 "win": ["“Ha! Quick eyes. The governor could use a man like you.”"], "done": ["“Come back when you've grown sharper.”"]},
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
            "objectives": {"1-n1": "Read the notice in the town square."},
        },
        "The Peach Garden": {
            "archetype": "garden",
            "landmarks": [
                {"kind": "tree.peach_big", "id": "altar", "node": "1-n2", "label": "The great peach tree",
                 "intro": ["Under the great peach tree two old men sit over a weiqi board, one in grey, one in red.",
                           ["starred", "Three young men, come to swear before Heaven? Heaven is listening. But first, show us how you read the stones."]],
                 "outro": [["stargrey", "Good. The road ahead forks, and fortune favours the one who reads it."],
                           "When the brothers look up, the two old men are gone. Only the board remains, and a drift of petals."]},
                {"kind": "furniture.gotable", "id": "board", "near": "altar"},
                {"kind": "building.moongate", "id": "gate"},
            ],
            # The Star Lords of the plan (docs/three-kingdoms-plan.md), unnamed until World 11.
            "npcs": [
                {"kind": "hero.stargrey", "near": "board", "until": "1-n2", "face": "right",
                 "say": "The old man in grey studies the board and says nothing."},
                {"kind": "hero.starred", "near": "board", "until": "1-n2", "face": "left",
                 "say": "“Patience. Heaven is in no hurry.”"},
            ],
            "objectives": {"1-n2": "Swear brotherhood under the great peach tree."},
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
            "objectives": {"1-as": "Shortcut: the horse dealers on the northern trail."},
        },
        "Daxing Mountain": {
            "archetype": "mountain",
            "banners": "yellow",
            "landmarks": [{"kind": "rock.crag", "id": "pass", "node": "1-n3", "label": "The Yellow Turban line"}],
            "objectives": {"1-n3": "Meet the Yellow Turbans at Daxing Mountain."},
        },
        "Qingzhou": {
            "archetype": "city",
            "banners": "red",
            "landmarks": [{"kind": "building.gate", "id": "citygate", "node": "1-n4", "label": "The besieged city"}],
            "npcs": [{"kind": "folk.soldier", "say": "“The rebels have us surrounded. If only someone could draw them off…”"}],
            "objectives": {"1-n4": "Lift the siege of Qingzhou."},
        },
        "Guangzong Road": {
            "archetype": "road",
            "landmarks": [{"kind": "camp.logs", "id": "cart", "node": "1-n5", "label": "A prisoner's cart"}],
            "objectives": {"1-n5": "Go to Guangzong, where Lu Zhi besieges Zhang Jiao."},
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
            "objectives": {"1-b2": "Side story: Cao Cao at the gates of Luoyang."},
        },
        "Changshe": {
            "archetype": "camp",
            "banners": "red",
            "landmarks": [{"kind": "building.tent", "id": "camp", "node": "1-b3", "label": "The Han camp"}],
            "objectives": {"1-b3": "Side story: red banners at Changshe."},
        },
        "Envoy's Road": {
            "archetype": "road",
            "landmarks": [{"kind": "camp.table", "id": "envoy", "node": "1-bs", "label": "The envoy's rest"}],
            "objectives": {"1-bs": "Shortcut: the envoy on the road."},
        },
        "Dong Zhuo's Camp": {
            "archetype": "camp",
            "banners": "red",
            "landmarks": [{"kind": "building.tent", "id": "command", "node": "1-n6", "label": "Dong Zhuo's tent"}],
            "npcs": [{"kind": "folk.soldier", "say": "“The general is in his tent. He doesn't like visitors without rank.”"}],
            "objectives": {"1-n6": "Rescue Dong Zhuo, then report at his tent."},
        },
        "Hills of Black Wind": {
            "archetype": "hills",
            "banners": "yellow",
            "landmarks": [{"kind": "rock.big", "id": "altar", "node": "1-n7", "label": "Zhang Bao's sorcery"}],
            "objectives": {"1-n7": "Break Zhang Bao's sorcery in the hills."},
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
