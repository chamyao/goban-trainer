/* ================= avatars: the story's protagonists, collected by playing as them ================= */
// The user: "board avatars as a site feature like in the stories", "a way to gain collectibles from the playthroughs
// such as the avatars", "mainly I just care about protagonists", "everyone you play as", "when you first complete a
// problem as them", Jang Geu-rae "just use the main one". A protagonist is anyone a book hands you the lead as (its
// party's first: w.party, and each ["party", [...]] in its scenes); one joins the collection the first time a story
// board is completed while playing as them (TK.markCleared). The one picked sits beside the site's boards (problems,
// the Stream, Turning points), with a word when a problem is solved or missed.
// Kept in the progress row (progress.av: own {who: 1}, pick), merged by union.
const Avatars = (() => {
  const SAME = { ms_jang_child: "ms_jang", ms_jang_young: "ms_jang" };   // one Jang Geu-rae: the main one, the intern (ms_jang)
  const norm = who => SAME[who] || who;
  const NOT = new Set(["redhare"]);   // (a horse led a scene once)
  const L = () => { const p = loadProgress(); return p.av || { own: {}, pick: "" }; };
  const store = f => { const p = loadProgress(); p.av = p.av || {}; p.av.own = p.av.own || {}; f(p.av); TK.saveProg(p); };
  const owns = who => !!(L().own || {})[norm(who)];
  const picked = () => { const w = L().pick; return w && owns(w) ? w : ""; };
  const name = who => (typeof tkName === "function" ? tkName(who) : who);
  let portraits = null;
  const PV = () => (typeof TownUI !== "undefined" && TownUI.PORTRAIT_V) || 0;   // (the portraits' version, tk-town.js)
  const loadPortraits = () => portraits || (portraits = fetch(`assets/tk/portraits/portraits.json?v=${PV()}`).then(r => r.json()).catch(() => ({})));
  const img = (file) => `assets/tk/portraits/${file}?v=${PV()}`;

  // every protagonist, by book, from the story's data
  let leadsP = null;
  function leads() {
    return leadsP || (leadsP = (async () => {
      if (!TK.data) await TK.load();
      const out = [];
      for (const w of TK.data.worlds) {
        const seq = [(w.party || [])[0]];
        const s = JSON.stringify(w.scenes || {});
        for (const m of s.matchAll(/\["party",\s*\["([^"]+)"/g)) seq.push(m[1]);
        const novel = w.novel ? (TK_NOVELS[w.novel] || {}).title : "Romance of the Three Kingdoms";
        for (const who of seq.map(norm)) {   // (one who leads in several books: every one of them)
          if (!who || NOT.has(who)) continue;
          const x = out.find(y => y.who === who);
          if (x) { if (!x.books.includes(w.n)) x.books.push(w.n); } else out.push({ who, books: [w.n], novel });
        }
      }
      return out;
    })());
  }
  // who the story has you play as in a book right now
  const leadOf = n => { const w = TK.world(n); return w ? norm((TK.party(w) || [])[0] || "") : ""; };

  function unlock(who, quiet) {
    who = norm(who);
    if (!who || NOT.has(who) || owns(who)) return false;
    store(A => { A.own[who] = 1; if (!A.pick) A.pick = who; });
    if (!quiet) toast(`🎭 ${name(who)} joins your avatars`);
    return true;
  }
  // a story board completed: whoever you're playing as joins (TK.markCleared calls this)
  function cleared(key) {
    const n = parseInt(key, 10);
    if (n) unlock(leadOf(n));
  }
  // boards won before avatars existed: who led then isn't known, so each book's first lead for a book begun, and all
  // of its leads for a book finished
  async function catchUp() {
    // a board ever completed counts, a book since started over included (a rebuilt book's start-over keeps an undo on
    // every board: apo110's Book 12, beaten before it, read as unfinished, and Diaochan stayed locked)
    const p = loadProgress(), ever = k => (p.tk || {})[k] === 1, done = Object.keys(p.tk || {}).filter(ever);
    if (!done.length) return;
    const all = await leads();
    for (const w of TK.data.worlds) {
      const mine = done.filter(k => parseInt(k, 10) === w.n);
      if (!mine.length) continue;
      // finished: its last board cleared (a board nothing follows; only Books 1–3 call theirs N-boss)
      const finished = ever(`${w.n}-boss`) || w.nodes.some(n => !TK.isStart(n.key) && !w.edges.some(e => e[0] === n.key) && ever(n.key));
      if (finished) for (const x of all.filter(x => x.books.includes(w.n))) unlock(x.who, true);
      else unlock((w.party || [])[0], true);
    }
  }

  function toast(text) {
    const t = h("div", { class: "event-toast" }, text);
    document.body.append(t);
    setTimeout(() => t.remove(), 2800);
  }
  // the avatar on a board page, as the story's duel has its lead (Graphics: style.css .tk-duel-lead; the user: "on the
  // bottom left and bigger, similar to the stories"): on a wide screen a column left of the board, the painted cut-out
  // standing on the board's foot (its waist cut flush on that edge, nothing cropped above), in front of the board's
  // edge with taps passing through, and the word on a result in a dark box over its head (from 1280px, where a column
  // fits beside the board and its side panel); narrower, a small portrait beside the box under the board
  // each in their own voice (the user: "did you match the avatar dialogues to their personality"); the Misaeng cast in
  // English, as their book; anyone not here, the plain lines
  const LINES = { ok: [["妙！", "Brilliant!"], ["好棋。", "A fine move."], ["正是此处。", "Exactly there."]],
                  bad: [["可惜。", "A pity."], ["再想想。", "Think again."], ["不是这里。", "Not there."]] };
  const VOICE = {
    liubei: { ok: [["此乃众人之功。", "The credit belongs to all of us."], ["仁者无敌。", "The benevolent have no enemy."], ["得此一着，如鱼得水。", "This move is like a fish finding water."],
                   ["二弟三弟，看这一手！", "Brothers, look at this move!"], ["以德服人，以棋服人。", "Win by virtue; win at the board."], ["好，大事可成。", "Good. Great things can be done."]],
              bad: [["备之过也。", "The fault is mine."], ["莫急，从长计议。", "No haste. We think it through."], ["勿以恶小而为之……这一手，小了。", "Don't do wrong because it's small… that move was small."],
                    ["败而不馁，再图兴复。", "Beaten, not broken; we rise again."], ["是我看错了。", "I misjudged it."]] },
    diaochan: { ok: [["一着妙手，胜过千军。", "One fine move outweighs a thousand soldiers."], ["妾身早知如此。", "I knew it would come to this."], ["连环之计，便在此处。", "The chain of stratagems turns right here."],
                     ["月见了也要躲进云里。", "Even the moon would hide behind a cloud."], ["轻轻一子，便定了乾坤。", "One light stone, and heaven and earth are settled."], ["义父，这一手，可还入眼？", "Father, does this move please you?"]],
                bad: [["此计未成，再图之。", "This plan failed; then another."], ["妾身……一时大意了。", "I was careless, for a moment."], ["一步错了，便要再演一出戏。", "One wrong step, and another act must be played."],
                      ["这一手，不似妾身。", "That move wasn't like me."], ["无妨，戏还长着。", "No matter. The play is long."]] },
    wangyun: { ok: [["汉室有望矣！", "There is hope for the Han!"], ["老夫此计，天衣无缝。", "This old man's plan has no seam."], ["国贼可除矣。", "The traitor can be undone."],
                    ["一子落下，社稷安矣。", "One stone down, and the realm is safe."], ["好！老夫老而未朽。", "Good! Old, but not yet rotten."], ["此着，可以告慰先帝。", "This move would comfort the late emperor."]],
               bad: [["老夫失算了。", "This old man miscalculated."], ["事不密则害成……", "A plan not kept close comes to harm…"], ["唉，汉室何其多难。", "Alas, how the Han suffers."],
                     ["再谋。老夫尚有一计。", "Again. This old man has one more plan."], ["老眼昏花，错看了。", "Old eyes; I misread it."]] },
    caocao: { ok: [["哈哈哈！此一手，天下谁能当之？", "Ha! Who under heaven could answer that?"], ["天下英雄，皆在吾算中。", "Every hero under heaven, in my reckoning."], ["老骥伏枥，志在千里。", "An old steed in the stable still dreams of a thousand li."],
                   ["吾得此着，如得子房。", "This move is worth a Zhang Liang to me."], ["对酒当歌，人生几何！", "Drink and sing: how long is a life!"], ["说曹操，曹操便到。", "Speak of Cao Cao, and here he is."]],
              bad: [["胜败乃兵家常事。", "Victory and defeat are a soldier's daily fare."], ["吾自失之，非人之过。", "I lost it myself. No one else to blame."], ["哼，吾好梦中下棋。", "Hmph. I play in my sleep."],
                    ["此一着，吾记下了。", "That one I'll remember."], ["鸡肋，鸡肋……", "Chicken ribs, chicken ribs…"]] },
    lvbu: { ok: [["人中吕布！", "Among men, Lü Bu!"], ["谁敢与我争锋？", "Who dares cross blades with me?"], ["方天画戟，所向披靡！", "My halberd: everything falls before it!"],
                 ["马中赤兔，棋中吕布！", "Red Hare among horses, Lü Bu at the board!"], ["哈！一戟定乾坤！", "Ha! One stroke settles it!"], ["天下无人可挡！", "No one under heaven can stop me!"]],
            bad: [["可恶！再来！", "Curse it! Again!"], ["吕布岂会败于此？", "Would Lü Bu lose to this?"], ["这棋盘，欺我！", "This board cheats me!"],
                  ["谁在背后算我？", "Who's scheming behind my back?"], ["哼，下一手必胜。", "Hmph. The next one I win."]] },
    lisu: { ok: [["三寸之舌，胜于百万之师。", "Three inches of tongue beat a million troops."], ["说得通，下得也通。", "Well argued, well played."], ["赤兔已送，此子亦然。", "I delivered Red Hare; I deliver this too."],
                 ["不战而屈人之兵。", "Subdue without a battle."], ["妙哉，正如我所言。", "Marvellous, just as I said."], ["这一手，有理有据。", "This move stands on reason."]],
            bad: [["此言……未能说动。", "That argument… didn't carry."], ["待我再想一番说辞。", "Let me find better words."], ["说客也有词穷之时。", "Even an envoy runs out of words."],
                  ["咳，失言，失言。", "Ahem. Misspoke, misspoke."], ["容我再陈一策。", "Let me present another plan."]] },
    jiaxu: { ok: [["算无遗策。", "Nothing left uncalculated."], ["正合我算。", "Exactly as I reckoned."], ["一言乱天下，一子定一局。", "One word upends the realm; one stone decides a game."],
                  ["不出所料。", "As expected."], ["静观其变，变已至此。", "Watch and wait; and so it came."], ["保身之道，亦是棋道。", "The way to keep alive is the way of go."]],
             bad: [["嗯……此处，吾亦未算到。", "Hm. Even I didn't see that one."], ["不急。再算。", "No hurry. Reckon again."], ["失一子，不失全局。", "Lose a stone, not the game."],
                   ["此着，可改。", "This move can be mended."], ["退一步，再看。", "Step back, and look again."]] },
    lijue: { ok: [["痛快！", "Satisfying!"], ["哼，杀得好！", "Hah! A good kill!"], ["长安是我的了！", "Chang'an is mine!"],
                  ["来呀，再来！", "Come on, another!"], ["吃！全吃了！", "Eat it! Eat them all!"], ["这才叫打仗！", "Now that's fighting!"]],
             bad: [["混账！", "Damn it all!"], ["老子不服！", "I don't accept it!"], ["谁坏我事？！", "Who ruined this?!"],
                   ["哼，下回砍了他。", "Hmph. Next time, off with his head."], ["气煞我也！", "I'm furious!"]] },
    chenliu: { ok: [["朕……下对了吗？", "Did I… get it right?"], ["朕明白了！", "I understand now!"], ["原来如此，朕记住了。", "So that's how. I'll remember."],
                    ["朕也能保护百姓吗？", "Can I protect the people too?"], ["好！朕再下一盘！", "Good! Let me play another!"], ["这一子，朕自己想的。", "I thought of this stone myself."]],
               bad: [["朕不明白……", "I don't understand…"], ["再教朕一次。", "Teach me once more."], ["朕……下错了吗？", "Did I… get it wrong?"],
                     ["朕不怕，朕再想想。", "I'm not afraid. I'll think again."], ["若是皇兄在就好了。", "If only my brother were here."]] },
    dongzhuo: { ok: [["顺我者昌！", "Those who follow me prosper!"], ["天下都是我的！", "All under heaven is mine!"], ["哈哈，谁能奈何得了我？", "Ha! Who can touch me?"],
                     ["来人，赏！", "Reward them!"], ["这一手，朝堂上谁敢说不？", "Who in court dares say no to this?"], ["吾儿奉先也不过如此。", "Even my son Fengxian does no better."]],
                bad: [["谁敢笑我？！", "Who dares laugh?!"], ["哼！再来！", "Hmph! Again!"], ["逆我者亡！", "Those who cross me die!"],
                      ["这棋，拖出去斩了！", "Drag this game out and behead it!"], ["定是有人害我。", "Someone has wronged me."]] },
    chengong: { ok: [["此一着，可定大局。", "This move settles the whole game."], ["谋定而后动，正是如此。", "Plan first, then move. Just so."], ["公台之计，终得一用。", "At last, Gongtai's plan is used."],
                     ["大丈夫立于世，当如此着。", "A man should stand in the world like this move."], ["好！此乃正道。", "Good! This is the right way."], ["宁为玉碎，此子不让。", "Better broken jade: this stone won't yield."]],
                bad: [["公台失策了……", "Gongtai has erred…"], ["可惜，良策不用。", "A pity: the good plan went unused."], ["悔不当初。", "I regret it already."],
                      ["此非吾之本意。", "That's not what I intended."], ["再议，再议。", "Again, let us deliberate."]] },
    yanshi: { ok: [["夫君，你看。", "Look, husband."], ["原来如此，妾身也会。", "So that's it. I can do it too."], ["这一子，妾身斗胆了。", "I was bold with this stone."],
                   ["家中安好，便是赢了。", "If home is safe, we've won."], ["呀，下对了。", "Oh, I got it right."], ["夫君教的，妾身记着呢。", "I remembered what you taught me, husband."]],
              bad: [["妾身不懂这些……", "I don't understand these things…"], ["还是小心些好。", "Better to be careful."], ["妾身怕了……", "I'm afraid…"],
                    ["夫君莫怪。", "Don't be cross, husband."], ["再让妾身想想。", "Let me think again."]] },
    zhangliao: { ok: [["张辽在此！", "Zhang Liao is here!"], ["八百破十万，何况此局！", "Eight hundred broke a hundred thousand. This is nothing!"], ["冲阵，就在此处！", "Charge the line, right here!"],
                      ["小儿止啼，敌阵自乱。", "Children stop crying; the enemy lines break."], ["文远此着，无愧主公。", "Wenyuan's move does his lord proud."], ["一鼓作气！", "In one breath!"]],
                 bad: [["败而不馁。", "Beaten, not broken."], ["整军再战。", "Regroup and fight again."], ["是我冒进了。", "I pushed too far."],
                       ["收兵，再来。", "Pull back. Again."], ["此阵未破，下次必破。", "This line held. Next time it breaks."]] },
    chendeng: { ok: [["正中下怀。", "Just as I'd hoped."], ["一切尽在掌握。", "All in hand."], ["湖海之士，本当如此。", "So should a man of lakes and seas play."],
                    ["徐州之计，便在此子。", "The plan for Xuzhou lies in this stone."], ["好，好。", "Good. Good."], ["鲙鱼虽美，不及此着。", "Even raw fish isn't as fine as this move."]],
               bad: [["失算一着。", "One move miscounted."], ["且看下回。", "We'll see next time."], ["此子无用矣。", "This stone is wasted."],
                     ["唔，再筹划。", "Hm. Plan again."], ["面上无事，心中有数。", "Calm outside; I know what went wrong."]] },
    houcheng: { ok: [["这一手，我早看准了。", "I had my eye on that one."], ["好！", "Good!"], ["马是我追回来的，这棋也是。", "I brought the horses back; this game too."],
                    ["哈，酒也该喝一杯了。", "Ha, that deserves a drink."], ["这下没人小看我了。", "No one looks down on me now."], ["稳了。", "Got it."]],
               bad: [["唉，又是这般……", "Ugh, this again…"], ["不该如此。", "It shouldn't go like this."], ["又要挨骂了……", "I'll get shouted at again…"],
                     ["我这脑袋啊。", "This head of mine."], ["再来，我就不信。", "Again. I won't believe it."]] },
    zhaoyun: { ok: [["吾乃常山赵子龙也！", "I am Zhao Zilong of Changshan!"], ["一身是胆。", "All courage."], ["七进七出，又何妨！", "In and out seven times, what of it!"],
                   ["主公放心。", "Rest easy, my lord."], ["枪到之处，无人可挡。", "Where my spear goes, none can stand."], ["阿斗安然，子龙安心。", "A-Dou is safe; Zilong is at ease."]],
              bad: [["子龙惭愧。", "Zilong is ashamed."], ["再闯一回！", "I'll charge through again!"], ["是子龙轻敌了。", "Zilong underestimated them."],
                    ["收枪，重来。", "Lower the spear. Again."], ["主公，容子龙再试。", "My lord, let Zilong try again."]] },
    ladysun: { ok: [["哼，不过如此！", "Hmph, is that all?"], ["本小姐出手，岂有不胜？", "When I play, how could I lose?"], ["刀剑也好，棋子也好，我都不输。", "Swords or stones, I don't lose."],
                   ["玄德，你看见没有？", "Xuande, did you see that?"], ["江东的女儿，就是这样下棋。", "That's how a daughter of Jiangdong plays."], ["痛快！", "Satisfying!"]],
              bad: [["再来一局！", "One more game!"], ["哼，下次可不会了。", "Hmph. Not next time."], ["是这棋盘不好！", "It's this board's fault!"],
                    ["不许笑！", "Don't you laugh!"], ["我只是让你一手。", "I was only giving you one."]] },
    daiyu: { ok: [["这一手倒也有几分意思。", "There's something to that move."], ["原来如此，不过尔尔。", "So that's all it was."], ["偏是我会，你们倒不会了。", "So it's me who knows, and not you all."],
                  ["一子落定，倒像一句好诗。", "A stone set down, like a good line of verse."], ["宝玉若在，又要说我刻薄了。", "If Baoyu were here, he'd call me sharp again."], ["也罢，算我赢了。", "Very well, call it my win."]],
             bad: [["花谢花飞……罢了。", "Petals fall and fly… never mind."], ["我原说不会下的。", "I did say I couldn't play."], ["你们只管笑我便是。", "Go on, laugh at me."],
                   ["这也值得生气？", "Is this worth getting upset over?"], ["一年三百六十日，风刀霜剑严相逼。", "Three hundred sixty days a year, wind like knives and frost like swords."]] },
    grannyliu: { ok: [["哎哟，老婆子也下着了！", "Well I never! This old woman got one!"], ["阿弥陀佛，这可巧了！", "Bless me, what luck!"], ["老刘，老刘，食量大如牛！", "Old Liu, Old Liu, eats like an ox!"],
                      ["回去跟板儿说，他姥姥会下棋！", "I'll tell Ban'er his granny can play!"], ["这一子比那茄鲞还香！", "This stone's tastier than that aubergine dish!"], ["庄稼地里也有学问。", "There's learning in a farm field too."]],
                 bad: [["庄稼人，哪懂这个。", "A farm woman, what do I know of this?"], ["老婆子眼花了。", "My old eyes are going."], ["哎哟，又闹笑话了。", "Oh dear, I've made a fool of myself again."],
                       ["这棋子比银子还难认。", "These stones are harder to tell apart than silver."], ["姑娘们别笑，老婆子再来。", "Don't laugh, young ladies; I'll try again."]] },
    ms_jang: { ok: [["", "Baduk taught me this one."], ["", "One more stone that lives."], ["", "I read it all the way out."],
                    ["", "Small steps. They add up."], ["", "Just like the old records."], ["", "That's one I won't forget."]],
               bad: [["", "I'm not there yet. I'll get there."], ["", "I didn't read it out. Again."], ["", "My fault. I'll own it."],
                     ["", "Haste. That was haste."], ["", "Not alive yet. Still breathing, though."]] },
    ms_oh: { ok: [["", "Good. That's our guy."], ["", "See? Hard work pays."], ["", "Now that's a Sales 3 move."],
                  ["", "Let's grab a drink after this."], ["", "Nobody's laughing at our team now."], ["", "Not bad, kid. Not bad at all."]],
             bad: [["", "Hey. Focus."], ["", "We're not finished yet."], ["", "Go wash your face and come back."],
                   ["", "Mistakes happen. Fix it."], ["", "Breathe. Then read it again."]] },
    ms_oh_hike: { ok: [["", "Good. Keep climbing."], ["", "That's the summit."], ["", "Look at that view."],
                       ["", "One ridge at a time."], ["", "The air's better up here."], ["", "See? Worth the climb."]],
                  bad: [["", "Breathe. One step at a time."], ["", "Slipped. Get up."], ["", "Wrong trail. Back down a bit."],
                        ["", "Mountains don't rush."], ["", "Rest a second. Then up."]] },
    ms_ahn: { ok: [["", "Done."], ["", "As expected."], ["", "That's the number that works."],
                   ["", "Filed. Next."], ["", "I checked it twice."], ["", "Good. Clean."]],
              bad: [["", "I'll fix it."], ["", "Again. Properly this time."], ["", "That won't happen twice."],
                    ["", "My mistake. Noted."], ["", "Let me redo the numbers."]] },
    ms_parkjg: { ok: [["", "See? Leave it to me."], ["", "That's how a pro handles it."], ["", "Smooth, right?"],
                      ["", "Trust me, I've done this a hundred times."], ["", "Write that one down."], ["", "Easy money."]],
                 bad: [["", "That's… not on me."], ["", "Let's keep that between us."], ["", "Market conditions. Happens."],
                       ["", "We'll spin it. Don't worry."], ["", "Okay, okay, recalculating."]] },
    ms_sun: { ok: [["", "Nicely done."], ["", "Good work. Go home on time."], ["", "That's the way."],
                   ["", "Clean and simple. I like it."], ["", "You've earned a coffee."], ["", "That one goes in the report."]],
              bad: [["", "Let's look again, calmly."], ["", "It happens. Next one."], ["", "No blame. What did we miss?"],
                    ["", "Slow down a little."], ["", "We'll fix it together."]] },
    ms_han: { ok: [["", "That's how it's done!"], ["", "Ha! Too easy."], ["", "Who's the best? Me."],
                   ["", "Watch and learn."], ["", "Another win for the books."], ["", "Is that all they've got?"]],
              bad: [["", "Damn it."], ["", "Whatever. Next."], ["", "That wasn't a real mistake."],
                    ["", "Luck. Pure luck."], ["", "Fine. Again."]] },
  };

  // One avatar for the whole site, held to the window's bottom-left corner whatever the scroll (the user: "make the
  // anchor the actual window", "anchor avatar and bigger on mobile too"), on every page with a board and its side panel:
  // problems, the Stream, Turning points, games in Play ("have avatar appear on play boards too"). Made once, so a page
  // that redraws on every move (a live game) doesn't bring it in again each time; hidden on other pages. On a wide
  // screen the board's row keeps a column clear for it.
  let fixed = null, fixedWho = "", pending = false, lastHash = "", lastRow = null;
  function figure(who) {
    if (fixed && fixedWho === who) return fixed;
    if (fixed) fixed.remove();
    const lead = h("img", { class: "avatar-lead", alt: "" });
    loadPortraits().then(m => { if (m[who]) lead.src = img(m[who]); });
    lead.addEventListener("click", () => say(moment("tap")));   // (tappable where it stands clear of the board: a wide screen)
    fixed = h("div", { class: "avatar-fixed", hidden: "" }, [h("div", { class: "avatar-dlg", hidden: "" }, [h("div", { class: "avatar-name" }, name(who)), h("div", { class: "avatar-say" })]), lead]);
    fixedWho = who;
    document.body.append(fixed);
    return fixed;
  }
  // the board pages: a board card beside its side panel (not the Review tab: the user wanted the boards one plays on)
  const boardRow = () => !location.hash.startsWith("#/review") && [...document.querySelectorAll("#root .board-card")]
    .map(b => b.parentNode.classList.contains("avatar-stage") ? b.parentNode.parentNode : b.parentNode).find(r => r.querySelector(":scope > aside"));
  function mount() {
    pending = false;
    const who = picked(), row = who && boardRow(), playing = !!who && /^#\/(play|friend)/.test(location.hash);
    document.body.classList.toggle("has-avatar", !!(row || playing));
    if (!row && !playing) { if (fixed) fixed.hidden = true; lastHash = ""; return; }
    const f = figure(who);
    if (f.hidden) { f.hidden = false; const l = f.querySelector(".avatar-lead"); l.style.animation = "none"; void l.offsetWidth; l.style.animation = ""; }
    // a new board (the next problem, another page): the last word goes (the user: "completion dialogue shouldn't persist to
    // the next problem"); a page's own line (Turning points' prompt) is said right after
    if (row && row !== lastRow) {
      const b = f.querySelector(".avatar-dlg"); b.hidden = true; b.querySelector(".avatar-say").textContent = "";
      const t = window.__trainer;
      if (t && t.alive !== false && t.goban && row.contains(t.goban.svg) && typeof t.turnColor === "function") say(intro(t.turnColor()));
    }
    lastRow = row || null;
    // the Play screen, arrived at without a game: "what to play?"
    if (playing && !row && lastHash !== location.hash) setTimeout(() => say(moment("play")), 200);
    lastHash = location.hash;
    // the column keeping the board clear of it, on a wide screen
    const board = row && row.querySelector(":scope > .board-card");   // (the Play screen without a game: no board)
    if (board) { const stage = h("div", { class: "avatar-stage" }, [h("div", { class: "avatar-col" })]); row.insertBefore(stage, board); stage.append(board); }
  }
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(mount); } };
  // a word from it: a page's own (Turning points' "You're White. Find a move to keep the advantage.": the user, "this
  // line can be a dialogue for the avatar"), or one on a result
  function say(text) {
    if (!fixed || fixed.hidden) return false;
    const b = fixed.querySelector(".avatar-dlg");
    b.querySelector(".avatar-say").textContent = text; b.hidden = !text;
    return true;
  }
  // moments beyond a result, as Mahjong Soul's characters talk at the table (the user: "more dialogue similar in placement
  // to Mahjong Soul ... e.g. 'what to play?' on the Play screen"): play (the Play screen), start (a game begins), win,
  // lose (a game's end), idle (your turn, a while), tap (tapping the figure). Each character's own where written, else
  // the plain lines (in English only for the Misaeng cast)
  const MOMENTS = {
    play: [["下哪一局？", "What shall we play?"], ["今天找谁对弈？", "Who shall we play today?"]],
    start: [["开局了。", "Here we go."], ["请多指教。", "Let's have a good game."]],
    win: [["赢了！", "We won!"], ["这一局，漂亮。", "A beautiful game."]],
    lose: [["下次再来。", "Next time."], ["输了……复盘吧。", "Lost… let's review it."]],
    idle: [["慢慢想。", "Take your time."], ["想好了吗？", "Decided yet?"]],
    intro: [["请。", "Your move."], ["看仔细了。", "Look carefully."], ["这一题，你来。", "This one's yours."]],
    tap: [["嗯？", "Hm?"], ["专心下棋。", "Focus on the board."], ["我在看着呢。", "I'm watching."]],
  };
  const SAY = {
    liubei: { play: [["今日与谁论棋？", "With whom shall we talk go today?"], ["贤士在何处？下一局吧。", "Where are the worthy? Let's play one."]],
              win: [["此皆众人之力。", "This is everyone's strength."]], lose: [["胜败无常，备当自省。", "Win or lose, I must look inward."]],
              tap: [["二弟三弟何在？", "Where are my brothers?"], ["天下大事，亦如此局。", "The affairs of the realm are like this board."]] },
    diaochan: { play: [["今日与谁对弈？妾身陪着。", "Whom do we play today? I'll keep you company."], ["下一局吧，妾身想看你赢。", "Play one. I want to watch you win."]],
                win: [["果然不出妾身所料。", "Just as I expected."]], lose: [["输一局，换一计。", "Lose a game, change a plan."]],
                tap: [["妾身好看吗？", "Am I pretty?"], ["莫看我，看棋。", "Don't look at me, look at the board."], ["月色正好呢。", "The moonlight is lovely tonight."]] },
    wangyun: { play: [["老夫与你下一盘。", "This old man will play you."]], win: [["社稷之福！", "A blessing for the realm!"]], lose: [["老夫再筹一计。", "I'll devise another plan."]],
               tap: [["汉室，汉室啊……", "The Han, oh, the Han…"], ["莫扰老夫思量。", "Don't disturb my thinking."]] },
    caocao: { play: [["天下英雄，谁可一战？", "Which hero under heaven will face me?"], ["来，与孤下一盘。", "Come, play me a game."]],
              win: [["哈哈哈！天下归心！", "Ha! All hearts under heaven are mine!"]], lose: [["孤不过一时失手。", "A momentary slip, nothing more."]],
              tap: [["何事？说。", "What is it? Speak."], ["孤在想天下大计。", "I'm thinking about the realm."]] },
    lvbu: { play: [["谁敢来战？", "Who dares fight me?"], ["来！让我杀个痛快！", "Come! Let me fight to my heart's content!"]],
            win: [["天下谁人能敌？", "Who under heaven can match me?"]], lose: [["这不算！再来！", "That doesn't count! Again!"]],
            tap: [["别碰我的方天画戟。", "Don't touch my halberd."], ["赤兔在哪？", "Where's Red Hare?"]] },
    lisu: { play: [["我去说一说，看谁肯来一局。", "Let me go and talk someone into a game."]], tap: [["我有一言相劝。", "A word of advice, if I may."]] },
    jiaxu: { play: [["对手已算好了。", "I've already sized up the opponent."]], tap: [["……", "…"], ["少言，多算。", "Speak less. Reckon more."]] },
    lijue: { play: [["找个人来砍！", "Find me someone to beat!"]], tap: [["看什么看！", "What are you looking at!"]] },
    chenliu: { play: [["朕想下棋！", "I want to play!"]], tap: [["朕……朕不怕。", "I… I'm not scared."], ["陪朕玩一会儿？", "Play with me a while?"]] },
    dongzhuo: { play: [["谁来陪咱家下棋？", "Who'll play with me?"]], tap: [["拿酒来！", "Bring wine!"]] },
    chengong: { play: [["择一良局，以定大计。", "Choose a good game; settle a grand plan."]], tap: [["公台在此。", "Gongtai is here."]] },
    yanshi: { play: [["夫君，今天下一盘吧。", "Husband, let's play a game today."]], tap: [["呀！吓我一跳。", "Oh! You startled me."]] },
    zhangliao: { play: [["张辽请战！", "Zhang Liao asks to fight!"]], tap: [["整装待发。", "Ready to march."]] },
    chendeng: { play: [["来一盘，消消食。", "A game, to settle the stomach."]], tap: [["鱼脍呢？", "Where's the raw fish?"]] },
    houcheng: { play: [["来一局，赢了喝酒！", "A game, and drinks if we win!"]], tap: [["嘘，别声张。", "Shh, keep it down."]] },
    zhaoyun: { play: [["子龙愿往！", "Zilong will go!"], ["主公，下哪一局？", "My lord, which game?"]],
               win: [["幸不辱命。", "I have not failed my charge."]], lose: [["子龙请罪。", "Zilong begs forgiveness."]],
               tap: [["子龙在。", "Zilong is here."], ["枪已磨好。", "My spear is sharpened."]] },
    ladysun: { play: [["来，陪本小姐下一盘！", "Come, play me a game!"], ["今天找谁比试？", "Who's my match today?"]],
               win: [["哼，早说了我不会输。", "Hmph, I told you I wouldn't lose."]], lose: [["不算不算，再来！", "Doesn't count, again!"]],
               tap: [["不许乱碰！", "Hands off!"], ["我的剑可不是摆设。", "My sword isn't for decoration."]] },
    daiyu: { play: [["又要下棋？罢了，陪你。", "Go again? Fine, I'll keep you company."], ["今天下哪一局？别输了又怪我。", "Which game today? Don't blame me if you lose."]],
             win: [["赢了也就赢了。", "A win is a win."]], lose: [["输了，我早料到。", "We lost; I saw it coming."]],
             tap: [["做什么？", "What is it?"], ["我又不是那起子人。", "I'm not one of those people."], ["花开得正好。", "The flowers are lovely now."]] },
    grannyliu: { play: [["哎哟，下哪一盘？老婆子都想看看。", "Oh my, which game? I want to see them all."]],
                 win: [["阿弥陀佛，赢了！", "Bless me, we won!"]], lose: [["输了也乐呵。", "Lost, but what fun."]],
                 tap: [["哎哟，可不敢碰。", "Oh my, mustn't touch."], ["这园子比画儿还好看。", "This garden's prettier than a painting."]] },
    ms_jang: { play: [["", "Which game? I'll read it out."], ["", "Let's play. I'm ready."]], win: [["", "We made it."]], lose: [["", "Let's review it. That's how you get better."]],
               tap: [["", "Yes?"], ["", "I'm still an intern, you know."]] },
    ms_oh: { play: [["", "Alright, what are we playing?"]], win: [["", "That's our team!"]], lose: [["", "Drinks anyway. Then we review."]],
             tap: [["", "What, you need something?"], ["", "Don't slack off."]] },
    ms_oh_hike: { play: [["", "Which trail today?"]], tap: [["", "Nice air up here, huh?"]] },
    ms_ahn: { play: [["", "Which one. Pick fast."]], win: [["", "Good. Next."]], lose: [["", "Noted. Won't happen again."]],
              tap: [["", "Busy."], ["", "Did you need something?"]] },
    ms_parkjg: { play: [["", "Let's find an easy one, huh?"]], tap: [["", "Between you and me…"]] },
    ms_sun: { play: [["", "Pick a game. We'll do it properly."]], tap: [["", "Take a break if you need one."]] },
    ms_han: { play: [["", "Who's my next victim?"]], win: [["", "Obviously."]], lose: [["", "That one was rigged."]], tap: [["", "What?"]] },
  };
  // a problem as it opens (the user: "dialogue for the problem intro as well"): whose move, then the character's word
  const INTRO = {
    liubei: [["请赐教。", "Please, show me."], ["共勉之。", "Let us strive together."], ["莫急，看清楚。", "No haste; see it clearly."]],
    diaochan: [["妾身看你的了。", "I'm watching you."], ["这一着，可有妙计？", "Is there a clever plan here?"], ["慢慢来，妾身等着。", "Take your time; I'll wait."]],
    wangyun: [["老夫且看你如何应对。", "Let this old man see how you answer."], ["此局关乎社稷。", "The realm hangs on this one."]],
    caocao: [["来，让孤看看你的本事。", "Come, show me what you've got."], ["天下大势，便在此局。", "The fate of the realm is in this one."], ["速决。", "Decide quickly."]],
    lvbu: [["来！一击定胜负！", "Come! One blow decides it!"], ["别让我失望。", "Don't disappoint me."]],
    lisu: [["此局，且听我一言：先看清楚。", "On this one, a word: look first."], ["好好说服这盘棋。", "Talk this board round."]],
    jiaxu: [["算清楚了再下。", "Reckon it out, then play."], ["急不得。", "No rushing."]],
    lijue: [["上！", "Go!"], ["别磨蹭！", "Quit dawdling!"]],
    chenliu: [["朕来试试！", "Let me try!"], ["这一题难吗？", "Is this one hard?"]],
    dongzhuo: [["给咱家拿下！", "Take it for me!"], ["快下！", "Hurry up!"]],
    chengong: [["谋定而后动。", "Plan first, then move."], ["此题，有正有奇。", "This one has a straight way and a tricky one."]],
    yanshi: [["夫君，这一题呢？", "Husband, what about this one?"], ["小心些。", "Be careful."]],
    zhangliao: [["张辽为先锋！", "Zhang Liao leads the charge!"], ["看准了再冲。", "Aim true, then charge."]],
    chendeng: [["且看此题。", "Let's see this one."], ["不慌不忙。", "No hurry, no worry."]],
    houcheng: [["这个我在行。", "I'm good at these."], ["来吧。", "Here we go."]],
    zhaoyun: [["子龙在此，放手一搏！", "Zilong is here; go for it!"], ["看准破绽。", "Find the gap."]],
    ladysun: [["这题难不倒我们！", "This won't stop us!"], ["快，让我看看你的本事。", "Come on, show me."]],
    daiyu: [["这一题倒有些意思。", "This one's rather interesting."], ["又来了，你先想。", "Another one. You think first."], ["别看我，看棋。", "Don't look at me, look at the board."]],
    grannyliu: [["哎哟，这又是什么阵势？", "Oh my, what kind of setup is this?"], ["老婆子跟着看看。", "This old woman will watch along."]],
    ms_jang: [["", "Read it out first."], ["", "Every stone has a reason."]],
    ms_oh: [["", "Alright, let's see this one."], ["", "Focus. You've got this."]],
    ms_oh_hike: [["", "Next ridge. Let's go."]],
    ms_ahn: [["", "Next."], ["", "Read it carefully."]],
    ms_parkjg: [["", "Easy one, I bet."]],
    ms_sun: [["", "Take a breath, then look."]],
    ms_han: [["", "Bet you can't get this one."]],
  };
  function intro(color) {
    const who = picked(), set = INTRO[who] || MOMENTS.intro, [zh, en] = set[Math.floor(Math.random() * set.length)];
    const turn = color === WHITE ? ["白先。", "White to play."] : color === BLACK ? ["黑先。", "Black to play."] : ["", ""];
    return who.startsWith("ms_") ? [turn[1], en].filter(Boolean).join(" ") : [turn[0] + zh, [turn[1], en].filter(Boolean).join(" ")].filter(Boolean).join(" ");
  }
  // a moment's line, in the picked avatar's voice
  function moment(kind) {
    const who = picked(), mine = (SAY[who] || {})[kind], set = mine && mine.length ? mine : MOMENTS[kind];
    const [zh, en] = set[Math.floor(Math.random() * set.length)];
    return who.startsWith("ms_") || !zh ? en : `${zh} ${en}`;
  }
  // a game in Play: a line as it begins and as it ends, once each (a live game redraws on every move); your turn sitting
  // a minute: a nudge
  const games = {};
  let idleT = 0;
  function onGame(g) {
    if (!picked()) return;
    const id = g.id || g.code || "game", st = games[id] = games[id] || {};
    if (g.phase === "play" && !st.start) { st.start = 1; setTimeout(() => say(moment("start")), 300); }
    if (g.phase === "finished" && !st.end) {
      const r = typeof g.resultText === "function" ? g.resultText() : "";
      if (/^You won/.test(r)) { st.end = 1; setTimeout(() => say(moment("win")), 300); }
      else if (/^You lost/.test(r)) { st.end = 1; setTimeout(() => say(moment("lose")), 300); }
    }
    clearTimeout(idleT);
    if (g.phase === "play" && g.myTurn) idleT = setTimeout(() => { if (location.hash.startsWith("#/play") || location.hash.startsWith("#/friend")) say(moment("idle")); }, 60000);
  }
  const lastLine = {};
  addEventListener("tczw:result", e => {
    if (!fixed || fixed.hidden) return;
    const kind = e.detail === "ok" ? "ok" : "bad", set = (VOICE[picked()] || LINES)[kind] || LINES[kind];
    let i = Math.floor(Math.random() * set.length);
    if (set.length > 1 && i === lastLine[kind]) i = (i + 1 + Math.floor(Math.random() * (set.length - 1))) % set.length;   // (never the same twice running)
    lastLine[kind] = i;
    const [zh, en] = set[i];
    say(zh ? `${zh} ${en}` : en);
  });

  // the collection (#/avatars): everyone, the ones yet to come as silhouettes
  async function view() {
    crumbs.innerHTML = "";
    crumbs.append(h("a", { href: "#/" }, "Library"), " / Avatars & items");
    root.innerHTML = `<div class="loading">Loading…</div>`;
    const [all, m] = await Promise.all([leads(), loadPortraits()]);
    await catchUp();
    if (!location.hash.startsWith("#/avatars")) return;
    root.innerHTML = "";
    const have = all.filter(x => owns(x.who)).length, pick = picked();
    root.append(h("div", { class: "cat-title" }, `Avatars · ${have} of ${all.length}`));
    root.append(h("p", { class: "meta-sub" }, "Everyone the stories have you play as. One joins the first time you complete a story board as them; the one you pick sits beside your boards."));
    root.append(h("div", { class: "avatar-grid" }, all.map(x => {
      const mine = owns(x.who), on = pick === x.who;
      return h("button", { class: "avatar-tile" + (mine ? "" : " locked") + (on ? " on" : ""), type: "button", title: mine ? (on ? "Your avatar" : "Pick") : `Play as them in ${x.novel}`,
        onclick: () => { if (!mine) return; store(A => { A.pick = on ? "" : x.who; }); view(); } }, [
        m[x.who] ? h("img", { src: img(m[x.who]), alt: "" }) : h("div", { class: "avatar-none" }, "?"),
        h("div", { class: "avatar-name" }, mine ? name(x.who) : "？"),
        h("div", { class: "meta-sub" }, mine ? (on ? "✓ yours" : x.novel) : x.novel),
      ]);
    })));
    items();
  }
  // the items, beside the avatars (the user: "expand avatars to avatars / items"): every board, stone set, title and
  // hat, each with its picture; the ones owned to wear or take off, the rest dimmed with where they come from
  function items() {
    const E = typeof Events !== "undefined" ? Events : null;
    if (!E) return;
    const evName = id => (E.LIST.find(e => e.id === id) || {}).name || id;
    const evIcon = id => (E.LIST.find(e => e.id === id) || {}).ci || "";
    const whence = it => it.gift ? (it.slot ? `${evName(it.ev)} sign-in, day ${it.slot}` : `${evName(it.ev)} goals, all three`) : `${evName(it.ev)} shop · ${evIcon(it.ev)} ${it.price}`;
    const tile = (it, own, on, toggle, sub) => h("button", { type: "button", class: "avatar-tile item-tile" + (own ? "" : " locked") + (on ? " on" : ""),
      onclick: () => { if (own && toggle) { toggle(); view(); } } }, [E.preview(it, true), h("div", { class: "avatar-name" }, it.name), h("div", { class: "meta-sub" }, sub)]);
    const section = (title, tiles) => { root.append(h("div", { class: "cat-title" }, title)); root.append(h("div", { class: "avatar-grid" }, tiles)); };
    // boards: the standard ones are everyone's; the events' to collect
    const cur = BoardTheme.current.id;
    section("Boards", [
      ...BoardTheme.LIST.map(t => tile({ type: "board", name: t.name, board: t }, true, cur === t.id, () => {
        try { t.id === "kaya" ? localStorage.removeItem(BoardTheme.KEY) : localStorage.setItem(BoardTheme.KEY, t.id); } catch {} BoardTheme.paintAll(); BoardTheme.label(); }, cur === t.id ? "✓ on" : "standard")),
      ...E.ITEMS.filter(it => it.type === "board").map(it => { const own = E.owns(it.id), on = own && E.isOn(it);
        return tile(it, own, on, () => E.equip(it.id, !on), own ? (on ? "✓ on" : evName(it.ev)) : whence(it)); }),
    ]);
    for (const [type, title, none] of [["stones", "Stones", "Classic stones"], ["title", "Titles", "No title"], ["hat", "Sun Wukong's hats", "No hat"]]) {
      const list = E.ITEMS.filter(it => it.type === type), worn = E.equipped(type);
      section(title, [
        h("button", { type: "button", class: "avatar-tile item-tile" + (worn ? "" : " on"), onclick: () => { if (worn) { E.equip(worn.id, false); view(); } } },
          [h("div", { class: "event-preview small item-none" }, "—"), h("div", { class: "avatar-name" }, none), h("div", { class: "meta-sub" }, worn ? "" : "✓ on")]),
        ...list.map(it => { const own = E.owns(it.id), on = own && E.isOn(it);
          return tile(it, own, on, () => E.equip(it.id, !on), own ? (on ? "✓ on" : evName(it.ev)) : whence(it)); }),
      ]);
    }
  }
  // two copies: what's owned by union; the pick, this browser's unless it has none
  function merge(l, r) {
    if (!r) return l;
    if (!l) return r;
    return { own: { ...(r.own || {}), ...(l.own || {}) }, pick: l.pick || r.pick || "" };
  }
  const count = () => Object.keys(L().own || {}).length;
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => { if (Object.keys(loadProgress().tk || {}).length) catchUp().catch(e => console.error("[avatars]", e)); }, 3000);
    // a page drawn (by the router, or a page redrawing itself): the card goes in
    const r = document.getElementById("root");
    if (r) new MutationObserver(schedule).observe(r, { childList: true, subtree: true });
    addEventListener("hashchange", schedule);
  });
  return { INTRO, intro, VOICE, SAY, MOMENTS, moment, onGame, say, unlock, cleared, owns, picked, leads, catchUp, mount: () => { mount(); return fixed; }, view, merge, count, norm };
})();
