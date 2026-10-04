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
            ],
        },
        "Zhuo County": {
            "archetype": "town",
            "landmarks": [
                {"kind": "landmark.notice", "id": "notice", "node": "1-n1", "label": "The notice board"},
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
            ],
            "banners": "red",
            "objectives": {"1-n1": "Read the notice in the town square."},
        },
        "The Peach Garden": {
            "archetype": "garden",
            "landmarks": [
                {"kind": "tree.peach_big", "id": "altar", "node": "1-n2", "label": "The great peach tree"},
                {"kind": "building.moongate", "id": "gate"},
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
