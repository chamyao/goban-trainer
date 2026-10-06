# Art to generate for Book 2's maps

Written by `python3 tools/mapfactory/plans.py --world 2 --assets docs/book2/assets-needed.md` from the built maps, checked against the vocab and kits on Graphics' branch claude/tk-plot-w1 (8388cb7; rerun on main once it's merged). Each kind below is used by the plans but isn't drawn natively by every kit: a stand-in shows until its art lands, and "missing" means nothing draws it at all. Graphics generates from this list; rerun after new art to see what's left.

38 of 89 kinds need art.

| Kind | Size (tiles) | Used | genshin | jade | xianxia | Brief |
|---|---|---|---|---|---|---|
| `bridge` | ground |  in 1 map | stand-in: wood | stand-in: wood | stand-in: wood | a stone or timber bridge; the Phoenix Pavilion's is a zig-zag timber bridge |
| `building.compound` | 10×10 | 3 in 1 map | stand-in: building.hall | stand-in: building.hall | stand-in: building.hall | a walled Han residence seen from above: rammed-earth wall with grey tile coping, a gatehouse in the front wall, roofs of halls showing inside |
| `building.gatehouse` | 2×1 | 8 in 6 maps | stand-in: building.gate | stand-in: building.gate | stand-in: building.gate | a compound's gatehouse: a roofed gateway in the compound wall, double doors |
| `building.gatetower` | 3×6 | 1 in 1 map | stand-in: building.gate | stand-in: building.gate | stand-in: building.gate | a city-gate tower (Xuanping Gate): a tall timber tower on the city wall over the gate passage, stairs up its inner side |
| `building.granary` | 6×2 | 4 in 1 map | stand-in: building.lodge | stand-in: building.lodge | stand-in: building.lodge | a Han granary: long rammed-earth storehouse, thatched or tiled gable roof, raised floor, small high vents |
| `building.hall_grand` | 10×5 | 6 in 5 maps | stand-in: building.hall | stand-in: building.hall | stand-in: building.hall | a great hall of an official's residence: wide hip-and-gable roof of grey tiles, red lacquered pillars, latticed doors across the front, stone base |
| `building.hut` | 3×2 | 4 in 2 maps | drawn | stand-in: building.house | drawn |  |
| `building.palace` | 26×14 | 2 in 1 map | stand-in: building.hall | stand-in: building.hall | stand-in: building.hall | Weiyang Palace on its raised terrace: a vast hall with a double-eaved hip roof of dark grey tiles, red pillars, white stone balustrade and steps |
| `building.pavilion` | 3×3 | 2 in 2 maps | stand-in: building.moongate | stand-in: building.moongate | stand-in: building.moongate | an open-sided garden pavilion: four or six red pillars, upturned eaves, no walls; may stand on piles in a lotus pond |
| `building.pavilion_painted` | 3×3 | 1 in 1 map | stand-in: building.shop | stand-in: building.shop | stand-in: building.shop | the painted pavilion: a two-storey garden pavilion with carved, painted beams and a balcony |
| `building.posthouse` | 5×3 | 4 in 2 maps | stand-in: building.house | stand-in: building.house | stand-in: building.house | a Han post-pavilion (亭): a small walled station with a gate and a lookout, a signboard by the road |
| `building.storehouse` | 6×2 | 2 in 1 map | stand-in: building.lodge | stand-in: building.lodge | stand-in: building.lodge | a treasury storehouse: stout walls, heavy double doors with bronze fittings, tiled roof |
| `building.tent_small` | 2×2 | 1 in 1 map | stand-in: building.tent | stand-in: building.tent | stand-in: building.tent | a small square officer's tent |
| `building.wing` | 4×6 | 10 in 5 maps | stand-in: building.lodge | stand-in: building.lodge | stand-in: building.lodge | a side wing of a courtyard house: long low gable roof, lattice windows, door facing the courtyard (drawn facing E, W or S as `faces` says) |
| `camp` | ground |  in 2 maps | stand-in: dirt | stand-in: dirt | stand-in: dirt | trampled camp ground |
| `camp.banquet` | 10×2 | 1 in 1 map | stand-in: camp.table | stand-in: camp.table | stand-in: camp.table | a long banquet table under awnings, low tables and cushions in a row, wine jars |
| `cliff` | ground |  in 1 map | stand-in: sand | stand-in: sand | stand-in: sand | a loess cliff face |
| `court` | ground |  in 7 maps | stand-in: stone | stand-in: stone | stand-in: stone | a stone-flagged courtyard |
| `curtain` | ground |  in 2 maps | stand-in: wood | stand-in: wood | stand-in: wood | a hanging curtain line across a room |
| `field` | ground |  in 1 map | stand-in: grass | stand-in: grass | stand-in: grass | open meadow outside the walls, longer grass |
| `field.wheat` | ground |  in 3 maps | stand-in: sand | stand-in: sand | stand-in: sand | a wheat field in rows |
| `gallery` | ground |  in 1 map | stand-in: wood | stand-in: wood | stand-in: wood | a covered gallery: a roofed walkway with red pillars and lattice railings on both sides |
| `garden` | ground |  in 2 maps | stand-in: grass | stand-in: grass | stand-in: grass | garden ground: grass, moss, scattered stones |
| `garden.rockery` | 2×2 | 2 in 2 maps | stand-in: rock.crag | stand-in: rock.crag | stand-in: rock.crag | a garden rockery of pierced Taihu stones |
| `hills` | ground |  in 2 maps | stand-in: grass | stand-in: grass | stand-in: grass | rough hill ground, scrub |
| `landmark.heights` | 10×6 | 2 in 1 map | stand-in: rock.crag | stand-in: rock.crag | stand-in: rock.crag | a rocky height over a valley mouth, a signal post on top (gongs on one, drums on the other) |
| `landmark.ridge` | 6×2 | 1 in 1 map | stand-in: rock.small | stand-in: rock.small | stand-in: rock.small | an earthen ridge: raised bare earth with a gentle slope, grass on its flanks |
| `loess` | ground |  in 1 map | stand-in: sand | stand-in: sand | stand-in: sand | dry yellow loess ground |
| `market` | ground |  in 1 map | stand-in: dirt | stand-in: dirt | stand-in: dirt | packed earth with straw and litter, a busy market |
| `market.stalls` | 6×2 | 1 in 1 map | stand-in: building.shop | stand-in: building.shop | stand-in: building.shop | a row of market stalls with cloth awnings, baskets and goods |
| `passage` | ground |  in 2 maps | stand-in: stone | stand-in: stone | stand-in: stone | a narrow flagged passage between buildings |
| `path` | ground |  in 2 maps | stand-in: sand | stand-in: sand | stand-in: sand | a narrow garden path of pebbles or stepping stones |
| `plain` | ground |  in 1 map | stand-in: grass | stand-in: grass | stand-in: grass | open treeless grassland |
| `plateau` | ground |  in 1 map | stand-in: stone | stand-in: stone | stand-in: stone | the raised Longshou terrace: an edge of dressed stone, steps where roads climb it |
| `road` | ground |  in 4 maps | stand-in: dirt | stand-in: dirt | stand-in: dirt | a beaten-earth road; the avenue is paved, three lanes, the middle lane edged |
| `stage` | ground |  in 2 maps | stand-in: wood | stand-in: wood | stand-in: wood | a raised wooden stage floor behind a curtain |
| `wall.city` | ground |  in 2 maps | stand-in: wall | stand-in: wall | stand-in: wall | Chang'an's rammed-earth city wall, crenellated, wide enough to walk on |
| `ward` | ground |  in 1 map | stand-in: stone | stand-in: stone | stand-in: stone | the paved ground of an officials' ward |
