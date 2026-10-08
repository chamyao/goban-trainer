#!/usr/bin/env python3
"""Render a story world as a readable bilingual script (Markdown), for review.

    python3 tools/tk_script_md.py WORLD2_CC docs/book2/caocao-script.md "The Cao Cao arc"
    python3 tools/tk_script_md.py WORLD2 docs/book2/diaochan-script.md "The Diaochan arc"

Reads tools/tk_story_w2_new.py. Narration is in italics, each line followed by its Chinese.
**▶ GO PROBLEM** marks where a board is posed; stills are shown in brackets; a party step shows who the player becomes.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tk_story_w2_new as story  # noqa: E402

# Display names for speakers and leads (English, Chinese). Anything missing falls back to the id.
NAMES = {
    "caocao": ("Cao Cao", "曹操"), "hejin": ("He Jin", "何进"), "yuanshao": ("Yuan Shao", "袁绍"), "chenlin": ("Chen Lin", "陈琳"),
    "luzhi": ("Lu Zhi", "卢植"), "xiandi": ("Emperor Xian", "献帝"), "chenliu": ("the Prince of Chenliu", "陈留王"), "cuiyi": ("Cui Yi", "崔毅"),
    "dongzhuo": ("Dong Zhuo", "董卓"), "liru": ("Li Ru", "李儒"), "dingyuan": ("Ding Yuan", "丁原"), "lvbu": ("Lü Bu", "吕布"),
    "lisu": ("Li Su", "李肃"), "wangyun": ("Wang Yun", "王允"), "dingguan": ("Ding Guan", "丁管"), "caiyong": ("Cai Yong", "蔡邕"),
    "wufu": ("Wu Fu", "伍孚"), "chengong": ("Chen Gong", "陈宫"), "lvboshe": ("Lü Boshe", "吕伯奢"), "weihong": ("Wei Hong", "卫弘"),
    "xiahoudun": ("Xiahou Dun", "夏侯惇"), "diaochan": ("Diaochan", "貂蝉"), "zhangwen": ("Zhang Wen", "张温"),
    "shisunrui": ("Shisun Rui", "士孙瑞"), "huangwan": ("Huang Wan", "黄琬"), "dongmu": ("Dong Zhuo's mother", "董母"),
    "mamidi": ("Ma Midi", "马日磾"), "lijue": ("Li Jue", "李傕"), "guosi": ("Guo Si", "郭汜"), "jiaxu": ("Jia Xu", "贾诩"),
    "daoren": ("the Taoist", "道人"), "huangfusong": ("Huangfu Song", "皇甫嵩"),
    "yanshi": ("Lady Yan", "嚴氏"), "chendeng": ("Chen Deng", "陳登"), "chengui": ("Chen Gui", "陳珪"), "hanyin": ("Han Yin", "韓胤"),
    "jiling": ("Ji Ling", "紀靈"), "houcheng": ("Hou Cheng", "侯成"), "songxian": ("Song Xian", "宋憲"), "weixu": ("Wei Xu", "魏續"),
    "zhangliao": ("Zhang Liao", "張遼"), "mizhu": ("Mi Zhu", "糜竺"), "liubei": ("Liu Bei", "劉備"), "guanyu": ("Guan Yu", "關羽"),
    "zhangfei": ("Zhang Fei", "張飛"), "lvnv": ("Lü Bu's daughter", "呂布之女"), "pangshu": ("Pang Shu", "龐舒"),
}


def name(who):
    return NAMES.get(who, (who, ""))[0]


def render(world, title):
    zh = story.ZH2
    nodes = {n["key"]: n for n in world["nodes"]}
    order = [world["edges"][0][0]] + [b for _, b in world["edges"]]
    out = [f"# {title}: script (generated from tools/tk_story_w2_new.py by tools/tk_script_md.py)", "",
           "Narration in italics. **▶ GO PROBLEM** marks where a board is posed. Stills in brackets.", ""]
    for st in world.get("opening", []):
        if st[0] == "scroll":
            out += [f"## Opening scroll: {st[1]}", ""]
            out += [f"> {line}  \n> {zh.get(line, '')}" for line in st[2]] + [""]
    for key in order:
        n = nodes[key]
        sc = world["scenes"][n["scene"]]
        dil = n.get("dilemma")
        dils = dil if isinstance(dil, list) else ([dil] if dil else [])
        boards = " / ".join(f"**{name(d['who'])}**: “{d['q']}”" for d in dils)
        head = f"*{n['place']}*" + (f" · room `{n['room']}`" if n.get("room") else "")
        head += f" · boards: {boards}" if dils else " · no board"
        if n.get("role") == "boss":
            head += " · **BOSS**"
        out += ["", f"## {key.upper()} · {sc['title']} ({zh.get(sc['title'], '')})", head, ""]
        for g in n.get("gate", []) or []:
            out += [f"- Gate: needs {', '.join(g['needs'])}. Objective: {g.get('objective', '')}"]
        if n.get("gate"):
            out.append("")
        for st in sc["steps"]:
            k = st[0]
            if k == "n":
                out += [f"*{st[1]}*  ", zh.get(st[1], ""), ""]
            elif k == "say":
                out += [f"**{name(st[1])}:** {st[2]}  ", zh.get(st[2], ""), ""]
            elif k == "problem":
                out += ["**▶ GO PROBLEM**", ""]
            elif k == "still":
                out += [f"[still: `{st[1]}`]", ""]
            elif k == "gain":
                out += [f"*(gained: {st[1]})*", ""]
            elif k == "give":
                out += [f"*({name(st[1])} gives {st[3]} to {st[2]})*", ""]
            elif k == "party" and sc is not None:
                if st[1] != world.get("party") or key != order[0]:
                    out += [f"*(the player is now: {' and '.join(name(w) for w in st[1])})*", ""]
    return "\n".join(out).rstrip() + "\n"


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    world = getattr(story, sys.argv[1])
    Path(sys.argv[2]).write_text(render(world, sys.argv[3]), encoding="utf-8")
    print("wrote", sys.argv[2])


if __name__ == "__main__":
    main()
