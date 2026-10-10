# Art to generate for Book hlm1's maps

Written by `python3 tools/mapfactory/plans.py --world 20 --assets redchamber/book1/assets-needed.md` from the built maps. Each kind below is used by the plans but isn't drawn natively by every kit: a stand-in (a vocab fallback) shows until its art lands, and "missing" means nothing draws it at all. Graphics generates from this list; rerun after new art to see what's left.

21 of 72 kinds need art.

| Kind | Size (tiles) | Used | genshin | jade | xianxia | Brief |
|---|---|---|---|---|---|---|
| `building.blackgate` | 2×1 | 2 in 2 maps | stand-in: building.gate | stand-in: building.gatehouse | stand-in: building.gate | a mansion's gate with black-lacquered leaves (黑油大门) and brass studs under a grey tiled roof, set in a high wall; two tiles wide, the same view as the gatehouses |
| `building.festoongate` | 2×2 | 1 in 1 map | stand-in: building.gate | stand-in: building.gatehouse | stand-in: building.gate | a Chinese 'festooned gate' (垂花门) set in a whitewashed courtyard wall: a small gabled roof of grey tiles over a red-lacquered doorway, carved hanging pillars ending in painted lotus-bud pendants at the front corners, green and gold painted beams; two tiles wide, the same 3/4 view as the gatehouses, the opening walkable |
| `building.gatehouse` | 2×1 | 14 in 3 maps | stand-in: building.gate | drawn | stand-in: building.gate | a compound's gatehouse: a roofed gateway in the compound wall, double doors |
| `building.halfgate` | 2×2 | 1 in 1 map | stand-in: building.gate | stand-in: building.gatehouse | stand-in: building.gate | a small plain gate in a whitewashed courtyard wall, half the height of a court gate (半大门), dark red leaves standing open, a little tiled roof; two tiles wide, walkable through |
| `building.hall_grand` | 10×5 | 5 in 2 maps | stand-in: building.hall | drawn | stand-in: building.hall | a great hall of an official's residence: wide hip-and-gable roof of grey tiles, red lacquered pillars, latticed doors across the front, stone base |
| `building.wing` | 6×4 | 2 in 1 map | stand-in: building.lodge | drawn | stand-in: building.lodge | a side wing of a courtyard house: long low gable roof, lattice windows, door facing the courtyard (drawn facing E, W or S as `faces` says) |
| `furn.clock` | 1×1 | 1 in 1 map | stand-in: furn.drawers | stand-in: furn.drawers | stand-in: furn.drawers | a western striking clock (自鸣钟) in a carved box hung on a red pillar, a brass pendulum weight below it; one tile wide, drawn two tiles tall, the pillar to the floor |
| `furn.curtain` | 1×1 | 2 in 2 maps | stand-in: furn.screen | stand-in: furn.screen | stand-in: furn.screen | a hanging bead curtain across part of a room |
| `furn.cushion` | 1×1 | 1 in 1 map | stand-in: furn.seat | stand-in: furn.seat | stand-in: furn.seat | a brocade seat cushion (锦褥), deep red with gold roundels, flat on the kang or floor; one tile |
| `furn.gauze` | 3×1 | 1 in 1 map | stand-in: furn.screen | stand-in: furn.screen | stand-in: furn.screen | a partition of green gauze (碧纱橱) stretched in a carved red-lacquer frame, the bed glimpsed through it; three tiles wide, walked round, not through |
| `furn.handwarmer` | 1×1 | 1 in 1 map | stand-in: furn.jar | stand-in: furn.jar | stand-in: furn.jar | a little round brass hand-warmer (手炉) with a pierced lid and a pair of tiny brass tongs on a kang table; one tile |
| `furn.hearth` | 2×1 | 1 in 1 map | drawn | stand-in: camp.cookfire | drawn |  |
| `furn.kang` | 3×2 | 8 in 7 maps | stand-in: furn.bed | stand-in: furn.bed | stand-in: furn.bed | a kang (炕) seen from the room: a raised platform of brick under a red felt rug, a low lacquered kang table on it with tea things, bolsters at the back; three tiles wide, two deep |
| `furn.plaque` | 3×1 | 1 in 1 map | stand-in: furn.screen | stand-in: furn.screen | stand-in: furn.screen | a great horizontal plaque (匾) on the back wall: blue ground, a frame of gold dragons, three large gold characters; three tiles wide, hung high |
| `landmark.stonelion` | 2×2 | 4 in 1 map | stand-in: rock.big | stand-in: rock.big | stand-in: rock.big | a great grey stone guardian lion (石狮子) crouching on a carved plinth, mouth open, one paw on a ball; two tiles square, as tall as a person and a half; a pair flanks a mansion gate |
| `prop.bench` | 4×1 | 1 in 1 map | stand-in: furn.counter | stand-in: furn.counter | stand-in: furn.counter | a long plain wooden bench (大板凳) set against a wall by a gate, four tiles long |
| `prop.birdcage` | 1×1 | 14 in 1 map | stand-in: prop.lanterns | stand-in: prop.lanterns | stand-in: prop.lanterns | a round bamboo bird cage with a green parrot in it, hung from a hook; one tile, drawn at head height under the eaves of a covered walk |
| `prop.greencart` | 3×2 | 2 in 2 maps | stand-in: prop.carriage | stand-in: prop.carriage | stand-in: prop.carriage | a covered carriage (翠幄青绸车): a two-wheeled cart with a green silk canopy and curtains, no horse (it is led off), shafts resting on the ground; three tiles long, two deep |
| `prop.sedan` | 2×2 | 5 in 2 maps | stand-in: prop.carriage | stand-in: prop.carriage | stand-in: prop.carriage | a Qing sedan chair (轿子) set down: a box of dark wood with a curtained front and gauze side windows, a little domed roof, two long carrying poles resting on the ground; two tiles square |
| `prop.toyload` | 2×1 | 2 in 1 map | stand-in: furn.sacks | stand-in: furn.sacks | stand-in: furn.sacks | a hawker's carrying pole set down with two flat baskets of toys: clay figures, little drums, paper windmills, sugar figures; two tiles wide |
| `wall.lattice` | ground |  in 1 map | stand-in: wall | stand-in: wall | stand-in: wall | a lattice wall: wooden lattice panels you can see through but not walk through |
