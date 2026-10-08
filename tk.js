/* ---- Romance of the Three Kingdoms: a story campaign on an overworld map ---- */
// The story runs in the novel's order: main story points sit on the fixed
// nodes every route passes through (before each fork, after each merge);
// side roads carry side stories. Levels are single problems, flawless only:
// a slip draws a new problem of the same grade. Data: data/tk.json, built by
// tools/build_tk.py from tools/tk_story.py. Art: terrain, characters and
// effects are drawn here; trees and props come from assets/tk (see CREDITS).

/* ---------- pixel art: characters ---------- */

const TK_CHARS = {
  liubei: { name: "Liu Bei", skin: "#f2c79c", hair: "#2b2226", hat: "topknot", hatC: "#2b2226", pin: "#e6c14a", robe: "#e9dcae", trim: "#3f7d4c", beard: "thin", ears: true, eyes: "kind", weapon: "swords" },
  guanyu: { name: "Guan Yu", skin: "#c0402f", hair: "#1d1517", hat: "scarf", hatC: "#2e7a42", robe: "#2e7a42", trim: "#d4ad42", beard: "long", eyes: "phoenix", weapon: "glaive" },
  zhangfei: { name: "Zhang Fei", skin: "#e9b98e", hair: "#1a1416", hat: "band", hatC: "#b8392c", robe: "#4a4a5c", trim: "#b8392c", beard: "bristle", eyes: "round", weapon: "spear" },
  caocao: { name: "Cao Cao", skin: "#efc59d", hair: "#241c1e", hat: "guan", hatC: "#1e1e24", robe: "#7b2a2a", trim: "#d4ad42", beard: "goatee", eyes: "narrow", weapon: "sword" },
  dongzhuo: { name: "Dong Zhuo", skin: "#e2b089", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#5b3b6e", trim: "#d4ad42", beard: "short", eyes: "narrow", fat: true },
  zhangbao: { name: "Zhang Bao", skin: "#e7c39b", hair: "#2a2024", hat: "wild", hatC: "#e8bc2a", robe: "#d8ab2a", trim: "#7a5216", beard: "none", eyes: "wild", weapon: "sword" },
  zhangjiao: { name: "Zhang Jiao", skin: "#e9c8a2", hair: "#d8d2c8", hat: "yellowband", hatC: "#e8bc2a", robe: "#d8ab2a", trim: "#7a5216", beard: "long", beardC: "#d8d2c8", eyes: "normal" },
  luzhi: { name: "Lu Zhi", skin: "#eec7a0", hair: "#9a9a9a", hat: "guan", hatC: "#1e1e24", robe: "#3e5f8a", trim: "#d6d2c4", beard: "long", beardC: "#a8a8a8", eyes: "kind" },
  zhujun: { name: "Zhu Jun", skin: "#e8c09a", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#8a3030", trim: "#c8c8c8", beard: "short", eyes: "normal", weapon: "sword" },
  huangfusong: { name: "Huangfu Song", skin: "#e8c09a", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#2f4f7a", trim: "#c8c8c8", beard: "long", eyes: "normal", weapon: "sword" },
  liubei_child: { name: "Young Liu Bei", skin: "#f5d2ae", hair: "#2b2226", hat: "topknot", hatC: "#2b2226", pin: "#e6c14a", robe: "#e9dcae", trim: "#3f7d4c", beard: "none", ears: true, eyes: "kind" },
  liuyuanqi: { name: "Liu Yuanqi", skin: "#eec7a0", hair: "#7a7276", hat: "guan", hatC: "#1e1e24", robe: "#5a6a4a", trim: "#d6d2c4", beard: "short", beardC: "#9a9a9a", eyes: "kind" },
  yanzheng: { name: "Yan Zheng", skin: "#e2b089", hair: "#2a2024", hat: "yellowband", hatC: "#e8bc2a", robe: "#6a4a2a", trim: "#e8bc2a", beard: "short", eyes: "narrow", weapon: "sword" },
  chengyuanzhi: { name: "Cheng Yuanzhi", skin: "#e8b88c", hair: "#2a2024", hat: "yellowband", hatC: "#e8bc2a", robe: "#8f6a3a", trim: "#e8bc2a", beard: "short", eyes: "wild", weapon: "glaive" },
  militia: { name: "Village brave", skin: "#ecc29a", hair: "#2a2024", hat: "band", hatC: "#b8392c", robe: "#6a7a5a", trim: "#b8392c", beard: "none", eyes: "normal", weapon: "spear" },
  // townsfolk, drawn like the heroes (kits with folk "drawn" use these; see assets/tk/kits)
  f_farmer: { name: "Farmer", skin: "#e8b88c", hair: "#2a2024", hat: "straw", hatC: "#d8b867", robe: "#8a6a4a", trim: "#5a3a22", beard: "none", eyes: "normal" },
  f_farmer2: { name: "Farmer", skin: "#ecc29a", hair: "#2a2024", hat: "band", hatC: "#5a6a8a", robe: "#5a6a8a", trim: "#3a3a4a", beard: "short", eyes: "normal" },
  f_porter: { name: "Porter", skin: "#e2b089", hair: "#2a2024", hat: "topknot", hatC: "#2a2024", pin: "#8a6a4a", robe: "#7a7a6a", trim: "#4a4a3a", beard: "none", eyes: "round" },
  f_youth: { name: "Young man", skin: "#f0c8a0", hair: "#2a2024", hat: "topknot", hatC: "#2a2024", pin: "#3f7d4c", robe: "#5a8a5a", trim: "#2e5a3a", beard: "none", eyes: "kind" },
  f_woman: { name: "Woman", skin: "#f2cfaa", hair: "#2a2024", hat: "bun", hatC: "#2a2024", pin: "#c8392c", robe: "#c87a8a", trim: "#7a3a4a", beard: "none", eyes: "kind" },
  f_woman2: { name: "Woman", skin: "#efc59d", hair: "#3a2a2a", hat: "bun", hatC: "#3a2a2a", pin: "#e6c14a", robe: "#4a8a8a", trim: "#2a5a5a", beard: "none", eyes: "narrow" },
  f_elder: { name: "Elder", skin: "#e8c4a0", hair: "#d8d2c8", hat: "scholar", hatC: "#3a3236", robe: "#d6cfb8", trim: "#6a5a4a", beard: "long", beardC: "#e0dcd4", eyes: "kind" },
  f_elder2: { name: "Old man", skin: "#e2b089", hair: "#9a9a9a", hat: "topknot", hatC: "#9a9a9a", pin: "#6a6a6a", robe: "#8a7a5a", trim: "#4a3a2a", beard: "short", beardC: "#b0b0b0", eyes: "narrow" },
  // court ladies and girls: high buns, painted faces
  f_geisha: { name: "Lady", skin: "#fbefe8", hair: "#1a1418", hat: "lady", pin: "#c8283c", pin2: "#e6c14a", flower: "#f08ab0", robe: "#c8283c", trim: "#e6c14a", beard: "none", eyes: "kind", makeup: true },
  f_geisha2: { name: "Lady", skin: "#fbefe8", hair: "#1a1418", hat: "lady", pin: "#2a2a3a", pin2: "#e6c14a", flower: "#ffffff", robe: "#6a3a8a", trim: "#f0d0e0", beard: "none", eyes: "kind", makeup: true },
  f_geisha3: { name: "Lady", skin: "#f8eae0", hair: "#241a1e", hat: "lady", pin: "#2e7a5a", pin2: "#d8d8e0", flower: "#f6c84a", robe: "#2e6a7a", trim: "#f4ead2", beard: "none", eyes: "kind", makeup: true },
  f_maiden: { name: "Maiden", skin: "#f8dcc4", hair: "#2a2024", hat: "twinloops", pin: "#e6c14a", robe: "#7ab0c8", trim: "#f4f0e8", beard: "none", eyes: "kind", makeup: true },
  f_maiden2: { name: "Maiden", skin: "#f4d2b4", hair: "#3a2a26", hat: "twinloops", pin: "#c8392c", robe: "#e8a0b0", trim: "#8a3a4a", beard: "none", eyes: "kind", makeup: true },
  f_girl: { name: "Girl", skin: "#f8dcc4", hair: "#2a2024", hat: "sidebuns", pin: "#c8392c", robe: "#f0b04a", trim: "#c8392c", beard: "none", eyes: "kind" },
  f_child: { name: "Child", skin: "#f5d2ae", hair: "#2a2024", hat: "topknot", hatC: "#2a2024", pin: "#c8392c", robe: "#d8a84a", trim: "#8a5a22", beard: "none", eyes: "round" },
  f_daoist: { name: "Daoist", skin: "#e8c4a0", hair: "#5a5256", hat: "scholar", hatC: "#2e3a5a", robe: "#8a8a9a", trim: "#2e3a5a", beard: "thin", eyes: "narrow" },
  f_noble: { name: "Gentleman", skin: "#f0cfac", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#6a3a7a", trim: "#d4ad42", beard: "goatee", eyes: "narrow" },
  f_soldier: { name: "Soldier", skin: "#e8b88c", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#8a3030", trim: "#c8c8c8", beard: "none", eyes: "normal", weapon: "spear" },
  f_hunter: { name: "Hunter", skin: "#d8a47c", hair: "#2a2024", hat: "band", hatC: "#4a6a3a", robe: "#5a6a3a", trim: "#3a4a2a", beard: "bristle", eyes: "round" },
  f_official: { name: "Clerk", skin: "#f0cfac", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#3e5f8a", trim: "#d6d2c4", beard: "thin", eyes: "narrow" },
  rebel: { name: "Yellow Turban", skin: "#e8b88c", hair: "#2a2024", hat: "yellowband", hatC: "#e8bc2a", robe: "#9a7a4a", trim: "#e8bc2a", beard: "none", eyes: "normal", weapon: "spear" },
  inspector: { name: "The Inspector", skin: "#f0cfac", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#6b6a35", trim: "#d4ad42", beard: "thin", eyes: "narrow" },
  xushao: { name: "Xu Shao", skin: "#eec7a0", hair: "#3a3236", hat: "scholar", hatC: "#2e3a5a", robe: "#ded6c0", trim: "#2e3a5a", beard: "thin", eyes: "kind" },
  uncle: { name: "Cao Cao's uncle", skin: "#eec7a0", hair: "#5a5256", hat: "topknot", hatC: "#5a5256", pin: "#8a8a8a", robe: "#7a6a5a", trim: "#3a3236", beard: "short", eyes: "normal" },
  zuofeng: { name: "Zuo Feng", skin: "#f5dcc4", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#3f6a5a", trim: "#d4ad42", beard: "none", eyes: "narrow" },
  merchant: { name: "Zhang Shiping", skin: "#ebbd92", hair: "#2a2024", hat: "straw", hatC: "#d8b867", robe: "#8a6a4a", trim: "#5a3a22", beard: "short", eyes: "kind" },
  immortal: { name: "Old Immortal of Southern Florescence", img: "assets/tk/p_immortal.png", skin: "#efe0c8", hair: "#e8e8e8", hat: "topknot", hatC: "#e8e8e8", pin: "#6a8a5a", robe: "#6a8a6a", trim: "#d8d2c0", beard: "long", beardC: "#eeeeee", eyes: "kind" },
  // Book 2: the coalition, Luoyang's court and Wang Yun's house
  stargrey: { name: "Elder Grey Star", skin: "#efe0c8", hair: "#e8e8e8", hat: "scholar", hatC: "#5a5a6a", robe: "#8a8a9a", trim: "#d8d2c0", beard: "long", beardC: "#eeeeee", eyes: "kind" },
  starred: { name: "Elder Red Star", skin: "#f0d8bc", hair: "#e8e8e8", hat: "scholar", hatC: "#7a2a2a", robe: "#a83a32", trim: "#e6c14a", beard: "long", beardC: "#eeeeee", eyes: "narrow" },
  gongsunzan: { name: "Gongsun Zan", skin: "#eec7a0", hair: "#2a2024", hat: "helmet", hatC: "#d6d2c4", robe: "#e9e4d4", trim: "#3e5f8a", beard: "short", eyes: "round", weapon: "spear" },
  yuanshao: { name: "Yuan Shao", skin: "#f0cfac", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#8a6a2a", trim: "#e6c14a", beard: "goatee", eyes: "narrow", weapon: "sword" },
  yuanshu: { name: "Yuan Shu", skin: "#f2d0ae", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#c89a2a", trim: "#7a3a4a", beard: "thin", eyes: "narrow" },
  xiandi: { name: "Emperor Xian", skin: "#f8dcc4", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#d8b02a", trim: "#7a2a2a", beard: "none", eyes: "kind" },
  chenliu: { name: "Prince of Chenliu", skin: "#f8dcc4", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#d8b02a", trim: "#7a2a2a", beard: "none", eyes: "kind" },   // the boy before he is enthroned (book 13, c4-c12)
  shaodi: { name: "Emperor Shao", skin: "#f8dcc4", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#c8a02a", trim: "#2a2a3a", beard: "none", eyes: "round" },
  hetaihou: { name: "Empress Dowager He", skin: "#fbefe8", hair: "#1a1418", hat: "lady", pin: "#e6c14a", pin2: "#c8283c", flower: "#e6c14a", robe: "#6a2a4a", trim: "#e6c14a", beard: "none", eyes: "narrow", makeup: true },
  tangfei: { name: "Consort Tang", skin: "#fbefe8", hair: "#1a1418", hat: "lady", pin: "#d8d8e0", pin2: "#e6c14a", flower: "#ffffff", robe: "#d8c8d8", trim: "#6a4a6a", beard: "none", eyes: "kind", makeup: true },
  dingyuan: { name: "Ding Yuan", skin: "#e2b089", hair: "#5a5256", hat: "helmet", hatC: "#858a94", robe: "#3e5f8a", trim: "#c8c8c8", beard: "long", eyes: "round", weapon: "sword" },
  lisu: { name: "Li Su", skin: "#efc59d", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#5a6a4a", trim: "#d4ad42", beard: "thin", eyes: "narrow" },
  lvbu: { name: "Lü Bu", skin: "#efc59d", hair: "#1a1416", hat: "helmet", hatC: "#c8a03a", robe: "#a82a2a", trim: "#e6c14a", beard: "none", eyes: "wild", weapon: "glaive" },
  liru: { name: "Li Ru", skin: "#e8c09a", hair: "#2a2024", hat: "scholar", hatC: "#1e1e24", robe: "#3a2a3a", trim: "#8a7a5a", beard: "goatee", eyes: "narrow" },
  chengong: { name: "Chen Gong", skin: "#eec7a0", hair: "#2a2024", hat: "scholar", hatC: "#2e3a5a", robe: "#4a6a7a", trim: "#d6d2c4", beard: "thin", eyes: "kind" },
  caohong: { name: "Cao Hong", skin: "#e2b089", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#7b2a2a", trim: "#c8c8c8", beard: "bristle", eyes: "round", weapon: "sword" },
  zumao: { name: "Zu Mao", skin: "#e8b88c", hair: "#2a2024", hat: "band", hatC: "#b8392c", robe: "#2a5a3a", trim: "#b8392c", beard: "short", eyes: "round", weapon: "sword" },
  sunjian: { name: "Sun Jian", skin: "#e8b88c", hair: "#2a2024", hat: "helmet", hatC: "#c8a03a", robe: "#b8392c", trim: "#e6c14a", beard: "short", eyes: "phoenix", weapon: "sword" },
  chengpu: { name: "Cheng Pu", skin: "#e2b089", hair: "#5a5256", hat: "helmet", hatC: "#858a94", robe: "#8a3030", trim: "#c8c8c8", beard: "long", eyes: "round", weapon: "spear" },
  handang: { name: "Han Dang", skin: "#d8a47c", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#6a3a2a", trim: "#c8c8c8", beard: "bristle", eyes: "round", weapon: "glaive" },
  huaxiong: { name: "Hua Xiong", skin: "#d8a47c", hair: "#1a1416", hat: "helmet", hatC: "#4a4a5c", robe: "#3a3a4a", trim: "#8a3030", beard: "bristle", eyes: "wild", weapon: "glaive" },
  lijue: { name: "Li Jue", skin: "#e2b089", hair: "#2a2024", hat: "helmet", hatC: "#4a4a5c", robe: "#5b3b6e", trim: "#c8c8c8", beard: "bristle", eyes: "narrow", weapon: "sword" },
  guosi: { name: "Guo Si", skin: "#d8a47c", hair: "#2a2024", hat: "helmet", hatC: "#4a4a5c", robe: "#4a3a5a", trim: "#c8c8c8", beard: "short", eyes: "wild", weapon: "spear" },
  wangyun: { name: "Wang Yun", skin: "#eec7a0", hair: "#9a9a9a", hat: "guan", hatC: "#1e1e24", robe: "#2e4a6a", trim: "#d6d2c4", beard: "long", beardC: "#c8c8c8", eyes: "kind" },
  diaochan: { name: "Diaochan", skin: "#fbefe8", hair: "#1a1418", hat: "lady", pin: "#e6c14a", pin2: "#d8d8e0", flower: "#f08ab0", robe: "#f2d6e0", trim: "#c86a8a", beard: "none", eyes: "kind", makeup: true },
  dongmu: { name: "Dong Zhuo's mother", skin: "#efd8c0", hair: "#d8d2c8", hat: "bun", hatC: "#d8d2c8", pin: "#e6c14a", robe: "#5b3b6e", trim: "#d4ad42", beard: "none", eyes: "kind" },
  caiyong: { name: "Cai Yong", skin: "#eec7a0", hair: "#9a9a9a", hat: "scholar", hatC: "#3a3236", robe: "#d6cfb8", trim: "#6a5a4a", beard: "long", beardC: "#c8c8c8", eyes: "kind" },
  lvboshe: { name: "Lü Boshe", skin: "#e8c4a0", hair: "#9a9a9a", hat: "topknot", hatC: "#9a9a9a", pin: "#6a6a6a", robe: "#8a7a5a", trim: "#4a3a2a", beard: "long", beardC: "#c8c8c8", eyes: "kind" },
  // the new Book 2 (ch. 8-9): Wang Yun's plot and Dong Zhuo's fall
  zhangwen: { name: "Zhang Wen", skin: "#eec7a0", hair: "#7a7276", hat: "guan", hatC: "#1e1e24", robe: "#5a3a6a", trim: "#d4ad42", beard: "long", beardC: "#9a9a9a", eyes: "kind" },
  shisunrui: { name: "Shisun Rui", skin: "#efc59d", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#3e5f8a", trim: "#d6d2c4", beard: "goatee", eyes: "narrow" },
  huangwan: { name: "Huang Wan", skin: "#e8c4a0", hair: "#9a9a9a", hat: "guan", hatC: "#1e1e24", robe: "#6a5a3a", trim: "#d4ad42", beard: "long", beardC: "#c8c8c8", eyes: "kind" },
  mamidi: { name: "Ma Midi", skin: "#eec7a0", hair: "#d8d2c8", hat: "scholar", hatC: "#2e3a5a", robe: "#4a6a5a", trim: "#d6d2c4", beard: "long", beardC: "#e0dcd4", eyes: "kind" },
  jiaxu: { name: "Jia Xu", skin: "#e8c09a", hair: "#2a2024", hat: "scholar", hatC: "#1e1e24", robe: "#2a2a34", trim: "#8a7a5a", beard: "thin", eyes: "narrow" },
  niufu: { name: "Niu Fu", skin: "#d8a47c", hair: "#2a2024", hat: "helmet", hatC: "#4a4a5c", robe: "#5b3b6e", trim: "#c8c8c8", beard: "bristle", eyes: "round", weapon: "sword" },
  huchier: { name: "Hu Chi'er", skin: "#c88a5c", hair: "#1a1416", hat: "band", hatC: "#4a3a2a", robe: "#6a4a2a", trim: "#3a2a1a", beard: "short", eyes: "wild", weapon: "sword" },
  daoren: { name: "Taoist", skin: "#efe0c8", hair: "#d8d2c8", hat: "topknot", hatC: "#d8d2c8", pin: "#6a8a5a", robe: "#d8d2c0", trim: "#5a6a4a", beard: "long", beardC: "#eeeeee", eyes: "kind" },
  f_villager: { name: "Villager", skin: "#e8b88c", hair: "#2a2024", hat: "band", hatC: "#8a7a5a", robe: "#8a7a5a", trim: "#5a3a22", beard: "none", eyes: "round" },
  // Book 3: Beihai, Xuzhou and White Gate Tower
  taishici: { name: "Taishi Ci", skin: "#e8b88c", hair: "#2a2024", hat: "band", hatC: "#3e5f8a", robe: "#4a6a8a", trim: "#d6d2c4", beard: "short", eyes: "phoenix", weapon: "spear" },
  kongrong: { name: "Kong Rong", skin: "#f0cfac", hair: "#5a5256", hat: "scholar", hatC: "#1e1e24", robe: "#7a2a3a", trim: "#d4ad42", beard: "long", beardC: "#7a7276", eyes: "kind" },
  guanhai: { name: "Guan Hai", skin: "#d8a47c", hair: "#2a2024", hat: "yellowband", hatC: "#e8bc2a", robe: "#8a6a2a", trim: "#e8bc2a", beard: "bristle", eyes: "wild", weapon: "glaive" },
  taoqian: { name: "Tao Qian", skin: "#eec7a0", hair: "#d8d2c8", hat: "guan", hatC: "#1e1e24", robe: "#3e5f8a", trim: "#d4ad42", beard: "long", beardC: "#e0dcd4", eyes: "kind" },
  mizhu: { name: "Mi Zhu", skin: "#f0cfac", hair: "#2a2024", hat: "scholar", hatC: "#2e3a5a", robe: "#c8a04a", trim: "#7a5216", beard: "thin", eyes: "kind" },
  chendeng: { name: "Chen Deng", skin: "#efc59d", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#3a5a4a", trim: "#d6d2c4", beard: "goatee", eyes: "narrow" },
  zhaoyun: { name: "Zhao Yun", skin: "#f2c79c", hair: "#1d1517", hat: "helmet", hatC: "#d6d2c4", robe: "#ecebe4", trim: "#3e5f8a", beard: "none", eyes: "phoenix", weapon: "spear" },
  jiling: { name: "Ji Ling", skin: "#e2b089", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#c89a2a", trim: "#7a3a4a", beard: "short", eyes: "round", weapon: "glaive" },
  zhangliao: { name: "Zhang Liao", skin: "#e8b88c", hair: "#2a2024", hat: "helmet", hatC: "#4a4a5c", robe: "#5a3a6a", trim: "#c8c8c8", beard: "short", eyes: "phoenix", weapon: "glaive" },
  haomeng: { name: "Hao Meng", skin: "#d8a47c", hair: "#2a2024", hat: "helmet", hatC: "#4a4a5c", robe: "#6a3a3a", trim: "#c8c8c8", beard: "bristle", eyes: "narrow", weapon: "sword" },
  gaoshun: { name: "Gao Shun", skin: "#e2b089", hair: "#2a2024", hat: "helmet", hatC: "#3a3a44", robe: "#3a3a4a", trim: "#a83a32", beard: "short", eyes: "round", weapon: "spear" },
  xunyu: { name: "Xun Yu", skin: "#f2d0ae", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#2e4a6a", trim: "#d6d2c4", beard: "thin", eyes: "kind" },
  guojia: { name: "Guo Jia", skin: "#f5dcc4", hair: "#2a2024", hat: "scholar", hatC: "#2e3a5a", robe: "#5a7a8a", trim: "#d6d2c4", beard: "none", eyes: "narrow" },
  sunqian: { name: "Sun Qian", skin: "#eec7a0", hair: "#2a2024", hat: "scholar", hatC: "#3a3236", robe: "#8a7a5a", trim: "#d6d2c4", beard: "thin", eyes: "kind" },
  sunce: { name: "Sun Ce", skin: "#efc59d", hair: "#2a2024", hat: "helmet", hatC: "#c8a03a", robe: "#c8392c", trim: "#e6c14a", beard: "none", eyes: "phoenix", weapon: "spear" },
  dianwei: { name: "Dian Wei", skin: "#c88a5c", hair: "#1a1416", hat: "band", hatC: "#2a2024", robe: "#5a3a2a", trim: "#8a3030", beard: "bristle", eyes: "wild", weapon: "swords", fat: true },
  xiahoudun: { name: "Xiahou Dun", skin: "#e2b089", hair: "#1a1416", hat: "helmet", hatC: "#4a4a5c", robe: "#7b2a2a", trim: "#c8c8c8", beard: "short", eyes: "round", weapon: "spear", patch: true },
  wanghou: { name: "Wang Hou", skin: "#efc59d", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#6a6a4a", trim: "#d4ad42", beard: "thin", eyes: "narrow" },
  houcheng: { name: "Hou Cheng", skin: "#e8b88c", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#5a3a6a", trim: "#c8c8c8", beard: "short", eyes: "round", weapon: "sword" },
  yanshi: { name: "Lady Yan", skin: "#fbefe8", hair: "#1a1418", hat: "lady", pin: "#e6c14a", pin2: "#c8283c", flower: "#c8283c", robe: "#7a2a3a", trim: "#e6c14a", beard: "none", eyes: "narrow", makeup: true },
  zhangkai: { name: "Zhang Kai", skin: "#d8a47c", hair: "#2a2024", hat: "yellowband", hatC: "#e8bc2a", robe: "#6a5a3a", trim: "#e8bc2a", beard: "bristle", eyes: "narrow", weapon: "sword" },
  // Lü Bu's fall (book 14)
  lvnv: { name: "Lü Bu's daughter", skin: "#f8dcc4", hair: "#1a1418", hat: "twinloops", pin: "#e6c14a", robe: "#c8392c", trim: "#e6c14a", beard: "none", eyes: "phoenix", makeup: true },
  chengui: { name: "Chen Gui", skin: "#eec7a0", hair: "#d8d2c8", hat: "guan", hatC: "#1e1e24", robe: "#3a5a4a", trim: "#d6d2c4", beard: "long", beardC: "#e0dcd4", eyes: "narrow" },
  hanyin: { name: "Han Yin", skin: "#f0cfac", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#8a6a2a", trim: "#e6c14a", beard: "goatee", eyes: "narrow" },
  songxian: { name: "Song Xian", skin: "#e2b089", hair: "#2a2024", hat: "helmet", hatC: "#5a5a64", robe: "#7a3a2a", trim: "#c8c8c8", beard: "short", eyes: "round", weapon: "spear" },
  weixu: { name: "Wei Xu", skin: "#d8a47c", hair: "#1a1416", hat: "helmet", hatC: "#4a4a5c", robe: "#4a4a3a", trim: "#c8c8c8", beard: "bristle", eyes: "narrow", weapon: "sword" },
  // the Cao Cao arc (test book 13)
  caoren: { name: "Cao Ren", skin: "#e2b089", hair: "#2a2024", hat: "helmet", hatC: "#5a5a64", robe: "#8a3a2a", trim: "#c8c8c8", beard: "short", eyes: "round", weapon: "spear" },
  xiahouyuan: { name: "Xiahou Yuan", skin: "#e8b88c", hair: "#1a1416", hat: "helmet", hatC: "#4a4a5c", robe: "#3a4a6a", trim: "#c8c8c8", beard: "thin", eyes: "phoenix", weapon: "sword" },
  lidian: { name: "Li Dian", skin: "#efc59d", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#4a5a3a", trim: "#d6d2c4", beard: "thin", eyes: "kind", weapon: "sword" },
  yuejin: { name: "Yue Jin", skin: "#d8a47c", hair: "#1a1416", hat: "helmet", hatC: "#6a5a4a", robe: "#6a4a2a", trim: "#c8c8c8", beard: "bristle", eyes: "wild", weapon: "spear" },
  hejin: { name: "He Jin", skin: "#e8b88c", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#7a2a2a", trim: "#e6c14a", beard: "short", eyes: "round", fat: true },
  chenlin: { name: "Chen Lin", skin: "#f0cfac", hair: "#2a2024", hat: "scholar", hatC: "#2e3a5a", robe: "#4a5a6a", trim: "#d6d2c4", beard: "thin", eyes: "narrow" },
  cuiyi: { name: "Cui Yi", skin: "#e8c4a0", hair: "#9a9a9a", hat: "topknot", hatC: "#9a9a9a", pin: "#6a6a6a", robe: "#7a6a4a", trim: "#4a3a2a", beard: "long", beardC: "#b8b8b8", eyes: "kind" },
  mingong: { name: "Min Gong", skin: "#e2b089", hair: "#2a2024", hat: "band", hatC: "#3a3236", robe: "#5a6a7a", trim: "#d6d2c4", beard: "short", eyes: "round", weapon: "sword" },
  taihou: { name: "Empress Dowager He", skin: "#fbefe8", hair: "#1a1418", hat: "lady", pin: "#e6c14a", pin2: "#c8283c", flower: "#e6c14a", robe: "#6a2a4a", trim: "#e6c14a", beard: "none", eyes: "narrow", makeup: true },
  weihong: { name: "Wei Hong", skin: "#f0cfac", hair: "#5a5256", hat: "guan", hatC: "#1e1e24", robe: "#6a4a7a", trim: "#e6c14a", beard: "long", beardC: "#6a6266", eyes: "kind" },
  wufu: { name: "Wu Fu", skin: "#e8b88c", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#5a3a3a", trim: "#c8c8c8", beard: "short", eyes: "round" },
  dingguan: { name: "Ding Guan", skin: "#eec7a0", hair: "#9a9a9a", hat: "guan", hatC: "#1e1e24", robe: "#3e5f8a", trim: "#d6d2c4", beard: "long", beardC: "#c0c0c0", eyes: "narrow" },
  // Red Hare, led by Li Su: a horse, not a person (horse: the coat in assets/tk/horses/); the look fields are a fallback
  redhare: { name: "Red Hare", horse: "red", skin: "#b83a22", robe: "#b83a22", trim: "#2a2024", hair: "#2a2024", beard: "none" },
  caosong: { name: "Cao Song", skin: "#efd8c0", hair: "#d8d2c8", hat: "guan", hatC: "#1e1e24", robe: "#7b4a2a", trim: "#d4ad42", beard: "long", beardC: "#e0dcd4", eyes: "kind" },
  // the Talk with Claude book: Clawd, the Claude Code mascot, drawn by TKArt.clawd instead of as a person
  claude: { name: "Claude", clawd: true, skin: "#d97757", robe: "#d97757", trim: "#d97757", hair: "#d97757", beard: "none" },
};
// Someone the story names but nobody has drawn yet: the stand-in's look (their own name still shows).
const tkLook = who => TK_CHARS[who] || TK_CHARS.f_farmer;

const TKArt = {
  shade(hex, f) {  // f < 0 darkens, > 0 lightens
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const m = v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
    return "#" + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  },
  // A grid of colours (null = empty), then an outline pass and a canvas.
  grid(w, h) { return { w, h, c: Array.from({ length: h }, () => new Array(w).fill(null)) }; },
  set(g, x, y, col) { if (x >= 0 && y >= 0 && x < g.w && y < g.h && col) g.c[y][x] = col; },
  rect(g, x, y, w, h, col) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(g, x + i, y + j, col); },
  ellipse(g, cx, cy, rx, ry, col) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
      if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) this.set(g, x, y, col);
  },
  line(g, x0, y0, x1, y1, col) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) this.set(g, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), col);
  },
  outline(g, col = "#1c1418") {
    const add = [];
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      if (g.c[y][x]) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g.c[y + dy] && g.c[y + dy][x + dx] && g.c[y + dy][x + dx] !== col)) add.push([x, y]);
    }
    for (const [x, y] of add) g.c[y][x] = col;
    return g;
  },
  canvas(g) {
    const cv = document.createElement("canvas");
    cv.width = g.w; cv.height = g.h;
    const ctx = cv.getContext("2d");
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.c[y][x]) { ctx.fillStyle = g.c[y][x]; ctx.fillRect(x, y, 1, 1); }
    return cv;
  },

  // Map sprite, 14x18 including the outline. frame 0/1 = legs; pose: stand | kneel | strike.
  sprite(d, frame = 0, pose = "stand") {
    const g = this.grid(16, 20), O = 2;  // O: left margin for the outline and weapons
    const s = (x, y, c) => this.set(g, x + O, y + 1, c), R = (x, y, w, h, c) => this.rect(g, x + O, y + 1, w, h, c);
    const skinS = this.shade(d.skin, -.18), robeS = this.shade(d.robe, -.22), dark = "#2a2228";
    const kneel = pose === "kneel", dy = kneel ? 3 : 0;
    // weapon behind the body
    if (d.weapon === "spear" && pose !== "strike") { for (let y = 1; y < 17; y++) s(10, y + dy, "#7a5a3a"); s(10, 0 + dy, "#d0d4d8"); s(11, -1 + dy, "#d0d4d8"); s(10, -2 + dy, "#d0d4d8"); }
    if (d.weapon === "glaive" && pose !== "strike") { for (let y = 3; y < 17; y++) s(10, y + dy, "#6a4a2a"); R(10, -1 + dy, 2, 4, "#d0d4d8"); s(12, 0 + dy, "#d0d4d8"); s(10, 3 + dy, "#3f9a5a"); }
    // body
    R(2, 9 + dy, 6, 1, d.robe); R(1, 10 + dy, 8, kneel ? 3 : 3, d.robe); R(1, 12 + dy, 8, 1, robeS);
    s(4, 9 + dy, d.trim); s(5, 10 + dy, d.trim); R(1, 11 + dy, 8, 1, d.trim);  // collar and belt
    s(0, 10 + dy, d.robe); s(9, 10 + dy, d.robe); s(0, 11 + dy, d.skin); s(9, 11 + dy, d.skin);  // sleeves, hands
    if (kneel) R(0, 13 + dy, 10, 1, robeS);
    else {
      const L = frame ? [[2, 13], [6, 14], [1, 14]] : [[2, 13], [6, 13]];
      if (frame) { R(1, 13, 3, 2, robeS); R(6, 13, 3, 2, robeS); s(0, 15, dark); s(1, 15, dark); s(7, 15, dark); s(8, 15, dark); }
      else { R(2, 13, 2, 2, robeS); R(6, 13, 2, 2, robeS); R(2, 15, 2, 1, dark); R(6, 15, 2, 1, dark); }
      void L;
    }
    // head
    R(1, 2 + dy, 8, 7, d.skin); R(1, 8 + dy, 8, 1, skinS);
    if (d.fat) { s(0, 5 + dy, d.skin); s(9, 5 + dy, d.skin); s(0, 6 + dy, d.skin); s(9, 6 + dy, d.skin); }
    if (d.ears) { R(0, 4 + dy, 1, 4, d.skin); R(9, 4 + dy, 1, 4, d.skin); }
    // eyes
    const ey = 5 + dy;
    if (d.eyes === "round") { s(2, ey, "#fff"); s(3, ey, dark); s(6, ey, "#fff"); s(7, ey, dark); }
    else if (d.eyes === "phoenix") { s(2, ey, dark); s(3, ey - 1, dark); s(6, ey - 1, dark); s(7, ey, dark); R(2, ey - 2, 2, 1, dark); R(6, ey - 2, 2, 1, dark); }
    else if (d.eyes === "kind") { s(3, ey, dark); s(6, ey, dark); }
    else if (d.eyes === "wild") { s(2, ey, dark); s(3, ey, dark); s(6, ey, dark); s(7, ey, dark); }
    else { s(3, ey, dark); s(6, ey, dark); }
    if (d.patch) { R(1, ey - 1, 8, 1, "#141014"); R(2, ey, 2, 1, "#141014"); }   // an eyepatch (Xiahou Dun)
    if (d.makeup) { s(4, 7 + dy, "#c8283c"); s(5, 7 + dy, "#c8283c"); s(2, 6 + dy, "#f4a0aa"); s(7, 6 + dy, "#f4a0aa"); }  // red lips, blush
    // beard
    const bc = d.beardC || d.hair || dark;
    if (d.beard === "long") { R(3, 7 + dy, 4, 1, bc); R(3, 8 + dy, 4, 3, bc); R(4, 11 + dy, 2, 1, bc); }
    else if (d.beard === "bristle") { R(2, 8 + dy, 6, 1, bc); s(1, 7 + dy, bc); s(8, 7 + dy, bc); s(0, 8 + dy, bc); s(9, 8 + dy, bc); R(3, 9 + dy, 4, 1, bc); }
    else if (d.beard === "short") { R(3, 8 + dy, 4, 2, bc); }
    else if (d.beard === "goatee") { s(3, 7 + dy, bc); s(6, 7 + dy, bc); R(4, 8 + dy, 2, 2, bc); }
    else if (d.beard === "thin") { R(4, 8 + dy, 2, 1, bc); }
    // hair and hats
    const H = d.hatC, hr = d.hair || dark;
    if (d.hat === "topknot") { R(1, 1 + dy, 8, 2, hr); R(4, -1 + dy, 2, 2, hr); R(3, 0 + dy, 4, 1, d.pin || "#e6c14a"); s(1, 3 + dy, hr); s(8, 3 + dy, hr); }
    if (d.hat === "bun") { R(1, 1 + dy, 8, 2, hr); R(3, -2 + dy, 4, 3, hr); s(7, -1 + dy, d.pin || "#c8392c"); s(8, -2 + dy, d.pin || "#c8392c"); R(1, 3 + dy, 1, 3, hr); R(8, 3 + dy, 1, 3, hr); }  // a woman's hair, pinned up
    else if (d.hat === "lady") {  // a court lady's high chignon: puffed wings, a comb, hairpins and a flower
      R(1, 1 + dy, 8, 2, hr); R(0, 2 + dy, 1, 4, hr); R(9, 2 + dy, 1, 4, hr); R(1, 0 + dy, 8, 1, hr); R(2, -1 + dy, 6, 1, hr);
      R(3, 0 + dy, 4, 1, d.pin || "#c8283c"); s(0, -1 + dy, d.pin2 || "#e6c14a"); s(9, -1 + dy, d.pin2 || "#e6c14a"); s(9, 1 + dy, d.flower || "#f08ab0"); s(8, 0 + dy, d.flower || "#f08ab0");
    }
    else if (d.hat === "twinloops") {  // two looped buns, a ribbon between
      R(1, 1 + dy, 8, 2, hr); R(1, -1 + dy, 3, 1, hr); s(1, 0 + dy, hr); s(3, 0 + dy, hr); R(6, -1 + dy, 3, 1, hr); s(6, 0 + dy, hr); s(8, 0 + dy, hr);
      s(4, 0 + dy, d.pin || "#e6c14a"); s(5, 0 + dy, d.pin || "#e6c14a"); R(1, 3 + dy, 1, 3, hr); R(8, 3 + dy, 1, 3, hr);
    }
    else if (d.hat === "sidebuns") {  // a girl's round buns, tied with ribbons
      R(1, 1 + dy, 8, 2, hr); R(-1, 1 + dy, 2, 2, hr); R(9, 1 + dy, 2, 2, hr); s(0, 3 + dy, d.pin || "#c8392c"); s(9, 3 + dy, d.pin || "#c8392c"); R(2, 3 + dy, 6, 1, hr);
    }
    else if (d.hat === "scarf") { R(1, 0 + dy, 8, 3, H); R(3, -1 + dy, 4, 1, H); R(0, 2 + dy, 1, 4, H); s(1, 3 + dy, hr); s(8, 3 + dy, hr); }
    else if (d.hat === "band") { R(1, 0 + dy, 8, 2, hr); s(1, -1 + dy, hr); s(4, -1 + dy, hr); s(7, -1 + dy, hr); R(1, 2 + dy, 8, 1, H); s(0, 3 + dy, hr); s(9, 3 + dy, hr); }
    else if (d.hat === "guan") { R(1, 1 + dy, 8, 2, H); R(2, -1 + dy, 6, 2, H); s(0, 2 + dy, H); s(9, 2 + dy, H); }
    else if (d.hat === "yellowband") { R(1, 1 + dy, 8, 1, hr); R(1, 2 + dy, 8, 1, H); s(9, 3 + dy, H); s(9, 4 + dy, H); R(3, 0 + dy, 4, 1, hr); }
    else if (d.hat === "wild") { R(1, 0 + dy, 8, 2, hr); s(0, -1 + dy, hr); s(3, -2 + dy, hr); s(6, -2 + dy, hr); s(9, -1 + dy, hr); R(1, 2 + dy, 8, 1, H); R(0, 3 + dy, 1, 6, hr); R(9, 3 + dy, 1, 6, hr); }
    else if (d.hat === "helmet") { R(1, 0 + dy, 8, 3, H); R(2, -1 + dy, 6, 1, H); R(4, -2 + dy, 2, 1, "#c8392c"); s(0, 3 + dy, H); s(9, 3 + dy, H); }
    else if (d.hat === "scholar") { R(1, 0 + dy, 8, 3, H); R(3, -1 + dy, 4, 1, H); s(9, 1 + dy, H); s(10, 2 + dy, H); }
    else if (d.hat === "straw") { R(-1, 2 + dy, 12, 1, H); R(2, 0 + dy, 6, 2, H); R(3, -1 + dy, 4, 1, H); }
    // weapons in front
    if (d.weapon === "swords") { R(-1, 11 + dy, 1, 3, "#d0d4d8"); R(10, 11 + dy, 1, 3, "#d0d4d8"); }
    if (d.weapon === "sword") { R(10, 9 + dy, 1, 4, "#d0d4d8"); s(10, 13 + dy, "#7a5a3a"); }
    if (pose === "strike") {
      const pole = d.weapon === "glaive" ? "#6a4a2a" : "#7a5a3a";
      if (d.weapon === "spear" || d.weapon === "glaive") { for (let x = 6; x < 14; x++) s(x, 9 + dy, pole); R(13, 8 + dy, 2, 3, "#d0d4d8"); }
      else R(9, 8 + dy, 5, 1, "#d0d4d8");
    }
    return this.canvas(this.outline(g));
  },

  // Dialogue portrait, 32x32.
  bust(d) {
    const g = this.grid(34, 34), O = 1, Oy = d.hat === "lady" || d.hat === "twinloops" ? 5 : O;  // tall hair: the figure sits lower in the frame
    const s = (x, y, c) => this.set(g, x + O, y + Oy, c), R = (x, y, w, h, c) => this.rect(g, x + O, y + Oy, w, h, c);
    const E = (cx, cy, rx, ry, c) => this.ellipse(g, cx + O, cy + Oy, rx, ry, c), Ln = (a, b, c2, e, col) => this.line(g, a + O, b + Oy, c2 + O, e + Oy, col);
    const skinS = this.shade(d.skin, -.16), robeS = this.shade(d.robe, -.2), robeL = this.shade(d.robe, .15), dark = "#2a2228", hr = d.hair || dark, H = d.hatC;
    // shoulders, cross collar
    E(16, 33, 15, 8, d.robe); R(3, 27, 26, 5, d.robe); R(3, 30, 26, 2, robeS);
    Ln(11, 25, 18, 31, d.trim); Ln(12, 25, 19, 31, d.trim); Ln(21, 25, 17, 29, d.trim); Ln(20, 25, 16, 29, d.trim);
    Ln(4, 28, 9, 26, robeL);
    R(13, 21, 6, 5, skinS);  // neck
    // head
    const rx = d.fat ? 10 : 8;
    E(16, 14, rx, 9.5, d.skin); E(16 + rx - 2, 15, 2, 7, skinS);
    if (d.ears) { R(6, 11, 2, 10, d.skin); R(24, 11, 2, 10, d.skin); s(6, 20, skinS); s(25, 20, skinS); }
    else { R(7, 12, 1, 4, d.skin); R(24, 12, 1, 4, d.skin); }
    // eyes and brows
    const ey = 14;
    if (d.eyes === "round") { E(12, ey, 2, 2, "#fff"); E(20, ey, 2, 2, "#fff"); R(12, ey - 1, 2, 2, dark); R(20, ey - 1, 2, 2, dark); R(9, ey - 4, 5, 1, dark); R(18, ey - 4, 5, 1, dark); }
    else if (d.eyes === "phoenix") { Ln(10, ey + 1, 14, ey - 1, dark); Ln(18, ey - 1, 22, ey + 1, dark); Ln(9, ey - 3, 14, ey - 4, dark); Ln(18, ey - 4, 23, ey - 3, dark); R(10, ey - 3, 4, 1, dark); R(18, ey - 3, 4, 1, dark); }
    else if (d.eyes === "narrow") { R(11, ey, 3, 1, dark); R(18, ey, 3, 1, dark); Ln(10, ey - 3, 13, ey - 2, dark); Ln(19, ey - 2, 22, ey - 3, dark); }
    else if (d.eyes === "kind") { s(11, ey, dark); R(12, ey - 1, 2, 1, dark); s(14, ey, dark); s(18, ey, dark); R(19, ey - 1, 2, 1, dark); s(21, ey, dark); R(10, ey - 4, 4, 1, hr); R(18, ey - 4, 4, 1, hr); }
    else if (d.eyes === "wild") { E(12, ey, 1.6, 1.6, "#fff"); E(20, ey, 1.6, 1.6, "#fff"); s(12, ey, "#a02020"); s(20, ey, "#a02020"); Ln(9, ey - 2, 14, ey - 4, dark); Ln(18, ey - 4, 23, ey - 2, dark); }
    else { R(11, ey, 2, 2, dark); R(19, ey, 2, 2, dark); R(10, ey - 3, 4, 1, hr); R(18, ey - 3, 4, 1, hr); }
    if (d.patch) { Ln(7, ey - 3, 25, ey - 6, "#141014"); E(12, ey, 2.8, 2.4, "#141014"); }   // an eyepatch (Xiahou Dun)
    s(16, 17, skinS); s(15, 18, skinS);  // nose
    R(14, 20, 4, 1, this.shade(d.skin, -.4));  // mouth
    if (d.makeup) { E(9.5, 18, 2, 1, "#f4a0aa"); E(22.5, 18, 2, 1, "#f4a0aa"); R(14, 20, 4, 1, "#c8283c"); R(15, 21, 2, 1, "#a81c30"); }  // blush, red lips
    // beard
    const bc = d.beardC || hr, bl = this.shade(bc, .25);
    if (d.beard === "long") { Ln(12, 19, 14, 18, bc); Ln(20, 19, 18, 18, bc); E(16, 26, 5, 8, bc); R(13, 21, 7, 4, bc); Ln(15, 23, 15, 32, bl); Ln(17, 24, 17, 31, bl); R(14, 20, 4, 1, this.shade(d.skin, -.4)); }
    else if (d.beard === "bristle") {
      E(16, 21, 9, 4, bc); for (const [x, y] of [[6, 18], [5, 20], [7, 22], [26, 18], [27, 20], [25, 22], [10, 25], [14, 26], [18, 26], [22, 25]]) Ln(x, y, 16 + (x - 16) * .6, 21, bc);
      R(14, 20, 4, 1, "#7a3a30");
    }
    else if (d.beard === "short") { E(16, 22, 6, 3, bc); Ln(12, 19, 15, 18, bc); Ln(20, 19, 17, 18, bc); R(14, 20, 4, 1, this.shade(d.skin, -.4)); }
    else if (d.beard === "goatee") { Ln(10, 21, 14, 18, bc); Ln(22, 21, 18, 18, bc); R(15, 22, 2, 5, bc); }
    else if (d.beard === "thin") { Ln(12, 19, 14, 18, bc); Ln(20, 19, 18, 18, bc); R(15, 22, 2, 2, bc); }
    // hair and hats
    if (d.hat === "topknot") { E(16, 7, 8.5, 4, hr); R(8, 7, 2, 6, hr); R(23, 7, 2, 6, hr); E(16, 2, 3, 2.5, hr); R(12, 3, 8, 1, d.pin || "#e6c14a"); }
    if (d.hat === "bun") { E(16, 7, 8.5, 4, hr); R(8, 7, 2, 9, hr); R(23, 7, 2, 9, hr); E(16, 1.5, 5, 3, hr); R(20, 0, 5, 1, d.pin || "#c8392c"); }
    else if (d.hat === "lady") {  // a court lady's high chignon
      const p2 = d.pin2 || "#e6c14a", fl = d.flower || "#f08ab0", hl = this.shade(hr, .35);
      E(7, 12, 3, 5.5, hr); E(25, 12, 3, 5.5, hr);            // puffed wings over the ears
      E(16, 7, 9.5, 4.5, hr); E(16, 2, 8, 3.5, hr); E(16, -1, 5, 2.5, hr);  // the swept-up mass and its knot
      Ln(10, 3, 22, 3, hl); Ln(12, 0, 20, 0, hl);             // sheen
      R(11, 4, 10, 2, d.pin || "#c8283c"); s(13, 4, p2); s(16, 4, p2); s(19, 4, p2);  // the lacquered comb
      Ln(3, -1, 10, 3, p2); Ln(29, -1, 22, 3, p2); s(3, 0, fl); s(29, 0, fl); s(4, 1, fl); s(28, 1, fl);  // hairpins with dangles
      E(24, 2, 2.2, 2.2, fl); s(24, 2, "#fff"); E(21.5, 0, 1.5, 1.5, this.shade(fl, -.15));  // a flower
      R(9, 7, 14, 2, hr); R(8, 8, 2, 5, hr); R(23, 8, 2, 5, hr);
    }
    else if (d.hat === "twinloops") {  // two looped buns and a ribbon
      E(16, 7, 8.5, 4, hr); R(8, 7, 2, 9, hr); R(23, 7, 2, 9, hr);
      for (const cx of [9, 23]) for (let y = -2; y <= 5; y++) for (let x = cx - 5; x <= cx + 5; x++) {
        const q = ((x - cx) / 4.5) ** 2 + ((y - 1.5) / 3.6) ** 2;
        if (q <= 1 && q >= .3) s(x, y, hr);
      }
      R(14, 2, 4, 3, d.pin || "#e6c14a"); s(13, 5, d.pin || "#e6c14a"); s(18, 5, d.pin || "#e6c14a");
    }
    else if (d.hat === "sidebuns") {  // a girl's round buns with ribbons
      E(16, 7, 8.5, 4, hr); E(6, 6, 3.6, 3.6, hr); E(26, 6, 3.6, 3.6, hr); s(5, 5, this.shade(hr, .35)); s(25, 5, this.shade(hr, .35));
      R(3, 9, 5, 2, d.pin || "#c8392c"); R(24, 9, 5, 2, d.pin || "#c8392c"); R(9, 8, 14, 2, hr); R(8, 8, 2, 5, hr); R(23, 8, 2, 5, hr);
    }
    else if (d.hat === "scarf") { E(16, 6, 9.5, 5, H); R(7, 6, 18, 4, H); R(6, 9, 2, 9, H); R(25, 9, 2, 6, H); Ln(9, 9, 23, 9, this.shade(H, -.25)); E(16, 2, 4, 2, H); }
    else if (d.hat === "band") { E(16, 7, 9, 4.5, hr); for (let x = 7; x <= 25; x += 3) Ln(x, 6, x - 1, 1, hr); R(7, 8, 18, 2, H); R(6, 9, 2, 8, hr); R(24, 9, 2, 8, hr); }
    else if (d.hat === "guan") { E(16, 7, 8.5, 3.5, hr); R(10, 0, 12, 7, H); R(11, 0, 10, 1, this.shade(H, .2)); R(6, 7, 20, 2, H); R(8, 8, 2, 4, hr); R(22, 8, 2, 4, hr); }
    else if (d.hat === "yellowband") { E(16, 7, 8.5, 4, hr); R(7, 8, 18, 2, H); R(25, 9, 3, 2, H); Ln(26, 10, 28, 15, H); R(8, 9, 2, 5, hr); R(22, 9, 2, 5, hr); }
    else if (d.hat === "wild") { E(16, 7, 9.5, 5, hr); for (const [x, y] of [[5, 4], [9, 0], [14, -1], [19, 0], [24, 1], [27, 5]]) Ln(x, y, 16, 7, hr); R(5, 9, 3, 18, hr); R(24, 9, 3, 18, hr); R(7, 8, 18, 2, H); }
    else if (d.hat === "helmet") { E(16, 7, 10, 6, H); R(6, 7, 20, 4, H); R(6, 10, 20, 1, this.shade(H, -.3)); R(15, -1, 2, 3, "#c8392c"); R(6, 10, 3, 9, H); R(23, 10, 3, 9, H); }
    else if (d.hat === "scholar") { E(16, 6, 9, 5, H); R(7, 6, 18, 4, H); Ln(24, 7, 28, 14, H); Ln(25, 7, 29, 13, H); }
    else if (d.hat === "straw") { E(16, 8, 15, 3, H); E(16, 5, 7, 4, H); Ln(2, 8, 30, 8, this.shade(H, -.25)); }
    return this.canvas(this.outline(g));
  },
  // Clawd: a flat clay-orange block with two tall black eyes, a nub of an arm each side and four short legs.
  // view: down | up | side (facing right) | bust; frame 0-3 walks (1 and 3 lift a pair of legs, the body bobs).
  clawd(view, frame = 0) {
    const C = "#d97757", hi = "#e89a7c", lo = "#b85f42", eye = "#1c1418";
    const big = view === "bust", g = this.grid(big ? 34 : 16, big ? 34 : 20), k = big ? 2 : 1;
    const R = (x, y, w, h, c) => this.rect(g, x * k + (big ? 1 : 0), y * k + (big ? -6 : 0), w * k, h * k, c);
    const bob = frame % 2 ? 1 : 0, side = view === "side";
    const [bx, bw] = side ? [3, 10] : [2, 12], top = 6 + bob;
    R(bx, top, bw, 8, C); R(bx, top, bw, 1, hi); R(bx, top + 7, bw, 1, lo);
    if (side) R(bx + bw, top + 3, 2, 2, C);                       // the arm nub in front
    else { R(0, top + 3, 2, 2, C); R(14, top + 3, 2, 2, C); }
    const legs = side ? [4, 6, 9, 11] : [3, 5, 10, 12];
    legs.forEach((x, i) => {
      const up = frame === 1 ? i % 2 === 0 : frame === 3 ? i % 2 === 1 : false;
      R(x, top + 8, 1, (up ? 2 : 3) - bob, lo);
    });
    if (view === "down" || big) { R(5, top + 2, 1, 2, eye); R(10, top + 2, 1, 2, eye); }
    if (side) R(10, top + 2, 1, 2, eye);
    return this.canvas(this.outline(g, "#5a2a1c"));
  },
  cache: {},
  get(who, kind, frame = 0, pose = "stand") {
    const k = `${who}|${kind}|${frame}|${pose}`;
    if (!this.cache[k]) this.cache[k] = tkLook(who).clawd ? this.clawd(kind === "bust" ? "bust" : "down", frame)
      : kind === "bust" ? this.bust(tkLook(who)) : this.sprite(tkLook(who), frame, pose);
    return this.cache[k];
  },
  // Flipped copy for walking left.
  flip(cv) {
    const o = document.createElement("canvas"); o.width = cv.width; o.height = cv.height;
    const c = o.getContext("2d"); c.translate(cv.width, 0); c.scale(-1, 1); c.drawImage(cv, 0, 0); return o;
  },
};

/* ---------- the overworld: terrain painted once, life drawn each frame ---------- */

const TK_W = 480, TK_H = 270;
function tkRng(seed) {  // mulberry32
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const TKImg = {
  cache: {},
  get(name) {
    if (!this.cache[name]) {
      const im = new Image(); im.crossOrigin = "anonymous";
      this.cache[name] = { im, ready: new Promise(r => { im.onload = r; im.onerror = r; }) };
      im.src = `assets/tk/${name}.png`;
    }
    return this.cache[name].im;
  },
  load(names) { return Promise.all(names.map(n => (this.get(n), this.cache[n].ready))); },
};

// Roads are gentle quadratic curves; the same curve is drawn and walked.
function tkCtrl(A, B) {
  const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
  const bend = (((A.x * 7 + B.y * 13) % 9) - 4) * 1.6;
  return { x: mx - dy / L * bend, y: my + dx / L * bend };
}
function tkPt(A, C, B, t) {
  const u = 1 - t;
  return { x: u * u * A.x + 2 * u * t * C.x + t * t * B.x, y: u * u * A.y + 2 * u * t * C.y + t * t * B.y };
}
function tkCurve(A, B, step = 1) {  // points about `step` px apart
  const C = tkCtrl(A, B), n = Math.max(2, Math.ceil(Math.hypot(B.x - A.x, B.y - A.y) / step)), out = [];
  for (let i = 0; i <= n; i++) out.push(tkPt(A, C, B, i / n));
  return out;
}
function tkSpline(pts, step = 1) {  // Catmull-Rom through the points
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const n = Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]) });
    }
  }
  return out;
}

// Per-world scenery. Landmarks are placed by hand near their nodes;
// trees, rocks and flowers are scattered wherever there is no road.
const TK_ART = {
  1: {
    seed: 184,
    grass: ["#5f9642", "#6ea64b", "#7bb255", "#88bd60"],
    mountains: { x0: -10, x1: 372, base: 56, colors: ["#b9cfc9", "#8fb0a6", "#6a917f", "#4d7462"] },
    river: [[238, -6], [228, 28], [248, 60], [238, 96], [214, 130], [200, 166], [196, 204], [210, 238], [198, 276]],
    landmarks: [
      ["village", 34, 236], ["bigpeach", 90, 168], ["orchard", 108, 186], ["signpost", 78, 204],
      ["hills", 262, 156], ["city", 284, 226], ["fields", 438, 214, 36, 40], ["fields", 112, 246, 44, 20], ["fields", 300, 92, 40, 22],
      ["camp", 448, 168], ["darkhills", 392, 96], ["fortress", 432, 46], ["mulberry", 14, 210],
    ],
    forests: [[60, 110, 34, 9], [150, 96, 30, 7], [330, 252, 36, 8], [466, 120, 18, 6], [160, 262, 26, 5], [270, 116, 22, 5], [352, 60, 20, 5]],
    petals: [108, 180, 50],  // ambient blossom: x, y, radius
    cloud: [388, 104],       // Zhang Bao's black cloud, until the boss falls
  },
};

const TKPaint = {
  px(c, x, y, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); },
  grass(c, rng, cols) {
    c.fillStyle = cols[1]; c.fillRect(0, 0, TK_W, TK_H);
    // coarse value noise for patches
    const gw = Math.ceil(TK_W / 12) + 2, gh = Math.ceil(TK_H / 12) + 2, g = [];
    for (let i = 0; i < gw * gh; i++) g.push(rng());
    const v = (x, y) => {
      const gx = x / 12, gy = y / 12, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
      const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], d = g[(iy + 1) * gw + ix], e = g[(iy + 1) * gw + ix + 1];
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      return a + (b - a) * sx + (d - a) * sy + (a - b - d + e) * sx * sy;
    };
    const img = c.getImageData(0, 0, TK_W, TK_H), D = img.data;
    const rgb = cols.map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
    for (let y = 0; y < TK_H; y++) for (let x = 0; x < TK_W; x++) {
      let n = v(x, y) + (rng() - .5) * .18, k = n < .3 ? 0 : n < .5 ? 1 : n < .72 ? 2 : 3;
      if (((x + y) & 1) && Math.abs(n - .5) < .02) k = 1;
      const o = (y * TK_W + x) * 4; D[o] = rgb[k][0]; D[o + 1] = rgb[k][1]; D[o + 2] = rgb[k][2]; D[o + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    for (let i = 0; i < 260; i++) {  // grass tufts
      const x = rng() * TK_W, y = rng() * TK_H;
      this.px(c, x, y, cols[0]); this.px(c, x + 2, y, cols[0]); this.px(c, x + 1, y - 1, cols[0]);
    }
  },
  mountains(c, rng, m) {
    // Ridges from far (pale) to near (dark), each with lit left slopes.
    m.colors.forEach((col, i) => {
      const base = m.base - 26 + i * 9, amp = 30 - i * 5, lit = TKArt.shade(col, .18), dark = TKArt.shade(col, -.12);
      const peaks = [];
      for (let x = m.x0; x < m.x1 + 30; x += 14 + rng() * 22) peaks.push([x, base - amp * (.45 + rng() * .55)]);
      const H = [];
      for (let x = 0; x < TK_W; x++) {
        let h = TK_H;
        for (const [px, py] of peaks) { const d = Math.abs(x - px); h = Math.min(h, py + d * (.7 + ((px * 13) % 7) / 14)); }
        H.push(Math.min(h, base + 8));
      }
      for (let x = Math.max(0, m.x0); x < Math.min(TK_W, m.x1 + 40); x++) {
        const f = Math.max(0, Math.min(1, (m.x1 + 40 - x) / 90)), bottom = base + 12 + i * 2;
        const top = Math.round(bottom - (bottom - H[x]) * f);  // the range slopes down into the plain
        if (bottom - top < 1) continue;
        c.fillStyle = col; c.fillRect(x, top, 1, bottom - top);
        const slope = (H[x + 1] ?? top) - (H[x - 1] ?? top);
        if (slope < 0) { c.fillStyle = lit; c.fillRect(x, top, 1, Math.min(6, bottom - top)); }
        else if (slope > 0) { c.fillStyle = dark; c.fillRect(x, top + 1, 1, Math.min(5, bottom - top)); }
        if (i === 0 && top < base - 18) { c.fillStyle = "#eef3f1"; c.fillRect(x, top, 1, 2); }  // snow on the far peaks
      }
    });
    // little pines along the near ridge
    for (let i = 0; i < 40; i++) {
      const x = m.x0 + 10 + rng() * (m.x1 - m.x0 - 20), y = m.base + 2 + rng() * 10;
      this.pine(c, x, y, "#2f5a44");
    }
  },
  pine(c, x, y, col) {
    x = Math.round(x); y = Math.round(y);
    c.fillStyle = col; c.fillRect(x, y - 6, 1, 2); c.fillRect(x - 1, y - 4, 3, 2); c.fillRect(x - 2, y - 2, 5, 2);
    c.fillStyle = "#4a3324"; c.fillRect(x, y, 1, 1);
  },
  river(c, pts) {
    const S = tkSpline(pts, 1);
    const stamp = (w, col) => { c.fillStyle = col; for (const p of S) c.fillRect(Math.round(p.x - w / 2), Math.round(p.y - w / 2), w, w); };
    stamp(14, "#c9b98a"); stamp(12, "#2f6496"); stamp(10, "#3d7fbf"); stamp(4, "#4f93cf");
    return S;
  },
  road(c, A, B, kind) {
    const P = tkCurve(A, B, .5);
    const w = kind === "short" ? 3 : 5, edge = kind === "short" ? "#7d7a72" : "#a7814f", fill = kind === "short" ? "#b9b4a6" : "#d6b77f";
    c.fillStyle = edge; for (const p of P) c.fillRect(Math.round(p.x - (w + 2) / 2), Math.round(p.y - (w + 2) / 2), w + 2, w + 2);
    c.fillStyle = fill; for (const p of P) c.fillRect(Math.round(p.x - w / 2), Math.round(p.y - w / 2), w, w);
    if (kind !== "short") { c.fillStyle = "#c4a26a"; P.forEach((p, i) => { if (i % 9 === 0) c.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }); }
    else { c.fillStyle = "#8e8a80"; P.forEach((p, i) => { if (i % 6 === 0) c.fillRect(Math.round(p.x - 1), Math.round(p.y), 2, 1); }); }
    return P;
  },
  bridge(c, p, dir) {
    const [dx, dy] = dir, nx = -dy, ny = dx;
    for (let s = -9; s <= 9; s++) for (let o = -3; o <= 3; o++) {
      const x = p.x + dx * s + nx * o, y = p.y + dy * s + ny * o;
      this.px(c, x, y, Math.abs(o) === 3 ? "#5a3a22" : (s & 1) ? "#8a6038" : "#9c7044");
    }
  },
  sprite(build) { return TKArt.canvas(TKArt.outline(build)); },
  tree(kind, v = 0) {  // small overworld trees: round, pine, peach
    const key = kind + v;
    if ((this.trees || (this.trees = {}))[key]) return this.trees[key];
    const g = TKArt.grid(12, 14), E = (cx, cy, rx, ry, c) => TKArt.ellipse(g, cx, cy, rx, ry, c);
    const base = { round: ["#3f7a3a", "#5a9a48", "#82bf62"], round2: ["#356b36", "#4d8a40", "#6faa52"], peach: ["#d77a92", "#f0a2b6", "#fcd2dc"] }[kind === "round" && v ? "round2" : kind] || ["#2f5a44", "#3f7552", "#5a9468"];
    if (kind === "pine") {
      TKArt.rect(g, 5, 11, 2, 2, "#5a3a22");
      for (let i = 0; i < 4; i++) TKArt.rect(g, 5 - i - (i > 1 ? 0 : 0), 2 + i * 2, 2 + i * 2, 3, i % 2 ? base[1] : base[0]);
      TKArt.rect(g, 5, 1, 2, 1, base[2]); TKArt.set(g, 4, 4, base[2]); TKArt.set(g, 3, 6, base[2]);
    } else {
      TKArt.rect(g, 5, 9, 2, 4, "#6a4428");
      E(6, 6, 5, 4.6, base[0]); E(5.4, 5.4, 4.2, 3.8, base[1]); E(4.4, 4.2, 2, 1.6, base[2]);
      if (kind === "peach") for (const [x, y] of [[3, 7], [8, 4], [7, 8], [2, 5]]) TKArt.set(g, x, y, "#fff0f4");
    }
    return (this.trees[key] = this.sprite(g));
  },
  house(roof = "#5b6170") {
    const g = TKArt.grid(18, 15), R = (x, y, w, h, c) => TKArt.rect(g, x, y, w, h, c);
    R(3, 7, 12, 6, "#e8dcc0"); R(3, 12, 12, 1, "#cbbd9c"); R(8, 9, 2, 4, "#5a3a22"); R(4, 8, 2, 2, "#8a6038"); R(12, 8, 2, 2, "#8a6038");
    R(2, 3, 14, 4, roof); R(4, 2, 10, 1, roof); R(1, 6, 16, 1, TKArt.shade(roof, -.25)); TKArt.set(g, 0, 5, roof); TKArt.set(g, 17, 5, roof);
    R(4, 1, 10, 1, TKArt.shade(roof, .2));
    for (let x = 3; x < 15; x += 2) TKArt.set(g, x, 4, TKArt.shade(roof, .15));
    return this.sprite(g);
  },
  tent(col = "#e9e4d6") {
    const g = TKArt.grid(13, 11);
    for (let y = 0; y < 8; y++) TKArt.rect(g, 6 - y * .75, y + 2, 1 + y * 1.5, 1, y > 5 ? TKArt.shade(col, -.1) : col);
    TKArt.rect(g, 5, 7, 3, 3, "#5a4a3a"); TKArt.set(g, 6, 1, "#5a3a22"); TKArt.set(g, 6, 0, "#5a3a22");
    return this.sprite(g);
  },
  walls(w, h, col, roof) {  // a walled town or fort with a gate tower on the south side
    const g = TKArt.grid(w + 2, h + 10), R = (x, y, ww, hh, c) => TKArt.rect(g, x + 1, y + 4, ww, hh, c);
    const dark = TKArt.shade(col, -.25), lit = TKArt.shade(col, .15);
    R(0, 0, w, 4, col); R(0, h - 5, w, 5, col); R(0, 0, 4, h, col); R(w - 4, 0, 4, h, col);
    R(0, h - 1, w, 1, dark); R(0, 3, w, 1, dark);
    for (let x = 0; x < w; x += 3) R(x, -1, 2, 1, lit);
    for (let y = 0; y < h; y += 3) { R(-1, y, 1, 2, lit); R(w, y, 1, 2, lit); }
    const gx = Math.floor(w / 2) - 5;  // gate tower
    R(gx, h - 9, 10, 8, lit); R(gx - 2, h - 12, 14, 4, roof); R(gx - 3, h - 9, 16, 1, TKArt.shade(roof, -.3)); R(gx + 3, h - 4, 4, 4, "#3a2a1e");
    return { cv: this.sprite(g), gate: [gx + 6, h + 3] };
  },
  feature(c, rng, f, img) {
    const [kind, x, y] = f, draw = (cv, X, Y) => c.drawImage(cv, Math.round(X - cv.width / 2), Math.round(Y - cv.height));
    if (kind === "village") {
      for (const [dx, dy, r] of [[-26, -10, "#5b6170"], [-24, 14, "#6b5a50"], [16, 22, "#5b6170"], [-6, 26, "#4f5868"], [20, -8, "#6b5a50"]]) draw(this.house(r), x + dx, y + dy);
      img.smoke = [x - 22, y - 22];
    } else if (kind === "bigpeach") draw(img.g_peachtree, x, y + 4);
    else if (kind === "orchard") {
      for (const [dx, dy] of [[-30, 4], [-20, 16], [24, -12], [30, 2], [-6, -22], [14, -24], [-30, -12], [-18, -2], [36, -8], [-38, 10]]) draw(this.tree("peach"), x + dx, y + dy);
    } else if (kind === "signpost") draw(img.g_signpost, x, y);
    else if (kind === "mulberry") draw(img.j_pine2, x, y);
    else if (kind === "hills") {
      for (const [dx, dy, r] of [[-14, 2, 16], [10, -4, 20], [26, 6, 12]]) {
        for (let yy = -r; yy <= 0; yy++) for (let xx = -r * 1.6; xx <= r * 1.6; xx++) {
          if ((xx / (r * 1.6)) ** 2 + (yy / r) ** 2 > 1) continue;
          this.px(c, x + dx + xx, y + dy + yy, xx < -r * .3 ? "#7aa65c" : xx > r * .6 ? "#4f7a46" : "#64904f");
        }
      }
      for (const [dx, dy] of [[-18, -8], [2, -16], [14, -10], [26, -2], [-6, -2]]) this.pine(c, x + dx, y + dy, "#2f5a44");
    } else if (kind === "city") {
      const { cv } = this.walls(40, 26, "#b8a27a", "#5b6170");
      draw(cv, x, y + 6);
      for (const [dx, dy] of [[-9, -12], [9, -14]]) draw(this.house("#4f5868"), x + dx, y + dy);
      img.flags.push([x - 18, y - 22, "#c8392c"], [x + 18, y - 22, "#c8392c"]);
    } else if (kind === "fields") {
      const [, , , w, h] = f;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const strip = Math.floor(i / 9) % 2, furrow = j % 3 === 0;
        this.px(c, x - w / 2 + i, y - h / 2 + j, strip ? (furrow ? "#a99a48" : "#c9b85c") : (furrow ? "#6f9a43" : "#8cb655"));
      }
    } else if (kind === "camp") {
      for (const [dx, dy] of [[-10, -6], [6, -10], [14, 6], [-4, 10], [22, -4]]) draw(this.tent(), x + dx, y + dy);
      img.flags.push([x - 16, y - 18, "#222"], [x + 26, y - 18, "#222"]);
    } else if (kind === "darkhills") {
      for (const [dx, dy, r] of [[-20, 6, 14], [4, 0, 20], [26, 8, 13]]) {
        for (let yy = -r; yy <= 0; yy++) for (let xx = -r * 1.5; xx <= r * 1.5; xx++) {
          if ((xx / (r * 1.5)) ** 2 + (yy / r) ** 2 > 1) continue;
          this.px(c, x + dx + xx, y + dy + yy, xx < -r * .3 ? "#5f6e5a" : xx > r * .6 ? "#3e4a3e" : "#4f5c4c");
        }
      }
      for (const [dx, dy] of [[-16, -6], [10, -14], [24, -2]]) { c.fillStyle = "#2e2a26"; c.fillRect(x + dx, y + dy - 6, 1, 6); c.fillRect(x + dx - 2, y + dy - 5, 2, 1); c.fillRect(x + dx + 1, y + dy - 4, 2, 1); }
    } else if (kind === "fortress") {
      const { cv } = this.walls(56, 34, "#b58a4a", "#8a5a2a");
      draw(cv, x, y + 22);
      for (const [dx, dy] of [[-12, -2], [10, 0]]) draw(this.tent("#e3c46a"), x + dx, y + dy);
      img.flags.push([x - 26, y - 14, "#e8bc2a"], [x + 26, y - 14, "#e8bc2a"], [x - 8, y - 18, "#e8bc2a"], [x + 8, y - 18, "#e8bc2a"]);
    }
  },
};

/* ---------- campaign state ---------- */

const TK = {
  data: null,
  async load() {
    if (!this.data) this.data = await (await fetch("data/tk.json?v=85")).json();
    return this.data;
  },
  ls(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } },
  lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} if (typeof Sync !== "undefined" && Sync.tkKey(k)) Sync.scheduleSave(); },
  saveProg(p) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); if (typeof Sync !== "undefined") Sync.scheduleSave(); },
  // cleared, unless undone since (a replay or a start over: "tkUndo", dated, so another device's or the server's old
  // copy can't bring a beat back; clearing it again later, "tkAt", wins)
  cleared(key) { const p = loadProgress(); return (p.tk || {})[key] === 1 && !(((p.tkUndo || {})[key] || 0) > ((p.tkAt || {})[key] || 0)); },
  markCleared(key) { const p = loadProgress(); (p.tk || (p.tk = {}))[key] = 1; (p.tkAt || (p.tkAt = {}))[key] = Date.now(); this.saveProg(p); },
  undoCleared(p, key) { if (p.tk) delete p.tk[key]; (p.tkUndo || (p.tkUndo = {}))[key] = Date.now(); },
  // A world rolled back (Replay from…, Start over): dated in the progress (synced, the later wins), and this
  // device's place, party and things in that world marked as made after it ("tk-seen"). Another device's
  // copy of that world from before it is stale, and isn't taken (app.js Sync)
  rolledBack(p, n) {
    const t = Date.now();
    (p.tkReplay || (p.tkReplay = {}))[n] = t;
    const seen = this.ls("tk-seen"); seen[n] = t; this.lsSet("tk-seen", seen);
  },
  seen(id) { return !!(loadProgress().tkSeen || {})[id]; },
  markSeen(id) { const p = loadProgress(); (p.tkSeen || (p.tkSeen = {}))[id] = 1; this.saveProg(p); },
  world(n) { return this.data.worlds.find(w => w.n === n); },
  node(w, key) { return w.nodes.find(x => x.key === key); },
  preds(w, key) { return w.edges.filter(e => e[1] === key).map(e => e[0]); },
  succs(w, key) { return w.edges.filter(e => e[0] === key).map(e => e[1]); },
  isStart(key) { return key.endsWith("-start"); },
  // open: a start, the first beat of a book (nothing before it: Book 2 has no start node), or one whose way in is cleared
  open(w, key) { const p = this.preds(w, key); return this.isStart(key) || !p.length || p.some(k => this.isStart(k) || this.cleared(k)); },
  worldOpen(n) { const wd = this.world(n) || {}, test = typeof TK_TEST !== "undefined" && TK_TEST;
    if (wd.draft || wd.hidden) return test;   // a draft or a book taken down: test mode only
    if (wd.open) return true;                  // a book open to everyone from the start
    return n === 1 || this.cleared(`${n - 1}-boss`) || (typeof TK_TEST !== "undefined" && TK_TEST); },   // test mode opens every book
  at(n) { return this.ls("tk-at")[n] || `${n}-start`; },
  setAt(n, key) { const a = this.ls("tk-at"); a[n] = key; this.lsSet("tk-at", a); },
  party(w) { return this.ls("tk-party")[w.n] || w.party; },
  setParty(w, list) { const a = this.ls("tk-party"); a[w.n] = list; this.lsSet("tk-party", a); },
  // Difficulty: Adaptive only. Each board is picked by the player's rating (TKElo), bosses included; a book
  // without a rated pool deals its own boards. An old Easy/Hard choice (tk-diff) is ignored and cleared.
  get mode() { try { localStorage.removeItem("tk-diff"); } catch {} return "adaptive"; },
  set mode(v) {},
  get easy() { return false; },
  set easy(v) {},
  problemRef(node, idx = 0) {
    const d = this.ls("tk-draw"), w = this.world(+String(node.key).split("-")[0]);
    if (this.mode === "adaptive" && w && w.rated && w.rated.length)   // once a beat's board is seen it stays (a retry, a revisit)
      return TKElo.pick(w, `${node.key}~${idx}`, node.role === "boss" ? TKElo.BOSS : TKElo.BOARD);
    const pool = this.easy && node.pool_easy && node.pool_easy.length ? node.pool_easy : node.pool;
    return pool[((d[node.key] || 0) + idx) % pool.length];
  },
  // A wrong move keeps the problem but rests it: TK_REST ms before it can be tried again.
  rest(key) { const d = this.ls("tk-rest"); d[key] = Date.now() + TK_REST; this.lsSet("tk-rest", d); },
  restLeft(key) { return Math.max(0, (this.ls("tk-rest")[key] || 0) - Date.now()); },
  // Walkable path between two nodes over open or cleared ground.
  route(w, from, to) {
    const ok = k => this.open(w, k) || this.cleared(k);
    const prev = { [from]: null }, q = [from];
    while (q.length) {
      const k = q.shift();
      if (k === to) break;
      for (const [a, b] of w.edges) for (const [x, y] of [[a, b], [b, a]])
        if (x === k && !(y in prev) && (ok(y) || y === to)) { prev[y] = k; q.push(y); }
    }
    if (!(to in prev)) return [from, to];
    const path = [];
    for (let k = to; k !== null; k = prev[k]) path.unshift(k);
    return path;
  },
  roleLabel(node) {
    return { main: "Main story", side: "Side story · long road", short: "Side story · shortcut", boss: "Boss", challenge: "Challenge" }[node.role] || "";
  },
};

/* ---------- the live map ---------- */

class TKMap {
  constructor(w, host) {
    this.w = w; this.art = TK_ART[w.n] || TK_ART[1]; this.host = host;
    this.N = Object.fromEntries(w.nodes.map(n => [n.key, n]));
    this.cv = h("canvas", { class: "tk-canvas" });
    this.buf = document.createElement("canvas"); this.buf.width = TK_W; this.buf.height = TK_H;
    this.bg = document.createElement("canvas"); this.bg.width = TK_W; this.bg.height = TK_H;
    this.fx = []; this.actors = {}; this.texts = []; this.shake = 0; this.dim = 0;
    this.sel = null; this.onSelect = null; this.t = 0;
    const at = this.N[TK.at(w.n)] || w.nodes[0];
    this.party = TK.party(w).map((who, i) => ({ who, x: at.x - i * 7, y: at.y + i * 2, left: false, frame: 0, pose: "stand", trail: [] }));
    this.leader = this.party[0];
    host.append(this.cv);
    this.cv.addEventListener("click", e => this.click(e));
  }
  async init() {
    const names = ["j_peach", "j_peach2", "j_pine", "j_pine2", "j_bamboo", "j_rock", "j_rock2", "j_bush", "j_flower", "j_flower2", "g_peachtree", "g_crane", "g_signpost", "g_cloud", "g_bamboo", "g_barrels"];
    await TKImg.load(names);
    this.img = Object.fromEntries(names.map(n => [n, TKImg.get(n)]));
    this.img.flags = [];
    this.paint();
    this.resize();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.host);
    const loop = ts => {
      if (!this.cv.isConnected) { this.ro.disconnect(); return; }
      const dt = Math.min(50, ts - (this.last || ts)); this.last = ts; this.t += dt;
      this.update(dt); this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  resize() {
    const r = this.host.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    const s = Math.max(1, Math.round(r.width * dpr / TK_W));
    if (this.cv.width !== TK_W * s) { this.cv.width = TK_W * s; this.cv.height = TK_H * s; }
    this.s = s;
  }
  paint() {
    const c = this.bg.getContext("2d"), rng = tkRng(this.art.seed), A = this.art, w = this.w;
    TKPaint.grass(c, rng, A.grass);
    for (const f of A.landmarks.filter(f => f[0] === "fields")) TKPaint.feature(c, rng, f, this.img);
    if (A.mountains) TKPaint.mountains(c, rng, A.mountains);
    this.river = A.river ? TKPaint.river(c, A.river) : [];
    this.roads = {};
    const roadPts = [];
    for (const [a, b] of w.edges) {
      const kind = [this.N[a].role, this.N[b].role].includes("short") ? "short" : "road";
      const P = TKPaint.road(c, this.N[a], this.N[b], kind);
      this.roads[a + ">" + b] = P; roadPts.push(...P);
      // a bridge wherever the road crosses the river
      let inside = false;
      P.forEach((p, i) => {
        const wet = this.river.some(q => Math.abs(q.x - p.x) < 5 && Math.abs(q.y - p.y) < 5);
        if (wet && !inside) {
          const q = P[Math.min(P.length - 1, i + 8)], d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
          this.bridges = (this.bridges || []).concat([[{ x: p.x + (q.x - p.x) / d * 6, y: p.y + (q.y - p.y) / d * 6 }, [(q.x - p.x) / d, (q.y - p.y) / d]]]);
        }
        inside = wet;
      });
    }
    for (const [p, dir] of this.bridges || []) TKPaint.bridge(c, p, dir);
    // scatter: forests, then rocks and flowers, away from roads, river and nodes
    const busy = (x, y, r) => roadPts.some(p => Math.abs(p.x - x) < r && Math.abs(p.y - y) < r) || this.river.some(p => Math.abs(p.x - x) < r && Math.abs(p.y - y) < r)
      || w.nodes.some(n => Math.abs(n.x - x) < r + 6 && Math.abs(n.y - y) < r + 6);
    const props = [];
    for (const [fx, fy, r, n] of A.forests || []) {
      let placed = 0;
      for (let i = 0; i < n * 8 && placed < n * 2.5; i++) {
        const x = fx + (rng() - .5) * 2 * r, y = fy + (rng() - .5) * 1.3 * r;
        if (((x - fx) / r) ** 2 + ((y - fy) / (r * .65)) ** 2 > 1 || busy(x, y, 7)) continue;
        const kind = rng() < .3 ? "pine" : "round";
        props.push([TKPaint.tree(kind, rng() < .5 ? 1 : 0), x, y]); placed++;
      }
    }
    for (let i = 0; i < 46; i++) {  // lone trees
      const x = rng() * TK_W, y = 66 + rng() * (TK_H - 66);
      if (!busy(x, y, 9)) props.push([TKPaint.tree(rng() < .25 ? "pine" : "round", i & 1), x, y]);
    }
    for (let i = 0; i < 160; i++) {  // flowers and pebbles, drawn flat
      const x = rng() * TK_W, y = 66 + rng() * (TK_H - 66);
      if (busy(x, y, 4)) continue;
      const k = rng();
      if (k < .7) { const col = ["#f4e27a", "#fbfbf3", "#f2a8c0", "#c9a0e8"][Math.floor(rng() * 4)]; TKPaint.px(c, x, y, col); TKPaint.px(c, x + 1, y + 1, "#3f7a3a"); }
      else { c.fillStyle = "#8f8e86"; c.fillRect(Math.round(x), Math.round(y), 3, 2); c.fillStyle = "#c4c2b8"; c.fillRect(Math.round(x), Math.round(y), 2, 1); }
    }
    const marks = A.landmarks.filter(f => f[0] !== "fields");
    const all = props.map(p => ({ y: p[2], f: () => c.drawImage(p[0], Math.round(p[1] - p[0].width / 2), Math.round(p[2] - p[0].height)) }))
      .concat(marks.map(f => ({ y: f[2], f: () => TKPaint.feature(c, rng, f, this.img) })));
    all.sort((a, b) => a.y - b.y).forEach(o => o.f());
    this.flags = this.img.flags;
  }
  // ---- animation ----
  update(dt) {
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter(f => f.t < f.life);
    this.texts = this.texts.filter(t => (t.t += dt) < t.life);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    const A = this.art;
    if (A.petals && Math.random() < dt / 260) this.fx.push(this.petal(A.petals[0] + (Math.random() - .5) * A.petals[2] * 2, A.petals[1] - A.petals[2] * .6));
    if (this.img.smoke && Math.random() < dt / 300) this.fx.push({ kind: "smoke", x: this.img.smoke[0], y: this.img.smoke[1], t: 0, life: 2600, vx: .004 + Math.random() * .004 });
    if (!this.crane && Math.random() < dt / 9000) this.crane = { x: -20, y: 16 + Math.random() * 40, t: 0 };
    if (this.crane) { this.crane.x += dt * .03; this.crane.t += dt; if (this.crane.x > TK_W + 20) this.crane = null; }
    // walkers
    for (const a of [...this.party, ...Object.values(this.actors)]) {
      if (a.path && a.path.length) {
        const p = a.path[0], dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy), sp = (a.speed || .05) * dt;
        if (dx) a.left = dx < 0;
        if (d <= sp) { a.x = p.x; a.y = p.y; a.path.shift(); } else { a.x += dx / d * sp; a.y += dy / d * sp; }
        a.walk = (a.walk || 0) + dt;
        a.frame = Math.floor(a.walk / 140) % 2;
        if (!a.path.length) { a.frame = 0; a.done && a.done(); a.done = null; }
      }
    }
    // followers trail the leader
    const L = this.leader;
    if (L.path && L.path.length || !L.trail.length || Math.hypot(L.x - L.trail[L.trail.length - 1].x, L.y - L.trail[L.trail.length - 1].y) > .9) L.trail.push({ x: L.x, y: L.y });
    if (L.trail.length > 400) L.trail.shift();
    this.party.slice(1).forEach((m, i) => {
      if (m.path && m.path.length) return;  // scripted
      const idx = L.trail.length - 1 - (i + 1) * 9;
      if (idx >= 0) { const p = L.trail[idx]; if (Math.abs(p.x - m.x) > .01) m.left = p.x < m.x; m.frame = L.frame; m.x = p.x; m.y = p.y; }
    });
  }
  petal(x, y) { return { kind: "petal", x, y, t: 0, life: 3000 + Math.random() * 1500, vx: .008 + Math.random() * .01, ph: Math.random() * 6, c: Math.random() < .5 ? "#f6b7c6" : "#fbd7df" }; }
  draw() {
    const c = this.buf.getContext("2d"), t = this.t;
    c.imageSmoothingEnabled = false;
    c.drawImage(this.bg, 0, 0);
    // river sparkle
    if (this.river.length) for (let i = 0; i < 26; i++) {
      const k = Math.floor((i * 37 + t * .02) % this.river.length), p = this.river[k];
      if (((i * 13 + Math.floor(t / 300)) % 5) === 0) TKPaint.px(c, p.x + ((i * 7) % 7) - 3, p.y + ((i * 3) % 5) - 2, "#bfe0f6");
    }
    // flags
    for (const [x, y, col] of this.flags || []) {
      c.fillStyle = "#4a3324"; c.fillRect(x, y, 1, 12);
      for (let i = 0; i < 6; i++) { c.fillStyle = col; c.fillRect(x + 1 + i, y + Math.round(Math.sin(t / 180 + i * .9) * 1), 1, 4); }
    }
    // mist over the mountains
    const M = this.art.mountains;
    if (M) for (let i = 0; i < 4; i++) {
      const x = ((t * .006 * (i + 1) + i * 140) % (TK_W + 160)) - 120;
      c.fillStyle = "rgba(255,255,255,.16)"; c.fillRect(Math.round(x), M.base + 2 + i * 4, 110 + i * 20, 3);
      c.fillStyle = "rgba(255,255,255,.1)"; c.fillRect(Math.round(x) + 14, M.base + 1 + i * 4, 70, 5);
    }
    // the black cloud over the hills, until the boss falls
    if (this.art.cloud && !TK.cleared(`${this.w.n}-boss`)) {
      const [cx, cy] = this.art.cloud;
      for (let i = 0; i < 40; i++) {
        const a = i * 2.4 + t / 900, r = 8 + (i % 6) * 3;
        c.fillStyle = i % 3 ? "rgba(30,26,40,.55)" : "rgba(70,60,90,.5)";
        c.fillRect(Math.round(cx + Math.cos(a) * r * 1.6), Math.round(cy - 8 + Math.sin(a) * r * .5), 3, 2);
      }
    }
    // crane
    if (this.crane) {
      const im = this.img.g_crane, bob = Math.round(Math.sin(this.crane.t / 200) * 2);
      c.save(); c.translate(Math.round(this.crane.x), this.crane.y + bob); c.scale(-1, 1); c.drawImage(im, -im.width / 2, -im.height / 2, im.width * .7, im.height * .7); c.restore();
    }
    this.drawNodes(c);
    // sprites, back to front
    const sprites = [...this.party.map(p => ({ ...p, ref: p })), ...Object.values(this.actors).map(a => ({ ...a, ref: a }))].filter(a => !a.hidden).sort((a, b) => a.y - b.y);
    for (const a of sprites) this.drawSprite(c, a);
    // effects
    for (const f of this.fx) this.drawFx(c, f);
    if (this.dim) { c.fillStyle = `rgba(10,8,20,${this.dim})`; c.fillRect(0, 0, TK_W, TK_H); for (const f of this.fx.filter(f => f.kind === "bolt")) this.drawFx(c, f); }
    // to screen
    const d = this.cv.getContext("2d"), s = this.s;
    d.imageSmoothingEnabled = false;
    const sx = this.shake ? Math.round((Math.random() - .5) * 4) * s : 0;
    d.fillStyle = "#000"; d.fillRect(0, 0, this.cv.width, this.cv.height);
    d.drawImage(this.buf, sx, 0, TK_W * s, TK_H * s);
    this.drawLabels(d, s);
  }
  drawNodes(c) {
    const w = this.w, pulse = (Math.sin(this.t / 260) + 1) / 2;
    for (const n of w.nodes) {
      if (TK.isStart(n.key)) continue;
      const done = TK.cleared(n.key), open = TK.open(w, n.key), x = Math.round(n.x), y = Math.round(n.y);
      const big = n.role === "main" || n.role === "boss";
      const fill = done ? "#f0c43a" : open ? "#fbf6e8" : "#9a978e", ring = done ? "#8a5a10" : open ? "#3a2a1e" : "#5a5850";
      if (n.role === "short") {
        for (let r = 0; r <= 5; r++) { c.fillStyle = r === 5 ? ring : (done ? fill : open ? "#e0503a" : fill); c.fillRect(x - (5 - r), y - r, (5 - r) * 2 + 1, 1); c.fillRect(x - (5 - r), y + r, (5 - r) * 2 + 1, 1); }
      } else {
        const r = big ? 5 : 4;
        for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
          const d = Math.hypot(xx, yy);
          if (d <= r + .3) TKPaint.px(c, x + xx, y + yy, d > r - .9 ? ring : (yy < -r / 3 && xx < 0 ? TKArt.shade(fill, .35) : fill));
        }
        if (n.role === "boss") { c.fillStyle = done ? "#8a5a10" : "#c8392c"; c.fillRect(x - 1, y - 2, 3, 3); }
      }
      if (open && !done) {  // pulsing ring on playable levels
        c.strokeStyle = `rgba(255,236,150,${.4 + pulse * .5})`; c.lineWidth = 1;
        c.beginPath(); c.arc(x + .5, y + .5, (big ? 7 : 6) + pulse * 1.5, 0, Math.PI * 2); c.stroke();
      }
      if (this.sel === n.key) { c.strokeStyle = "#c8392c"; c.lineWidth = 1; c.strokeRect(x - 8.5, y - 8.5, 17, 17); }
    }
  }
  drawSprite(c, a) {
    let cv = TKArt.get(a.who, "sprite", a.frame || 0, a.pose === "fall" ? "stand" : (a.pose || "stand"));
    if (a.left) cv = TKArt.flip(cv);
    const x = Math.round(a.x), y = Math.round(a.y);
    c.fillStyle = "rgba(0,0,0,.22)"; c.fillRect(x - 4, y, 9, 2);
    if (a.pose === "fall") {
      const k = Math.min(1, (performance.now() - (a.ref.fellAt || 0)) / 500);
      c.save(); c.globalAlpha = 1 - k * .6; c.translate(x, y); c.rotate((a.left ? -1 : 1) * k * Math.PI / 2); c.drawImage(cv, -cv.width / 2, -cv.height); c.restore();
    } else c.drawImage(cv, x - Math.floor(cv.width / 2), y - cv.height + 1);
  }
  drawFx(c, f) {
    const k = f.t / f.life;
    if (f.kind === "petal") {
      TKPaint.px(c, f.x + f.vx * f.t + Math.sin(f.t / 300 + f.ph) * 3, f.y + f.t * .012, f.c);
    } else if (f.kind === "smoke" || f.kind === "incense") {
      c.fillStyle = `rgba(230,230,235,${.55 * (1 - k)})`;
      c.fillRect(Math.round(f.x + Math.sin(f.t / 400) * 2 + f.vx * f.t * 2), Math.round(f.y - f.t * .008), 2, 2);
    } else if (f.kind === "spark") {
      c.fillStyle = f.c; c.fillRect(Math.round(f.x + f.vx * f.t), Math.round(f.y + f.vy * f.t + .00004 * f.t * f.t), f.sz || 1, f.sz || 1);
    } else if (f.kind === "ring") {
      c.strokeStyle = `rgba(255,255,255,${1 - k})`; c.lineWidth = 2; c.beginPath(); c.arc(f.x, f.y, 2 + k * 14, 0, Math.PI * 2); c.stroke();
    } else if (f.kind === "swirl") {
      const a = f.a + f.t / 300, r = f.r * (1 - k * .3);
      c.fillStyle = f.c; c.fillRect(Math.round(f.x + Math.cos(a) * r * 1.5), Math.round(f.y + Math.sin(a) * r * .6 - k * 10), 3, 2);
    } else if (f.kind === "bolt") {
      if ((Math.floor(f.t / 90) % 3) !== 0) return;
      c.strokeStyle = "#fffbe0"; c.lineWidth = 1; c.beginPath(); let x = f.x, y = f.y - 40; c.moveTo(x, y);
      for (let i = 0; i < 6; i++) { x += (Math.random() - .5) * 10; y += 7; c.lineTo(x, y); } c.stroke();
    } else if (f.kind === "flame") {
      const col = k < .3 ? "#fff1a0" : k < .6 ? "#f6a23a" : "#d8452a";
      c.fillStyle = col; c.fillRect(Math.round(f.x + Math.sin(f.t / 90 + f.ph) * 1.5), Math.round(f.y - f.t * .02), 2, 2);
    } else if (f.kind === "paper") {
      const x = f.x + Math.sin(f.t / 250 + f.ph) * 6, y = f.y - 30 + f.t * .03;
      c.fillStyle = "#f4efe0"; c.fillRect(Math.round(x), Math.round(y), (Math.floor(f.t / 150 + f.ph) % 2) ? 3 : 1, 4);
    }
  }
  drawLabels(d, s) {
    const label = (n, txt, strong) => {
      d.font = `${strong ? "700 " : "600 "}${Math.max(10, 5.2 * s)}px system-ui, sans-serif`;
      const tw = d.measureText(txt).width, x = Math.min(Math.max(n.x * s, tw / 2 + 4), this.cv.width - tw / 2 - 4), y = (n.y - 11) * s;
      d.fillStyle = strong ? "rgba(40,24,16,.85)" : "rgba(40,24,16,.62)";
      d.beginPath(); d.roundRect(x - tw / 2 - 4 * s / 2, y - 6 * s, tw + 4 * s, 7.5 * s, 3 * s); d.fill();
      d.fillStyle = "#fff8e6"; d.textAlign = "center"; d.textBaseline = "middle"; d.fillText(txt, x, y - 2.2 * s);
    };
    const boss = this.w.nodes.find(n => n.role === "boss");
    if (boss && this.sel !== boss.key) label(boss, boss.place, false);
    if (this.sel) label(this.N[this.sel], this.N[this.sel].place, true);
    for (const t of this.texts) {
      d.font = `900 ${8 * s}px system-ui, sans-serif`; d.textAlign = "center";
      d.fillStyle = "#3a1a10"; d.fillText(t.text, t.x * s + s, (t.y - t.t * .02) * s + s);
      d.fillStyle = "#ffe36a"; d.fillText(t.text, t.x * s, (t.y - t.t * .02) * s);
    }
  }
  // ---- input ----
  click(e) {
    const r = this.cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * TK_W, y = (e.clientY - r.top) / r.height * TK_H;
    let best = null, bd = 18;
    for (const n of this.w.nodes) { if (TK.isStart(n.key)) continue; const d = Math.hypot(n.x - x, n.y - y); if (d < bd) { bd = d; best = n; } }
    if (best && this.onSelect) this.onSelect(best.key);
  }
  select(key) { this.sel = key; }
  // ---- movement ----
  walkTo(key) {
    return new Promise(res => {
      const from = TK.at(this.w.n), path = TK.route(this.w, from, key), pts = [];
      for (let i = 0; i < path.length - 1; i++) {
        const fw = this.roads[path[i] + ">" + path[i + 1]], bw = this.roads[path[i + 1] + ">" + path[i]];
        const seg = fw ? fw : bw ? [...bw].reverse() : [this.N[path[i + 1]]];
        pts.push(...seg.filter((_, j) => j % 3 === 0), this.N[path[i + 1]]);
      }
      if (!pts.length) { res(); return; }
      this.leader.path = pts.map(p => ({ x: p.x, y: p.y })); this.leader.speed = .055;
      this.leader.done = () => { TK.setAt(this.w.n, key); res(); };
    });
  }
  actor(id) { return this.actors[id] || this.party.find(p => p.who === id); }
  pos(at, dx = 0, dy = 0) { const n = this.N[at] || this.leader; return { x: n.x + dx, y: n.y + dy }; }
  moveActor(a, x, y) {
    return new Promise(res => { a.path = [{ x, y }]; a.speed = .05; a.done = res; });
  }
  addFx(name, x, y) {
    const R = Math.random, push = f => this.fx.push(Object.assign({ t: 0 }, f));
    if (name === "petals") for (let i = 0; i < 60; i++) push(Object.assign(this.petal(x + (R() - .5) * 60, y - R() * 20), { t: -R() * 1200 }));
    else if (name === "incense") for (let i = 0; i < 40; i++) push({ kind: "incense", x: x + (R() - .5) * 2, y, t: -i * 110, life: 1800, vx: .002 });
    else if (name === "flash") { push({ kind: "ring", x, y, life: 350 }); for (let i = 0; i < 12; i++) push({ kind: "spark", x, y, vx: (R() - .5) * .12, vy: -R() * .1, life: 500, c: "#fff6c8" }); this.shake = 250; }
    else if (name === "dust") for (let i = 0; i < 36; i++) push({ kind: "spark", x: x + (R() - .5) * 30, y: y + (R() - .5) * 10, vx: (R() - .5) * .06, vy: -R() * .04, life: 900, c: R() < .5 ? "#d8c39a" : "#b8a074", sz: 2 });
    else if (name === "sparkle") for (let i = 0; i < 18; i++) push({ kind: "spark", x, y, vx: (R() - .5) * .1, vy: -R() * .12, life: 800, c: R() < .5 ? "#ffe36a" : "#fff" });
    else if (name === "fire") for (let i = 0; i < 120; i++) push({ kind: "flame", x: x + (R() - .5) * 40, y: y + (R() - .5) * 14, ph: R() * 6, t: -R() * 1800, life: 900 });
    else if (name === "paper") for (let i = 0; i < 30; i++) push({ kind: "paper", x: x + (R() - .5) * 60, y, ph: R() * 6, t: -R() * 900, life: 2200 });
    else if (name === "whip") { this.texts.push({ text: "THWACK!", x: x + (R() - .5) * 10, y, t: 0, life: 700 }); this.shake = 200; for (let i = 0; i < 5; i++) push({ kind: "spark", x, y, vx: (R() - .5) * .1, vy: -R() * .08, life: 400, c: "#7aa65c" }); }
    else if (name === "blackwind") {
      for (let i = 0; i < 90; i++) push({ kind: "swirl", x, y, a: R() * 6.3, r: 6 + R() * 26, t: -R() * 600, life: 2600, c: R() < .6 ? "#1c1826" : "#4a3f60" });
      for (let i = 0; i < 4; i++) push({ kind: "bolt", x: x + (R() - .5) * 40, y, t: -i * 500, life: 400 });
      this.dimFor(.45, 2600);
    }
    return { petals: 1200, incense: 800, flash: 350, dust: 700, sparkle: 300, fire: 1600, paper: 1800, whip: 450, blackwind: 2400 }[name] || 300;
  }
  dimFor(v, ms) { this.dim = v; clearTimeout(this.dimT); this.dimT = setTimeout(() => { this.dim = 0; }, ms); }
}

/* ---------- voice-over: one Mandarin clip per line (tools/build_tk_voice.py) ---------- */

const TKVoice = {
  audio: null, queue: [],
  // "zh" (Chinese voice-over), "en" (English) or "off"; an older "on" means Chinese.
  get lang() { let v; try { v = localStorage.getItem("tk-voice"); } catch {} return v === "off" || v === "en" ? v : "zh"; },
  set lang(v) { try { localStorage.setItem("tk-voice", v); } catch {} if (v === "off") this.stop(); },
  get on() { return this.lang !== "off"; },
  has(vid) { return !!vid && !!TK.data && (this.lang === "en" ? TK.data.voices_en || [] : TK.data.voices).includes(vid); },
  // Plays clips one after another; resolves when the last ends or is stopped.
  play(vids) {
    this.stop();
    if (!this.on) return Promise.resolve();
    this.queue = (Array.isArray(vids) ? vids : [vids]).filter(v => this.has(v));
    return new Promise(res => {
      const next = () => {
        const v = this.queue.shift();
        if (!v) { this.audio = null; res(); return; }
        const a = new Audio(`assets/tk/voice/${this.lang === "en" ? "en/" : ""}${v}.mp3?v=2`);  // bump when clips are re-rendered
        this.audio = a; a.onended = next; a.onerror = next; a.onpause = () => { if (this.audio === a && !a.ended) res(); };
        a.play().catch(next);
      };
      next();
    });
  },
  stop() { this.queue = []; if (this.audio) { const a = this.audio; this.audio = null; a.pause(); } },
};

/* ---------- story: dialogue box, storyteller scrolls, scene runner ---------- */

const TKStory = {
  skipping: false,
  dialog(who, text, zh, vid) {
    return new Promise(res => {
      let box = document.querySelector(".tk-dlg");
      if (!box) {
        box = h("div", { class: "tk-dlg" }, [
          h("div", { class: "tk-dlg-face" }), h("div", { class: "tk-dlg-body" }, [h("b", { class: "tk-dlg-name" }), h("p", { class: "tk-dlg-zh", lang: "zh-CN" }), h("p", { class: "tk-dlg-text" })]),
          h("button", { class: "tk-skip", type: "button" }, "Skip ▸▸"), h("span", { class: "tk-dlg-more" }, "▼"),
        ]);
        document.body.append(box);
      }
      const ch = who ? tkLook(who) : null, face = box.querySelector(".tk-dlg-face");   // someone not yet drawn: the stand-in's face, their name
      face.innerHTML = "";
      if (ch) face.append(ch.img ? h("img", { src: ch.img, alt: "" }) : TKArt.get(who, "bust"));
      box.classList.toggle("narr", !ch);
      box.querySelector(".tk-dlg-name").textContent = ch ? (typeof tkName === "function" ? tkName(who) : ch.name) : "";
      box.querySelector(".tk-dlg-zh").textContent = zh || "";
      TKVoice.play(vid);
      const p = box.querySelector(".tk-dlg-text");
      let i = 0, done = false;
      const tick = setInterval(() => { i += 2; p.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(tick); done = true; box.classList.add("ready"); } }, 28);
      box.classList.remove("ready");
      const finish = () => { clearInterval(tick); TKVoice.stop(); box.onclick = null; skip.onclick = null; res(); };
      box.onclick = e => {
        if (e.target === skip) return;
        if (!done) { clearInterval(tick); p.textContent = text; done = true; box.classList.add("ready"); return; }
        finish();
      };
      const skip = box.querySelector(".tk-skip");
      skip.onclick = e => { e.stopPropagation(); this.skipping = true; finish(); };
    });
  },
  closeDialog() { TKVoice.stop(); const b = document.querySelector(".tk-dlg"); if (b) b.remove(); },
  scroll(title, paras, zhTitle, zhParas, vids) {
    return new Promise(res => {
      const wrap = h("div", { class: "tk-scroll-wrap" }, [
        h("div", { class: "tk-scroll" }, [
          h("h3", {}, zhTitle ? [h("span", { lang: "zh-CN" }, zhTitle), h("span", { class: "tk-scroll-en" }, title)] : title),
          ...paras.map((t, i) => h("div", { class: "tk-para" + (t.startsWith("—") ? " by" : "") }, [  // Chinese first, English after
            ...(zhParas && zhParas[i] ? [h("p", { class: "zh", lang: "zh-CN" }, zhParas[i])] : []), h("p", { class: "en" }, t)])),
          h("button", { class: "tk-scroll-go", type: "button" }, "Continue ▸"),
        ]),
      ]);
      document.body.append(wrap);
      TKVoice.play(vids || []);
      // Enter or Space turns it too (no focus on the button: that would scroll a long one to its end)
      const key = e => { if ((e.key === "Enter" || e.key === " ") && !(e.target && e.target.tagName === "BUTTON")) { e.preventDefault(); e.stopPropagation(); go(); } };
      const go = () => { removeEventListener("keydown", key, true); TKVoice.stop(); wrap.remove(); res(); };
      addEventListener("keydown", key, true);
      wrap.querySelector(".tk-scroll-go").onclick = go;
    });
  },
  // Plays a scene on the map. Skipping still applies the lasting effects
  // (who is in the party) so the story state stays right.
  async play(map, steps) {
    this.skipping = false;
    const w = map.w;
    for (const s of steps) {
      const [op] = s;
      if (op === "party") {
        const at = map.leader;
        map.party = s[1].map((who, i) => map.party.find(p => p.who === who) || { who, x: at.x - (i + 1) * 4, y: at.y + 1, frame: 0, pose: "stand", trail: [] });
        map.party.forEach(p => { p.trail = []; });
        map.leader = map.party[0]; map.leader.trail = [];
        TK.setParty(w, s[1]);
        continue;
      }
      if (op === "remove") { delete map.actors[s[1]]; continue; }
      if (this.skipping) { if (op === "spawn") continue; continue; }
      if (op === "n") await this.dialog(null, s[1], s[2], s[3]);
      else if (op === "say") await this.dialog(s[1], s[2], s[3], s[4]);
      else if (op === "scroll") { this.closeDialog(); await this.scroll(s[1], s[2], s[3], s[4], s[5]); }
      else if (op === "spawn") { const p = map.pos(s[3], s[4], s[5]); map.actors[s[1]] = { who: s[2], x: p.x, y: p.y, frame: 0, pose: "stand", left: p.x > map.leader.x }; }
      else if (op === "move") { const a = map.actor(s[1]); if (a) { const p = map.pos(s[2], s[3], s[4]); await map.moveActor(a, p.x, p.y); } }
      else if (op === "pose") {
        const a = map.actor(s[1]); if (!a) continue;
        a.pose = s[2]; if (s[2] === "fall") a.fellAt = performance.now();
        if (s[2] === "strike") { await new Promise(r => setTimeout(r, 380)); a.pose = "stand"; }
      }
      else if (op === "fx") { const p = map.pos(s[2], s[3], s[4]); await new Promise(r => setTimeout(r, map.addFx(s[1], p.x, p.y))); }
      else if (op === "wait") await new Promise(r => setTimeout(r, s[1]));
    }
    for (const k of Object.keys(map.actors)) delete map.actors[k];
    this.closeDialog();
  },
};

/* ---------- views ---------- */

const TKView = {
  map: null,
  // The level a finished problem came back from, for the zoom-out and story.
  takeReturn() { try { const r = JSON.parse(sessionStorage.getItem("tk-return")); sessionStorage.removeItem("tk-return"); return r; } catch { return null; } },
};

async function viewTK(worldN) {
  const nav = routeSeq;
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const D = await TK.load();
  if (nav !== routeSeq) return;
  // no book named (the library card): the book last played; a named one becomes the last played
  let last = 1; try { last = +localStorage.getItem("tk-book") || 1; } catch {}
  const first = (D.worlds.find(x => TK.worldOpen(x.n)) || D.worlds[0]).n;   // the first book a player can open
  let n = worldN && TK.world(worldN) && TK.worldOpen(worldN) ? worldN : TK.world(last) && TK.worldOpen(last) ? last : first;
  if (worldN && worldN !== n && /^#\/tk\/\d+/.test(location.hash)) history.replaceState(null, "", `#/tk/${n}`);   // a closed book's address shows the book that opened
  try { localStorage.setItem("tk-book", String(n)); } catch {}
  const w = TK.world(n);
  crumbs.innerHTML = "";
  crumbs.append(h("a", { href: "#/" }, "Library"), " / ", D.title);
  root.innerHTML = "";
  const levels = w.nodes.filter(x => !TK.isStart(x.key)), done = levels.filter(x => TK.cleared(x.key)).length;
  const chron = h("button", { class: "tk-chron-btn", type: "button" }, "史册 Chronicle");
  const voiceBtn = h("button", { class: "tk-chron-btn", type: "button", "aria-pressed": String(TKVoice.on), title: "配音：中文 → English → 关 Voice: Chinese → English → off" });
  const voiceLabel = () => {
    voiceBtn.textContent = { zh: "配音：中文 Chinese voice", en: "配音：英文 English voice", off: "静音 Voice off" }[TKVoice.lang];
    voiceBtn.setAttribute("aria-pressed", String(TKVoice.on));
  };
  voiceLabel();
  voiceBtn.onclick = () => { TKVoice.lang = { zh: "en", en: "off", off: "zh" }[TKVoice.lang]; voiceLabel(); };
  root.append(h("div", { class: "tk-head" }, [
    h("div", {}, [h("h2", {}, [h("span", { class: "zh" }, D.native), " ", D.title]),
      h("div", { class: "sub" }, `第${w.book || w.n}卷 Book ${w.book || w.n} · ${w.name} ${w.zh} · chapters ${w.chapters.join("–")} · ${w.grades} · ${done}/${levels.length} cleared`)]),
    h("div", { class: "tk-head-btns" }, [voiceBtn, chron]),
  ]));
  root.append(h("div", { class: "tk-worlds" }, [
    ...D.worlds.filter(x => !x.chat && (!(x.draft || x.hidden) || TK_TEST)).map(x => TK.worldOpen(x.n)
      ? h("a", { class: "tk-world" + (x.n === n ? " on" : ""), href: `#/tk/${x.n}` }, `${x.book || x.n} · ${x.zh} ${x.name}${x.hidden ? " · 下架 off" : ""}`)
      : h("span", { class: "tk-world lock" }, `${x.n} · ${x.zh} ${x.name} — 先完成第${x.n - 1}卷 after Book ${x.n - 1}`)),
  ]));
  const host = h("div", { class: "tk-map" });
  root.append(host);
  const info = h("div", { class: "tk-info" });
  root.append(info);

  // Worlds whose places are built are explored on foot (tk-world.js); the node map
  // remains only for worlds that haven't been built yet.
  const world = typeof WorldData !== "undefined" && WorldData.has(w.n);
  if (world) {
    // Art style: the same maps drawn with either free pack (tk-world.js WORLD_KITS).
    const kit = WorldView.kit(), kits = Object.keys(WORLD_KITS), next = kits[(kits.indexOf(kit) + 1) % kits.length];
    root.querySelector(".tk-head-btns").prepend(h("button", { class: "tk-chron-btn", type: "button", title: `Switch to ${WORLD_KITS[next].en}`,
      onclick: () => { WorldView.setKit(next); viewTK(w.n); } }, `画风：${WORLD_KITS[kit].zh} ${WORLD_KITS[kit].en}`));
    if (typeof WorldTravel !== "undefined") WorldTravel.addButtons(root.querySelector(".tk-head-btns"), w);   // map and start over (tk-travel.js)
    // test mode is remembered (a ?test=1 link); say so, and offer the way out (the user didn't know they were in it)
    if (TK_TEST) {
      root.querySelector(".tk-head-btns").append(h("button", { class: "tk-chron-btn", type: "button", title: "Leave test mode: no Skip key, the hidden books hidden again",
        onclick: () => { try { sessionStorage.setItem("tk-test", "0"); localStorage.removeItem("tk-test"); } catch {} location.href = location.pathname + location.hash; } }, "退出测试模式 Exit test mode"));
      const sub = root.querySelector(".sub");
      if (sub) sub.append(h("span", { class: "tk-test-badge", title: "Test mode: problems have a Skip key and hidden books are open. Menu → Exit test mode." }, " · 测试模式 Test mode"));
    }
    // on a phone: whether a tap on a small board shows a ghost stone first (Auto) or plays at once (Never)
    if (TK_TOUCH && typeof Goban !== "undefined") {
      const conf = h("button", { class: "tk-chron-btn", type: "button" });
      const label = () => { const auto = Goban.confirmMode() === "auto"; conf.setAttribute("aria-pressed", String(auto));
        conf.textContent = auto ? "落子确认：自动 Confirm taps: Auto" : "落子确认：不用 Confirm taps: Never"; };
      conf.onclick = () => { Goban.setConfirmMode(Goban.confirmMode() === "auto" ? "never" : "auto"); label(); };
      label();
      root.querySelector(".tk-head-btns").append(conf);
    }
    // Feedback from inside the game, tagged with where the player is (book, place, position, next
    // beat, what's on screen), so a note like "this didn't trigger" comes with its context
    {
      const ta = h("textarea", { class: "tk-fb-text", rows: "3", placeholder: "意见反馈 Feedback: what's wrong or what would be better here?" });
      const msg = h("span", { class: "tk-fb-msg" });
      const send = h("button", { class: "tk-chron-btn", type: "button", "data-keep": "1" }, "发送反馈 Send feedback");
      ta.addEventListener("keydown", e => {   // typing doesn't walk him or talk; Enter sends (Shift+Enter for a new line)
        e.stopPropagation();
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send.click(); }
      });
      ta.addEventListener("keyup", e => e.stopPropagation());
      send.onclick = async () => {
        const text = ta.value.trim();
        if (!text) { msg.textContent = "先写几句 Write something first."; return; }
        send.disabled = true; msg.textContent = "…";
        try { await Sync.sendFeedback(text, tkFeedbackContext(w)); ta.value = ""; msg.textContent = "已发送，谢谢！Sent, thanks!"; }
        catch (e) { console.error(e); msg.textContent = "没发出去，再试一次 Couldn't send, try again."; }
        send.disabled = false;
      };
      root.querySelector(".tk-head-btns").append(h("div", { class: "tk-fb" }, [ta, h("div", { class: "tk-fb-row" }, [send, msg])]));
    }
    // the other books, once open (Book 2 after Book 1's boss)
    for (const x of D.worlds) if (x.n !== w.n && !x.chat && TK.worldOpen(x.n))
      root.querySelector(".tk-head-btns").append(h("button", { class: "tk-chron-btn", type: "button", onclick: () => { location.hash = `#/tk/${x.n}`; } },
        `第${x.book || x.n}卷 Book ${x.book || x.n} · ${x.zh} ${x.name}${x.hidden ? " · 下架 off" : ""} ▸`));   // testers see which books players can't
    // The buttons live in a menu inside the game window, with the controls.
    const panel = h("div", { class: "tk-menu-panel", hidden: "" }, [root.querySelector(".tk-head-btns"),
      h("div", { class: "tk-menu-keys" }, TK_TOUCH ? "点击地面移动 Tap to move · 点击人物对话 Tap to talk · 按住拖动 Hold and drag to steer"
        : "点击地面移动 Click to move · 点击人物对话 Click someone to talk · 按住拖动 Hold and drag to steer · 键盘也可 WASD / Enter work too")]);
    const toggle = h("button", { class: "tk-menu-btn", type: "button", "aria-expanded": "false" }, "菜单 Menu ▾");
    toggle.onclick = () => {
      const open = panel.hidden;
      panel.hidden = !open; toggle.setAttribute("aria-expanded", String(open)); toggle.textContent = open ? "菜单 Menu ▴" : "菜单 Menu ▾";
      host.focus();
    };
    panel.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      // actions that take you somewhere close the menu; switches (voice, music, guide) leave it open to show their state
      if (!b.hasAttribute("aria-pressed") && !b.dataset.keep) { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); toggle.textContent = "菜单 Menu ▾"; }
      setTimeout(() => host.focus(), 0);   // keep the keyboard on the game
    });
    // Full window: the game takes the whole screen (and the real full screen where the
    // browser allows it). On by default on a phone; remembered either way.
    const full = h("button", { class: "tk-menu-btn", type: "button", "aria-pressed": "false" });
    const setFull = (on, native) => {
      host.classList.toggle("tk-fullwin", on);
      document.documentElement.classList.toggle("tk-fullwin-on", on);
      full.setAttribute("aria-pressed", String(on));
      full.textContent = on ? "还原 Exit full" : "全屏 Full";
      try { localStorage.setItem("tk-full", on ? "1" : "0"); } catch {}
      const de = document.documentElement;
      try {
        if (on && native && !document.fullscreenElement && de.requestFullscreen) de.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
        if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      } catch {}
      if (!on) host.scrollIntoView({ block: "nearest" });
    };
    full.onclick = () => { setFull(!host.classList.contains("tk-fullwin"), true); host.focus(); };
    let pref = null;
    try { pref = localStorage.getItem("tk-full"); } catch {}
    setFull(pref ? pref === "1" : TK_TOUCH, false);
    host.append(h("div", { class: "tk-menu" }, [h("div", { class: "tk-menu-row" }, [full, toggle]), panel]));
    // Scenes replayed outside the node map: words only, no walking or effects.
    const still = { w, actors: {}, leader: { x: 0, y: 0 }, party: [], pos: () => ({ x: 0, y: 0 }), actor: () => null, moveActor: async () => {}, addFx: () => 0 };
    const run = async steps => { TKStory.busy = true; try { await TKStory.play(still, steps); } finally { TKStory.busy = false; } };
    chron.onclick = () => tkChronicle(w, still);
    if (!TK.seen(`${w.n}:opening`)) { await run(w.opening); TK.markSeen(`${w.n}:opening`); if (nav !== routeSeq) return; }
    const ret = TKView.takeReturn();
    info.append(h("div", { class: "tk-info-text" }, [h("b", {}, `${w.zh} ${w.name}`),
      h("div", { class: "meta" }, TK_TOUCH ? "点击地面走过去，点击人物对话，点击房屋进门；头上有 ! 的人会给你出题。Tap where to go, tap someone to talk, tap a house to go in. People marked ! will set you a problem."
        : "点击地面走过去，点击人物对话，点击房屋进门；头上有 ! 的人会给你出题。Click (or tap) where to go, click someone to talk, click a house to go in. People marked ! will set you a problem.")]));
    try {
      await WorldView.mount({
        w, host, ret: ret && ret.world === w.n ? ret : null,
        onPuzzle: (key, at) => TKOverlay.open(w.n, key, at),  // the board comes up inside the game window
        onTalkTo: tkChatAllowed() ? scene => TKTalk.open(scene, host) : null,   // Claude in the teahouse's back room (Chang'an): the chat
        onBoss: async () => { if (!TK.seen(`${w.n}:closing`)) { await run(w.closing); TK.markSeen(`${w.n}:closing`); } },
        // the book's last beat done: on into the next book, no menus (its opening scroll plays there)
        onBookDone: () => { const nx = w.next || w.n + 1; if (TK.world(nx)) { try { localStorage.setItem("tk-book", String(nx)); } catch {} location.hash = `#/tk/${nx}`; } },   // a book can name the one after it (the Cao Cao arc → the Diaochan arc)
      });
    } catch (e) { host.textContent = e.message; }
    return;
  }
  if (typeof WorldView !== "undefined") WorldView.destroy();
  const map = new TKMap(w, host);
  TKView.map = map;
  await map.init();
  if (nav !== routeSeq) return;

  const showInfo = key => {
    map.select(key);
    const node = map.N[key], open = TK.open(w, key), clr = TK.cleared(key), scene = node.scene && w.scenes[node.scene];
    info.innerHTML = "";
    const story = node.role === "main" || node.role === "boss"
      ? (clr && scene ? `Story: ${scene.title}` : "A main story point")
      : (clr && scene ? `Side story: ${scene.title}` : "Side story: ???");
    info.append(h("div", { class: "tk-info-text" }, [
      h("b", {}, node.place),
      h("div", { class: "meta" }, [TK.roleLabel(node), node.grade, clr ? "cleared ★" : open ? "" : "locked"].filter(Boolean).join(" · ")),
      h("div", { class: "meta" }, story),
    ]));
    const play = h("button", { class: "tk-play", type: "button" }, clr ? "Play again ▶" : "Play ▶");
    play.disabled = !open && !clr;
    play.onclick = () => enter(key);
    info.append(play);
  };
  // At a fork: offer both roads.
  const showFork = (from, nexts) => {
    info.innerHTML = "";
    info.append(h("div", { class: "tk-info-text" }, [h("b", {}, "The road forks"), h("div", { class: "meta" }, "Both roads rejoin ahead. Each tells a different side story.")]));
    const opts = h("div", { class: "tk-fork" });
    for (const k of nexts) {
      const node = map.N[k], long = node.role === "side";
      let len = 0, cur = k;
      while (cur && map.N[cur].role === node.role) { len++; cur = TK.succs(w, cur)[0]; }
      const b = h("button", { type: "button", class: long ? "" : "short" }, [
        h("b", {}, long ? "Long road" : "Mountain trail"),
        h("span", {}, `${len} level${len > 1 ? "s" : ""} · ${node.grade}`),
      ]);
      b.onclick = async () => { info.innerHTML = ""; await map.walkTo(k); showInfo(k); };
      opts.append(b);
    }
    info.append(opts);
  };
  const enter = async key => {
    if (TK.at(w.n) !== key) await map.walkTo(key);
    // zoom into the node, then open the level
    const n = map.N[key];
    host.style.transformOrigin = `${n.x / TK_W * 100}% ${n.y / TK_H * 100}%`;
    host.classList.add("tk-zoom-in");
    setTimeout(() => { location.hash = `#/tk/${w.n}/${key}`; }, 430);
  };
  // After a scene: walk on to the next level, or offer the fork.
  const advance = async from => {
    const nexts = TK.succs(w, from).filter(k => !TK.cleared(k));
    if (nexts.length === 1) { await map.walkTo(nexts[0]); showInfo(nexts[0]); }
    else if (nexts.length > 1) showFork(from, nexts);
    else showInfo(from);
  };
  map.onSelect = key => {
    if (TKStory.busy) return;
    if (map.sel === key && (TK.open(w, key) || TK.cleared(key))) { enter(key); return; }
    showInfo(key);
    if ((TK.open(w, key) || TK.cleared(key)) && TK.at(w.n) !== key) map.walkTo(key);
  };
  chron.onclick = () => tkChronicle(w, map);

  const ret = TKView.takeReturn();
  const run = async steps => { TKStory.busy = true; try { await TKStory.play(map, steps); } finally { TKStory.busy = false; } };
  if (ret && ret.world === w.n) {
    const n2 = map.N[ret.key];
    host.style.transformOrigin = `${n2.x / TK_W * 100}% ${n2.y / TK_H * 100}%`;
    host.classList.add("tk-zoom-out");
    setTimeout(() => host.classList.remove("tk-zoom-out"), 500);
    if (ret.win) {
      map.select(ret.key);
      await new Promise(r => setTimeout(r, 450));
      map.addFx("sparkle", n2.x, n2.y - 4);
      const sc = n2.scene && w.scenes[n2.scene], id = `${w.n}:${n2.scene}`;
      if (sc && !TK.seen(id)) { await run(sc.steps); TK.markSeen(id); }
      if (n2.role === "boss" && !TK.seen(`${w.n}:closing`)) { await run(w.closing); TK.markSeen(`${w.n}:closing`); }
      if (n2.role === "boss") showDone(); else await advance(ret.key);
      return;
    }
    showInfo(ret.key);
    return;
  }
  function showDone() {
    info.innerHTML = "";
    info.append(h("div", { class: "tk-info-text" }, [h("b", {}, `★ 第${w.book || w.n}卷完 Book ${w.book || w.n} complete`), h("div", { class: "meta" }, "下一卷即将推出。The next book is coming.")]));
  }
  if (!TK.seen(`${w.n}:opening`)) {
    await run(w.opening); TK.markSeen(`${w.n}:opening`);
  }
  const here = TK.at(w.n);
  if (TK.cleared(`${w.n}-boss`)) { showDone(); return; }
  if (TK.isStart(here) || TK.cleared(here)) await advance(here);
  else showInfo(here);
}

const TK_ROLE_ZH = { main: "主线", side: "支线 · 远路", short: "支线 · 捷径", boss: "首领", challenge: "挑战" };
const TK_BOSS_ZH = { zhangbao: "地公将军张宝" };

// A campaign level's problem: the node (story beat or town challenger) and its
// current draw from the pool; null if it isn't open.
async function tkLevelData(worldN, key) {
  await TK.load();
  const w = TK.world(worldN);
  if (w && !TK.node(w, key) && typeof WorldData !== "undefined") await WorldData.region(w.n);  // a challenger in the world
  // "NODE~2": a scene's second problem, drawn from the same pool
  const [base, nth] = String(key).split("~"), idx = Math.max(0, (+nth || 1) - 1);
  const node = w && (TK.node(w, base) || (typeof WorldData !== "undefined" && WorldData.node(w, base)));
  if (!node || !(node.town || TK.open(w, base) || TK.cleared(base) || TK.cleared(key))) return null;
  // no board past the scene's last ("a9~9" when a9 poses three)
  const nProb = ((w.scenes && w.scenes[node.scene] && w.scenes[node.scene].steps) || []).filter(s => s[0] === "problem").length;
  if (nth && idx >= Math.max(1, nProb) && !(node.chase && idx >= 19)) return null;   // a chase's catches draw from slot 20 on (tk-world.js chaseCaught)
  const [bookId, pid] = TK.problemRef(node, idx);
  const src = await getBook(bookId);
  const p = src.problems.find(x => x.id === pid);
  return { w, node, src, p, book: Object.assign({}, src, { problems: [p] }) };
}

// The board and its panels, built into host. opts: back() leaves, again() deals
// a new problem after a slip, onWin() runs once a flawless solve is saved.
function tkLevelBuild(host, worldN, key, { w, node, src, p, book }, { back, again, onWin }) {
  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" });
  boardCard.append(svg);
  const status = h("div", { id: "status" });
  const turnBadge = h("span", { class: "badge turn" }, "黑先 Black to play");
  const btnExplore = h("button", {}, "Explore");
  const treeBox = h("div", { class: "movetree", style: "height:auto; max-height:320px" });
  const note = h("div", { class: "source-note", style: "display:none" });
  const treePanel = h("div", { class: "panel", style: "display:none" }, [h("h2", {}, "解答 Solution tree"), treeBox]);
  const verdict = h("div", { class: "tk-verdict" });
  const bossPanel = node.boss ? h("div", { class: "panel tk-boss" }, [
    TKArt.get(node.boss.who, "bust"),
    h("div", {}, [h("b", {}, [TK_BOSS_ZH[node.boss.who] ? `${TK_BOSS_ZH[node.boss.who]} · ` : "", node.boss.title]),
      h("p", { class: "zh", lang: "zh-CN" }, node.boss.taunt_zh ? `“${node.boss.taunt_zh}”` : ""), h("p", {}, `“${node.boss.taunt}”`),
      ...(TKVoice.has(node.boss.taunt_vid) ? [h("button", { class: "tk-say", type: "button", onclick: () => TKVoice.play(node.boss.taunt_vid) }, "播放 Play")] : [])]),
  ]) : null;
  if (node.boss) TKVoice.play(node.boss.taunt_vid);
  const aside = h("aside", {}, [
    ...(bossPanel ? [bossPanel] : []),
    h("div", { class: "panel" }, [
      h("h2", {}, `第${worldN}卷 ${w.zh} · Book ${worldN} · ${w.name}`),
      h("div", { class: "meta-title" }, [`${node.place_zh || node.place} · ${TK_ROLE_ZH[node.role] || ""}`,
        h("span", { class: "tk-en" }, ` ${node.place} · ${TK.roleLabel(node)}`)]),
      h("div", { class: "meta-sub" }, [node.role === "boss" ? "" : `出自 from ${src.title} · `, p.url ? h("a", { href: p.url, target: "_blank" }, "来源 source")
                                                                 : h("a", { href: `https://www.101weiqi.com/q/${p.id}/`, target: "_blank" }, "来源 source")]),
      h("div", { class: "badges" }, [...(p.lv || node.grade ? [h("span", { class: "badge" }, p.lv || node.grade)] : []), ...(p.qt ? [h("span", { class: "badge" }, p.qt)] : []), turnBadge]),
    ]),
    h("div", { class: "panel" }, [h("h2", {}, "状态 Status"), status, note, verdict]),
    treePanel,
    h("div", { class: "panel" }, [
      h("h2", {}, "操作 Controls"),
      h("div", { class: "controls" }, [
        h("button", { onclick: () => trainer.undo() }, "悔棋 Undo"),
        h("button", { onclick: () => trainer.hint() }, "提示 Hint"),
        h("button", { onclick: () => trainer.reset() }, "重来 Reset"),
        h("button", { class: "wide", onclick: back }, "← 返回 Back"),
      ]),
    ]),
  ]);
  const player = h("div", { class: "player tk-level" });
  player.append(boardCard, aside);
  host.append(player);
  host.classList.add("tk-enter");
  setTimeout(() => host.classList.remove("tk-enter"), 500);
  if (TK.restLeft(key) > 0) tkRestLock(boardCard, key);
  trainer = new Trainer(book, 0, { svg, boardCard, status, turnBadge, btnExplore, treePanel, treeBox, note, noEngine: true });
  btnExplore.addEventListener("click", () => trainer.toggleExplore());
  window.__trainer = trainer;
  const t = trainer;
  let settled = false;  // the first result decides the level; a reset can't undo a slip
  const onResult = e => {
    if (!verdict.isConnected) return removeEventListener("tczw:result", onResult);
    if (trainer !== t || settled) return;
    settled = true;
    TKElo.result(w, node, [src.id, p.id], e.detail === "ok" && !t.flawed);   // adaptive difficulty: first try only
    verdict.innerHTML = "";
    if (e.detail === "ok" && !t.flawed) {
      TK.markCleared(key);
      onWin();
      verdict.className = "tk-verdict win";
      verdict.append(h("b", {}, node.role === "boss" ? "★ 击败首领！Boss defeated!" : "★ 完美！Flawless!"), h("button", { onclick: back }, "继续 Continue ▸"));
    } else {
      TK.rest(key);
      verdict.className = "tk-verdict slip";
      verdict.append(h("b", {}, e.detail === "ok" ? `解出了，但不算完美。Solved, but not flawless (${t.flawed}).` : "敌人识破了！The enemy saw through it!"),
        h("span", {}, " 换个思路。Try another way."));
      // a moment to see what went wrong, then the same problem from the start, to study until the rest is over
      setTimeout(() => { if (verdict.isConnected) again(); }, 1800);
    }
  };
  addEventListener("tczw:result", onResult);
}

// A level as its own page (direct links, and worlds still on the node map).
async function viewTKLevel(worldN, key) {
  const nav = routeSeq;
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const d = await tkLevelData(worldN, key);
  if (nav !== routeSeq) return;
  if (!d) { location.hash = `#/tk/${worldN || 1}`; return; }
  if (!d.node.town) TK.setAt(worldN, key);
  crumbs.innerHTML = "";
  crumbs.append(h("a", { href: "#/" }, "Library"), " / ", h("a", { href: `#/tk/${worldN}` }, `Three Kingdoms · Book ${worldN}`), ` / ${d.node.place}`);
  root.innerHTML = "";
  tkLevelBuild(root, worldN, key, d, {
    back: () => { root.classList.add("tk-leave"); setTimeout(() => { root.classList.remove("tk-leave"); location.hash = `#/tk/${worldN}`; }, 320); },
    again: () => viewTKLevel(worldN, key),
    onWin: () => { try { sessionStorage.setItem("tk-return", JSON.stringify({ world: worldN, key, win: true })); } catch {} },
  });
}

// What a story figure (the Star Lords, Lu Zhi) says on the board they set: [zh, en] to open, on a win, on a slip.
const TK_SETTER_LINES = {
  stargrey: { open: ["且看此局。黑先。", "Look at this. Black to play."], win: ["善。", "Good."], slip: ["未也。再看。", "Not yet. Look again."] },
  luzhi: { open: ["还记得为师教你的么？黑先。", "Do you remember what I taught you? Black to play."], win: ["好。你没有忘。", "Good. You haven't forgotten."], slip: ["不对。静下心来，再看。", "No. Calm yourself, and look again."] },
};
TK_SETTER_LINES.starred = TK_SETTER_LINES.stargrey;

const TK_REST = 30000;
// A touch screen (a phone or tablet): tap to move and tap to talk.
// Test mode, for trying the story without solving: open the page with ?test=1 (?test=0 ends it).
// Problems then get a Skip key that counts as a flawless solve. It lasts the browser tab (sessionStorage):
// once it was kept for good, and a player who followed one ?test=1 link stayed in it without knowing.
// The playtest harness (tests/playtest/testmode.js, which sets tk-harness) keeps its saved localStorage tk-test.
const TK_TEST = (() => {
  try {
    const q = new URLSearchParams(location.search).get("test");
    if (q != null) sessionStorage.setItem("tk-test", q === "0" ? "0" : "1");
    if (localStorage.getItem("tk-harness") === "1") {   // the tests: kept as before
      if (q != null) localStorage.setItem("tk-test", q === "0" ? "0" : "1");
      return localStorage.getItem("tk-test") === "1";
    }
    localStorage.removeItem("tk-test");   // the old for-good flag, from a link followed once
    return sessionStorage.getItem("tk-test") === "1";
  } catch { return false; }
})();
const TK_TOUCH = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;

// Hold a board until its problem's rest is over. The position stays in full view
// (time to read it); stones can't be played yet, and a small chip counts down.
// Then onReady(). Leaving and coming back doesn't skip it (the end time is saved).
function tkRestLock(board, key, onReady) {
  const lock = h("div", { class: "tk-rest" }), chip = h("span", { class: "tk-rest-chip" });
  lock.append(chip);
  board.append(lock);
  const tick = () => {
    if (!lock.isConnected) return;
    const s = Math.ceil(TK.restLeft(key) / 1000);
    if (s <= 0) { lock.remove(); if (onReady) onReady(); return; }
    chip.innerHTML = `<b lang="zh-CN">思考</b> Think · ${s}s`;
    setTimeout(tick, 250);
  };
  tick();
}

// Townsfolk who set problems, by challenger id (tools/tk_places.py).
const TK_FOES = {
  neighbour: ["邻居", "Neighbour"], elder: ["老者", "Old man"], innkeeper: ["店家", "Innkeeper"],
  farmer: ["农夫", "Farmer"], clerk: ["书吏", "Clerk"],
};

// A level as a duel inside the game window: the opponent's portrait, a board on a
// wooden frame, and the game's own dialogue box for what's said and what happened.
// foe: { id, who, face } from the world (null for a story beat with no opponent).
function tkDuelBuild(box, worldN, key, { node, src, p }, foe, { leave, again, onWin, once }) {
  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "tk-duel-board" }, [svg]);
  const status = h("div", { class: "tk-duel-status" });
  const hidden = { turnBadge: h("span"), btnExplore: h("button"), treeBox: h("div"), note: h("div") };
  const treePanel = h("div");
  const [nameZh, name] = foe && foe.who ? [TK_BOSS_ZH[foe.who] || (typeof tkName === "function" ? tkName(foe.who) : foe.who), node.boss ? node.boss.title : ""]
    : foe ? (TK_FOES[foe.id] || ["对手", "Opponent"]) : [node.place_zh || node.place, node.place];
  const face = foe && foe.face ? foe.face : null;
  if (face) face.className = "town-face";
  const zh = h("div", { class: "town-zh", lang: "zh-CN" }), en = h("div", { class: "town-en" });
  const btns = h("div", { class: "tk-duel-next" });
  const say = (z, e, ...next) => { zh.textContent = z; en.textContent = e; btns.replaceChildren(...next); };
  const story = !foe || node.role === "boss" || !!TK_SETTER_LINES[foe.who];
  const dlg = h("div", { class: `town-dlg tk-duel-dlg ${story ? "story" : "chat"}` }, [
    h("div", { class: "town-tab" }, node.role === "boss" ? "首领 · Boss" : "主线 · Story"),
    ...(face ? [face] : []),
    h("div", { class: "town-txt" }, [
      h("div", { class: "town-who" }, [nameZh, name && name !== nameZh ? h("span", { class: "tk-duel-en" }, ` ${name}`) : ""]),
      zh, en, status, btns,
    ]),
  ]);
  const key_ = (k, label, fn) => h("button", { type: "button", class: "tk-duel-key", onclick: fn }, [h("b", {}, k), label]);
  const keys = h("div", { class: "tk-duel-keys" }, [
    key_("U", "悔棋 Undo", () => trainer && trainer.undo()),
    key_("H", "提示 Hint", () => trainer && trainer.hint()),
    key_("R", "重来 Reset", () => trainer && trainer.reset()),
    key_("Esc", "离开 Leave", leave),
    TK_TEST ? key_("S", "跳过 Skip (test)", () => trainer && (trainer.flawed = null, dispatchEvent(new CustomEvent("tczw:result", { detail: "ok" })))) : "",
  ]);
  const srcLine = h("div", { class: "tk-duel-src" }, [
    `${p.lv || node.grade || ""} · 死活 · `, node.role === "boss" ? "" : `出自 ${src.title} · `,
    h("a", { href: p.url || `https://www.101weiqi.com/q/${p.id}/`, target: "_blank", rel: "noopener" }, "来源 source"),
  ]);
  // a decision board: the leader's choice named in the side column, over what's said
  const nth = Math.max(0, (+String(key).split("~")[1] || 1) - 1);   // which board of the scene
  const dil = Array.isArray(node.dilemma) ? node.dilemma[Math.min(nth, node.dilemma.length - 1)] : node.dilemma;
  const dilBox = dil ? h("div", { class: "tk-duel-dilemma" }, [h("b", { lang: "zh-CN" }, dil.q_zh || ""), h("span", {}, dil.q)]) : "";
  const dlgRow = h("div", { class: "tk-duel-dlgrow" }, [dlg]);
  const side = h("div", { class: "tk-duel-side" }, [dilBox, dlgRow, keys, srcLine]);
  box.replaceChildren(boardCard, side);
  // A book that shows its protagonist at the board (world "lead_portrait"): the party leader's painted
  // portrait (assets/tk/portraits) on the left: a column of its own left of the board on a wide screen,
  // a small one left of the dialogue box on a phone (style.css shows one of the two). Who leads changes
  // as the story hands the party on; someone with no portrait yet shows nothing.
  // whose board it is: the decider its dilemma names, else whoever is walking (the two can differ mid-scene: Diaochan
  // called in to Wang Yun's banquet decides its board while he is still the one walking)
  const wd = TK.world(worldN), lead = wd && wd.lead_portrait && ((dil && dil.who) || TK.party(wd)[0]);
  if (lead && typeof TownUI !== "undefined") TownUI.loadPortraits().then(() => {
    const f = TownUI.portraits[lead];
    if (!f || !side.isConnected) return;
    const src = `assets/tk/portraits/${f}?v=${TownUI.PORTRAIT_V}`;
    box.classList.add("has-lead"); if (box.__fit) box.__fit();
    box.prepend(h("div", { class: "tk-duel-leadcol" }, [h("img", { class: "tk-duel-lead", alt: "", src })]));
    dlgRow.prepend(h("img", { class: "tk-duel-lead-sm", alt: "", src }));
  });
  // A boss duel: a lacquered red frame, a darker field, and his name over the board.
  box.parentNode && box.parentNode.classList.toggle("tk-duel-boss", !!node.boss);
  if (node.boss) boardCard.prepend(h("div", { class: "tk-duel-bossname" }, [
    h("b", { lang: "zh-CN" }, TK_BOSS_ZH[node.boss.who] || tkName(node.boss.who)), h("span", {}, node.boss.title || "")]));

  // A decision board: the leader's dilemma named over the board while the problem is open.

  const dline = k => dil && dil[k] ? [dil[k + "_zh"] || "", dil[k]] : null;
  // each of the leader's lines (open/win/slip) replaces the usual one when given
  const base = foe && TK_SETTER_LINES[foe.who];
  const lord = dil && (dil.open || dil.win || dil.slip) ? {
    open: dline("open") || (base ? base.open : ["黑先。", "Black to play."]),
    win: dline("win") || (base ? base.win : ["★ 完美！", "Flawless!"]),
    slip: dline("slip") || (base ? base.slip : TK_SETTER_LINES.stargrey.slip) } : base;
  const opening = () => {
    if (node.boss) say(node.boss.taunt_zh || "", node.boss.taunt);
    else if (lord) { say(...lord.open); if (dil && dil.open_vid && TKVoice.has(dil.open_vid)) TKVoice.play(dil.open_vid); }
    else if (foe) say("请。你执黑先下。", "Your move. You play Black.");
    else say("黑先。", "Black to play.");
  };
  opening();
  if (TK.restLeft(key) > 0) { say("先看清这局，片刻之后再落子。", "Study the position; you can play again in a moment."); tkRestLock(boardCard, key, opening); }

  trainer = new Trainer(Object.assign({}, src, { problems: [p] }), 0, { svg, boardCard, status, treePanel, ...hidden, noEngine: true });
  // Size the board to the window it sits in, keeping its shape (it's cropped to the corner in play).
  const fit = () => {
    if (box.parentNode && box.parentNode.classList.contains("tk-duel-full")) {
      // a phone upright: the board takes the width, but a tall crop (an adaptive pick, 7 wide by 12 tall) at most
      // ~52% of the height, so the dilemma, the dialogue and the keys stay on screen under it
      svg.removeAttribute("style"); boardCard.style.width = "";
      const vb = svg.viewBox.baseVal;
      if (!vb || !vb.width || matchMedia("(orientation: landscape) and (max-height: 560px)").matches) return;
      const W = Math.min(box.clientWidth - 32, 520) - 16, H = innerHeight * .52 - 16, k = Math.min(W / vb.width, H / vb.height);
      if (vb.height * W / vb.width <= H) return;   // fits by width: as before
      svg.style.width = `${Math.floor(vb.width * k)}px`; svg.style.height = `${Math.floor(vb.height * k)}px`; boardCard.style.width = "auto";
      return;
    }
    const vb = svg.viewBox.baseVal, cs = getComputedStyle(box);
    if (!vb || !vb.width) return;
    // with the lead's portrait column (18%) beside it, the board gives up some width, or the words beside it
    // are left a sliver (a dilemma broken into single words, its dialogue scrolled out of sight)
    const H = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 16, W = box.clientWidth * (box.classList.contains("has-lead") ? .46 : .6) - 16;
    const k = Math.min(H / vb.height, W / vb.width);
    svg.style.width = `${Math.floor(vb.width * k)}px`; svg.style.height = `${Math.floor(vb.height * k)}px`;
  };
  fit(); box.__fit = fit;
  const ro = new ResizeObserver(() => box.isConnected ? fit() : ro.disconnect());
  ro.observe(box);
  window.__trainer = trainer;
  const t = trainer;
  let settled = false;  // the first result decides the level; a reset can't undo a slip
  const onResult = e => {
    if (!box.isConnected) return removeEventListener("tczw:result", onResult);
    if (trainer !== t || settled) return;
    settled = true;
    TKElo.result(TK.world(worldN), node, [src.id, p.id], e.detail === "ok" && !t.flawed);   // adaptive difficulty: first try only
    const go = (label, fn) => h("button", { type: "button", class: "tk-duel-go", onclick: fn }, [label, h("b", {}, " ⏎")]);
    if (e.detail === "ok" && !t.flawed) {
      TK.markCleared(key);
      onWin();
      dlg.classList.add("win");
      if (node.boss) say("……我竟败了！", "…Defeated? Me?", go("继续 Continue ▸", leave));
      else if (lord) { say(...lord.win, go("继续 Continue ▸", leave)); if (dil && dil.win_vid && TKVoice.has(dil.win_vid)) TKVoice.play(dil.win_vid); }
      else if (foe) say("好棋！我认输。", "Well played. I resign.", go("继续 Continue ▸", leave));
      else say("★ 完美！", "Flawless!", go("继续 Continue ▸", leave));
    } else if (once) {   // one try (a chase): no second go; back to the world, which decides what follows
      dlg.classList.add("slip");
      say(...(e.detail === "ok" ? [`解出了，但不算完美（${t.flawed}）。被擒了！`, `Solved, but not flawless (${t.flawed}). You're taken!`] : ["被擒了！", "You're taken!"]), go("继续 Continue ▸", leave));
    } else {
      TK.rest(key);
      dlg.classList.add("slip");
      const how = e.detail === "ok" ? [`解出了，但不算完美（${t.flawed}）。`, `Solved, but not flawless (${t.flawed}).`]
        : lord ? lord.slip
        : foe ? ["哈！被我看穿了。换个思路吧。", "Ha! I saw through that. Try another way."] : ["敌人识破了！换个思路。", "The enemy saw through it! Try another way."];
      say(how[0], how[1]);
      if (e.detail !== "ok" && dil && dil.slip_vid && TKVoice.has(dil.slip_vid)) TKVoice.play(dil.slip_vid);
      // a moment to see what went wrong, then the same problem from the start, to study until the rest is over
      setTimeout(() => { if (box.isConnected) again(); }, 1800);
    }
  };
  addEventListener("tczw:result", onResult);
}

// A level laid over the explorable world, inside its window (or the whole screen
// when that window is small). Resolves true after a flawless solve, false if the
// player leaves. at: { host, foe } from the world.
const TKOverlay = {
  open(worldN, key, at = {}) {
    return new Promise(async resolve => {
      document.querySelectorAll(".tk-duel").forEach(el => el.remove());
      const host = at.host && at.host.isConnected ? at.host : null;
      const box = h("div", { class: "tk-duel-stage" });
      // the whole window, not the game's frame, when the frame is narrow or short (a phone held sideways)
      const cramped = el => !el || !el.isConnected || el.clientWidth < 640 || el.clientHeight < 420;
      const wrap = h("div", { class: "tk-duel" + (cramped(host) ? " tk-duel-full" : ""), role: "dialog", "aria-modal": "true", "aria-label": "Go problem 死活题" },
        [h("div", { class: "tk-duel-wipe" }), box]);
      (wrap.classList.contains("tk-duel-full") ? document.body : host).append(wrap);
      // a phone turned sideways or back: the whole screen or inside the game's window, decided again
      const relayout = () => {
        const full = cramped(host);
        if (full === wrap.classList.contains("tk-duel-full")) return;
        wrap.classList.toggle("tk-duel-full", full);
        wrap.classList.add("tk-relaid");   // moved, not opened: no wipe again
        (full ? document.body : host).append(wrap);
      };
      addEventListener("resize", relayout);
      let won = false, closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        if (trainer) { trainer.alive = false; clearTimeout(trainer.replyTimer); trainer = null; }
        removeEventListener("keydown", onKey, true); removeEventListener("hashchange", onNav); removeEventListener("resize", relayout);
        wrap.classList.remove("tk-relaid"); wrap.classList.add("tk-leave");
        setTimeout(() => { wrap.remove(); resolve(won); }, 280);
      };
      // Escape leaves; Enter takes the offered next step. Keys stay out of the paused world.
      const onKey = e => {
        if (e.key === "Escape") { e.preventDefault(); close(); }
        else if (e.key === "Enter" && !(e.target && e.target.tagName === "BUTTON")) { const b = box.querySelector(".tk-duel-go"); e.preventDefault(); if (b) b.click(); }
        else return;
        e.stopPropagation();
      };
      const onNav = () => close();
      addEventListener("keydown", onKey, true); addEventListener("hashchange", onNav);
      const show = async () => {
        const d = await tkLevelData(worldN, key);
        if (closed) return;
        if (!d) return close();
        tkDuelBuild(box, worldN, key, d, at.foe || null, { leave: close, again: show, once: !!at.once, onWin: () => { won = true; if (at.onWin) at.onWin(); } });
      };
      await show();
    });
  },
};

// Where the player is, for a feedback note: book, place, position, the next beat and its goal line,
// what's open on screen, and the device and settings.
// Talk with Claude: a two-way chat, listed with the books (the user, apo110). The thread lives in the private Chat
// sheet behind the Apps Script; a message pings the Feedback inbox PR (no content) to wake the Integration session,
// whose reply lands in the sheet, and the window asks for it every few seconds while open. apo110 and test mode only.
function tkChatAllowed() {
  return (typeof Sync !== "undefined" && Sync.username === "apo110") || (typeof TK_TEST !== "undefined" && TK_TEST);
}
let tkChatTimer = null;
// The study (world 90, Places' map) where you walk up to Claude and talk; the conversation plays in a dialogue box
// with a line to type in (TKTalk). It isn't a story book: registered here, hidden from every book list.
const TK_CHAT_WORLD = 90;
function tkChatWorld(D) {
  let w = D.worlds.find(x => x.n === TK_CHAT_WORLD);
  if (!w) {
    const b2 = TK.world(12), lead = (b2 && TK.party(b2) || [])[0] || "wangyun";   // you walk in as Book 2's lead
    w = { n: TK_CHAT_WORLD, name: "Talk with Claude", zh: "与Claude对话", chat: true, hidden: true, party: [lead],
      nodes: [], scenes: {}, cast: {}, chapters: [], grades: "", opening: [], closing: [] };
    D.worlds.push(w);
  }
  return w;
}
async function viewTKChat(plain) {
  const nav = routeSeq;
  if (!plain && tkChatAllowed() && Sync.chatKey() && typeof WorldView !== "undefined") {
    const D = await TK.load(), region = await WorldData.region(TK_CHAT_WORLD);
    if (nav !== routeSeq) return;
    if (region) return viewTKStudy(tkChatWorld(D));
  }
  clearTimeout(tkChatTimer);
  crumbs.innerHTML = "";
  crumbs.append(h("a", { href: "#/" }, "Library"), " / ", h("a", { href: "#/tk" }, "三国演义"), " / 对话 Talk with Claude");
  root.innerHTML = "";
  if (!tkChatAllowed()) {
    root.append(h("div", { class: "tk-chat" }, [h("p", {}, "这一卷不对外开放。This book isn't open.")]));
    return;
  }
  // the password (checked by the Apps Script against its CHAT_KEY): asked once, kept in this browser
  const askKey = wrong => {
    clearTimeout(tkChatTimer);
    root.innerHTML = "";
    const pw = h("input", { class: "tk-chat-in", type: "password", placeholder: "密码 Password", autocomplete: "current-password" });
    const go = h("button", { class: "tk-chat-send", type: "button" }, "进入 Enter");
    go.onclick = () => { const k = pw.value.trim(); if (!k) return; Sync.setChatKey(k); viewTKChat(plain); };
    pw.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") go.click(); });
    root.append(h("div", { class: "tk-chat" }, [
      h("div", { class: "tk-chat-head" }, [h("b", {}, "对话 · Talk with Claude"), h("small", {}, wrong ? "密码不对 Wrong password, try again." : "这一卷需要密码。This book needs its password.")]),
      h("div", { class: "tk-chat-row" }, [pw, go])]));
    pw.focus();
  };
  if (!Sync.chatKey()) return askKey(false);
  const log = h("div", { class: "tk-chat-log" });
  const ta = h("textarea", { class: "tk-chat-in", rows: "2", placeholder: "写给 Claude… Message Claude (Enter sends, Shift+Enter for a new line)" });
  const send = h("button", { class: "tk-chat-send", type: "button" }, "发送 Send");
  const note = h("div", { class: "tk-chat-note" });
  root.append(h("div", { class: "tk-chat" }, [
    h("div", { class: "tk-chat-head" }, [h("b", {}, "对话 · Talk with Claude"), h("small", {}, ["Claude replies here, usually within a minute or two. ", h("a", { href: "#/tk/chat" }, "回书房 Back to the study")])]),
    log, h("div", { class: "tk-chat-row" }, [ta, send]), note]));
  let list = [], pending = [], shown = "";
  const when = at => at ? new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "…";
  const draw = () => {
    const key = JSON.stringify([list.length, list.length && list[list.length - 1].at, pending.length]);
    if (key === shown) return;
    shown = key;
    const atEnd = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
    log.innerHTML = "";
    if (!list.length && !pending.length) log.append(h("div", { class: "tk-chat-empty" }, "还没有消息。No messages yet: say hello."));
    for (const m of [...list, ...pending])
      log.append(h("div", { class: "tk-chat-m " + (m.who === "claude" ? "them" : "me") + (m.pending ? " pending" : "") },
        [h("div", { class: "tk-chat-text" }, m.text), h("small", {}, (m.who === "claude" ? "Claude · " : "") + when(m.at))]));
    if (atEnd || pending.length) log.scrollTop = log.scrollHeight;
  };
  const poll = async () => {
    if (nav !== routeSeq) return;
    try {
      list = await Sync.fetchChat();
      if (nav !== routeSeq) return;
      pending = pending.filter(p => !list.some(m => m.who === "you" && m.text === p.text));
      note.textContent = "";
      draw();
    } catch (e) {
      if (e.locked) { Sync.setChatKey(""); return askKey(true); }
      console.error(e); note.textContent = "连不上对话 Can't reach the chat right now; trying again.";
    }
    if (nav === routeSeq) tkChatTimer = setTimeout(poll, 8000);
  };
  send.onclick = async () => {
    const text = ta.value.trim();
    if (!text) return;
    send.disabled = true;
    pending.push({ who: "you", text, pending: true });
    ta.value = "";
    draw();
    try { await Sync.sendChat(text, `#/tk/chat · last book ${(() => { try { return localStorage.getItem("tk-book") || "?"; } catch { return "?"; } })()}`); }
    catch (e) {
      if (e.locked) { Sync.setChatKey(""); return askKey(true); }
      console.error(e); note.textContent = "没发出去 Couldn't send; your message is back in the box."; pending.pop(); ta.value = text; draw();
    }
    send.disabled = false;
    clearTimeout(tkChatTimer);
    tkChatTimer = setTimeout(poll, 1500);
  };
  ta.addEventListener("keydown", e => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send.click(); }
  });
  draw();
  poll();
}

async function viewTKStudy(w) {
  const nav = routeSeq;
  clearTimeout(tkChatTimer);
  crumbs.innerHTML = "";
  crumbs.append(h("a", { href: "#/" }, "Library"), " / ", h("a", { href: "#/tk" }, "三国演义"), " / 对话 Talk with Claude");
  root.innerHTML = "";
  // straight back to the book you were playing (the user: "I can't navigate back to Diaochan Book 2 quickly")
  let back = 12; try { back = +localStorage.getItem("tk-book") || 12; } catch {}
  const bw = TK.world(back) && !TK.world(back).chat && TK.worldOpen(back) ? TK.world(back) : (TK.data.worlds.find(x => !x.chat && TK.worldOpen(x.n)) || {});
  root.append(h("div", { class: "tk-worlds" }, [h("a", { class: "tk-world tk-world-back", href: `#/tk/${bw.n || ""}` },
    `◀ 回第${bw.book || bw.n}卷 Back to Book ${bw.book || bw.n} · ${bw.zh || ""} ${bw.name || ""}`)]));
  root.append(h("div", { class: "tk-info" }, [h("div", { class: "tk-info-text" }, [h("b", {}, "与Claude对话 · Talk with Claude"),
    h("div", { class: "meta" }, ["走到书桌前和 Claude 说话。Walk up to Claude at the desk and talk. ", h("a", { href: "#/tk/chat/plain" }, "纯文字 Plain chat window")])])]));
  const host = h("div", { class: "tk-map" });
  root.append(host);
  try { await WorldView.mount({ w, host, onTalkTo: scene => TKTalk.open(scene, host) }); }
  catch (e) { host.textContent = e.message; }
  if (nav !== routeSeq) WorldView.destroy();
}

// The conversation with Claude in the study: Claude's lines in a dialogue box with the portrait, and a line for
// yours underneath. The same private thread as the plain chat window (app.js Sync.sendChat / fetchChat).
const TKTalk = {
  open(scene, host) {
    if (host.querySelector(".tk-talk")) return;
    scene.seated = true;
    if (scene.player) scene.player.setVelocity(0);
    const file = typeof TownUI !== "undefined" && TownUI.portraits && TownUI.portraits.claude;
    const log = h("div", { class: "tk-talk-log" });
    const ta = h("textarea", { class: "tk-talk-in", rows: "1", placeholder: "你说… Say something (Enter sends, Esc leaves)" });
    const send = h("button", { class: "tk-talk-send", type: "button" }, "说 Say");
    const leave = h("button", { class: "tk-talk-leave", type: "button", title: "Leave the conversation" }, "✕");
    const el = h("div", { class: "tk-talk town-dlg" + (file ? " has-portrait" : "") }, [
      ...(file ? [h("img", { class: "tk-talk-face", src: `assets/tk/portraits/${file}?v=${TownUI.PORTRAIT_V}`, alt: "" })] : (() => {   // no painting: the pixel bust (Clawd, drawn in code by TKArt)
        try { const c = h("canvas", { class: "tk-talk-face town-face", width: "34", height: "34" }); c.getContext("2d").drawImage(TKArt.get("claude", "bust"), 0, 0); return [c]; } catch { return []; }
      })()),
      h("div", { class: "tk-talk-body" }, [h("div", { class: "town-who" }, ["Claude", leave]), log, h("div", { class: "tk-talk-row" }, [ta, send])])]);
    host.append(el);
    let list = [], pending = [], waiting = false, timer = null, shown = "";
    const draw = () => {
      const key = JSON.stringify([list.length, list.length && list[list.length - 1].at, pending.length, waiting]);
      if (key === shown) return;
      shown = key;
      log.innerHTML = "";
      const all = [...list.slice(-6), ...pending];
      if (!all.length) log.append(h("div", { class: "tk-talk-line them" }, "你好！有什么想聊的？Hello! What would you like to talk about?"));
      for (const m of all) log.append(h("div", { class: "tk-talk-line " + (m.who === "claude" ? "them" : "me") + (m.pending ? " pending" : "") }, (m.who === "claude" ? "" : "你 You: ") + m.text));
      if (waiting) log.append(h("div", { class: "tk-talk-line them thinking" }, "……"));
      log.scrollTop = log.scrollHeight;
    };
    const locked = () => { Sync.setChatKey(""); askKey(true); };
    const poll = async () => {
      try {
        list = await Sync.fetchChat();
        pending = pending.filter(p => !list.some(m => m.who === "you" && m.text === p.text));
        const last = list[list.length - 1];
        if (waiting && last && last.who === "claude") waiting = false;
        draw();
      } catch (e) { if (e.locked) return locked(); console.error(e); }
      if (el.isConnected) timer = setTimeout(poll, waiting ? 4000 : 8000);
    };
    const close = () => { clearTimeout(timer); el.remove(); scene.seated = false; host.focus(); };
    send.onclick = async () => {
      const text = ta.value.trim();
      if (!text) return;
      ta.value = ""; pending.push({ who: "you", text, pending: true }); waiting = true; draw();
      try { await Sync.sendChat(text, "#/tk/chat · the study"); }
      catch (e) { if (e.locked) return locked(); console.error(e); pending.pop(); waiting = false; ta.value = text; draw(); }
      clearTimeout(timer); timer = setTimeout(poll, 1500);
    };
    leave.onclick = close;
    // keys typed here are for the conversation, not for walking
    for (const ev of ["keydown", "keyup", "keypress"]) el.addEventListener(ev, e => e.stopPropagation());
    ta.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send.click(); }
    });
    el.addEventListener("mousedown", e => e.stopPropagation());
    el.addEventListener("pointerdown", e => e.stopPropagation());
    // the chat's password (the script's CHAT_KEY), asked here in the box the first time, kept in this browser
    const row = el.querySelector(".tk-talk-row");
    const askKey = wrong => {
      clearTimeout(timer);
      log.innerHTML = "";
      log.append(h("div", { class: "tk-talk-line them" }, wrong ? "密码不对。Wrong password, try again." : "先说暗号。The password, please."));
      const pw = h("input", { class: "tk-talk-in", type: "password", placeholder: "密码 Password", autocomplete: "current-password" });
      const ok = h("button", { class: "tk-talk-send", type: "button" }, "进 Enter");
      const go = () => { const k = pw.value.trim(); if (!k) return; Sync.setChatKey(k); row.replaceChildren(ta, send); shown = ""; draw(); poll(); setTimeout(() => ta.focus(), 50); };
      ok.onclick = go;
      pw.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); go(); } else if (e.key === "Escape") { e.preventDefault(); close(); } });
      row.replaceChildren(pw, ok);
      setTimeout(() => pw.focus(), 50);
    };
    if (!Sync.chatKey()) return askKey(false);
    draw(); poll();
    setTimeout(() => ta.focus(), 50);
  },
};

// Adaptive difficulty (the user, apo110): an Elo rating kept in the synced progress. A board solved on the first
// try (no slip, no hint) is a win, anything else a loss, against the problem's own grade; the next board is the
// unused problem nearest the rating (one of the nearest few, so it isn't predictable). 15K = 600, 100 a grade,
// 1K = 2000, 1D = 2100. Starts at 14K, the old Easy.
const TKElo = {
  START: 700,
  // the problem's rating against the player's: a board is aimed at a 3-in-4 first-try solve, a boss at 1-in-2
  // (the user). Elo's expectation 1/(1+10^(d/400)) is 3/4 at d = -400·log10(3) ≈ -191, 1/2 at d = 0.
  BOARD: -Math.round(400 * Math.log10(3)), BOSS: 0,
  of(rank) { return 600 + rank * 50; },
  state(p = loadProgress()) { return p.tkElo || (p.tkElo = { r: this.START, n: 0, used: [], slots: {} }); },
  get rating() { return this.state().r; },
  label(r = this.rating) {
    const i = Math.max(0, Math.round((r - 600) / 50));
    return i < 30 ? `${15 - Math.floor(i / 2)}K${i % 2 ? "+" : ""}` : `${1 + Math.floor((i - 30) / 2)}D${(i - 30) % 2 ? "+" : ""}`;
  },
  pick(w, slot, offset = this.BOARD) {
    const p = loadProgress(), s = this.state(p);
    s.slots = s.slots || {}; s.used = s.used || [];
    if (s.slots[slot]) return s.slots[slot];
    const aim = s.r + offset, used = new Set(s.used), near = w.rated.filter(x => !used.has(`${x[0]}:${x[1]}`))
      .sort((a, b) => Math.abs(this.of(a[2]) - aim) - Math.abs(this.of(b[2]) - aim)).slice(0, 6);
    const x = near[Math.floor(Math.random() * near.length)] || w.rated[0];
    s.slots[slot] = [x[0], x[1]];
    s.used.push(`${x[0]}:${x[1]}`);
    if (s.used.length > 500) s.used = s.used.slice(-500);
    const keys = Object.keys(s.slots); if (keys.length > 400) for (const k of keys.slice(0, keys.length - 400)) delete s.slots[k];   // a seen board stays
    TK.saveProg(p);
    return s.slots[slot];
  },
  // a board's first result, in Adaptive: the rating moves (faster for the first ten boards); it shapes the boards
  // still unseen, never one already dealt
  result(w, node, ref, win) {
    if (TK.mode !== "adaptive" || !w || !w.rated || !node) return;
    const x = w.rated.find(y => y[0] === ref[0] && y[1] === ref[1]);
    if (!x) return;
    const p = loadProgress(), s = this.state(p), E = 1 / (1 + Math.pow(10, (this.of(x[2]) - s.r) / 400));
    s.r = Math.round(Math.max(300, Math.min(2800, s.r + (s.n < 10 ? 96 : s.n < 30 ? 64 : 32) * ((win ? 1 : 0) - E))));
    s.n = (s.n || 0) + 1;
    TK.saveProg(p);
  },
};

function tkFeedbackContext(w) {
  const sc = window.__w, parts = [location.hash, `Book ${w.n}`];
  try {
    if (sc && sc.place) {
      const P = sc.player;
      parts.push(`place ${sc.placeId}${P ? ` @ ${Math.round(P.x)},${Math.round(P.y)} facing ${P.facing}` : ""}`);
      const q = sc.nextMain && sc.nextMain();
      if (q) parts.push(`next ${q.node}`);
      if (sc.goalText) parts.push(`goal "${sc.goalText[0]}"`);
      const busy = [sc.cine && "cutscene", sc.ui && sc.ui.busy() && "dialogue", sc.seated && "go table"].filter(Boolean);
      if (busy.length) parts.push(`on screen: ${busy.join(", ")}`);
    }
    if (document.querySelector(".tk-duel")) parts.push(`problem open${window.__trainer && window.__trainer.p ? ` (${window.__trainer.p.id || ""})` : ""}`);
    parts.push(`cleared ${w.nodes.filter(x => TK.cleared(x.key)).length}/${w.nodes.length}`);
    parts.push(`kit ${typeof WorldView !== "undefined" ? WorldView.kit() : "?"}`, `voice ${TKVoice.lang}`);
    parts.push(`${TK_TOUCH ? "touch" : "mouse"} ${innerWidth}x${innerHeight}`);
    if (TK_TEST) parts.push("test mode");
    const v = [...document.scripts].map(x => (x.src.match(/(tk-world|tk)\.js\?v=\d+/) || [])[0]).filter(Boolean);
    if (v.length) parts.push(v.join(" "));
  } catch (e) { parts.push(`(context error: ${e.message})`); }
  return parts.join(" · ");
}

// Every story scene in the novel's order; the ones not yet seen stay hidden.
function tkChronicle(w, map) {
  const items = [["opening", "Prologue", null]];
  // the nodes come in the story's order; the boss's closing scroll follows the boss, before Anxi
  for (const n of w.nodes.filter(n => n.scene && w.scenes[n.scene])) {
    items.push([n.scene, w.scenes[n.scene].title, n]);
    if (n.role === "boss" && w.closing && w.closing.length) items.push(["closing", (w.closing.find(s => s[0] === "scroll") || [])[1] || "Epilogue", null]);   // the closing scroll's own title
  }
  const wrap = h("div", { class: "tk-scroll-wrap" });
  const list = h("div", { class: "tk-chron" });
  for (const [id, title, n] of items) {
    const seen = TK.seen(`${w.n}:${id}`), side = n && (n.role === "side" || n.role === "short");
    const b = h("button", { type: "button", class: (seen ? "" : "unseen ") + (side ? "side" : "") }, [
      h("b", {}, seen ? title : side ? `??? — ${n.role === "short" ? "take the mountain trail" : "take the long road"}` : "???"),
      h("span", {}, n ? n.place : ""),
    ]);
    b.disabled = !seen;
    b.onclick = async () => {
      close();
      const steps = id === "opening" ? w.opening : id === "closing" ? w.closing : w.scenes[id].steps;
      TKStory.busy = true;
      try { await TKStory.play(map, steps.filter(s => s[0] !== "party")); } finally { TKStory.busy = false; }
    };
    list.append(b);
  }
  // closes from the top as well as the end, by a tap outside it, or Escape
  const close = () => { wrap.remove(); removeEventListener("keydown", esc, true); };
  const esc = e => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
  addEventListener("keydown", esc, true);
  wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
  wrap.append(h("div", { class: "tk-scroll" }, [
    h("button", { class: "tk-scroll-x", type: "button", "aria-label": "Close 关闭", onclick: close }, "关闭 Close"),
    h("h3", {}, `Chronicle · ${w.name}`), list,
    h("button", { class: "tk-scroll-go", type: "button", onclick: close }, "Close")]));
  document.body.append(wrap);
}
