# Art to generate for Misaeng's maps (Book 1, world 21; the other books add theirs)

Written by `python3 tools/mapfactory/plans.py --world 21 --assets docs/book2/assets-needed-ms.md` from the built maps. Each kind below is used by the plans but isn't drawn natively by every kit: a stand-in (a vocab fallback) shows until its art lands, and "missing" means nothing draws it at all. Graphics generates from this list; rerun after new art to see what's left.

57 of 82 kinds need art.

| Kind | Size (tiles) | Used | genshin | jade | seoul | xianxia | Brief |
|---|---|---|---|---|---|---|---|
| `asphalt` | ground |  in 2 maps | stand-in: stone | stand-in: stone | drawn | stand-in: stone | a Seoul carriageway: dark asphalt, white lane lines and dashes, a yellow centre line; tiles that join into a road four or more tiles wide |
| `barrier` | ground |  in 1 map | stand-in: wall | stand-in: wall | drawn | stand-in: wall | an office lobby's ID speed gates: waist-high steel posts with glass flaps between them, a card reader on each post; a 1-tile gap is the way through |
| `building.apartment` | 8×4 | 1 in 1 map | stand-in: building.hall | stand-in: building.hall | drawn | stand-in: building.hall | a slab of Korean flats (아파트): white and pale grey, a big block number painted on the side, balconies with glass, a lobby door at the foot |
| `building.gatehouse` | 2×1 | 2 in 2 maps | stand-in: building.gate | drawn | drawn | stand-in: building.gate | a compound's gatehouse: a roofed gateway in the compound wall, double doors |
| `building.office_block` | 6×3 | 9 in 2 maps | stand-in: building.hall | stand-in: building.hall | drawn | stand-in: building.hall | a small 4-5 storey Seoul office building: tiled or concrete front, rows of windows, a glass door at the bottom centre with a signboard over it, an AC unit or two |
| `building.office_tower` | 12×5 | 1 in 1 map | stand-in: building.hall | stand-in: building.hall_grand | drawn | stand-in: building.hall | a modern glass-and-steel office tower in central Seoul, 2012: blue-grey curtain wall, a granite base with revolving doors on the front, the company name in steel letters over the entrance (ONE INTERNATIONAL); drawn tall (it rises far above its footprint), same 3/4 view |
| `building.pavilion` | 3×3 | 1 in 1 map | stand-in: building.moongate | drawn | drawn | stand-in: building.moongate | an open-sided garden pavilion: four or six red pillars, upturned eaves, no walls; may stand on piles in a lotus pond |
| `building.pojangmacha` | 3×2 | 1 in 1 map | stand-in: building.tent | stand-in: building.tent | drawn | stand-in: building.tent | a pojangmacha: an orange tarp tent bar on the pavement, lit from inside, plastic stools, a steaming cart; the flap open at the front |
| `building.rooftop_box` | 3×2 | 1 in 1 map | stand-in: building.hut | stand-in: building.hut | drawn | stand-in: building.hut | a rooftop stairhouse and lift motor room: a concrete box, a steel door, vents |
| `building.storefront` | 4×2 | 16 in 4 maps | stand-in: building.shop | stand-in: building.shop | drawn | stand-in: building.shop | a Seoul street-level shop: a big bright signboard (hangul), glass front with posters, a rolled-up shutter, a floor of flats above; one sprite that reads as any small shop |
| `building.subway_entrance` | 3×2 | 2 in 2 maps | stand-in: building.gate | stand-in: building.gate | drawn | stand-in: building.gate | a Seoul subway entrance: stairs going down under a glass canopy, a blue sign with the line number and station name on a post beside it |
| `building.villa` | 5×3 | 11 in 3 maps | stand-in: building.house | stand-in: building.house | drawn | stand-in: building.house | a red-brick multi-family villa (빌라) of a Seoul hillside neighbourhood: 3-4 storeys, small balconies with laundry, a door at the foot with a number plate, a satellite dish |
| `carpet` | ground |  in 7 maps | stand-in: stone | stand-in: stone | drawn | stand-in: stone | an office floor of grey-blue carpet tiles, a faint grid |
| `crosswalk` | ground |  in 1 map | stand-in: road | stand-in: road | drawn | stand-in: road | a zebra crossing: broad white stripes across dark asphalt, running the short way across the road |
| `folk.ajumma` | — |  in 7 maps | stand-in: folk.villager | stand-in: folk.villager | drawn | stand-in: folk.villager | a middle-aged Korean woman: permed short hair, a quilted vest or a cardigan, an apron or a shopping trolley |
| `folk.grandpa` | — |  in 2 maps | stand-in: folk.villager | stand-in: folk.villager | drawn | stand-in: folk.villager | an old Korean man of Tapgol Park: flat cap or bare grey head, a padded jacket or a cardigan, slacks |
| `folk.kid` | — |  in 3 maps | stand-in: folk.villager | stand-in: folk.villager | drawn | stand-in: folk.villager | a Korean child of 6-12: a backpack, trainers, a school uniform or play clothes |
| `folk.officewoman` | — |  in 8 maps | stand-in: folk.villager | stand-in: folk.villager | drawn | stand-in: folk.villager | a Korean office worker, 2012: a skirt or trouser suit, blouse, lanyard ID card, low heels; a few variants (hair up or down, a folder, a coffee) |
| `folk.salaryman` | — |  in 10 maps | stand-in: folk.villager | stand-in: folk.villager | drawn | stand-in: folk.villager | a Korean office worker, 2012: dark suit, white shirt, lanyard ID card, black shoes; a few variants (tie or none, glasses, a briefcase or a phone) |
| `furn.ashtray` | 1×1 | 1 in 1 map | stand-in: furn.jar | stand-in: furn.jar | drawn | stand-in: furn.jar | a standing steel ashtray, the smokers' corner |
| `furn.bin` | 1×1 | 2 in 1 map | stand-in: furn.barrel | stand-in: furn.barrel | drawn | stand-in: furn.barrel | office recycling bins in a row: paper, cans, general (blue, yellow, grey) |
| `furn.chair` | 1×1 | 4 in 1 map | stand-in: furn.stool | stand-in: furn.stool | drawn | stand-in: furn.stool | a black office chair on castors |
| `furn.copier` | 2×1 | 1 in 1 map | stand-in: furn.drawers | stand-in: furn.drawers | drawn | stand-in: furn.drawers | an office copier, its lid up, paper stacked beside it |
| `furn.exec_desk` | 3×1 | 3 in 3 maps | stand-in: furn.desk | stand-in: furn.desk | drawn | stand-in: furn.desk | a department head's or executive's desk: big, dark wood, a leather chair behind, a name plate |
| `furn.filing` | 1×1 | 3 in 2 maps | stand-in: furn.drawers | stand-in: furn.drawers | drawn | stand-in: furn.drawers | a grey steel filing cabinet |
| `furn.fridge_case` | 2×1 | 4 in 2 maps | stand-in: furn.shelf | stand-in: furn.shelf | drawn | stand-in: furn.shelf | a glass-door drinks fridge, lit |
| `furn.go_board` | 1×1 | 19 in 2 maps | stand-in: furniture.gotable | stand-in: furniture.gotable | drawn | stand-in: furniture.gotable | a go board on the floor (a thick wooden board on legs), a cushion on either side, bowls of stones |
| `furn.kid_mat` | 2×1 | 2 in 1 map | stand-in: furn.rug | stand-in: furn.rug | drawn | stand-in: furn.rug | a padded play mat in bright colours |
| `furn.lectern` | 1×1 | 1 in 1 map | stand-in: furn.stool | stand-in: furn.stool | drawn | stand-in: furn.stool | a lectern with a microphone |
| `furn.lift_door` | 2×1 | 8 in 7 maps | stand-in: furn.screen | stand-in: furn.screen | drawn | stand-in: furn.screen | a lift's brushed steel doors, the floor number lit above them |
| `furn.low_table` | 2×1 | 7 in 4 maps | stand-in: furn.table | stand-in: furn.table | drawn | stand-in: furn.table | a low wooden table you sit at on the floor (상), set with dishes |
| `furn.meeting_table` | 4×2 | 7 in 4 maps | stand-in: furn.table | stand-in: furn.table | drawn | stand-in: furn.table | a long meeting table with chairs round it, a jug of water, notepads |
| `furn.noticeboard` | 2×1 | 3 in 3 maps | stand-in: landmark.notice | stand-in: landmark.notice | drawn | stand-in: landmark.notice | a cork noticeboard with sheets pinned to it |
| `furn.office_desk` | 2×1 | 31 in 4 maps | stand-in: furn.desk | stand-in: furn.desk | drawn | stand-in: furn.desk | an office desk: a grey top, a monitor and keyboard, papers, a mug, a black office chair pulled up; seen at the same 3/4 angle as furn.desk |
| `furn.plastic_table` | 1×1 | 3 in 1 map | stand-in: furn.table | stand-in: furn.table | drawn | stand-in: furn.table | a round red or blue plastic table with soju bottles and a dish on it |
| `furn.projector_screen` | 3×1 | 2 in 2 maps | stand-in: furn.screen | stand-in: furn.screen | drawn | stand-in: furn.screen | a pull-down projector screen, a slide lit on it |
| `furn.reception` | 4×1 | 2 in 2 maps | stand-in: furn.counter | stand-in: furn.counter | drawn | stand-in: furn.counter | a lobby front desk: a long counter in pale stone with the company logo on its front |
| `furn.sofa` | 2×1 | 6 in 5 maps | stand-in: furn.bed | stand-in: furn.bed | drawn | stand-in: furn.bed | a two-seat sofa in dark leather or grey cloth |
| `furn.store_shelf` | 2×1 | 4 in 1 map | stand-in: furn.shelf | stand-in: furn.shelf | drawn | stand-in: furn.shelf | a convenience store's shelf of snacks and noodles |
| `furn.subway_seat` | 4×1 | 10 in 1 map | stand-in: furn.bed | stand-in: furn.bed | drawn | stand-in: furn.bed | a Seoul subway carriage's long bench seat along the wall, grab rails above |
| `furn.toy_shelf` | 2×1 | 4 in 2 maps | stand-in: furn.shelf | stand-in: furn.shelf | drawn | stand-in: furn.shelf | a low shelf of toys and picture books |
| `furn.trophy_case` | 2×1 | 2 in 1 map | stand-in: furn.shelf | stand-in: furn.shelf | drawn | stand-in: furn.shelf | a glass case of trophies and framed photos |
| `furn.tv` | 2×1 | 3 in 3 maps | stand-in: furn.drawers | stand-in: furn.drawers | drawn | stand-in: furn.drawers | a television on a low cabinet |
| `furn.wardrobe` | 2×1 | 2 in 2 maps | stand-in: furn.shelf | stand-in: furn.shelf | drawn | stand-in: furn.shelf | a wardrobe, plain wood |
| `furn.water_cooler` | 1×1 | 1 in 1 map | stand-in: furn.jar | stand-in: furn.jar | drawn | stand-in: furn.jar | a water cooler with a stack of paper cups |
| `furn.whiteboard` | 2×1 | 2 in 2 maps | stand-in: furn.screen | stand-in: furn.screen | drawn | stand-in: furn.screen | a whiteboard on a stand, scribbled with arrows and figures |
| `landmark.pagoda` | 3×3 | 1 in 1 map | stand-in: landmark.incense | stand-in: landmark.incense | drawn | stand-in: landmark.incense | Tapgol Park's ten-storey marble pagoda (원각사지 십층석탑) inside its glass protective case |
| `lino` | ground |  in 5 maps | stand-in: wood | stand-in: wood | drawn | stand-in: wood | a Korean home's floor: glossy yellow-brown vinyl (장판) over the heated ondol, a faint wood grain |
| `market.stalls` | 6×2 | 4 in 1 map | stand-in: building.shop | drawn | drawn | stand-in: building.shop | a row of market stalls with cloth awnings, baskets and goods |
| `office_tile` | ground |  in 3 maps | stand-in: stone | stand-in: stone | drawn | stand-in: stone | a tower lobby's floor: large polished pale stone tiles with a soft reflection |
| `parapet` | ground |  in 1 map | stand-in: wall | stand-in: wall | drawn | stand-in: wall | a roof's low concrete parapet with a steel railing on top, the city's towers beyond |
| `prop.bench` | 2×1 | 7 in 3 maps | stand-in: camp.logs | stand-in: camp.logs | drawn | stand-in: camp.logs | a park bench, slats and iron legs |
| `prop.car` | 4×2 | 6 in 2 maps | stand-in: prop.carriage | stand-in: prop.carriage | drawn | stand-in: prop.carriage | a parked or passing car seen from above at the same 3/4 angle (a white or grey sedan, a black taxi with a roof light), four tiles long, two deep |
| `prop.memorial_tent` | 4×2 | 1 in 1 map | stand-in: building.tent | stand-in: building.tent | stand-in: building.tent | stand-in: building.tent | a white Korean memorial tent (분향소) on a plaza: a white canopy on poles, a long table in white cloth with framed black-and-white portraits, white chrysanthemums laid in rows, incense; four tiles wide |
| `prop.vending` | 1×1 | 2 in 2 maps | stand-in: furn.drawers | stand-in: furn.drawers | drawn | stand-in: furn.drawers | a drinks vending machine, lit, cans in rows |
| `prop.water_tank` | 2×2 | 1 in 1 map | stand-in: furn.barrel | stand-in: furn.barrel | drawn | stand-in: furn.barrel | a rooftop water tank: a squat cylinder on a frame |
| `tree.ginkgo` | 1×1 | 78 in 5 maps | stand-in: tree.small | stand-in: tree.small | drawn | stand-in: tree.small | a ginkgo street tree in a square of iron grating, fan-shaped leaves |
