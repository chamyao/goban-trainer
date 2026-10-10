"""World 21: Misaeng (미생), Season 1, after Yoon Tae-ho's webtoon (Daum, 2012-2013).

English only ("lang": "en"; the user: "we dont need chinese lines for this"). The design is docs/book2/misaeng-arc.md,
the research docs/book2/misaeng-research.md, the engine syntax docs/book2/misaeng-engine.md (claude/integration-alt2).
The webtoon's plot, people and order are kept; the dialogue is a close paraphrase, with only its famous short lines
quoted (the Korean is in the design doc). Beats marked (staging) or (invented) in comments are not in the webtoon.

The frame: every beat opens on the 1st Ing Cup final, game 5 (1989), Nie Weiping (White) against Cho Hunhyun (Black),
played up to the beat's "move". At five beats the player finds Cho's actual move ("record").
"""


def N(en):
    """A line of narration."""
    return ["n", en]


def S(who, en):
    """A spoken line."""
    return ["say", who, en]


def T(en):
    """A title, objective, caption or other label."""
    return en


def D(who, q, open_, win, slip):
    """A decision board: the caption over the problem, and the decider's own lines on it."""
    return {"q": q, "who": who, "open": open_, "win": win, "slip": slip}


# Cast id -> Kokoro English voice (ids already used in the repo).
CAST21 = {
    "ms_jang": "am_liam", "ms_jang_young": "am_liam", "ms_mother": "bf_emma", "ms_oh": "am_onyx", "ms_kimds": "am_eric", "ms_cheon": "am_echo",
    "ms_park": "am_fenrir", "ms_ahn": "af_bella", "ms_baekgi": "am_puck", "ms_han": "am_michael", "ms_kimsh": "am_adam",
    "ms_sun": "af_sarah", "ms_somi": "af_sky", "ms_sunhusband": "am_eric", "ms_kimsj": "bf_isabella", "ms_shin": "af_sky",
    "ms_kimbr": "bm_george", "ms_exec": "bm_lewis", "ms_president": "bm_daniel", "ms_director": "bm_fable",
    "ms_parkjg": "am_adam", "ms_client": "am_fenrir", "ms_ma": "bm_george", "ms_ahnboss": "am_echo", "ms_ahnfather": "bm_george",
    "ms_kimdsu": "am_echo", "ms_auditor": "bm_fable", "ms_hr": "am_michael", "ms_chinarep": "am_puck",
    "ms_kbastaff": "bm_lewis", "ms_shopowner": "bf_emma", "ms_examiner": "bm_daniel", "ms_trainee": "af_sky",
}


def _scenes():
    return {
        # M1 · 착수 0-1. The last trainee exam game; it is lost (R7). Then the cut: years, his mother, the monologue.
        # (staging) The webtoon tells his failure; it doesn't play one game. The board is that failure, played.
        "m1": {"title": T("Not Hard Enough"), "kind": "main", "steps": [
            ["spawn", "ex", "ms_examiner", "m1", 0, -4], ["spawn", "tr", "ms_trainee", "m1", 6, -2],
            N("The Korea Baduk Association. Rows of boards, and children who have given their whole lives to them."),
            N("Jang Geu-rae came here at eleven. He is eighteen now. This is his last chance to turn professional."),
            S("ms_examiner", "Last round. Win, and you're in. Lose, and you've aged out."),
            ["problem"],   # Jang: the game that decides his career; it is lost by half a point
            ["still", "ms_lastgame", "slow zoom in"],
            N("Half a point."),
            ["remove", "ex"], ["remove", "tr"],
            N("It wasn't talent, he tells himself. It wasn't the half-points, or the part-time jobs, or that there was never pocket money."),
            N("It wasn't that his father died, or that his mother took to her bed."),
            N("Those reasons hurt too much. So he'll say it was this: I didn't try hard enough."),
            N("He leaves baduk. A sponsor finds him a job; when his colleagues learn where he came from, they mock it, and he quits. "
              "He does his military service. Eight months after he comes out, the same sponsor calls the president of a trading company."),
            ["party", ["ms_jang"], {"to": {"place": "Susaek-dong", "spot": "home"}}],   # grown up now (ms_jang); a deliberate cut: years pass
        ]},

        # M2 · 2수. The first day. The parachute intern; Sales Team 3.
        "m2": {"title": T("The Light I'm Allowed"), "kind": "main", "steps": [
            ["spawn", "desk", "ms_hr", "m2", 4, -4],
            N("One International, a general trading company in Jongno. Interns in new suits wait for passes that have their names on them."),
            S("ms_hr", "Jang Geu-rae? You're not on my list. Oh, here: the president's office sent your name down separately."),
            N("Everyone else got in with a degree and a test. He got in with a phone call. He knows how that looks."),
            ["problem"],   # legwork: through the front desk with no pass yet
            ["gain", "pass"],
            ["still", "ms_onelight", "slow zoom in"],
            N("The gates open for him like for anyone else."),
            S("ms_hr", "Sales Team 3. Seventh floor. Section head Oh Sang-sik."),
            ["remove", "desk"],
            ["spawn", "oh", "ms_oh", "m2", 14, -6], ["spawn", "kd", "ms_kimds", "m2", 18, -4],
            S("ms_oh", "You're mine? Kim, he's yours. Show him where things are and don't let him touch anything that ships."),
            S("ms_kimds", "Assistant manager Kim Dong-sik. Welcome. You'll sit by me."),
            S("ms_jang", "If there's a light I'm meant to keep lit here, I'll answer for it. Whatever light I'm given."),
            N("Oh's eyes are red. He hasn't slept, by the look of them. He doesn't look up again."),
            ["remove", "oh"], ["remove", "kd"],
        ]},

        # M3 · 13수. The waybill. Kim Seok-ho borrows his glue stick; Sales 3's waybill ends up on the lobby floor.
        "m3": {"title": T("The Waybill"), "kind": "main", "steps": [
            ["spawn", "sh", "ms_kimsh", "m3", 4, -2], ["spawn", "oh", "ms_oh", "m3", 12, -6],
            S("ms_kimsh", "Can I borrow your glue stick? Mine's dry."),
            N("Kim Seok-ho, an intern from another firm's programme: married young, a child at home, the best translator of them all. "
              "He works fast. A page of Sales 3's comes away stuck to the back of his."),
            N("An hour later the director comes up from the lobby holding a waybill. It was on the floor by the gates, where anyone could read it."),
            ["spawn", "dir", "ms_director", "m3", 8, 2],
            ["emote", "dir", "anger"],
            S("ms_director", "Whose is this? A customer's shipment, on the floor of my lobby! Who had it last?"),
            N("Every intern is made to stand. Every eye goes to the parachute."),
            S("ms_director", "The one nobody tested. Of course."),
            ["remove", "dir"], ["remove", "sh"],
            S("ms_oh", "Hm."),
            N("Oh Sang-sik says nothing to Jang. He takes the lift down to the lobby."),
            ["party", ["ms_oh"], {"to": {"place": "One International", "spot": "lobby-lift"}}],   # the lead passes to Oh, at the lift doors below
        ]},

        # M3b · Oh searches the lobby. (invented: how he finds the scrap; the webtoon has him find it.)
        "m3b_wait": {"title": T("The Lobby"), "kind": "main", "steps": [
            S("ms_oh", "If it fell here, there's more of it. Bins first."),
        ]},
        "m3b": {"title": T("The Scrap"), "kind": "main", "steps": [
            N("Torn from the waybill's back: a strip with glue on it, and a name in an intern's careful hand. Kim Seok-ho."),
            S("ms_oh", "Not the parachute, then."),
            N("Oh goes up and has a word with the director, and Kim Seok-ho is called in. Nobody says sorry to Jang. Oh doesn't either."),
            ["party", ["ms_jang"], {"to": {"place": "One International", "spot": "sales3"}}],   # back to Jang, at his desk upstairs
        ]},

        # M4 · 17-19수. Park Jong-gi, IT sales: the roof, the client.
        "m4": {"title": T("A Farmer Among Hunters"), "kind": "main", "steps": [
            ["spawn", "pj", "ms_parkjg", "m4", 0, -2],
            N("Assistant manager Park Jong-gi from IT sales carries a resignation letter in his jacket. On the roof, Jang told him he admired his patience. "
              "Park heard something else: that someone thought he could be a hunter."),
            N("So he brought Jang along to a client."),
            ["spawn", "c1", "ms_client", "m4", 14, -6],
            N("Through the door they hear the client's staff. They're laughing about Park: how far they can push him, what he'll swallow next."),
            S("ms_parkjg", "..."),
            ["problem"],   # Park Jong-gi stands up to them
            ["emote", "pj", "anger"],
            S("ms_parkjg", "We'll be revising the terms. All of them. I'll send the paper tomorrow."),
            N("The client's president stares at him. So does Jang."),
            ["remove", "c1"], ["remove", "pj"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],
        ]},
        # M4b · 20수. The client's president comes to One International. The note; the confession.
        "m4b": {"title": T("Everyone Has Their Own Game"), "kind": "main", "steps": [
            ["spawn", "cp", "ms_client", "m4b", 10, -4], ["spawn", "pj", "ms_parkjg", "m4b", 2, -2],
            N("The client's president has come to One International in person, angry, and wants Park's head."),
            N("Jang writes four words on a slip and passes it under the table: Be irresponsible, sir. Blame the junior."),
            ["gain", "note"], ["lose", "note"],
            S("ms_parkjg", "The deception was mine. Not his. I'm the one who misled you."),
            N("Nobody punishes Park. The client goes home with nothing to say. Park comes up to the roof afterwards to thank Jang, and means it."),
            S("ms_jang", "Everyone has their own game of baduk. He played his."),
            ["remove", "cp"], ["remove", "pj"],
        ]},

        # M5 · 21수. Sun Ji-young asks; Jang and Ahn Young-yi go to the daycare.
        "m5": {"title": T("Somebody Has to Go"), "kind": "main", "steps": [
            ["spawn", "sun", "ms_sun", "m5", 0, -2], ["spawn", "ahn", "ms_ahn", "m5", 6, 0],
            N("Deputy general manager Sun Ji-young keeps work and home in two sealed rooms. Tonight they've run into each other."),
            S("ms_sun", "The daycare closes at seven. My meeting doesn't. I hate asking. I'm asking."),
            S("ms_sun", "Somi. Five. She'll be the last one there. Tell her Mummy's sorry."),
            S("ms_ahn", "We'll go. Jang Geu-rae, you're coming."),
            N("Ahn Young-yi: the intern everyone talks about. Political science, two companies behind her already, never a word out of place."),
            ["remove", "sun"], ["remove", "ahn"],
            ["party", ["ms_jang", "ms_ahn"], {"to": {"place": "Sun's neighbourhood", "from": "Jongno"}}],
        ]},
        "m5b": {"title": T("The Last One There"), "kind": "main", "steps": [
            ["spawn", "somi", "ms_somi", "m5b", 4, -2],
            N("Seven o'clock. One by one the other children's parents come through the gate. Somi watches every one of them, and every one of them isn't hers."),
            S("ms_ahn", "Somi? Your mum sent us. She's sorry she's late."),
            S("ms_somi", "She's always sorry."),
            N("They walk her home between them. Neither of them says much. It is the first time they've been anywhere together."),
            ["remove", "somi"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],
        ]},

        # M6 · 23-30수. The final PT: pairs. Jang does the materials; Han Seok-yul delivers, and chokes. Ahn is flawless.
        "m6": {"title": T("The Pair"), "kind": "main", "steps": [
            ["spawn", "han", "ms_han", "m6", 2, -2], ["spawn", "ahn", "ms_ahn", "m6", 12, -4], ["spawn", "bg", "ms_baekgi", "m6", 16, -2],
            N("The internship ends with a test. The interns are paired; each pair presents a business plan to a panel."),
            N("Jang draws Han Seok-yul: the loudest intern on the floor, who once ordered Jang around until Jang asked how old he was. "
              "It turned out Han is a year older."),
            S("ms_han", "Everything that matters happens on the shop floor. My father, my uncles: factory men. Paper doesn't make anything."),
            S("ms_jang", "Then you talk. I'll make the paper."),
            N("On the frame strip Cho Hunhyun, eight points of komi against him, considers the lower side."),
            ["problem"],   # the record: Black 29
            N("Cho broke White's lower side at the cost of his own shape, because eight points of komi left him no choice."),
            ["problem"],   # Han Seok-yul: finish the presentation
            S("ms_han", "...and that's why the site comes first. Thank you."),
            N("Ahn Young-yi's pair goes next. It is so clean that a panelist laughs."),
            S("ms_examiner", "Is she the president's daughter, or one of ours undercover?"),
            N("Jang Baek-gi's pair presents safe numbers, neatly compiled, and is told it has no vision."),
            ["remove", "ahn"], ["remove", "bg"],
        ]},

        # M7 · 31-33수. The individual task: sell to someone who won't buy. Then the results.
        # (uncertain in our sources: the exact objects. Office slippers against Han's work boots is the best reading.)
        "m7": {"title": T("Office Slippers"), "kind": "main", "steps": [
            S("ms_examiner", "Last task. Sell your partner something. Partner, you may buy or refuse."),
            ["gain", "slippers"],
            S("ms_jang", "Office slippers. An office worker's combat boots: the shoes you fight in all day."),
            S("ms_han", "I won't buy them."),
            S("ms_jang", "Your boots are for a shop floor. This floor is a shop floor too. You've been fighting on it for two months."),
            S("ms_han", "I won't buy them."),
            ["problem"],   # Jang: sell to someone who won't buy
            S("ms_han", "...I won't buy them. But I think I've been looking down on this floor."),
            ["lose", "slippers"],
            ["remove", "han"],
            N("The results. Ahn Young-yi, first overall. Jang Baek-gi, hired: the steel team. Han Seok-yul, hired. Kim Seok-ho, hired, to the group's head office."),
            N("Jang Geu-rae, hired. On a two-year contract."),
            ["lose", "pass"], ["gain", "id_card"],
            N("On the first morning Oh takes his new people to a memorial for laid-off workers before he takes them to their desks. He doesn't explain why."),
            ["party", ["ms_ahn"], {"to": {"place": "One International", "spot": "resources"}}],   # the lead passes to Ahn, at her new team's desks
        ]},

        # M8 · 39-43수. Ahn takes her team's rejected plan to finance head Kim Seon-ju herself. It fails (R7).
        "m8": {"title": T("Finance"), "kind": "main", "steps": [
            ["spawn", "ksj", "ms_kimsj", "m8", 8, -4],
            N("The resources team. Ahn's seniors have decided she is too sure of herself, and too good at it. Finance has sent their plan back."),
            N("Nobody on the team will go and ask why. Ahn goes."),
            S("ms_kimsj", "You're the new one. You walked in here without your section head."),
            S("ms_ahn", "The plan was sent back without a reason, ma'am. I'd like the reason."),
            N("Kim Seon-ju, head of finance: the only woman at her level in the building."),
            ["problem"],   # Ahn: get the plan past finance
            S("ms_kimsj", "The reason is that you're a first-year who thinks a good plan is enough. Go back to your team."),
            N("Ahn goes back to her team with the plan, and the lesson."),
            ["remove", "ksj"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "spot": "sales3"}}],   # back to Jang, a floor away
        ]},

        # M9 · 45-55수. 미생이네요. Kim Dong-sik knows his past. Four stones, one eye. Then Oh's collapse (told).
        "m9": {"title": T("Not Yet Alive"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m9", 2, -2],
            N("Sales 3's item, crude from Iran to Turkey, dies on an EU embargo. The team's little good-luck rite didn't help."),
            S("ms_kimds", "You were a trainee at the Baduk Association. Seven years. I looked it up."),
            ["emote", "ms_jang", "anger"],
            S("ms_jang", "You looked me up."),
            S("ms_kimds", "Because a company's no different from a baduk board. Here."),
            ["prop", "stones", "stones4", "m9", 4, -3],
            N("He sets four stones on the desk in a ring around an empty point: Oh, himself, Jang, and the team."),
            S("ms_kimds", "Us. If we hold together we win. Look, we've already made one."),
            N("On the frame strip, Cho's group in the centre has no eyes yet."),
            ["problem"],   # the record: Black 47
            N("Cho played it slack on purpose: he chose to settle his group, because living meant winning."),
            ["still", "ms_oneeye", "slow zoom in"],
            S("ms_jang", "One eye. It's still not alive. Misaeng."),
            ["remove", "stones"],
            N("Later that month: division head Kim Bu-ryeon keeps his name off Sales 3's China report, then puts it back on once the report looks good. "
              "Another team takes their rare-earth idea whole. Oh Sang-sik gets a nosebleed at his desk, an IV drip on his own, "
              "and a box of dried eel from Kim Bu-ryeon, who tells him a father who wrecks his health is no use to anyone."),
            ["remove", "kd"],
        ]},

        # M10 · 56-59수. The jargon; Kim Dong-sik's daily homework; the report that gets laminated.
        "m10": {"title": T("Laminated"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m10", 2, -2],
            N("TEU, surcharges, Ramadan schedules. Every sentence in the office has a word in it Jang doesn't know."),
            N("Every morning there's a sheet on his desk: three questions, in Kim Dong-sik's handwriting. Nobody mentions it."),
            ["gain", "homework"],
            S("ms_kimds", "Middle East shipping. A report, by Friday. Don't pretend you know. Find out."),
            ["problem"],   # legwork: the shipping report
            ["gain", "report"],
            N("Oh reads it, corrects it in red, and hands it back. The next morning it is pinned up by the copier, laminated."),
            S("ms_oh", "Not bad."),
            ["remove", "kd"],
            ["party", ["ms_sun"], {"to": {"place": "One International", "spot": "sun-desk"}}],   # the lead passes to Sun Ji-young, on the same floor
        ]},

        # M11 · 60-61수. Park Jong-sik arrives. He harasses Shin Da-in; Sun Ji-young goes to Oh.
        "m11": {"title": T("Park Jong-sik"), "kind": "main", "steps": [
            ["spawn", "pk", "ms_park", "m11", 10, -2], ["spawn", "shin", "ms_shin", "m11", 14, 0],
            N("Section head Park Jong-sik joins Sales 3: once the steel team's ace and its Middle East hand, now the man nobody else wanted. "
              "Kim Bu-ryeon sent him, on the advice of Oh's old rival."),
            N("He plays billiards in the afternoons. He calls Jang the high-school parachute to his face."),
            N("And he stands too close to Shin Da-in, a young contract worker, every day, and says things to her that she pretends not to hear."),
            S("ms_park", "Da-in, you should smile more. Doesn't cost anything."),
            ["remove", "pk"],
            S("ms_sun", "Da-in. Has he done this before? Every day?"),
            S("ms_shin", "...Please don't. I'm on contract."),
            ["spawn", "oh", "ms_oh", "m11", 20, -4],
            ["problem"],   # Sun Ji-young: say it to Oh, plainly
            S("ms_sun", "Your new section head is harassing a contract worker on my floor. I'm telling you because you're his team head. I'll tell the next person up if I have to."),
            S("ms_oh", "I'll deal with it."),
            N("He does. He tells Park, in front of the team, that he can't work with him."),
            ["remove", "shin"],
            N("Left to find his own business, Park comes back with one: used cars to Jordan, through a Korean supplier called Baekjin Trading."),
            S("ms_oh", "Look at this margin. Nobody makes that on used cars. Somebody's taking a cut."),
            ["gain", "statements"],
            N("Oh takes it to Kim Bu-ryeon, who signed off on the deal himself. Kim Bu-ryeon reads it twice."),
            S("ms_kimbr", "Follow procedure."),
            N("An audit is approved."),
            ["remove", "oh"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "spot": "sales3"}}],
        ]},

        # M12 · 62-63수. Baekjin Trading: Park is already there, coaching the staff.
        "m12": {"title": T("Baekjin Trading"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m12", 2, -2], ["spawn", "pk", "ms_park", "m12", 12, -4],
            N("Kim Dong-sik and Jang go to Baekjin Trading to see the supplier for themselves. Park Jong-sik is already there."),
            S("ms_park", "Sales 3. Thorough. Go on, ask them anything."),
            N("The staff answer every question the same way, in the same words, as if they'd learned them that morning."),
            ["gain", "coached"],
            ["remove", "pk"],
            S("ms_kimds", "They were told what to say. We can't prove it."),
            ["remove", "kd"],
        ]},
        "m13_wait": {"title": T("The Audit"), "kind": "main", "steps": [
            S("ms_jang", "Not yet. I haven't put it together. ICB's registration is on the audit room's table; my notes from the call to ICB are on my desk in Sales 3. Then link them on the audit board, from the bag or the audit room's table."),
        ]},

        # M13 · 64-65수 (boss). The audit is packing up. One more move. The phone. James Park.
        "m13": {"title": T("One More Move"), "kind": "main", "steps": [
            ["spawn", "au", "ms_auditor", "m13", 8, -4], ["spawn", "oh", "ms_oh", "m13", 2, -4], ["spawn", "kd", "ms_kimds", "m13", 4, -2],
            N("The audit team has been through everything and found nothing they can use. They're packing up."),
            S("ms_auditor", "Without more, we close it."),
            S("ms_jang", "Even in a game that's lost, there's a move you want to play. Let me play one."),
            ["problem"],   # Jang: keep the audit open
            S("ms_jang", "ICB, the Jordanian buyer, is all local staff on paper. When I called them, someone in the room was speaking Korean. Call them now."),
            N("The auditor dials Amman. A man answers. In Korean, until he catches himself."),
            ["still", "ms_phone", "slow zoom in"],
            N("The signatory on every ICB document, Muhammad Indira, is a Korean called Park Sang-jun."),
            S("ms_auditor", "Get us ICB's board list."),
            ["gain", "board_list"],
            ["problem"],   # Jang: read the board list
            S("ms_jang", "Park, Park, Park. Half the board is called Park."),
            ["spawn", "bg", "ms_baekgi", "m13", 14, 0],
            S("ms_baekgi", "You wanted Park Jong-sik's family? The steel team keeps everything. Here."),
            ["problem"],   # Jang: find James Park
            ["still", "ms_jamespark", "slow pan across"],
            S("ms_jang", "James Park, director of ICB, is Park Jong-sik. Park Sang-jun is the son of Baekjin's president. Baekjin's president is Park's uncle."),
            S("ms_oh", "Both ends of the deal. All family."),
            ["gain", "james_park"],
            ["remove", "au"], ["remove", "bg"], ["remove", "kd"],
        ]},

        # M14 · 66-68수. Park's grievance; he leaves; responsibility goes upward.
        "m14": {"title": T("No Fun"), "kind": "main", "steps": [
            ["spawn", "pk", "ms_park", "m14", 6, -2], ["spawn", "oh", "ms_oh", "m14", 2, -4],
            S("ms_park", "This is no fun."),
            S("ms_park", "In 2008 I brought in a hundred million dollars of steel to Jordan. Alone. And what did I get for it? A team dinner on the director's card."),
            S("ms_park", "You lot eat the money, and I'm supposed to go home happy with my salary?"),
            N("He leaves after a meeting with the executive vice president. The police come later."),
            ["remove", "pk"],
            N("Responsibility falls upward. Kim Bu-ryeon is moved to an affiliate, One Aluminium. A managing director resigns. "
              "Before he goes, Kim Bu-ryeon finds Oh, who blames himself, and tells him he did right."),
            S("ms_president", "Promote Oh. This half."),
            N("Oh Sang-sik is made deputy general manager, and Sales 3 gets a bonus, and a name around the building: the team that informs on its own."),
            S("ms_oh", "Nobody gets to say we didn't follow procedure."),
            ["remove", "oh"],
        ]},

        # M15 · 69-70수. Chuseok. The relatives; his mother.
        "m15": {"title": T("Mother's Pride"), "kind": "main", "steps": [
            ["spawn", "mo", "ms_mother", "m15", 12, -4],
            N("Chuseok. The relatives' flat is full of cousins with degrees and uncles with opinions."),
            N("They ask about his job. Contract, he says. They stop asking, and start talking about him as if he'd left the room."),
            N("He goes out on the landing. Through the kitchen door he hears his mother, defending him to her own sisters, in tears."),
            ["still", "ms_chuseok", "slow zoom in"],
            S("ms_jang", "Don't forget it. I'm my mother's pride. Not a son who falls short."),
            ["remove", "mo"],
            ["party", ["ms_oh"], {"to": {"place": "the pizza shop", "from": "Jongno"}}],   # (staging) the lead passes to Oh; his own errand, after the holiday
        ]},

        # M16 · 71-83수. Cheon Gwan-ung arrives (told). Kim Dong-su's pizza shop; the envelope.
        "m16": {"title": T("Outside Is Hell"), "kind": "main", "steps": [
            N("After the holiday Sales 3 gets Park's replacement, section head Cheon Gwan-ung: ordinary, a heavy drinker, wary of a team that informs. "
              "When he needles Kim Dong-sik over it, Oh shuts him down: you came here to work, not to play games. Cheon apologises."),
            N("And Jang proposes reviving the Jordan used-car deal that Park's fraud killed: clean, this time, to show the company can."),
            ["spawn", "kds", "ms_kimdsu", "m16", 4, -2],
            N("Kim Dong-su was Oh's senior once. He quit years ago. His pizza shop is being crushed by the big mart's pizza across the road."),
            S("ms_kimdsu", "Your old clients, Sang-sik. A word from you. I'm not asking for nothing."),
            ["gain", "envelope"],
            ["problem"],   # Oh: turn down an old friend
            ["lose", "envelope"],
            S("ms_oh", "I can't take it. Go and see Kim Seok-man at Hangang Trading. He'll hear you out."),
            ["still", "ms_hell", "slow pan across"],
            S("ms_kimdsu", "They say the company's a battlefield? Outside, it's hell. Don't you quit. Not till they push you out."),
            ["remove", "kds"],
            N("Back at the office, the team has a briefing to give the president. Oh hands Jang the seating notes."),
            ["gain", "seating_notes"], ["gain", "water"], ["gain", "green_tea"], ["gain", "coffee"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "spot": "board-room"}}],   # back to Jang, getting the board room ready
        ]},
        "m17_wait": {"title": T("The Board Room"), "kind": "main", "steps": [
            S("ms_jang", "Every seat as it's written on the notes: the president's water, the executive's tea, the division head's coffee. Then we rehearse."),
        ]},

        # M17 · 84-88수. Setting the room; the rehearsal; "shake the board"; the president.
        "m17": {"title": T("Shake the Board"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "m17", 2, -4], ["spawn", "kd", "ms_kimds", "m17", 6, -2], ["spawn", "ch", "ms_cheon", "m17", 10, -2],
            N("Every seat set, every pen squared. The last rehearsal goes perfectly, and Oh frowns all the way through it."),
            S("ms_oh", "It's tidy. Tidy doesn't sell a deal the board already hates. We need to shake it."),
            N("On the frame strip, the game turns."),
            ["problem"],   # the record: Black 85
            N("The move that turned the flow of the game."),
            ["spawn", "pr", "ms_president", "m17", 16, -6], ["spawn", "ex", "ms_exec", "m17", 20, -6],
            ["problem"],   # Oh: shake the board
            S("ms_president", "Approved. Who did the legwork? The youngest. What did he do?"),
            S("ms_oh", "It was his idea, sir. All of it started with him."),
            ["remove", "pr"], ["remove", "ex"],
            N("That evening Jang looks at his card. Contract. He reads the word twice."),
            S("ms_jang", "If I just keep doing as I do... I'll become a regular, won't I?"),
            ["remove", "kd"], ["remove", "ch"],
            S("ms_oh", "Here. A hundred thousand won. Buy something and sell it. Come back and tell me what you learned."),
            ["gain", "cash_100k"],
            ["remove", "oh"],
        ]},
        "m18_wait": {"title": T("A Hundred Thousand Won"), "kind": "main", "steps": [
            S("ms_jang", "Not yet. The market stalls on Jongno sell stock; the street's full of people to sell it to."),
        ]},

        # M18 · 103-106수. The mission fails, as written: the Baduk Association's rebuke, the corner shop.
        "m18": {"title": T("A Hundred Thousand Won"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "m18", 4, -2],
            S("ms_oh", "Well?"),
            S("ms_jang", "I went to the Baduk Association first. They told me they'd buy anything I brought, out of pity or kindness, and asked if I'd call that doing my job."),
            S("ms_jang", "Then the street. The old man at the corner shop sold more dried squid while I was talking than I sold all day."),
            ["gain", "dried_squid"],
            S("ms_oh", "You can't climb stairs that have no first step. And you can't sell like you're running away."),
            ["remove", "oh"],
            ["party", ["ms_ahn"], {"to": {"place": "One International", "spot": "roof"}}],   # the lead passes to Ahn, on the roof
        ]},

        # M19 · 114수. Her proposal is adopted at HQ; her department head chews her out on the roof; she withdraws (R7).
        "m19": {"title": T("Step on Me"), "kind": "main", "steps": [
            ["spawn", "ma", "ms_ma", "m19", 6, -4], ["spawn", "ab", "ms_ahnboss", "m19", 10, -2],
            N("At a group meeting at head office, Ahn's proposal was chosen over resources team 3's. Her department head had been backing team 3, to build his own camp."),
            ["emote", "ma", "anger"],
            S("ms_ma", "Who told you to embarrass this department in front of head office? Who do you think you are?"),
            S("ms_ahnboss", "Young-yi. My promotion's this round. Please. Just drop it."),
            ["problem"],   # Ahn: keep her proposal
            S("ms_ahn", "...I'll withdraw it. Team 3's plan will go forward."),
            ["remove", "ma"], ["remove", "ab"],
            ["still", "ms_roof_ahn", "slow zoom out"],
            N("She stays up there until the lunch hour is over."),
            ["party", ["ms_ahn"], {"to": {"place": "Jongno", "spot": "pojangmacha"}}],   # night; the tent bar
        ]},
        # M19b · 114-116수. Drinks with Jang. Her father. The necklace.
        "m19b": {"title": T("Her Father"), "kind": "main", "steps": [
            ["spawn", "jg", "ms_jang", "m19b", 4, -2],
            N("She drinks too fast, and Jang lets her. Then she puts her head down on the table and cries."),
            N("Her father is an army officer. He wanted sons. Prizes, class president, head of the student council: he never looked."),
            ["spawn", "dad", "ms_ahnfather", "m19b", 12, -6],
            N("When he heard his daughter was on an executive track, he asked about her salary, and then about loans in her name. When she said no, he hit her."),
            ["remove", "dad"],
            S("ms_ahn", "So I cut him off. And left. And came here. And today I did what I was told."),
            S("ms_jang", "You're allowed to like yourself a bit more. You don't have to earn it every day."),
            N("A few days later the department head is dressed down himself, by head office, for blocking the plan they had liked. "
              "Jang buys her a necklace. She wears it. He doesn't notice."),
            ["gain", "necklace"],
            ["remove", "jg"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],
        ]},

        # M20 · 121-123수. Cutaway: Sun Ji-young's husband tells her to quit.
        "m20": {"title": T("Somi's Mother"), "kind": "main", "steps": [
            ["spawn", "sun", "ms_sun", "m20", 0, -2], ["spawn", "hb", "ms_sunhusband", "m20", 8, -2], ["spawn", "so", "ms_somi", "m20", 4, 2],
            S("ms_sunhusband", "I've been promoted. We don't need two salaries. You can stop now. Stay home with her."),
            S("ms_sun", "I'm not only Somi's mother. I'm a person who works. I want to be seen as one."),
            N("They talk until late. In the end the housework is no longer something he helps with. It is something he has to do."),
            N("At the office, the rumour that she's leaving is already going round. Somebody says: women."),
            ["remove", "hb"], ["remove", "so"], ["remove", "sun"],
        ]},

        # M21 · 127-133수. The executive's China business. The call from the China office. Jang talks.
        "m21": {"title": T("The Phone Call"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "m21", 2, -4],
            N("After Jordan, the executive vice president takes Sales 3 into his own line, and gives them his long-running China business on handsome terms."),
            N("Oh sees what that patronage could mean: a regular contract for Jang. He sees what else it could mean, too."),
            S("ms_oh", "Nobody here thinks we've caught a golden rope. Nobody. And keep a copy of everything."),
            ["remove", "oh"],
            N("Oh and the others are out. The phone on the team's desk rings: the company's man in China."),
            S("ms_chinarep", "Is this Sales 3? Our partner's asking about the arrangements. The usual gifts, the relationships. What do you want me to tell them?"),
            ["problem"],   # Jang: answer the China office
            S("ms_jang", "I'll lay it out. The gifts, the guanxi: we'll need to understand exactly what's been going to whom, and why."),
            N("He means to help. In China, it lands as an alarm. Within days the Chinese partner tips off One International's audit department, and a nine-year business comes apart."),
            ["spawn", "oh", "ms_oh", "m21", 2, -4],
            S("ms_oh", "A fight between departments is the leader's game. Yours is your own. Play your own."),
            ["remove", "oh"],
            ["party", ["ms_oh"]],   # the lead passes to Oh, at the team's desks; he goes up to the executive
        ]},

        # M22 · 134-139수. Oh at the executive; the audit; the executive demoted; HR's answer.
        "m22": {"title": T("Only Today"), "kind": "main", "steps": [
            ["spawn", "ex", "ms_exec", "m22", 8, -4],
            N("The division head has spent the evening pouring drinks for Oh. Oh goes straight from the table to the executive's office."),
            N("On the frame strip, Cho's big group must find a way to live."),
            ["problem"],   # the record: Black 137
            N("Cho's way to live with the group."),
            ["problem"],   # Oh: face the executive
            S("ms_oh", "Were those gifts relationships, sir, or were they the company's money walking out the door?"),
            N("It comes out in the audit: the Chinese partner had been using the executive's ambition, and skimming One International's real profit for years."),
            S("ms_exec", "Thank you for ending it quietly."),
            N("He is made president of One Global Service, an unlisted affiliate nobody visits."),
            ["remove", "ex"],
            ["spawn", "jg", "ms_jang", "m22", 2, 2],
            N("Jang is crying. He did it out of love for the team, and it doesn't matter."),
            S("ms_oh", "I understand. And that's the end of it. Regret it today. Only today."),
            ["spawn", "hr", "ms_hr", "m22", 14, 0],
            S("ms_oh", "A contract worker with a high-school certificate. Converting him to regular. Is there a way?"),
            S("ms_hr", "There's no precedent. I'd say it'll probably be difficult."),
            N("He didn't look it up."),
            ["remove", "hr"], ["remove", "jg"],
        ]},

        # M23 · 140-144수. Kim Dong-su's offer; Oh resigns; the contract ends.
        "m23": {"title": T("Infrastructure"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m23", 4, -2], ["spawn", "ch", "ms_cheon", "m23", 8, -2], ["spawn", "jg", "ms_jang", "m23", 12, -2],
            N("Sales 3 is alone now. Kim Dong-su comes back with an offer: a small company of their own."),
            N("Oh thinks about his four sons, about chicken versus eel. His wife tells him: buy everything at the staff discount, and stay till the bonus."),
            S("ms_oh", "People are everything. That's all a company is."),
            N("He resigns, and asks Kim Bu-ryeon to come in with them. Cheon Gwan-ung is left holding the team."),
            ["remove", "ch"], ["remove", "kd"],
            ["party", ["ms_jang"], {"to": {"place": "Jongno", "spot": "forecourt"}}],   # Jang's last day: out of the tower
        ]},
        "m23b": {"title": T("Two Years"), "kind": "main", "steps": [
            ["lose", "id_card"], ["gain", "contract"],
            N("Two years. The contract ends on a weekday. Jang hands in his card and walks out through the gates."),
            ["still", "ms_infra", "slow zoom out"],
            N("Looking back, the building is already cold, as though it had never been his."),
            S("ms_jang", "The infrastructure was me."),
        ]},

        # M24 · 145수. Three weeks later: the new company. The next applicant. Jordan. Cheon's colour.
        "m24": {"title": T("Move 145"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "m24", 2, -4],
            N("Three weeks later. A narrow street, an office up a flight of stairs. Oh Sang-sik's new trading company has hired its first regular employee: Jang Geu-rae."),
            N("On the frame strip, 144 moves. Nie Weiping's stones press on Cho's centre."),
            ["problem"],   # the record: Black 145
            ["still", "ms_145", "slow zoom in"],
            N("Black 145. White's five stones in the centre can't escape now. Nie Weiping resigns. Cho Hunhyun is the first world champion in Korean baduk."),
            S("ms_oh", "Next applicant."),
            ["spawn", "kd", "ms_kimds", "m24", 10, 2], ["move", "kd", "m24", 6, -2],
            S("ms_kimds", "Kim Dong-sik. I've quit too. Is the post still open?"),
            S("ms_jang", "I got here first. So you're the junior."),
            ["remove", "kd"],
            N("Later, Jang is in Amman, on the phone to his boss in Seoul. Back at One International, under a new team head, Cheon Gwan-ung stays."),
            S("ms_cheon", "As a breadwinner, as a father, I'm colourless. That's my colour."),
            ["victory"],
        ]},
    }


def _nodes():
    def node(key, x, y, scene, room=None, place="One International", role="main", **extra):
        n = {"key": key, "x": x, "y": y, "role": role, "place": place, "scene": scene}
        if room:
            n["room"] = room
        n.update(extra)
        return n
    return [
        node("m1", 20, 240, "m1", place="Korea Baduk Association", room="kba-trainees", move=0, dilemma=D(
            "ms_jang", "Win the game that decides your career.",
            "Seven years at these boards. Win this, and I'm a professional.",
            "Half a point short.",
            "Read it again.")),
        node("m2", 40, 232, "m2", room="lobby", move=2, dilemma=D(
            "ms_jang", "Get through the front desk.",
            "Everyone else has a pass with their name on it. I have a phone call.",
            "Let in.",
            "Not like that. Again.")),
        node("m3", 55, 225, "m3", room="sales3", move=13, board=False),
        node("m3b", 62, 222, "m3b", room="lobby", move=13, board=False,
             gate=[{"needs": ["item:waybill_scrap"], "else": "m3b_wait",
                    "objective": T("Search the lobby's bins by the gates for the rest of the waybill."), "at": "One International"}]),
        node("m4", 75, 215, "m4", place="Jongno", room="client", move=19, dilemma=D(
            "ms_parkjg", "Stand up to the client.",
            "They've laughed at me for years. Somebody thinks I can be a hunter. Fine.",
            "They stop laughing.",
            "Steady. Again.")),
        node("m4b", 85, 210, "m4b", room="meeting", move=20, board=False),
        node("m5", 95, 205, "m5", room="sun-desk", move=21, board=False),
        node("m5b", 105, 200, "m5b", place="Sun's neighbourhood", room="daycare", move=22, board=False),
        node("m6", 120, 192, "m6", room="pt-room", move=28, record=[29, None], dilemma=[
            D("ms_jang", "Find Cho Hunhyun's move.",
              "Eight points of komi. He can't play safe.",
              "Black 29.",
              "Not there. Look again."),
            D("ms_han", "Finish the presentation.",
              "My mouth's gone dry. The site comes first. Say it.",
              "Thank you.",
              "Breathe. Again."),
        ]),
        node("m7", 135, 185, "m7", room="pt-room", move=33, dilemma=D(
            "ms_jang", "Sell to someone who won't buy.",
            "He'll say no whatever I do. Then don't sell him slippers. Sell him this floor.",
            "He buys it.",
            "He won't buy that. Again.")),
        node("m8", 150, 178, "m8", room="finance", move=43, dilemma=D(
            "ms_ahn", "Get the plan past finance.",
            "Nobody on my team will ask. Then I'll ask.",
            "She hears me out, and the answer is still no.",
            "Again. Calmly.")),
        node("m9", 165, 170, "m9", room="sales3", move=46, record=47, dilemma=D(
            "ms_jang", "Find Cho Hunhyun's move.",
            "His centre group has no eyes. If it lives, he wins.",
            "Black 47.",
            "Not there. Look again.")),
        node("m10", 178, 164, "m10", room="sales3", move=59, dilemma=D(
            "ms_jang", "Write the shipping report.",
            "Don't pretend to know. Find out.",
            "Corrected in red, and pinned up.",
            "Again. From the start.")),
        node("m11", 190, 158, "m11", room="sun-desk", move=61, dilemma=D(
            "ms_sun", "Say it to Oh, plainly.",
            "She asked me not to. I'm saying it anyway.",
            "He'll deal with it.",
            "Plainer. Again.")),
        node("m12", 205, 150, "m12", place="Baekjin Trading", room="baekjin", move=63, board=False),
        node("m13", 220, 142, "m13", room="audit", move=65, role="boss",
             gate=[{"needs": ["mark:audit"], "else": "m13_wait",
                    "objective": T("Pick up ICB's registration from the audit room's table and your call notes from your desk in Sales 3, then link the clues on the audit board (in the bag, or at the audit room's table)."),
                    "at": "One International"}],
             dilemma=[
                 D("ms_jang", "Keep the audit open.",
                   "Even in a lost game there's a move I want to play.",
                   "They dial Amman.",
                   "They're still packing. Again."),
                 D("ms_jang", "Read the board list.",
                   "Somebody in Amman speaks Korean. Who?",
                   "Park, and Park, and Park.",
                   "Read it again."),
                 D("ms_jang", "Find James Park.",
                   "Park's family is in the steel team's files.",
                   "James Park is Park Jong-sik.",
                   "Not yet. Again."),
             ]),
        node("m14", 235, 135, "m14", room="exec-floor", move=68, board=False),
        node("m15", 250, 128, "m15", place="Susaek-dong", room="relatives", move=70, board=False),
        node("m16", 265, 120, "m16", place="the pizza shop", move=83, dilemma=D(
            "ms_oh", "Turn down an old friend.",
            "He was my senior. He taught me this job. And he's holding out an envelope.",
            "I hand it back.",
            "Again. Kindly."),
             ),
        node("m17", 280, 112, "m17", room="board-room", move=84, record=[85, None],
             gate=[{"needs": ["mark:seat_president", "mark:seat_exec", "mark:seat_division"], "else": "m17_wait",
                    "objective": T("Set the board room from the seating notes: each drink at its seat, on the 7th-floor board room's table."),
                    "at": "One International"}],
             dilemma=[
                 D("ms_jang", "Find Cho Hunhyun's move.",
                   "The game's been even for too long. Something has to turn it.",
                   "Black 85.",
                   "Not there. Look again."),
                 D("ms_oh", "Shake the board.",
                   "They hate this deal already. Tidy won't move them. Shake it.",
                   "Approved.",
                   "They're not moving. Again."),
             ]),
        node("m18", 295, 105, "m18", place="Jongno", move=106, board=False,
             gate=[{"needs": ["mark:trade"], "else": "m18_wait",
                    "objective": T("Buy stock at the market stalls on Jongno with the hundred thousand won, then sell it to passers-by on the street."),
                    "at": "Jongno"}]),
        node("m19", 310, 98, "m19", room="roof", move=114, dilemma=D(
            "ms_ahn", "Keep your proposal.",
            "Head office chose it. It's the better plan. Say so.",
            "It's the better plan. I withdraw it.",
            "Again."),
             ),
        node("m19b", 320, 94, "m19b", place="Jongno", room="pojangmacha", move=116, board=False),
        node("m20", 330, 90, "m20", place="Sun's neighbourhood", room="sun-flat", move=123, board=False, cutaway=True),
        node("m21", 345, 82, "m21", room="sales3", move=133, dilemma=D(
            "ms_jang", "Answer the China office.",
            "Everyone's out. Somebody has to answer.",
            "I lay it all out.",
            "Again."),
             ),
        node("m22", 360, 75, "m22", room="exec-floor", move=136, record=[137, None], dilemma=[
            D("ms_oh", "Find Cho Hunhyun's move.",
              "His big group must live, or it's over.",
              "Black 137.",
              "Not there. Look again."),
            D("ms_oh", "Face the executive.",
              "Gifts, or the company's money? Ask him.",
              "It comes out.",
              "Again."),
        ]),
        node("m23", 375, 68, "m23", room="sales3", move=143, board=False),
        node("m23b", 382, 64, "m23b", place="Jongno", room="forecourt", move=144, board=False),
        node("m24", 395, 58, "m24", place="the new office", move=144, record=145, dilemma=D(
            "ms_jang", "Find Cho Hunhyun's move.",
            "One more move. The centre.",
            "Black 145. Nie Weiping resigns.",
            "Not there. Look again.")),
    ]


_ORDER = ["m1", "m2", "m3", "m3b", "m4", "m4b", "m5", "m5b", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m14",
          "m15", "m16", "m17", "m18", "m19", "m19b", "m20", "m21", "m22", "m23", "m23b", "m24"]
_EDGES = [[a, b] for a, b in zip(_ORDER, _ORDER[1:])]

_ITEMS = {
    "pass": {"name": "Intern's pass", "kind": "key"},
    "id_card": {"name": "ID card (contract)", "kind": "key", "text": "Jang Geu-rae. Sales Team 3. Contract: two years."},
    "waybill_scrap": {"name": "Waybill scrap", "kind": "key", "text": "Glue on the back. A name: Kim Seok-ho."},
    "note": {"name": "A note", "kind": "key", "text": "Be irresponsible, sir. Blame the junior."},
    "slippers": {"name": "Office slippers", "kind": "key"},
    "homework": {"name": "Kim Dong-sik's homework", "kind": "key", "text": "Three questions a day, in his handwriting."},
    "report": {"name": "The shipping report (laminated)", "kind": "key"},
    "envelope": {"name": "An envelope", "kind": "key"},
    "cash_100k": {"name": "The mission's envelope", "kind": "key", "text": "₩100,000 to turn into more."},
    "dried_squid": {"name": "Dried squid", "kind": "key"},
    "necklace": {"name": "A necklace", "kind": "key"},
    "contract": {"name": "The contract, ended", "kind": "key"},
    # the audit board's clues (m11-m13)
    "statements": {"name": "Baekjin's statements", "kind": "clue",
                   "text": "Used cars to Jordan, through Baekjin Trading. The margin is far above anything in the trade."},
    "coached": {"name": "Baekjin's staff", "kind": "clue",
                "text": "Every answer the same, in the same words. Park Jong-sik was there before us."},
    "icb_listing": {"name": "ICB's registration", "kind": "clue",
                    "text": "ICB Company, Amman. Every officer listed is Jordanian. Signatory: Muhammad Indira."},
    "icb_call": {"name": "My call to ICB", "kind": "clue",
                 "text": "When I called ICB about the paperwork, someone in the room behind was speaking Korean."},   # (staging) the webtoon has Jang remember it; how he heard it is ours
    "board_list": {"name": "ICB's board list", "kind": "clue", "text": "Park, Park, Park..."},
    "james_park": {"name": "James Park", "kind": "clue", "text": "James Park, director of ICB, is Park Jong-sik."},
    # setting the board room (m17); the notes say which seat gets what
    "seating_notes": {"name": "Seating notes", "kind": "key",
                      "text": "President: still water, no ice. Executive vice president: green tea. Division head: coffee, black."},
    "water": {"name": "Still water", "kind": "prop"},
    "green_tea": {"name": "Green tea", "kind": "prop"},
    "coffee": {"name": "Black coffee", "kind": "prop"},
}

_AUDIT = {
    "title": "The audit board",
    "clues": ["statements", "coached", "icb_listing", "icb_call"],
    "links": [
        {"q": "Why is Baekjin's margin so high?", "pair": ["statements", "coached"],
         "a": "Someone taught Baekjin what to say. The margin is the money."},
        {"q": "Who is ICB, really?", "pair": ["icb_listing", "icb_call"],
         "a": "Every officer is Jordanian on paper. So who was speaking Korean on their line?"},
    ],
    "done": "audit",
}

# (staging) What Jang buys isn't in our sources; the corner shop's dried squid is.
_TRADE = {
    "cash": 100000, "unit": "₩",
    "goods": {"socks": {"name": "Socks (10 pairs)", "cost": 20000}},
    "done": "trade",
    "ends": {"offers": 5},
    "when": "node:m17",
}

_OPENING = [
    ["scroll", T("The First Move"), [
        T("Every chapter of this book opens on one move of a real game: the 1st Ing Cup final, game 5, 1989. "
          "Nie Weiping has White. Cho Hunhyun has Black. It will last 145 moves."),
        T("You are Jang Geu-rae. You have given your childhood to baduk. In a few minutes you will find out whether it gives anything back."),
    ]],
]


def _world():
    return {
        "n": 21,
        "lang": "en",
        "name": T("Misaeng"),
        "zh": "",
        "chapters": [],
        "record": {"sgf": "docs/book2/misaeng-ing-cup-g5.sgf",
                   "title": "1st Ing Cup final, game 5", "black": "Cho Hunhyun", "white": "Nie Weiping"},
        "audit": _AUDIT,
        "trade": _TRADE,
        "grades": ["11K", "11K+"],
        "boss": "redmond",
        "party": ["ms_jang_young"],
        "lead_portrait": True,
        "items": _ITEMS,
        "nodes": _nodes(),
        "edges": _EDGES,
        "scenes": _scenes(),
        "opening": _OPENING,
        "closing": [],
    }


WORLD21 = _world()
