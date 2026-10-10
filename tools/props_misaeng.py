"""Misaeng's props (the modern book, docs/book2/misaeng-arc.md "Items"), drawn in code for tools/build_props.py.

Bag icons are item.<name> (the arc's item ids); the board room's setup props (m17) and the subway commuter's pocket
board are kinds in PROPS_MS. Each piece is about one tile (16 px) and is drawn bottom-centre on its tile.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from draw_tk_extras import Grid  # noqa: E402

PAPER, PAPER_D, INK, RED = "#f4f2ec", "#c8c4b8", "#4a4a5a", "#c8283c"
LINE = "#9aa4b4"


def _sheet(g, x, y, w, h, lines=True, col=PAPER):
    """A sheet of paper with a shaded edge and ruled lines of text."""
    g.rect(x, y, w, h, col); g.rect(x, y + h - 1, w, 1, PAPER_D); g.rect(x + w - 1, y, 1, h, PAPER_D)
    if lines:
        for ly in range(y + 2, y + h - 2, 2):
            g.rect(x + 2, ly, w - 4 - (ly % 3), 1, LINE)


def pass_card():   # a temporary visitor pass on a lanyard: a white card, a blue band, "TEMP"
    g = Grid(14, 16)
    for x, y in ((3, 0), (4, 1), (5, 2), (10, 0), (9, 1), (8, 2)):
        g.set(x, y, "#3a6a9a")
    g.rect(6, 3, 2, 2, "#b8b8c0")
    g.rect(2, 5, 10, 10, PAPER); g.rect(2, 5, 10, 3, "#3a6a9a"); g.rect(2, 14, 10, 1, PAPER_D)
    g.rect(4, 10, 6, 1, INK); g.rect(4, 12, 4, 1, LINE)
    return g.outline().image()


def id_card():   # the company ID card: photo, name lines, a red CONTRACT band across the bottom
    g = Grid(16, 12)
    g.rect(1, 1, 14, 10, PAPER); g.rect(1, 1, 14, 2, "#2e4a6a")
    g.rect(2, 4, 4, 5, "#c8d0d8"); g.ellipse(4, 5.5, 1.2, 1.2, "#e8c09a"); g.rect(3, 7, 3, 2, "#30364a")   # the photo
    g.rect(7, 4, 6, 1, INK); g.rect(7, 6, 5, 1, LINE)
    g.rect(1, 9, 14, 2, RED); g.rect(3, 9, 9, 1, "#f4c8c8")   # contract
    return g.outline().image()


def waybill_scrap():   # a torn scrap of a waybill: a ragged edge, barcode bars, a name in red
    g = Grid(16, 12)
    g.rect(1, 2, 13, 9, PAPER)
    for x, y in ((14, 3), (14, 5), (14, 8), (0, 4), (0, 7)):
        g.set(x, y, PAPER)
    for x in (1, 4, 7, 10, 13):
        g.set(x, 2, None if x % 2 else PAPER)
    g.c[2][4] = None; g.c[2][10] = None
    for x in range(3, 12, 2):
        g.rect(x, 4, 1, 3, INK)
    g.rect(3, 8, 7, 1, RED)
    return g.outline().image()


def note():   # a small folded note
    g = Grid(14, 12)
    g.rect(2, 2, 10, 8, "#f8f0b8"); g.rect(2, 2, 10, 1, "#e8d888"); g.rect(7, 2, 1, 8, "#e0d090")
    g.rect(3, 4, 3, 1, INK); g.rect(3, 6, 3, 1, INK); g.rect(9, 4, 2, 1, INK)
    return g.outline().image()


def slippers():   # a pair of office slippers, seen from above
    g = Grid(16, 14)
    for x in (2, 9):
        g.ellipse(x + 2.5, 7, 2.6, 6, "#4a4a5a"); g.rect(x, 2, 5, 4, "#2e4a6a"); g.rect(x + 1, 3, 3, 1, "#4a6a8a")
    return g.outline().image()


def homework():   # Kim Dong-sik's daily homework: a stack of sheets, a clip, red marks
    g = Grid(16, 16)
    _sheet(g, 3, 1, 11, 13, col="#e8e6e0")
    _sheet(g, 1, 2, 11, 13)
    g.rect(5, 1, 3, 3, "#9aa0a8"); g.set(9, 6, RED); g.set(10, 7, RED); g.set(9, 10, RED); g.set(10, 11, RED)
    return g.outline().image()


def report():   # the laminated report: a sheet in a glossy clear sleeve
    g = Grid(14, 16)
    g.rect(1, 1, 12, 14, "#dce8f0")
    _sheet(g, 2, 2, 10, 12)
    g.rect(3, 3, 6, 1, "#2e4a6a")
    for i in range(4):
        g.set(9 + i // 2, 5 + i, "#ffffff")   # the gloss
    return g.outline().image()


def statements():   # Baekjin's financial statements: a sheet of figures with a bar chart, one bar too tall
    g = Grid(14, 16)
    _sheet(g, 1, 1, 12, 14, lines=False)
    for i, h in enumerate((3, 4, 3, 8)):
        g.rect(3 + i * 2, 12 - h, 1, h, "#3a6a9a" if i < 3 else RED)
    g.rect(3, 3, 7, 1, INK)
    return g.outline().image()


def board_list():   # ICB's list of directors, one name circled in red
    g = Grid(14, 16)
    _sheet(g, 1, 1, 12, 14, lines=False)
    g.rect(3, 2, 6, 1, "#2e4a6a")
    for y in range(4, 13, 2):
        g.rect(3, y, 7, 1, LINE)
    g.ellipse(6.5, 10.5, 5, 1.8, RED, ring=.55)
    return g.outline().image()


def envelope():   # Kim Dong-su's white cash envelope, thick with notes
    g = Grid(16, 10)
    g.rect(1, 1, 14, 8, "#f4f2ec"); g.rect(1, 8, 14, 1, PAPER_D)
    for i in range(7):
        g.set(1 + i, 1 + i // 2, "#d8d4c8"); g.set(14 - i, 1 + i // 2, "#d8d4c8")
    g.rect(13, 2, 2, 5, "#7aa86a")   # a corner of the notes inside
    return g.outline().image()


def seating_notes():   # the seating notes: a sheet with a table plan (circles round an oval)
    g = Grid(14, 16)
    _sheet(g, 1, 1, 12, 14, lines=False)
    g.ellipse(7, 8, 3.5, 4.5, "#a8875a")
    for x, y in ((2, 5), (2, 9), (11, 5), (11, 9), (6, 2), (6, 13)):
        g.rect(x, y, 2, 1, "#3a6a9a")
    return g.outline().image()


def cash_100k():   # ₩100,000: two green ten-thousand-won notes and a paper band
    g = Grid(16, 12)
    g.rect(1, 2, 13, 7, "#8ab87a"); g.rect(3, 4, 13, 7, "#9ac88a"); g.rect(3, 10, 13, 1, "#6a985a")
    g.ellipse(11, 7.5, 2, 2, "#c8e0b8"); g.rect(5, 6, 3, 1, "#4a7a3a")
    g.rect(7, 3, 2, 8, PAPER)
    return g.outline().image()


def dried_squid():
    g = Grid(10, 16)
    g.ellipse(5, 5, 3.5, 5, "#e8c890"); g.rect(3, 0, 4, 2, "#e8c890"); g.set(2, 1, "#e8c890"); g.set(7, 1, "#e8c890")
    for x in (2, 4, 6, 8):
        g.rect(x, 9, 1, 6, "#d8b070")
    g.rect(4, 3, 2, 4, "#f4dcb0")
    return g.outline().image()


def necklace():   # a fine silver chain with a small pendant
    g = Grid(14, 14)
    g.ellipse(7, 6, 5.5, 5.5, "#d8dce4", ring=.7)
    g.c[0][6] = None; g.c[0][7] = None
    g.ellipse(7, 11.5, 1.6, 1.6, "#b8e0f0"); g.set(7, 11, "#ffffff")
    return g.outline().image()


def contract():   # the two-year contract: two pages, a signature line and a red seal
    g = Grid(14, 16)
    _sheet(g, 3, 1, 10, 13, col="#e8e6e0")
    _sheet(g, 1, 2, 10, 13)
    g.rect(3, 12, 5, 1, INK); g.ellipse(9, 12, 1.5, 1.5, RED)
    return g.outline().image()


def icb_listing():   # ICB's registration papers: a stamped certificate with a seal and a clipped photo-copy behind
    g = Grid(14, 16)
    _sheet(g, 3, 1, 10, 13, col="#e8e6e0")
    _sheet(g, 1, 2, 10, 13, lines=False)
    g.rect(3, 4, 6, 1, "#2e4a6a")
    for y in (6, 8, 10):
        g.rect(3, y, 5, 1, LINE)
    g.ellipse(8, 12, 1.6, 1.6, RED)
    return g.outline().image()


def icb_call():   # a phone-call memo: a pink message slip with a phone glyph and a scribbled number
    g = Grid(16, 12)
    g.rect(1, 1, 14, 10, "#f4c8d0"); g.rect(1, 1, 14, 2, "#d87a8a"); g.rect(1, 10, 14, 1, "#d8a8b0")
    g.rect(3, 4, 2, 4, "#2a2a34"); g.set(5, 4, "#2a2a34"); g.set(5, 7, "#2a2a34")
    for x in range(7, 14, 2):
        g.rect(x, 5, 1, 2, INK)
    g.rect(7, 8, 6, 1, LINE)
    return g.outline().image()


def coached():   # a page of coaching notes: handwritten lines, an arrow, a question underlined
    g = Grid(14, 16)
    _sheet(g, 1, 1, 12, 14, lines=False)
    for y in (3, 5, 7):
        g.rect(3, y, 6 + (y % 3), 1, "#3a3a8a")
    g.rect(3, 10, 6, 1, "#3a3a8a"); g.rect(3, 11, 6, 1, RED); g.set(10, 9, RED); g.set(11, 10, RED); g.set(10, 11, RED)
    return g.outline().image()


def james_park():   # a business card reading "James Park": a white card, a name line, a small logo
    g = Grid(16, 10)
    g.rect(1, 1, 14, 8, PAPER); g.rect(1, 8, 14, 1, PAPER_D)
    g.rect(3, 3, 7, 1, "#1c1418"); g.rect(3, 5, 5, 1, LINE); g.rect(3, 6, 4, 1, LINE)
    g.ellipse(12, 4, 1.6, 1.6, "#2e6ab0")
    return g.outline().image()


def green_tea():   # a paper cup of green tea, the tag of the bag hanging over the rim
    g = Grid(10, 12)
    g.rect(2, 2, 6, 9, "#f4f2ec"); g.rect(2, 2, 6, 1, "#8ab05a"); g.rect(2, 10, 6, 1, PAPER_D); g.rect(2, 5, 6, 2, "#6a9a4a")
    g.set(8, 2, "#c8c4b8"); g.rect(8, 3, 1, 3, "#c8c4b8"); g.rect(8, 6, 2, 2, "#8ab05a")
    return g.outline().image()


def copies():   # a sheaf of photocopies, slightly fanned, still warm
    g = Grid(14, 16)
    _sheet(g, 3, 1, 10, 13, col="#e8e6e0")
    _sheet(g, 2, 2, 10, 13, col="#eeece6")
    _sheet(g, 1, 3, 10, 12)
    return g.outline().image()


def ring_file():   # a ring binder with a label on its spine
    g = Grid(14, 16)
    g.rect(2, 1, 10, 14, "#2e4a8a"); g.rect(2, 1, 3, 14, "#22386a"); g.rect(3, 4, 1, 4, "#f4f2ec")
    g.rect(6, 4, 4, 3, "#f4f2ec"); g.rect(12, 2, 1, 12, "#e8e6e0")
    return g.outline().image()


def notebooks():   # worn field notebooks, a stack of three, dog-eared, a pen clipped on
    g = Grid(16, 14)
    for i, (c, hi) in enumerate((("#6a4a32", "#8a6a52"), ("#3a5a3a", "#5a7a5a"), ("#8a6a4a", "#a88a6a"))):
        g.rect(2 + i, 9 - i * 3, 12, 4, c); g.rect(2 + i, 9 - i * 3, 12, 1, hi); g.rect(13 + i, 10 - i * 3, 1, 2, PAPER)
    g.rect(11, 2, 1, 6, "#2a2a34")
    return g.outline().image()


def somi_drawing():   # Somi's crayon drawing: a woman seen from behind, a sun, wobbly crayon lines
    g = Grid(16, 14)
    g.rect(1, 1, 14, 12, PAPER); g.rect(1, 12, 14, 1, PAPER_D)
    g.ellipse(12, 3.5, 1.6, 1.6, "#f4c020")
    g.ellipse(7, 5, 2, 2, "#2a2024"); g.rect(5, 7, 5, 5, "#e8742a")      # dark hair from behind, an orange coat
    g.set(5, 12, "#2a2024"); g.set(9, 12, "#2a2024")
    g.rect(2, 11, 3, 1, "#5aa83a")
    return g.outline().image()


# the board room's setup (m17): placeable props
def tray():   # a lacquer tray with two cups and a carafe
    g = Grid(16, 10)
    g.ellipse(8, 6, 7.5, 3.5, "#5a3a2a"); g.ellipse(8, 5.5, 6.5, 2.6, "#7a4a32")
    g.rect(3, 2, 3, 4, "#f4f2ec"); g.rect(10, 2, 3, 4, "#f4f2ec"); g.rect(7, 0, 2, 5, "#c8dcec")
    return g.outline().image()


def pens():   # two pens laid side by side on a notepad
    g = Grid(14, 12)
    g.rect(2, 2, 10, 8, PAPER); g.rect(2, 9, 10, 1, PAPER_D)
    for i, col in enumerate(("#2a2a34", "#2e4a8a")):
        for k in range(9):
            g.set(3 + k, 7 - k // 3 + i * 2 - 2, col)
    return g.outline().image()


def cup():   # a drinks cup: a white mug of coffee
    g = Grid(10, 10)
    g.rect(1, 2, 6, 7, "#f4f2ec"); g.rect(1, 2, 6, 1, "#6a4a2a"); g.rect(1, 8, 6, 1, PAPER_D)
    g.rect(7, 4, 2, 1, "#f4f2ec"); g.rect(8, 4, 1, 3, "#f4f2ec"); g.rect(7, 6, 2, 1, "#f4f2ec")
    return g.outline().image()


def water():   # a bottle of water
    g = Grid(8, 16)
    g.rect(3, 0, 2, 2, "#3a6ab0"); g.rect(2, 2, 4, 2, "#c8e0f0"); g.rect(1, 4, 6, 11, "#b8d8f0")
    g.rect(1, 7, 6, 3, "#3a8ac8"); g.rect(2, 5, 1, 9, "#e8f4fc")
    return g.outline().image()


def pocket_board():   # the subway commuter's magnetic pocket go board, open, a few stones on it
    g = Grid(16, 14)
    g.rect(1, 1, 14, 12, "#d8b070"); g.rect(1, 12, 14, 1, "#a87a40")
    for i in range(3, 14, 2):
        g.rect(i, 2, 1, 10, "#7a5a2a"); g.rect(2, i - 1, 12, 1, "#7a5a2a")
    for x, y, c in ((5, 4, "#1c1418"), (7, 6, "#f4f2ec"), (9, 4, "#1c1418"), (7, 8, "#1c1418"), (9, 8, "#f4f2ec")):
        g.rect(x - 1, y - 1, 2, 2, c)
    return g.outline().image()


# Plot's item ids (tools/tk_story_w21.py); glue_stick, hand_mirror, icb_number and resignation were dropped from the story
ITEMS = {
    "pass": pass_card, "id_card": id_card, "waybill_scrap": waybill_scrap, "note": note, "slippers": slippers,
    "homework": homework, "report": report, "statements": statements, "board_list": board_list, "envelope": envelope,
    "seating_notes": seating_notes, "cash_100k": cash_100k, "dried_squid": dried_squid, "necklace": necklace,
    "contract": contract, "icb_listing": icb_listing, "icb_call": icb_call, "coached": coached,
    "james_park": james_park, "water": lambda: water(), "green_tea": green_tea, "coffee": lambda: cup(),
    # Book 1
    "copy": copies, "file": ring_file, "notebook": notebooks, "somi_drawing": somi_drawing,
}
KINDS = {"ms_tray": tray, "ms_pens": pens, "ms_cup": cup, "ms_water": water, "ms_pocketboard": pocket_board}


def frames():
    out = {f"item.{k}": f() for k, f in ITEMS.items()}
    out.update({k: f() for k, f in KINDS.items()})
    return out


PROPS_MS = {k: {"size": [1, 1], "atlas": k} for k in KINDS}
