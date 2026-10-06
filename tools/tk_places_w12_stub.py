"""Stand-in places for the Book 2 draft (test world 12) until the Places
session's tk_places_w2.py lands: just the buildings the draft's rooms need."""

H = "building.hall"
PLACES12 = {
    "Chang'an": {
        "archetype": "city",
        "landmarks": [
            {"kind": H, "id": "wy-hall", "label": "Wang Yun's house"},
            {"kind": "building.house", "id": "wy-rearhall", "label": "Wang Yun's rear hall", "near": "wy-hall"},
            {"kind": "building.house", "id": "wy-garden", "label": "Wang Yun's garden pavilion", "near": "wy-hall"},
            {"kind": "building.house", "id": "wy-secret", "label": "Wang Yun's secret room", "near": "wy-hall"},
            {"kind": H, "id": "xf-hall", "label": "Dong Zhuo's mansion"},
            {"kind": "building.house", "id": "xf-bedroom", "label": "Dong Zhuo's inner rooms", "near": "xf-hall"},
            {"kind": "building.house", "id": "xf-garden", "label": "The Phoenix Pavilion", "near": "xf-hall"},
            {"kind": H, "id": "dutang", "label": "The Capital Office"},
            {"kind": "building.house", "id": "caiyong", "label": "Cai Yong's house"},
        ],
    },
    "Meiwu": {
        "archetype": "town",
        "landmarks": [
            {"kind": H, "id": "hall", "label": "Meiwu hall"},
            {"kind": "building.house", "id": "treasury", "label": "The Meiwu treasury", "near": "hall"},
        ],
    },
    "Meiwu Road": {"archetype": "road"},
    "Liangzhou": {"archetype": "camp"},
}
