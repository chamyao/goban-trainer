"""World 21: Misaeng, Book 1, "Not Yet Alive" (착수): episodes 0-33 of Yoon Tae-ho's webtoon 『미생』 (Daum, 2012).

English only ("lang": "en"; the user: "we dont need chinese lines for this"). Season 1 is five books (worlds 21-25,
the user: "yeah lets go"); this is the first. Design: docs/book2/misaeng-arc.md ("Book 1"); research:
docs/book2/misaeng-research-ep0-33.md; engine syntax: docs/book2/misaeng-engine.md (claude/integration-alt2).
The webtoon's events, people and order are kept; the dialogue is a close paraphrase, with only short key lines quoted.
Beats marked (staging) or (invented) in comments are not in the webtoon.

The frame: every beat opens on the 1st Ing Cup final, game 5 (1989), Nie Weiping (White) against Cho Hunhyun (Black),
played to the beat's "move" (the episode number). At five beats the player finds Cho's actual move ("record").
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


# Cast id (Graphics' TK_CHARS keys) -> Kokoro English voice (ids already used in the repo).
CAST21 = {
    "ms_jang": "am_liam", "ms_jang_young": "am_liam", "ms_mother": "bf_emma", "ms_oh": "am_onyx", "ms_kimds": "am_eric",
    "ms_ahn": "af_bella", "ms_baekgi": "am_puck", "ms_han": "am_michael", "ms_kimsh": "am_adam", "ms_sun": "af_sarah",
    "ms_somi": "af_sky", "ms_kimbr": "bm_george", "ms_director": "bm_fable", "ms_parkjg": "am_adam", "ms_client": "am_fenrir",
    "ms_hr": "am_michael", "ms_examiner": "bm_daniel", "ms_trainee": "af_sky", "ms_daycare": "bf_isabella",
    # new in Book 1 (Graphics: to draw)
    "ms_stevehan": "am_echo", "ms_go": "am_fenrir", "ms_buyer": "bm_lewis", "ms_leesh": "am_puck",
    "ms_hanfather": "bm_george", "ms_sponsor": "bm_daniel", "ms_senior": "bm_fable",
}


def _scenes():
    return {
        # M1 · 착수0-1. The last trainee game, lost by half a point (R7). The monologue. The first job; the army (told).
        # (staging) The webtoon tells the failure; it doesn't play one game. The board is that failure, played.
        "m1": {"title": T("Half a Point"), "kind": "main", "steps": [
            ["spawn", "ex", "ms_examiner", "m1", 0, -4], ["spawn", "tr", "ms_trainee", "m1", 6, -2],
            N("The Korea Baduk Association. Rows of boards, and children who have given their whole lives to them."),
            N("Jang Geu-rae came here at eleven. His father lost his company and put everything he had left into his son. "
              "His mother cut the rankings and prize money of the great players out of the newspaper."),
            N("He is eighteen. This is the last chance to turn professional. After this, he is too old."),
            S("ms_examiner", "Last round. Begin."),
            ["problem"],   # Jang: the game that decides his career; lost by half a point
            ["still", "ms_lastgame", "slow zoom in"],
            N("Half a point. The others in his year pass. He doesn't."),
            ["remove", "ex"], ["remove", "tr"],
            N("It wasn't talent, he tells himself. It wasn't losing by half a point, again and again. It wasn't playing between "
              "part-time jobs, or that there was never pocket money. It wasn't that his father died and his mother took to her bed."),
            N("Those would hurt too much. So he'll tell himself this: it's not that I didn't try. But I'll say it's because I didn't try hard enough."),
            N("The sky and the leaves are the same colour they were. Only the world in his eyes has gone grey. "
              "He doesn't throw his stones away all at once. A few at a time."),
            ["spawn", "sp", "ms_sponsor", "m1", 10, 2],
            S("ms_sponsor", "There's a job at my company. Come in on Monday."),
            ["remove", "sp"],
            N("At first his colleagues ask about baduk. Later it becomes the joke: slow at everything, the way baduk people are. "
              "He packs his desk without a word, and goes into the army almost as if he were running."),
            ["party", ["ms_jang"], {"to": {"place": "Susaek-dong", "spot": "home"}}],   # grown up (ms_jang); a deliberate cut: years pass
        ]},

        # M2 · 2-3수. Eight months after the army. The lights. The first day; Sales Team 3; Oh on the phone at eleven at night.
        "m2": {"title": T("A Light Allowed Me"), "kind": "main", "steps": [
            ["spawn", "desk", "ms_hr", "m2", 4, -4],
            N("Eight months after his discharge, the same sponsor calls an old friend: the president of One International, a general trading company."),
            N("The night before, Jang looked at the lights of the city from the hill in Susaek-dong. If there's a light I must keep burning, "
              "I'll answer for it. If a light is allowed me. Is there one, for me?"),
            S("ms_hr", "Jang Geu-rae? You're not on my list. Oh, here: your name came down separately. From upstairs."),
            N("Everyone else got in with a degree and a test. He got in with a phone call. Everyone can see it."),
            ["gain", "pass"],
            ["still", "ms_onelight", "slow zoom in"],
            S("ms_hr", "Sales Team 3. Section head Oh Sang-sik."),
            ["remove", "desk"],
            ["spawn", "oh", "ms_oh", "m2", 14, -6], ["spawn", "kd", "ms_kimds", "m2", 18, -4],
            N("Sales Team 3's section head is on the phone to a buyer who wants an answer by eleven tonight. His eyes are red. "
              "He hasn't slept, by the look of them."),
            S("ms_oh", "Eleven. Yes. You'll have it. ...The intern? Kim, he's yours. We're in no position to be picky."),
            S("ms_kimds", "Kim Dong-sik, assistant manager. You'll sit by me."),
            S("ms_jang", "I won't fail again. Not the way I failed at baduk."),
            N("He says it to himself. Nobody's listening."),
            ["remove", "oh"], ["remove", "kd"],
        ]},

        # M3 · 4수. FOB. The jargon. A snapback on the board in his head (the episode prints one).
        "m3": {"title": T("FOB"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m3", 2, -2], ["spawn", "oh", "ms_oh", "m3", 10, -6],
            S("ms_oh", "FOB or CIF? Who's paying the freight? Kim, ask the buyer. Intern, find me the L/C. Now."),
            N("FOB. L/C. B/L. Every sentence in the room has a word in it Jang has never heard. Oh's red eyes don't wait for him to look them up."),
            N("He shuts his eyes, and the only thing he knows how to read comes up on its own: a board, white stones in a triangle, one point inside."),
            ["problem"],   # Jang: a snapback (환격), the problem the episode prints
            N("Play inside. Let them take it. Take back more. White dies whatever it does."),
            S("ms_kimds", "Free On Board. The seller's done once the goods are on the ship. Write it down. Here, you'll need these."),
            ["gain", "glue_stick"],
            ["remove", "kd"], ["remove", "oh"],
        ]},

        # M4 · 5수. Together, or alone. The mind map; the "Angry Birdie": three seniors, three errands; Ahn's first appearance.
        "m4_wait": {"title": T("Three Errands"), "kind": "main", "steps": [
            S("ms_jang", "Copies for Kim, the file for Oh, coffee for the deputy. All at once. Go."),
        ]},
        "m4": {"title": T("Together, or Alone"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m4", 2, -2], ["spawn", "ahn", "ms_ahn", "m4", 12, 0],
            N("He made a mind map of the team's work. It took him two nights."),
            S("ms_kimds", "This is something you did alone. Work here is something you do together. There's a manual for a reason."),
            N("Everyone on the floor has wanted something from him this morning, all at once, and none of it the same."),
            N("In the corridor a woman intern in a pink coat goes by with a stack of files and a face that has done this for ten years. "
              "Ahn Young-yi, from the same intake. She doesn't look at him."),
            ["remove", "ahn"], ["remove", "kd"],
        ]},

        # M5 · 6-7수. Twenty-five stones. The rumour; Kim Dong-sik's warning; the commute.
        "m5": {"title": T("Twenty-Five Stones"), "kind": "main", "steps": [
            ["still", "ms_25stones", "slow zoom out"],
            N("Twenty-five white stones, and one black. Wherever he puts himself, he's already surrounded."),
            N("Then the rumour gets round that the parachute was picked from the very top. Interns who never spoke to him start to."),
            ["spawn", "kd", "ms_kimds", "m5", 2, -2],
            S("ms_kimds", "Careful with the ones who praise you, who make your work sound bigger than it is, who do you favours. They'll collect."),
            ["problem"],   # Jang: live inside their wall
            S("ms_kimds", "I'm telling you because nobody told me."),
            ["remove", "kd"],
            N("On the train home, everyone is reading something, answering something, going somewhere."),
            S("ms_jang", "Am I the only one still dreaming? The world is faster than me."),
        ]},

        # M6 · 8-11수. The PT announced; Han Seok-yul; "Again!"; Oh: scattered; "How old are you?"
        "m6": {"title": T("Partners"), "kind": "main", "steps": [
            ["spawn", "han", "ms_han", "m6", 6, -2], ["spawn", "oh", "ms_oh", "m6", 14, -6],
            N("The internship ends with a test: a presentation, in pairs. The pairs are drawn. The others look at Jang's partner and wince."),
            N("Han Seok-yul: the intern who asked for the factory floor on day one, who tells everyone he has eaten with the president."),
            S("ms_han", "Field first. You do the paper. ...No. Again!"),
            S("ms_han", "The item? Find it yourself."),
            N("The other interns have a name for the pair: the nuclear bomb. A dud holding a dud."),
            S("ms_oh", "Jang. You're all over the place. Pick one thing and do it."),
            N("On the frame strip, Black links up with a stone it played earlier, looking for a way to live by attacking."),
            ["problem"],   # the record: Black 11
            N("Cho linked his stones, and kept attacking."),
            ["problem"],   # Jang: take the PT back
            S("ms_jang", "And. How old are you?"),
            S("ms_han", "..."),
            S("ms_jang", "Not going to say?"),
            ["remove", "han"], ["remove", "oh"],
            N("That night, alone, he thinks of the players he used to cut out of the paper with his mother. My heroes are disappearing."),
        ]},

        # M7 · 13수. The waybill. Kim Seok-ho, the glue stick, the lobby floor; the director; the punishment.
        "m7": {"title": T("The Waybill"), "kind": "main", "steps": [
            ["spawn", "sh", "ms_kimsh", "m7", 4, -2],
            N("Kim Seok-ho, an intern on Go's team: married young, the eldest grandson, a baby at home, the best translator in the intake. "
              "Nobody on his team teaches him anything; he borrows what he needs."),
            S("ms_kimsh", "Can I borrow your glue stick? Thanks."),
            ["lose", "glue_stick"],
            N("A page of Sales 3's comes away stuck to the back of his: a waybill, with the team's approval stamps on it. Jang was meant to shred it."),
            S("ms_kimsh", "Someone throw this away for me?"),
            N("He drops it on a desk and runs. An hour later it's on the floor of the lobby, by the gates, where any visitor could read it."),
            ["remove", "sh"],
            ["spawn", "dir", "ms_director", "m7", 8, 2], ["spawn", "oh", "ms_oh", "m7", 12, -6],
            ["emote", "dir", "anger"],
            S("ms_director", "Whose is this? A customer's shipment, on my lobby floor. Hey. Do better."),
            N("All the interns are made to stand in the corridor for an hour. Everyone knows whose desk the waybill came from."),
            ["remove", "dir"],
            S("ms_oh", "Let's clean it up."),
            N("That's all he says. He takes the lift down to the lobby."),
            ["party", ["ms_oh"], {"to": {"place": "One International", "spot": "lobby-lift"}}],   # the lead passes to Oh, at the lift doors below
        ]},

        # M8 · 14수. Oh finds the scrap (invented: how; the webtoon has him find it). Cutaway: Kim Seok-ho comes home.
        "m8_wait": {"title": T("The Lobby"), "kind": "main", "steps": [
            S("ms_oh", "If it fell here, there's more of it. The bins by the gates."),
        ]},
        "m8": {"title": T("The Scrap"), "kind": "main", "steps": [
            N("Torn from the waybill's back: a strip with glue on it, and a name in an intern's careful hand. Kim Seok-ho."),
            S("ms_oh", "Not the parachute, then."),
            N("At the team dinner Oh tells Go, Kim Seok-ho's section head, who is too drunk to hear it. Somebody else hears it, and Kim Seok-ho comes to say sorry."),
            ["still", "ms_babyfinger", "slow zoom in"],
            N("That night Kim Seok-ho comes home late to one room. His wife and the baby are asleep on the floor. The baby's hand closes round his finger."),
            S("ms_oh", "Kim. Get the kid a new glue stick."),
            ["gain", "glue_stick"],
            ["party", ["ms_kimbr"], {"to": {"place": "one-international--textile", "spot": "textile"}}],   # the lead passes to Kim Bu-ryeon
        ]},

        # M9 · 15-16수. Dog meat. Steve Han; Go; Kim Bu-ryeon's apology; the sauna.
        "m9": {"title": T("Dog Meat"), "kind": "main", "steps": [
            ["spawn", "st", "ms_stevehan", "m9", 6, -4], ["spawn", "go", "ms_go", "m9", 2, 0],
            N("Go, a section head on the floor below, took the textile team's American buyers to lunch with a challenging spirit. Dog meat."),
            N("Steve Han, the textile team's head, raised in America, has held every one of Go's approvals since."),
            S("ms_stevehan", "You fed them dog, and now they're sulking, and you won't say sorry. What you people do isn't business. It's playing at business. "
              "One page. What matters. Not this paper going back and forth."),
            S("ms_go", "I'm not apologising to him."),
            N("Kim Bu-ryeon, division head, could pull rank. It would get worse."),
            ["problem"],   # Kim Bu-ryeon: apologise before it grows
            S("ms_kimbr", "We were wrong, Steve. Both of us. Go, bow."),
            ["remove", "go"], ["remove", "st"],
            ["still", "ms_sauna", "slow pan across"],
            N("By evening they're all in a sauna on Jongno, up to their chins in hot water, We Are the World."),
            S("ms_stevehan", "Don't touch me."),
            N("Sometimes the obvious move is the hard one."),
            ["party", ["ms_jang"], {"to": {"place": "one-international--roof", "spot": "roof"}}],   # back to Jang, on the roof
        ]},

        # M10 · 17수. Park Jong-gi: bread on the street; the roof.
        "m10": {"title": T("Bread on the Street"), "kind": "main", "steps": [
            ["spawn", "pj", "ms_parkjg", "m10", 4, -2],
            N("Assistant manager Park Jong-gi, IT sales, carries a resignation letter in his jacket. He ate lunch standing up in the street, "
              "and brought it back up in an alley. Home is hard too: more happiness than he can carry, and he can't face it."),
            N("On the roof Jang tells him he admires his patience. Park hears something else."),
            S("ms_parkjg", "Sales is a hunt, you know. Hunters and farmers. Me, I'm a hunter. Come with me tomorrow. I'll show you."),
            N("No choice satisfies everyone. You answer for the one you make."),
            ["remove", "pj"],
            ["party", ["ms_jang"], {"to": {"place": "Jongno", "from": "One International"}}],
        ]},

        # M11 · 18-19수. The client. The mockery through a door; "by procedure"; the staged scolding; the proper move.
        "m11": {"title": T("The Proper Move"), "kind": "main", "steps": [
            ["spawn", "pj", "ms_parkjg", "m11", 0, -2], ["spawn", "cl", "ms_client", "m11", 12, -6],
            N("Through the client's door: his own staff, laughing. Put One International's order at the back. Park won't say a word. He never does."),
            N("Jang is looking at him. Waiting to see the hunter."),
            S("ms_parkjg", "Shall we proceed by the procedure, then? By the contract. Claims and all."),
            N("The client's president turns on one of his own men and shouts at him in front of the customer, so loud the office goes quiet. "
              "It's staged. Feint east, strike west: Park will feel sorry for him, and back down."),
            N("On the frame strip, White has shown a weakness on purpose. The natural answer is the hard one."),
            ["problem"],   # the record: Black 19
            N("Cho went straight into the weakness he was shown."),
            ["problem"],   # Jang: answer the trick with the proper move
            S("ms_jang", "Then you'll put that in writing, sir? What you just told your man. That it was his error, and you'll make it good."),
            S("ms_client", "...I'll come and see your people myself."),
            ["remove", "cl"], ["remove", "pj"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],
        ]},

        # M12 · 20수. The client's president at One International. The note; the confession; "everyone has their own baduk".
        "m12": {"title": T("Be Irresponsible"), "kind": "main", "steps": [
            ["spawn", "cl", "ms_client", "m12", 10, -4], ["spawn", "pj", "ms_parkjg", "m12", 2, -2],
            N("A client's president, at One International in person. It doesn't happen. The executives are all in the room."),
            N("Jang can see it now: Park is no hunter. He writes three words on a sheet made to look like a document, and slides it across. Be irresponsible, sir."),
            ["gain", "note"], ["lose", "note"],
            ["problem"],   # Park Jong-gi: tell them the truth
            S("ms_parkjg", "The one who deceived you was me. Not them. Discipline me."),
            N("Around the table, one by one, the executives' faces turn into his."),
            ["remove", "cl"],
            N("Nobody punishes him. You don't drop a partner of many years over this. On the roof afterwards Jang can't look at him."),
            S("ms_jang", "I'm sorry. Me, who failed at baduk, telling you how to play."),
            S("ms_parkjg", "Thank you."),
            ["remove", "pj"],
            S("ms_jang", "Everyone has their own baduk."),
        ]},

        # M13 · 21수. Sun Ji-young asks; Jang and Ahn at the daycare; the doorbell.
        "m13": {"title": T("The Doorbell"), "kind": "main", "steps": [
            ["spawn", "sun", "ms_sun", "m13", 0, -2], ["spawn", "ahn", "ms_ahn", "m13", 6, 0],
            N("Deputy general manager Sun Ji-young never asks a junior for anything personal. Tonight her husband can't make the pickup either."),
            S("ms_sun", "The daycare closes at seven. I can't get there. I'm sorry. I'm asking. Somi. She's five."),
            S("ms_ahn", "We'll go. Jang Geu-rae, you're coming."),
            ["remove", "sun"], ["remove", "ahn"],
            ["party", ["ms_jang", "ms_ahn"], {"to": {"place": "Sun's neighbourhood", "from": "Jongno"}}],
        ]},
        "m13b": {"title": T("The Doorbell"), "kind": "main", "steps": [
            ["spawn", "dc", "ms_daycare", "m13b", 8, -2], ["spawn", "so", "ms_somi", "m13b", 4, -2],
            ["still", "ms_doorbell", "slow zoom in"],
            N("Every time the bell rings, the children still here run to the door at once. Mum's here. Then it isn't theirs, and they walk back."),
            S("ms_ahn", "Somi? Your mum sent us. She's sorry."),
            S("ms_daycare", "She's always last. Are you her mum's colleague? ...Do you drink?"),
            N("Somi takes Ahn's hand, and then Jang's. They walk her home between them."),
            ["remove", "dc"], ["remove", "so"],
            ["party", ["ms_sun"], {"to": {"place": "Sun's neighbourhood", "spot": "sun-flat-door"}}],   # Sun comes home; the lead passes to her at her own door
        ]},

        # M14 · 22수. Sun at home: Somi's drawing of her mother, from behind.
        "m14": {"title": T("Her Back"), "kind": "main", "steps": [
            ["spawn", "so", "ms_somi", "m14", 4, 0],
            N("Jang and Ahn have gone. Somi is asleep on the floor with her crayons."),
            ["gain", "somi_drawing"],
            ["still", "ms_drawing", "slow zoom in"],
            N("A drawing: Mummy. A woman walking away, a phone at her ear. Somi has drawn her from behind, because that's how she sees her. "
              "Every morning Somi bows at the door and says have a good day, and her mother is already gone."),
            S("ms_sun", "I won't put you off for the sake of a living. Not any more."),
            N("At eight the next morning a client calls. At nine she's at her desk."),
            ["remove", "so"],
            ["party", ["ms_jang"], {"to": {"place": "one-international--sales3", "spot": "sales3"}}],
        ]},

        # M15 · 23-26수. Han is older; his method; the individual task; "through others I'm revealed".
        "m15": {"title": T("Questions, Not Answers"), "kind": "main", "steps": [
            ["spawn", "han", "ms_han", "m15", 4, -2],
            N("It turns out Han is a year older than Jang. He's been polite to him the whole time. Jang is not."),
            N("Han is in before anyone, out at the port and the airport before nine. An engineer, and a salesman."),
            S("ms_han", "The panel knows more than we do. Don't bring them answers. Bring them good questions."),
            ["problem"],   # Jang: build the PT with Han
            ["spawn", "oh", "ms_oh", "m15", 12, -6],
            S("ms_oh", "One more task, the day after the PT. Each of you sells something to the person you'd least like to sell to. Your partner. "
              "Your partner decides whether to buy."),
            N("Han won't take orders from anyone who has never stood on a factory floor. Jang has never stood on one."),
            S("ms_jang", "It's through other people that you find out what you are."),
            ["remove", "oh"], ["remove", "han"],
        ]},

        # M16 · 27-29수. PT day. The costumed team; Han's nerves; the choke; Jang stammers; Han's father's hands.
        "m16": {"title": T("Black Nails"), "kind": "main", "steps": [
            ["spawn", "han", "ms_han", "m16", 2, -2], ["spawn", "ex", "ms_examiner", "m16", 12, -6], ["spawn", "oh", "ms_oh", "m16", 16, -6],
            N("PT day. One team stretched the company logo and is finished before it starts. Another comes in costume. Next, says the panel."),
            N("Han has watched every team with a grin. Now his phone won't stop: his mother, his contacts on the floor. He takes a herbal calmative and then another."),
            N("On the frame strip, Cho has eight points of komi against him and can't afford to play safe."),
            ["problem"],   # the record: Black 29
            N("Cho broke White's side at the cost of his own shape. From here on, every move is one intent against another."),
            N("Han stands, opens his mouth, takes a sip of water, and chokes. He can't go on."),
            ["problem"],   # Jang: keep it going
            S("ms_jang", "The, the market for... One International's share of..."),
            N("He made every slide. He has never presented anything in his life."),
            ["still", "ms_blacknails", "slow zoom in"],
            N("A small boy and his father's hands. Dad, your nails are black. It's grease, it won't wash off. Why, are you ashamed?"),
            ["problem"],   # Han: say why the floor matters
            S("ms_han", "Father, I'm not ashamed of you. Or of the floor. Everything this company sells was made by somebody's hands."),
            S("ms_oh", "So someone else is keeping an eye on Jang Geu-rae."),
            ["remove", "han"], ["remove", "ex"], ["remove", "oh"],
            ["party", ["ms_ahn"]],   # the lead passes to Ahn, next up in the same room
        ]},

        # M17 · 30수. Ahn's PT; "the president's daughter?"; Han's team marked down for a sum.
        "m17": {"title": T("The President's Daughter?"), "kind": "main", "steps": [
            ["spawn", "ls", "ms_leesh", "m17", 4, -2], ["spawn", "ex", "ms_examiner", "m17", 12, -6],
            N("Han's team is marked down: a sum on one slide is wrong. The calculator does the sums. How do you get them wrong?"),
            N("Ahn Young-yi's turn, with her partner, Lee Sang-hyun. Speech isn't writing: you have to hold the air of the room, or it goes thin."),
            ["problem"],   # Ahn: give the PT
            N("It's flawless. Lee Sang-hyun barely says a word, because there's no room left for one."),
            S("ms_examiner", "You're not the president's daughter, are you? Or one of ours, undercover?"),
            S("ms_ahn", "No, sir. I've been through this a few times."),
            ["remove", "ls"], ["remove", "ex"],
            ["party", ["ms_jang"]],   # back to Jang for the individual task; he has to borrow something first
        ]},
        "m18_wait": {"title": T("Combat Boots"), "kind": "main", "steps": [
            S("ms_jang", "Not yet. I need the one thing I'm selling, and section head Oh is wearing it. Sales 3."),
        ]},

        # M18 · 31-32수 (boss). Oh barefoot; Han sells; Jang buys only the notebooks; Jang sells Oh's slippers; "I won't buy them".
        "m18": {"title": T("Combat Boots"), "kind": "main", "steps": [
            ["spawn", "han", "ms_han", "m18", 4, -2], ["spawn", "oh", "ms_oh", "m18", 14, -6], ["spawn", "ahn", "ms_ahn", "m18", 18, -2],
            ["still", "ms_barefoot", "slow zoom in"],
            N("The individual task. On the panel, section head Oh sits in his socks."),
            S("ms_han", "My field notebooks. Every site I've been to. And this."),
            N("He unrolls a bolt of fabric across the table with a flourish."),
            ["problem"],   # Jang: buy what's worth buying
            S("ms_jang", "I'll buy the notebooks. Not the cloth. I'm buying your time on the floor. And I'd like to sell cloth with you one day."),
            ["gain", "notebook"],
            N("Ahn, watching, looks surprised; then she smiles. So does Oh."),
            N("On the frame strip, Black can put White's whole side in atari."),
            ["problem"],   # the record: Black 31
            N("Cho broke the lower side completely. Every move says: answer like this, or else."),
            ["lose", "slippers"],
            S("ms_jang", "Office slippers. The office worker's combat boots. You have yours on the floor. This floor is a floor too."),
            S("ms_han", "I won't buy them."),
            S("ms_jang", "You've been fighting on it for two months."),
            S("ms_han", "I won't buy them."),
            ["problem"],   # Jang: sell to someone who won't buy
            S("ms_jang", "There are no meaningless stones on a board."),
            S("ms_han", "...And nothing a company makes is made for no reason. I've been narrow."),
            N("The next morning there are new slippers under every desk on the floor. Han bought them."),
            ["remove", "han"], ["remove", "oh"], ["remove", "ahn"],
        ]},

        # M19 · 33수. The results. Baek-gi's hand mirror; Ahn first; Jang on a two-year contract.
        "m19": {"title": T("Contract"), "kind": "main", "steps": [
            ["spawn", "bg", "ms_baekgi", "m19", 4, -2], ["spawn", "ahn", "ms_ahn", "m19", 8, -2], ["spawn", "han", "ms_han", "m19", 12, -2],
            N("Jang Baek-gi sold his partner a small hand mirror, in a box far too big for it: manage your face before you manage business. His partner bought it, red to the ears."),
            N("On the frame strip, Black can take its territory now."),
            ["problem"],   # the record: Black 33
            N("Cho settled his side. Territory against thickness."),
            N("The list. Ahn Young-yi, first overall. Jang Baek-gi, hired, to the steel team. Han Seok-yul, hired. Kim Seok-ho, hired, to head office."),
            N("Jang Geu-rae, hired. On a two-year contract."),
            ["lose", "pass"], ["gain", "id_card"],
            S("ms_jang", "A contract worker, with a real ID card round his neck."),
            ["remove", "bg"], ["remove", "ahn"], ["remove", "han"],
            ["party", ["ms_jang"], {"to": {"place": "Jongno", "from": "One International"}}],
        ]},

        # M20 · 33수. The first morning: Oh takes the new hires to the memorial altar at Daehanmun.
        "m20": {"title": T("Daehanmun"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "m20", 2, -4], ["spawn", "ahn", "ms_ahn", "m20", 6, 0], ["spawn", "han", "ms_han", "m20", 9, 0],
            ["spawn", "bg", "ms_baekgi", "m20", 12, 0],
            N("The first morning. Oh doesn't take his new people to their desks. He takes them to Daehanmun, the old palace gate, "
              "where a tent stands with portraits in it: laid-off car workers who died after they lost their jobs."),
            ["still", "ms_daehanmun", "slow pan across"],
            N("He bows. They bow. He doesn't explain. Ahn looks as if she already knows what this is."),
            S("ms_oh", "Right. Work."),
            N("Twenty-five stones became twenty-four. On the board in Jang's head there's a little room now, and a long game left."),
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
            "ms_jang_young", "Win the game that decides your career.",
            "Seven years at these boards. Win this, and I'm a professional.",
            "Half a point short.",
            "Read it again.")),
        node("m2", 40, 232, "m2", room="lobby", move=3, board=False),
        node("m3", 55, 225, "m3", room="sales3", move=4, dilemma=D(
            "ms_jang", "Find the move that gives a stone to take more.",
            "I don't know what FOB is. I know what this is.",
            "Snapback.",
            "Read it again.")),
        node("m4", 68, 218, "m4", room="sales3", move=5, board=False,
             gate=[{"needs": ["mark:errand_copy", "mark:errand_file", "mark:errand_coffee"], "else": "m4_wait",
                    "objective": T("Run the three errands on Sales 3's floor: Kim's copies from the copier, Oh's file to his desk, the deputy's coffee from the pantry."),
                    "at": "One International"}]),
        node("m5", 80, 212, "m5", room="sales3", move=7, dilemma=D(
            "ms_jang", "Live inside their wall.",
            "Twenty-five of them, and me. Find two eyes.",
            "Alive. Barely.",
            "Dead. Again.")),
        node("m6", 95, 205, "m6", room="pt-room", move=10, record=[11, None], dilemma=[
            D("ms_jang", "Find Cho Hunhyun's move.",
              "Link up, and keep attacking.",
              "Black 11.",
              "Not there. Look again."),
            D("ms_jang", "Take the PT back.",
              "He's been giving orders for three days. Enough.",
              "He stops talking.",
              "Again."),
        ]),
        node("m7", 110, 198, "m7", room="sales3", move=13, board=False),
        node("m8", 120, 194, "m8", room="lobby", move=14, board=False,
             gate=[{"needs": ["item:waybill_scrap"], "else": "m8_wait",
                    "objective": T("Search the recycling bins by the lobby's ID gates for the rest of the waybill."), "at": "One International"}]),
        node("m9", 135, 186, "m9", room="textile", move=16, dilemma=D(
            "ms_kimbr", "Apologise before it grows.",
            "I could pull rank. It would only get worse. The obvious move.",
            "Steve takes it.",
            "Not like that. Again.")),
        node("m10", 150, 180, "m10", room="roof", move=17, board=False),
        node("m11", 165, 172, "m11", place="Jongno", room="client", move=18, record=[19, None], dilemma=[
            D("ms_jang", "Find Cho Hunhyun's move.",
              "He's shown me a weakness on purpose. Go straight in.",
              "Black 19.",
              "Not there. Look again."),
            D("ms_jang", "Answer the trick with the proper move.",
              "It's staged. Hold him to what he said.",
              "He'll come in person.",
              "He's slipping away. Again."),
        ]),
        node("m12", 178, 166, "m12", room="meeting", move=20, dilemma=D(
            "ms_parkjg", "Tell them the truth.",
            "The kid says be irresponsible. I've been irresponsible for years.",
            "I said it.",
            "Again.")),
        node("m13", 190, 160, "m13", room="sun-desk", move=21, board=False),
        node("m13b", 198, 156, "m13b", place="Sun's neighbourhood", room="daycare", move=21, board=False),
        node("m14", 210, 150, "m14", place="Sun's neighbourhood", room="sun-flat", move=22, board=False),
        node("m15", 225, 142, "m15", room="sales3", move=26, dilemma=D(
            "ms_jang", "Build the PT with Han.",
            "He has the questions. I have the paper.",
            "It holds together.",
            "Again.")),
        node("m16", 240, 134, "m16", room="pt-room", move=28, record=[29, None, None], dilemma=[
            D("ms_jang", "Find Cho Hunhyun's move.",
              "Eight points of komi. He can't play safe.",
              "Black 29.",
              "Not there. Look again."),
            D("ms_jang", "Keep it going.",
              "He's choking. I made every slide. Say something.",
              "Enough to get him back.",
              "Breathe. Again."),
            D("ms_han", "Say why the floor matters.",
              "My father's hands. Say it.",
              "The room is listening.",
              "Again."),
        ]),
        node("m17", 250, 128, "m17", room="pt-room", move=30, dilemma=D(
            "ms_ahn", "Give the PT.",
            "Hold the room. Leave nothing thin.",
            "Flawless.",
            "Again. Cleaner.")),
        node("m18", 262, 120, "m18", room="pt-room", move=30, role="boss", record=[None, 31, None],
             gate=[{"needs": ["item:slippers"], "else": "m18_wait",
                    "objective": T("Borrow section head Oh's office slippers at his desk in Sales 3, then come back to the PT room."),
                    "at": "One International"}],
             dilemma=[
                 D("ms_jang", "Buy what's worth buying.",
                   "Notebooks and a bolt of cloth. What's he really selling?",
                   "The notebooks.",
                   "Look again."),
                 D("ms_jang", "Find Cho Hunhyun's move.",
                   "Atari. Break the whole side.",
                   "Black 31.",
                   "Not there. Look again."),
                 D("ms_jang", "Sell to someone who won't buy.",
                   "He'll say no whatever I do. Don't sell him slippers. Sell him this floor.",
                   "He buys.",
                   "He won't buy that. Again."),
             ]),
        node("m19", 275, 112, "m19", room="hr", move=32, record=33, dilemma=D(
            "ms_jang", "Find Cho Hunhyun's move.",
            "Take the territory. Settle.",
            "Black 33.",
            "Not there. Look again.")),
        node("m20", 290, 104, "m20", place="Daehanmun", move=33, board=False),
    ]


_ORDER = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m13b", "m14", "m15",
          "m16", "m17", "m18", "m19", "m20"]
_EDGES = [[a, b] for a, b in zip(_ORDER, _ORDER[1:])]

_ITEMS = {
    "pass": {"name": "Intern's pass", "kind": "key"},
    "id_card": {"name": "ID card (contract)", "kind": "key", "text": "Jang Geu-rae. Sales Team 3. Contract: two years."},
    "glue_stick": {"name": "Glue stick", "kind": "key"},
    "waybill_scrap": {"name": "Waybill scrap", "kind": "key", "text": "Glue on the back. A name: Kim Seok-ho."},
    "copy": {"name": "Copies for Kim", "kind": "key"},
    "file": {"name": "Oh's file", "kind": "key"},
    "coffee": {"name": "The deputy's coffee", "kind": "key"},
    "note": {"name": "A note", "kind": "key", "text": "Be irresponsible, sir."},
    "slippers": {"name": "Section head Oh's slippers", "kind": "key"},
    "notebook": {"name": "Han's field notebooks", "kind": "key", "text": "Every site he's stood on, in his handwriting."},
    "somi_drawing": {"name": "Somi's drawing", "kind": "key", "text": "Mummy, walking away, a phone at her ear. Drawn from behind."},
}

_OPENING = [
    ["scroll", T("The First Move"), [
        T("Every chapter of this story opens on one move of a real game: the 1st Ing Cup final, game 5, 1989. "
          "Nie Weiping has White. Cho Hunhyun has Black. It will last 145 moves."),
        T("You are Jang Geu-rae. You have given your childhood to baduk. In a few minutes you will find out whether it gives anything back."),
    ]],
]

_CLOSING = [
    ["scroll", T("Book 2: Style"), [
        T("Thirty-three moves played. Jang has a desk, a team head who takes his people to memorials, and a contract that ends in two years."),
        T("Next: four new hires, four teams, and the first time Sales 3 sees what Jang was before he came."),
    ]],
]


def _world():
    return {
        "n": 21,
        "lang": "en",
        "name": T("Not Yet Alive"),
        "zh": "",
        "chapters": [],
        "record": {"sgf": "docs/book2/misaeng-ing-cup-g5.sgf",
                   "title": "1st Ing Cup final, game 5", "black": "Cho Hunhyun", "white": "Nie Weiping"},
        "grades": ["11K", "11K+"],
        "boss": "redmond",
        "party": ["ms_jang_young"],
        "lead_portrait": True,
        "items": _ITEMS,
        "nodes": _nodes(),
        "edges": _EDGES,
        "scenes": _scenes(),
        "opening": _OPENING,
        "closing": _CLOSING,
        "next": 22,
    }


WORLD21 = _world()
