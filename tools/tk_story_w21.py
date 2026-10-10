"""World 21: Misaeng, Book 1, "Not Yet Alive" (착수): episodes 0-33 of Yoon Tae-ho's webtoon 『미생』 (Daum, 2012).

English only ("lang": "en"; the user: "we dont need chinese lines for this"). Season 1 is five books (worlds 21-25,
the user: "yeah lets go"); this is the first. Design: docs/book2/misaeng-arc.md ("Book 1"); research:
docs/book2/misaeng-research-ep0-33.md; engine syntax: docs/book2/misaeng-engine.md (claude/integration-alt2).
The webtoon's events, people and order are kept; the dialogue is a close paraphrase, with only short key lines quoted.
Beats marked (staging) or (invented) in comments are not in the webtoon.

The record boards are multiple choice (the user): Cho's move and three of the "choices", picked by the player's rank;
each choice carries its points lost against Cho's move (KataGo, the repo's small net, 300 visits on the position after
the move; scratchpad analysis, noise about 0.3). Every candidate scores below Cho's move.

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
        node("m6", 95, 205, "m6", room="pt-room", move=10, record=[11, None], choices={11: [['dl', 3.1], ['dr', 3.55], ['dc', 3.97], ['bp', 4.04], ['cc', 4.58], ['ed', 4.84], ['ip', 6.15]]},
             dilemma=[
            D("ms_jang", "Which move did Cho Hunhyun play?",
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
        node("m11", 165, 172, "m11", place="Jongno", room="client", move=18, record=[19, None], choices={19: [['ch', 0.03], ['oc', 0.04], ['kq', 0.16], ['lp', 0.91], ['dm', 1.07], ['dl', 1.72]]},
             dilemma=[
            D("ms_jang", "Which move did Cho Hunhyun play?",
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
        node("m16", 240, 134, "m16", room="pt-room", move=28, record=[29, None, None], choices={29: [['oq', 0.19], ['or', 1.33], ['dm', 2.27], ['dl', 2.42], ['ck', 2.45], ['pr', 3.16], ['dg', 3.17], ['qf', 4.03]]},
             dilemma=[
            D("ms_jang", "Which move did Cho Hunhyun play?",
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
             choices={31: [['ms', 0.43], ['mr', 0.56], ['dm', 2.43], ['dl', 2.96], ['ck', 3.01], ['gq', 3.45], ['hr', 4.16], ['ns', 5.02]]},
             dilemma=[
                 D("ms_jang", "Buy what's worth buying.",
                   "Notebooks and a bolt of cloth. What's he really selling?",
                   "The notebooks.",
                   "Look again."),
                 D("ms_jang", "Which move did Cho Hunhyun play?",
                   "Atari. Break the whole side.",
                   "Black 31.",
                   "Not there. Look again."),
                 D("ms_jang", "Sell to someone who won't buy.",
                   "He'll say no whatever I do. Don't sell him slippers. Sell him this floor.",
                   "He buys.",
                   "He won't buy that. Again."),
             ]),
        node("m19", 275, 112, "m19", room="hr", move=32, record=33, choices={33: [['gr', 2.16], ['dn', 2.3], ['ck', 4.18], ['dm', 4.64], ['ql', 4.69], ['dl', 4.87], ['hp', 8.34]]},
             dilemma=D(
            "ms_jang", "Which move did Cho Hunhyun play?",
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
        "voice": "ko",   # Korean voice-over, English screen (the user, via Integration alt2); lines in KO21
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


# Korean voice-over (the user: Korean voice, English screen; Integration alt2). Every spoken line: N/S lines, scroll
# paragraphs, the dilemmas' open/win/slip, and Places' map lines for w21. Close to the webtoon's own words for its key lines.
KO21 = {
    'The Korea Baduk Association. Rows of boards, and children who have given their whole lives to them.': '한국기원. 줄지어 놓인 바둑판들, 그리고 거기에 인생을 다 건 아이들.',
    'Jang Geu-rae came here at eleven. His father lost his company and put everything he had left into his son. His mother cut the rankings and prize money of the great players out of the newspaper.': '장그래는 열한 살에 이곳에 들어왔다. 아버지는 회사를 잃고 남은 모든 것을 아들에게 걸었다. 어머니는 신문에서 일류 기사들의 순위와 상금을 오려 모았다.',
    'He is eighteen. This is the last chance to turn professional. After this, he is too old.': '그는 열여덟. 프로가 될 마지막 기회다. 이번이 지나면, 나이 제한에 걸린다.',
    'Last round. Begin.': '마지막 대국입니다. 시작하세요.',
    "Half a point. The others in his year pass. He doesn't.": '반집. 동기들은 입단한다. 그는 못 한다.',
    "It wasn't talent, he tells himself. It wasn't losing by half a point, again and again. It wasn't playing between part-time jobs, or that there was never pocket money. It wasn't that his father died and his mother took to her bed.": '재능이 없어서가 아니라고, 그는 스스로에게 말한다. 번번이 반집으로 져서도 아니다. 아르바이트를 하며 바둑을 둬서도, 용돈 한 번 받아본 적 없어서도 아니다. 아버지가 돌아가시고 어머니가 자리에 누우셔서도 아니다.',
    "Those would hurt too much. So he'll tell himself this: it's not that I didn't try. But I'll say it's because I didn't try hard enough.": '그건 너무 아프니까. 그래서 이렇게 생각하기로 한다. 열심히 안 한 것은 아니지만, 열심히 안 해서인 걸로 생각하겠다.',
    "The sky and the leaves are the same colour they were. Only the world in his eyes has gone grey. He doesn't throw his stones away all at once. A few at a time.": '하늘도 나뭇잎도 그 색 그대로다. 내 눈 속의 세상만 회색이 되었다. 그는 바둑돌을 한꺼번에 버리지 않는다. 몇 개씩, 조금씩.',
    "There's a job at my company. Come in on Monday.": '우리 회사에 자리가 하나 있다. 월요일부터 나와라.',
    'At first his colleagues ask about baduk. Later it becomes the joke: slow at everything, the way baduk people are. He packs his desk without a word, and goes into the army almost as if he were running.': '처음엔 동료들이 바둑 얘기를 묻는다. 나중엔 그게 농담이 된다. 바둑 하던 사람이라 일처리가 답답하다고. 그는 말없이 책상을 정리하고, 도망치듯 군대에 간다.',
    'Eight months after his discharge, the same sponsor calls an old friend: the president of One International, a general trading company.': '제대하고 여덟 달 뒤, 그 후원자가 오랜 친구에게 전화를 건다. 종합상사 원 인터내셔널의 사장이다.',
    "The night before, Jang looked at the lights of the city from the hill in Susaek-dong. If there's a light I must keep burning, I'll answer for it. If a light is allowed me. Is there one, for me?": '그 전날 밤, 장그래는 수색동 언덕에서 도시의 불빛을 내려다봤다. 제가 밝혀야 할 불빛이 있다면 책임질 겁니다. 내게 허락된 불빛이 있다면요. 그런 게 있을까, 내게.',
    "Jang Geu-rae? You're not on my list. Oh, here: your name came down separately. From upstairs.": '장그래 씨? 명단에 없는데요. 아, 여기 있네. 따로 내려왔네요. 위에서.',
    'Everyone else got in with a degree and a test. He got in with a phone call. Everyone can see it.': '다들 학위와 시험으로 들어왔다. 그는 전화 한 통으로 들어왔다. 모두가 그걸 안다.',
    'Sales Team 3. Section head Oh Sang-sik.': '영업 3팀. 오상식 과장님.',
    "Sales Team 3's section head is on the phone to a buyer who wants an answer by eleven tonight. His eyes are red. He hasn't slept, by the look of them.": '영업 3팀 과장은 오늘 밤 열한 시까지 답을 달라는 바이어와 통화 중이다. 눈이 빨갛다. 잠을 못 잔 얼굴이다.',
    "Eleven. Yes. You'll have it. ...The intern? Kim, he's yours. We're in no position to be picky.": '열한 시. 네. 드리겠습니다. ...인턴? 김 대리, 네가 맡아. 지금 가릴 처지가 아니야.',
    "Kim Dong-sik, assistant manager. You'll sit by me.": '김동식 대리야. 내 옆자리 써.',
    "I won't fail again. Not the way I failed at baduk.": '다시는 바둑처럼 실패하지 않겠습니다.',
    "He says it to himself. Nobody's listening.": '혼잣말이다. 듣는 사람은 없다.',
    "FOB or CIF? Who's paying the freight? Kim, ask the buyer. Intern, find me the L/C. Now.": 'FOB야 CIF야? 운임은 누가 내? 김 대리, 바이어한테 물어봐. 인턴, L/C 찾아와. 지금.',
    "FOB. L/C. B/L. Every sentence in the room has a word in it Jang has never heard. Oh's red eyes don't wait for him to look them up.": 'FOB. L/C. B/L. 이 방의 모든 문장마다 장그래가 처음 듣는 단어가 들어 있다. 오 과장의 빨간 눈은 그가 찾아볼 때까지 기다려 주지 않는다.',
    'He shuts his eyes, and the only thing he knows how to read comes up on its own: a board, white stones in a triangle, one point inside.': '눈을 감으면, 그가 읽을 줄 아는 단 하나가 저절로 떠오른다. 바둑판, 삼각형으로 놓인 백돌, 그 안의 한 점.',
    'Play inside. Let them take it. Take back more. White dies whatever it does.': '안에 둔다. 따내게 둔다. 더 많이 되따낸다. 백은 뭘 해도 죽는다.',
    "Free On Board. The seller's done once the goods are on the ship. Write it down. Here, you'll need these.": '본선인도조건. 물건이 배에 실리면 파는 쪽 책임은 끝이야. 적어 둬. 자, 이것도 필요할 거야.',
    'Copies for Kim, the file for Oh, coffee for the deputy. All at once. Go.': '김 대리님 복사, 오 과장님 파일, 차장님 커피. 한꺼번에. 가자.',
    "He made a mind map of the team's work. It took him two nights.": '그는 팀의 업무를 마인드맵으로 그렸다. 이틀 밤이 걸렸다.',
    "This is something you did alone. Work here is something you do together. There's a manual for a reason.": '이건 너 혼자 한 일이야. 여기 일은 같이 하는 일이고. 매뉴얼이 괜히 있는 게 아니야.',
    'Everyone on the floor has wanted something from him this morning, all at once, and none of it the same.': '오늘 아침 이 층의 모든 사람이 그에게 뭔가를 원했다. 한꺼번에, 그리고 전부 다르게.',
    "In the corridor a woman intern in a pink coat goes by with a stack of files and a face that has done this for ten years. Ahn Young-yi, from the same intake. She doesn't look at him.": '복도에서 분홍 코트를 입은 여자 인턴이 서류 더미를 들고 지나간다. 십 년은 일한 사람 같은 얼굴이다. 같은 기수의 안영이. 그녀는 그를 쳐다보지 않는다.',
    "Twenty-five white stones, and one black. Wherever he puts himself, he's already surrounded.": '백돌 스물다섯, 흑돌 하나. 어디에 두든, 이미 포위되어 있다.',
    'Then the rumour gets round that the parachute was picked from the very top. Interns who never spoke to him start to.': '그러다 그 낙하산이 맨 꼭대기에서 꽂혔다는 소문이 돈다. 말 한 번 안 걸던 인턴들이 말을 걸기 시작한다.',
    "Careful with the ones who praise you, who make your work sound bigger than it is, who do you favours. They'll collect.": '칭찬하는 사람, 네 일을 부풀려 주는 사람, 호의를 베푸는 사람 조심해. 다 돌려받으려고 하는 거야.',
    "I'm telling you because nobody told me.": '아무도 나한테 말해 주지 않았으니까 해 주는 거야.',
    'On the train home, everyone is reading something, answering something, going somewhere.': '퇴근길 지하철, 모두가 뭔가를 읽고, 뭔가에 답하고, 어딘가로 가고 있다.',
    'Am I the only one still dreaming? The world is faster than me.': '나만 아직 꿈속인가. 세상은 나보다 빠르다.',
    "The internship ends with a test: a presentation, in pairs. The pairs are drawn. The others look at Jang's partner and wince.": '인턴 기간은 시험으로 끝난다. 2인 1조 프레젠테이션. 조가 정해진다. 다들 장그래의 짝을 보고 얼굴을 찡그린다.',
    'Han Seok-yul: the intern who asked for the factory floor on day one, who tells everyone he has eaten with the president.': '한석율. 첫날부터 현장을 지원한 인턴, 사장님과 밥도 먹었다고 떠들고 다니는 인턴.',
    'Field first. You do the paper. ...No. Again!': '현장이 먼저입니다. 서류는 그쪽이 하세요. ...아니요. 다시!',
    'The item? Find it yourself.': '아이템이요? 본인이 찾으세요.',
    'The other interns have a name for the pair: the nuclear bomb. A dud holding a dud.': '다른 인턴들은 그 조를 뉴클리어 밤이라고 부른다. 폭탄이 폭탄을 안았다고.',
    "Jang. You're all over the place. Pick one thing and do it.": '장그래. 너 중구난방이야. 하나만 골라서 해.',
    'On the frame strip, Black links up with a stone it played earlier, looking for a way to live by attacking.': '흑은 앞서 둔 돌과 길을 이으며, 공격으로 살길을 찾는다.',
    'Cho linked his stones, and kept attacking.': '조훈현은 돌을 이었고, 공격을 이어갔다.',
    'And. How old are you?': '그리고... 너 몇 살이냐?',
    '...': '...',
    'Not going to say?': '말 안 할래?',
    'That night, alone, he thinks of the players he used to cut out of the paper with his mother. My heroes are disappearing.': '그날 밤 혼자, 그는 어머니와 함께 신문에서 오려 내던 기사들을 떠올린다. 나의 영웅들이 사라져 간다.',
    "Kim Seok-ho, an intern on Go's team: married young, the eldest grandson, a baby at home, the best translator in the intake. Nobody on his team teaches him anything; he borrows what he needs.": '김석호. 고 과장 팀의 인턴. 장손이라 일찍 결혼했고, 집에 아기가 있고, 동기 중 번역을 제일 잘한다. 그의 팀에선 아무도 그에게 뭘 가르쳐 주지 않는다. 필요한 건 빌려 쓴다.',
    'Can I borrow your glue stick? Thanks.': '딱풀 좀 빌려도 돼요? 고마워요.',
    "A page of Sales 3's comes away stuck to the back of his: a waybill, with the team's approval stamps on it. Jang was meant to shred it.": '영업 3팀의 서류 한 장이 그의 서류 뒤에 붙어 딸려 간다. 팀의 결재 도장이 찍힌 운송장. 장그래가 파쇄해야 했던 것이다.',
    'Someone throw this away for me?': '이것 좀 버려 줄래요?',
    "He drops it on a desk and runs. An hour later it's on the floor of the lobby, by the gates, where any visitor could read it.": '그는 그걸 책상 위에 던져 놓고 뛰어간다. 한 시간 뒤 그것은 로비 바닥, 출입 게이트 옆에 떨어져 있다. 방문객 누구라도 읽을 수 있는 곳에.',
    "Whose is this? A customer's shipment, on my lobby floor. Hey. Do better.": '이거 누구 거야? 고객 화물이, 내 로비 바닥에. 야. 잘하자.',
    'All the interns are made to stand in the corridor for an hour. Everyone knows whose desk the waybill came from.': '인턴 전원이 복도에서 한 시간 동안 서 있는다. 그 운송장이 누구 책상에서 나왔는지 다들 안다.',
    "Let's clean it up.": '치우자.',
    "That's all he says. He takes the lift down to the lobby.": '그게 전부다. 그는 엘리베이터를 타고 로비로 내려간다.',
    "If it fell here, there's more of it. The bins by the gates.": '여기 떨어졌으면, 나머지도 있겠지. 게이트 옆 분리수거함.',
    "Torn from the waybill's back: a strip with glue on it, and a name in an intern's careful hand. Kim Seok-ho.": '운송장 뒤에서 뜯겨 나온 조각. 풀이 묻어 있고, 인턴의 꼼꼼한 글씨로 이름이 적혀 있다. 김석호.',
    'Not the parachute, then.': '낙하산이 아니었구만.',
    "At the team dinner Oh tells Go, Kim Seok-ho's section head, who is too drunk to hear it. Somebody else hears it, and Kim Seok-ho comes to say sorry.": '회식 자리에서 오 과장이 김석호의 과장인 고 과장에게 말하지만, 고 과장은 너무 취해 듣지 못한다. 다른 누군가가 그 말을 듣고, 김석호가 사과하러 온다.',
    "That night Kim Seok-ho comes home late to one room. His wife and the baby are asleep on the floor. The baby's hand closes round his finger.": '그날 밤 김석호는 늦게 단칸방으로 돌아온다. 아내와 아기가 바닥에서 자고 있다. 아기의 손이 그의 손가락을 꼭 쥔다.',
    'Kim. Get the kid a new glue stick.': '김 대리. 쟤 딱풀 새로 하나 사 줘.',
    "Go, a section head on the floor below, took the textile team's American buyers to lunch with a challenging spirit. Dog meat.": '아래층 고 과장이 섬유팀의 미국 바이어들을 도전 정신으로 점심에 데려갔다. 개고기였다.',
    "Steve Han, the textile team's head, raised in America, has held every one of Go's approvals since.": '미국에서 자란 섬유팀장 스티브 한은 그 뒤로 고 과장의 결재를 전부 붙잡고 있다.',
    "You fed them dog, and now they're sulking, and you won't say sorry. What you people do isn't business. It's playing at business. One page. What matters. Not this paper going back and forth.": '개고기를 먹여서 바이어가 삐졌는데, 사과도 안 하겠다? 당신들이 하는 건 사업이 아니에요. 사업 놀이지. 한 장. 핵심만. 서류가 왔다 갔다 하는 거 말고.',
    "I'm not apologising to him.": '저 사람한테 사과 안 합니다.',
    'Kim Bu-ryeon, division head, could pull rank. It would get worse.': '김부련 부장은 직급으로 누를 수도 있었다. 그러면 더 나빠질 뿐이다.',
    'We were wrong, Steve. Both of us. Go, bow.': '우리가 잘못했어, 스티브. 둘 다. 고 과장, 숙여.',
    "By evening they're all in a sauna on Jongno, up to their chins in hot water, We Are the World.": '저녁이 되자 그들은 모두 종로의 사우나에서 턱까지 뜨거운 물에 잠겨 있다. 위 아 더 월드.',
    "Don't touch me.": '돈 터치 미.',
    'Sometimes the obvious move is the hard one.': '가끔은 뻔한 수가 제일 어렵다.',
    "Assistant manager Park Jong-gi, IT sales, carries a resignation letter in his jacket. He ate lunch standing up in the street, and brought it back up in an alley. Home is hard too: more happiness than he can carry, and he can't face it.": 'IT 영업팀 박종기 대리는 재킷 안에 사직서를 넣고 다닌다. 길에서 서서 점심을 먹고, 골목에서 다 토했다. 집도 힘들다. 감당할 수 없을 만큼 행복해서, 마주할 수가 없다.',
    'On the roof Jang tells him he admires his patience. Park hears something else.': '옥상에서 장그래가 그의 인내심을 존경한다고 말한다. 박 대리는 다른 말로 듣는다.',
    "Sales is a hunt, you know. Hunters and farmers. Me, I'm a hunter. Come with me tomorrow. I'll show you.": '영업은 사냥이야. 사냥꾼이랑 농부가 있지. 난 사냥꾼이고. 내일 따라와. 보여 줄게.',
    'No choice satisfies everyone. You answer for the one you make.': '모두를 만족시키는 선택은 없다. 그 선택에 책임을 져라.',
    "Through the client's door: his own staff, laughing. Put One International's order at the back. Park won't say a word. He never does.": '거래처 문 너머로 그 회사 직원들이 웃고 있다. 원 인터내셔널 주문은 뒤로 미뤄. 박 대리는 한마디도 안 할 거라고. 그는 늘 그렇다.',
    'Jang is looking at him. Waiting to see the hunter.': '장그래가 그를 보고 있다. 사냥꾼을 보려고 기다리면서.',
    'Shall we proceed by the procedure, then? By the contract. Claims and all.': '그럼 절차대로 진행해도 되겠습니까? 계약대로요. 클레임까지 포함해서.',
    "The client's president turns on one of his own men and shouts at him in front of the customer, so loud the office goes quiet. It's staged. Feint east, strike west: Park will feel sorry for him, and back down.": '거래처 사장이 고객 앞에서 자기 직원에게 돌아서서 사무실이 조용해질 만큼 소리를 지른다. 짜고 치는 거다. 성동격서. 박 대리가 안쓰러워서 물러나게 하려는.',
    'On the frame strip, White has shown a weakness on purpose. The natural answer is the hard one.': '백은 일부러 약점을 보여 줬다. 당연한 응수가 가장 어렵다.',
    'Cho went straight into the weakness he was shown.': '조훈현은 보여 준 약점으로 곧장 들어갔다.',
    "Then you'll put that in writing, sir? What you just told your man. That it was his error, and you'll make it good.": '그럼 방금 직원분께 하신 말씀, 문서로 남겨 주시겠습니까? 그 직원 실수였고, 책임지고 처리하시겠다고요.',
    "...I'll come and see your people myself.": '...제가 직접 찾아뵙겠습니다.',
    "A client's president, at One International in person. It doesn't happen. The executives are all in the room.": '거래처 사장이 원 인터내셔널에 직접 온다. 있을 수 없는 일이다. 임원들이 전부 회의실에 앉아 있다.',
    'Jang can see it now: Park is no hunter. He writes three words on a sheet made to look like a document, and slides it across. Be irresponsible, sir.': '장그래는 이제 안다. 박 대리는 사냥꾼이 아니다. 그는 서류처럼 보이는 종이에 한마디를 적어 건넨다. 무책임해지세요.',
    'The one who deceived you was me. Not them. Discipline me.': '기망을 한 건... 저입니다. 저 사람들이 아니라. 저를 징계해 주십시오.',
    "Around the table, one by one, the executives' faces turn into his.": '테이블을 둘러싼 임원들의 얼굴이 하나씩 그의 얼굴로 바뀐다.',
    "Nobody punishes him. You don't drop a partner of many years over this. On the roof afterwards Jang can't look at him.": '아무도 그를 징계하지 않는다. 몇 년 된 거래처를 이런 일로 끊지는 않는다. 나중에 옥상에서 장그래는 그를 쳐다보지 못한다.',
    "I'm sorry. Me, who failed at baduk, telling you how to play.": '죄송합니다. 바둑에서도 실패한 제가, 감히 어떻게 두라고.',
    'Thank you.': '감사합니다.',
    'Everyone has their own baduk.': '모두에겐 자신만의 바둑이 있다.',
    "Deputy general manager Sun Ji-young never asks a junior for anything personal. Tonight her husband can't make the pickup either.": '선지영 차장은 후배에게 사적인 부탁을 절대 하지 않는다. 오늘 밤은 남편도 아이를 데리러 갈 수 없다.',
    "The daycare closes at seven. I can't get there. I'm sorry. I'm asking. Somi. She's five.": '어린이집이 일곱 시에 닫아요. 제가 갈 수가 없어요. 미안해요. 부탁할게요. 소미. 다섯 살이에요.',
    "We'll go. Jang Geu-rae, you're coming.": '저희가 갈게요. 장그래 씨, 같이 가요.',
    "Every time the bell rings, the children still here run to the door at once. Mum's here. Then it isn't theirs, and they walk back.": '벨이 울릴 때마다, 남아 있는 아이들이 한꺼번에 문으로 달려간다. 엄마 왔다. 그리고 자기 엄마가 아니면, 터덜터덜 돌아온다.',
    "Somi? Your mum sent us. She's sorry.": '소미야? 엄마가 우리 보냈어. 늦어서 미안하대.',
    "She's always last. Are you her mum's colleague? ...Do you drink?": '소미는 맨날 마지막이에요. 소미 엄마 회사 분이세요? ...술 좋아하세요?',
    "Somi takes Ahn's hand, and then Jang's. They walk her home between them.": '소미가 안영이의 손을 잡고, 그다음 장그래의 손을 잡는다. 둘은 아이를 가운데 두고 집까지 걸어간다.',
    'Jang and Ahn have gone. Somi is asleep on the floor with her crayons.': '장그래와 안영이는 갔다. 소미는 크레파스를 쥔 채 바닥에서 잠들어 있다.',
    "A drawing: Mummy. A woman walking away, a phone at her ear. Somi has drawn her from behind, because that's how she sees her. Every morning Somi bows at the door and says have a good day, and her mother is already gone.": '그림 한 장. 엄마. 전화기를 귀에 대고 걸어가는 여자. 소미는 엄마를 뒷모습으로 그렸다. 소미에게 엄마는 그렇게 보이니까. 매일 아침 소미는 문 앞에서 인사를 한다. 안녕히 다녀오때여. 엄마는 이미 가고 없다.',
    "I won't put you off for the sake of a living. Not any more.": '생활 때문에 널 미루지 않을게. 이제는.',
    "At eight the next morning a client calls. At nine she's at her desk.": '다음 날 아침 여덟 시, 거래처 전화가 온다. 아홉 시, 그녀는 자리에 앉아 있다.',
    "It turns out Han is a year older than Jang. He's been polite to him the whole time. Jang is not.": '알고 보니 한석율이 장그래보다 한 살 많다. 그는 내내 장그래에게 존댓말을 썼다. 장그래는 아니었다.',
    'Han is in before anyone, out at the port and the airport before nine. An engineer, and a salesman.': '한석율은 누구보다 먼저 출근해, 아홉 시 전에 항구와 공항을 다녀온다. 공대 출신에, 장사꾼이다.',
    "The panel knows more than we do. Don't bring them answers. Bring them good questions.": '심사위원들이 우리보다 더 많이 알아요. 답을 들고 가지 마세요. 좋은 질문을 들고 가요.',
    "One more task, the day after the PT. Each of you sells something to the person you'd least like to sell to. Your partner. Your partner decides whether to buy.": '과제가 하나 더 있어. PT 다음 날. 세상에서 제일 팔기 싫은 사람한테 뭔가를 팔아. 너희 짝한테. 살지 말지는 짝이 정한다.',
    "Han won't take orders from anyone who has never stood on a factory floor. Jang has never stood on one.": '한석율은 현장에 서 본 적 없는 사람의 지시는 받지 않는다. 장그래는 현장에 서 본 적이 없다.',
    "It's through other people that you find out what you are.": '남을 통해 내가 드러난다.',
    'PT day. One team stretched the company logo and is finished before it starts. Another comes in costume. Next, says the panel.': 'PT 날. 한 팀은 회사 로고를 늘려 쓰는 바람에 시작하기도 전에 끝났다. 다른 한 팀은 분장을 하고 들어온다. 다음 사람, 하고 심사위원이 말한다.',
    "Han has watched every team with a grin. Now his phone won't stop: his mother, his contacts on the floor. He takes a herbal calmative and then another.": '한석율은 다른 팀들을 히죽거리며 지켜봤다. 이제 그의 전화가 멈추지 않는다. 어머니, 현장 사람들. 청심환을 하나 먹고, 또 하나 먹는다.',
    "On the frame strip, Cho has eight points of komi against him and can't afford to play safe.": '조훈현에게는 덤 여덟 집의 부담이 있다. 안전하게 둘 여유가 없다.',
    "Cho broke White's side at the cost of his own shape. From here on, every move is one intent against another.": '조훈현은 자기 모양을 버리고 백의 변을 깨뜨렸다. 여기서부터는 한 수 한 수가 의도와 의도의 충돌이다.',
    "Han stands, opens his mouth, takes a sip of water, and chokes. He can't go on.": '한석율이 일어나 입을 열고, 물을 한 모금 마시다가 사레가 들린다. 계속하지 못한다.',
    "The, the market for... One International's share of...": '그, 그러니까 시장이... 원 인터내셔널의 점유율이...',
    'He made every slide. He has never presented anything in his life.': '슬라이드는 전부 그가 만들었다. 하지만 발표는 평생 한 번도 해 본 적이 없다.',
    "A small boy and his father's hands. Dad, your nails are black. It's grease, it won't wash off. Why, are you ashamed?": '어린 남자아이와 아버지의 손. 아빠, 손톱 까매. 기름때가 찌들어서 안 지워져. 왜, 창피해?',
    "Father, I'm not ashamed of you. Or of the floor. Everything this company sells was made by somebody's hands.": '아버지. 전 당신이, 현장이 부끄럽지 않아요. 이 회사가 파는 모든 건 누군가의 손으로 만든 겁니다.',
    'So someone else is keeping an eye on Jang Geu-rae.': '장그래를 주목하는 사람이 또 있구만.',
    "Han's team is marked down: a sum on one slide is wrong. The calculator does the sums. How do you get them wrong?": '한석율 팀은 감점이다. 슬라이드 한 장의 계산이 틀렸다. 계산은 계산기가 해 주는데, 계산을 왜 틀려.',
    "Ahn Young-yi's turn, with her partner, Lee Sang-hyun. Speech isn't writing: you have to hold the air of the room, or it goes thin.": '안영이 차례, 짝은 이상현. 말은 글과 다르다. 그 장소의 공기를 장악해야 앙상해지지 않는다.',
    "It's flawless. Lee Sang-hyun barely says a word, because there's no room left for one.": '완벽하다. 이상현은 거의 한마디도 하지 않는다. 할 틈이 남아 있지 않으니까.',
    "You're not the president's daughter, are you? Or one of ours, undercover?": '자네, 사장 딸이나 암행직원 아니지?',
    "No, sir. I've been through this a few times.": '아닙니다. 몇 번 경험한 적이 있어서요.',
    "Not yet. I need the one thing I'm selling, and section head Oh is wearing it. Sales 3.": '아직이야. 팔 물건이 있어야 하는데, 그걸 오 과장님이 신고 계셔. 영업 3팀.',
    'The individual task. On the panel, section head Oh sits in his socks.': '개별 과제. 심사석의 오 과장은 양말 바람이다.',
    "My field notebooks. Every site I've been to. And this.": '제 현장 노트입니다. 제가 가 본 모든 현장. 그리고 이것.',
    'He unrolls a bolt of fabric across the table with a flourish.': '그는 원단 한 필을 탁자 위에 멋지게 펼친다.',
    "I'll buy the notebooks. Not the cloth. I'm buying your time on the floor. And I'd like to sell cloth with you one day.": '노트는 사겠습니다. 원단은 아니고요. 제가 사는 건 당신의 현장 경험입니다. 그리고 언젠가 당신과 함께 섬유를 팔고 싶습니다.',
    'Ahn, watching, looks surprised; then she smiles. So does Oh.': '지켜보던 안영이가 놀란 얼굴을 하더니, 이내 웃는다. 오 과장도 웃는다.',
    "On the frame strip, Black can put White's whole side in atari.": '흑은 백의 변 전체에 단수를 칠 수 있다.',
    'Cho broke the lower side completely. Every move says: answer like this, or else.': '조훈현은 하변을 완전히 깨뜨렸다. 모든 수가 말한다. 이렇게 받아라, 아니면.',
    "Office slippers. The office worker's combat boots. You have yours on the floor. This floor is a floor too.": '실내화입니다. 사무실의 전투화죠. 당신 전투화는 현장에 있죠. 이 사무실도 현장입니다.',
    "I won't buy them.": '사지 않겠습니다.',
    "You've been fighting on it for two months.": '당신도 두 달 동안 이 현장에서 싸웠잖아요.',
    'There are no meaningless stones on a board.': '바둑판 위에 의미 없는 돌이란 없어요.',
    "...And nothing a company makes is made for no reason. I've been narrow.": '...회사에서 생산하는 제품 중에 이유 없이 존재하는 제품도 없죠. 제가 편협했습니다.',
    'The next morning there are new slippers under every desk on the floor. Han bought them.': '다음 날 아침, 층의 모든 책상 밑에 새 실내화가 놓여 있다. 한석율이 산 것이다.',
    'Jang Baek-gi sold his partner a small hand mirror, in a box far too big for it: manage your face before you manage business. His partner bought it, red to the ears.': '장백기는 짝에게 작은 손거울을 팔았다. 터무니없이 큰 상자에 넣어서. 사업 관리 전에 표정 관리부터 하라고. 짝은 귀까지 빨개져서 그걸 샀다.',
    'On the frame strip, Black can take its territory now.': '흑은 이제 실리를 챙길 수 있다.',
    'Cho settled his side. Territory against thickness.': '조훈현은 변을 굳혔다. 실리 대 세력.',
    'The list. Ahn Young-yi, first overall. Jang Baek-gi, hired, to the steel team. Han Seok-yul, hired. Kim Seok-ho, hired, to head office.': '명단. 안영이, 전체 수석. 장백기, 합격, 철강팀. 한석율, 합격. 김석호, 합격, 본사.',
    'Jang Geu-rae, hired. On a two-year contract.': '장그래, 합격. 2년 계약직.',
    'A contract worker, with a real ID card round his neck.': '계약직이지만, 정식 사원증을 목에 건다.',
    "The first morning. Oh doesn't take his new people to their desks. He takes them to Daehanmun, the old palace gate, where a tent stands with portraits in it: laid-off car workers who died after they lost their jobs.": '첫날 아침. 오 과장은 신입들을 자리로 데려가지 않는다. 덕수궁 대한문으로 데려간다. 그곳 천막 안에는 영정 사진들이 있다. 일자리를 잃은 뒤 세상을 떠난 자동차 노동자들.',
    "He bows. They bow. He doesn't explain. Ahn looks as if she already knows what this is.": '그가 고개를 숙인다. 그들도 고개를 숙인다. 그는 설명하지 않는다. 안영이는 이게 뭔지 이미 아는 얼굴이다.',
    'Right. Work.': '자. 일하자.',
    "Twenty-five stones became twenty-four. On the board in Jang's head there's a little room now, and a long game left.": '스물다섯 개의 돌이 스물네 개가 되었다. 장그래의 머릿속 바둑판에 이제 작은 자리가 생겼고, 갈 길은 아직 멀다.',
    'Every chapter of this story opens on one move of a real game: the 1st Ing Cup final, game 5, 1989. Nie Weiping has White. Cho Hunhyun has Black. It will last 145 moves.': '이 이야기의 모든 장은 실제 바둑 한 판의 한 수로 시작한다. 1989년 제1회 응씨배 결승 5국. 백은 녜웨이핑, 흑은 조훈현. 이 대국은 145수까지 간다.',
    'You are Jang Geu-rae. You have given your childhood to baduk. In a few minutes you will find out whether it gives anything back.': '당신은 장그래다. 어린 시절을 바둑에 바쳤다. 몇 분 뒤, 바둑이 무언가를 돌려주는지 알게 된다.',
    'Thirty-three moves played. Jang has a desk, a team head who takes his people to memorials, and a contract that ends in two years.': '33수까지 두었다. 장그래에게는 책상 하나, 신입을 분향소로 데려가는 팀장, 그리고 2년 뒤 끝나는 계약이 있다.',
    'Next: four new hires, four teams, and the first time Sales 3 sees what Jang was before he came.': '다음: 신입 넷, 네 개의 팀, 그리고 영업 3팀이 처음으로 장그래의 과거를 알게 된다.',
    "Seven years at these boards. Win this, and I'm a professional.": '7년을 이 판 앞에 앉아 있었다. 이번 판을 이기면, 프로다.',
    'Half a point short.': '반집 모자라.',
    'Read it again.': '다시 읽어.',
    "I don't know what FOB is. I know what this is.": 'FOB가 뭔지는 몰라. 이건 알아.',
    'Snapback.': '환격.',
    'Twenty-five of them, and me. Find two eyes.': '저쪽은 스물다섯, 나는 하나. 두 눈을 만들어.',
    'Alive. Barely.': '살았다. 겨우.',
    'Dead. Again.': '죽었다. 다시.',
    'Link up, and keep attacking.': '길을 잇고, 계속 공격해.',
    'Black 11.': '흑 11.',
    'Not there. Look again.': '거기가 아니야. 다시 봐.',
    "He's been giving orders for three days. Enough.": '사흘 내내 지시만 했어. 이제 그만.',
    'He stops talking.': '말이 멈춘다.',
    'Again.': '다시.',
    'I could pull rank. It would only get worse. The obvious move.': '직급으로 누를 수도 있지. 더 나빠질 뿐이야. 뻔한 수.',
    'Steve takes it.': '스티브가 받아들인다.',
    'Not like that. Again.': '그렇게 말고. 다시.',
    "He's shown me a weakness on purpose. Go straight in.": '일부러 약점을 보여 줬어. 곧장 들어가.',
    'Black 19.': '흑 19.',
    "It's staged. Hold him to what he said.": '짜고 치는 거야. 한 말에 책임을 지게 해.',
    "He'll come in person.": '직접 오겠대.',
    "He's slipping away. Again.": '빠져나가고 있어. 다시.',
    "The kid says be irresponsible. I've been irresponsible for years.": '무책임해지라고? 난 몇 년째 무책임했는데.',
    'I said it.': '말했다.',
    'He has the questions. I have the paper.': '저쪽엔 질문이 있고, 나한텐 서류가 있어.',
    'It holds together.': '맞물린다.',
    "Eight points of komi. He can't play safe.": '덤 여덟 집. 안전하게 둘 수 없어.',
    'Black 29.': '흑 29.',
    "He's choking. I made every slide. Say something.": '숨이 막혀 하잖아. 슬라이드는 내가 다 만들었어. 뭐라도 말해.',
    'Enough to get him back.': '그가 돌아올 만큼은.',
    'Breathe. Again.': '숨 쉬어. 다시.',
    "My father's hands. Say it.": '아버지의 손. 말해.',
    'The room is listening.': '모두가 듣고 있다.',
    'Hold the room. Leave nothing thin.': '공기를 장악해. 앙상한 데가 없게.',
    'Flawless.': '완벽.',
    'Again. Cleaner.': '다시. 더 깔끔하게.',
    "Notebooks and a bolt of cloth. What's he really selling?": '노트랑 원단 한 필. 진짜로 파는 게 뭐지?',
    'The notebooks.': '노트.',
    'Look again.': '다시 봐.',
    'Atari. Break the whole side.': '단수. 변 전체를 깨뜨려.',
    'Black 31.': '흑 31.',
    "He'll say no whatever I do. Don't sell him slippers. Sell him this floor.": '뭘 해도 안 산다고 할 거야. 실내화를 팔지 마. 이 현장을 팔아.',
    'He buys.': '산다.',
    "He won't buy that. Again.": '그건 안 사. 다시.',
    'Take the territory. Settle.': '실리를 챙겨. 굳혀.',
    'Black 33.': '흑 33.',
    # Places' map lines (claude/places-misaeng, w21)
    'A man in a black suit with a white ribbon on his lapel. He bows to the tent, and walks on.': '검은 양복에 흰 리본을 단 남자. 천막을 향해 고개를 숙이고, 지나간다.',
    'A woman sets white chrysanthemums along the table, one by one.': '한 여자가 흰 국화를 하나씩 탁자 위에 놓는다.',
    "A commuter hurrying past with a coffee. “Every morning there's a tent here for someone.”": '커피를 든 채 바삐 지나가는 출근길 직장인. "아침마다 여기 누군가를 위한 천막이 있어요."',
    'A commuter checks his watch, slows at the tent, and goes on.': '한 직장인이 시계를 보다가, 천막 앞에서 걸음을 늦추고, 다시 간다.',
    'A tourist with a camera and a travel go set stops you by the gate. “Excuse me! Is this the palace? …You play? One game, while the guards change?”': '카메라와 여행용 바둑판을 든 관광객이 대문 앞에서 당신을 세운다. "실례합니다! 여기가 궁인가요? …바둑 두세요? 수문장 교대하는 동안 한 판만?"',
    '“Wonderful. Thank you! Good luck in your new job.”': '"멋지네요. 고마워요! 새 직장에서 행운을 빌어요."',
    'The tourist is photographing the gate.': '관광객이 대문 사진을 찍고 있다.',
    "A clerk at the client's, smirking at his screen. He doesn't get up.": '거래처 직원이 모니터를 보며 히죽거린다. 일어나지도 않는다.',
    "A woman at the client's answers the phone. “He's in a meeting. He's always in a meeting.”": '거래처 여직원이 전화를 받는다. "회의 중이세요. 늘 회의 중이세요."',
    "The owner, behind the till, doesn't look up from his paper.": '주인은 계산대 뒤에서 신문에서 눈도 떼지 않는다.',
    'The woman at the cart. “Soju? Eomuk? Sit, sit.”': '포장마차 아주머니. "소주? 어묵? 앉아요, 앉아."',
    "An old man by the pagoda. “Sixty years I've come here. The stones don't change. We do.”": '탑 옆의 노인. "육십 년을 여기 왔지. 돌은 안 변해. 사람이 변하지."',
    'A man in a suit, on his phone, walking fast. “No, the shipment, the shipment—”': '정장 차림의 남자가 통화하며 빠르게 걷는다. "아니, 선적, 선적 말이야—"',
    "An office worker with a coffee in each hand. “Lunch is an hour. It's never an hour.”": '커피를 양손에 든 직장인. "점심시간은 한 시간이래. 한 시간인 적이 없어."',
    'A stallholder. “Dried squid, dried filefish. Cheaper than the shops, and better.”': '노점 상인. "마른오징어, 쥐포. 가게보다 싸고, 더 맛있어."',
    "An old woman setting out plastic stools. “Come back after dark, young man. That's when we're open.”": '플라스틱 의자를 펴는 할머니. "해 지면 와요, 총각. 그때 문 열어."',
    "An old man at the stone table waves you over without looking up. “You. You've got a player's hands. Sit.”": '돌 탁자의 노인이 쳐다보지도 않고 손짓한다. "자네. 바둑 두는 손이구먼. 앉아."',
    '“Hm. Where did you learn that? Go on, go to work.”': '"흠. 어디서 배웠나? 가 봐, 출근해야지."',
    'The old man is playing someone else now.': '노인은 이제 다른 사람과 두고 있다.',
    "An old man in a flat cap sets out the stones. “A young man in a tie, at Tapgol? Sit down, it's free.”": '납작모자를 쓴 노인이 돌을 늘어놓는다. "넥타이 맨 젊은이가 탑골공원에? 앉아, 공짜야."',
    '“…Again tomorrow. Same time.”': '"…내일 또 와. 같은 시간에."',
    'The old man in the flat cap is asleep on the bench.': '납작모자 노인은 벤치에서 졸고 있다.',
    "A courier with a trolley of boxes parks it across the lane. “Fourteenth floor? Every one of them's the fourteenth floor. Sit a minute. One game while the lift comes.”": '상자 수레를 끄는 택배 기사가 골목을 가로막고 세운다. "14층? 전부 다 14층이래. 잠깐 앉아. 엘리베이터 올 동안 한 판."',
    "“Ha! I'll take the stairs, then.”": '"하! 그럼 계단으로 가지 뭐."',
    "The courier's trolley rattles off down the lane.": '택배 기사의 수레가 덜컹거리며 골목을 내려간다.',
    'A trainee, eleven or twelve, replaying a game from a book, stone by stone.': '열한두 살쯤 된 연구생이 책을 보며 기보를 한 수씩 놓아 본다.',
    'Two trainees bent over a board. Neither has spoken for an hour.': '두 연구생이 판 위로 몸을 숙이고 있다. 한 시간째 아무 말이 없다.',
    'A girl in a school uniform counts the score twice.': '교복을 입은 여자아이가 계가를 두 번 한다.',
    "A trainee packs his stones away. “Next month. There's always next month.”": '한 연구생이 돌을 챙긴다. "다음 달에. 다음 달은 늘 있으니까."',
    'A boy of ten with a go book under his arm, running late.': '바둑책을 옆구리에 낀 열 살 소년이 늦어서 뛰어간다.',
    'Someone from HR, stacking contracts. “Two-year contracts are on the left. Regulars on the right.”': '인사팀 직원이 계약서를 쌓는다. "2년 계약직은 왼쪽. 정규직은 오른쪽."',
    "An intern rehearsing by the door grabs your sleeve. “Quiz me. No, play me. Anything. I can't think about the PT any more.”": '문 옆에서 연습하던 인턴이 당신 소매를 잡는다. "저 좀 퀴즈 내 주세요. 아니, 한 판 둬 주세요. 뭐든요. PT 생각을 더는 못 하겠어요."',
    '“…Thanks. I can breathe again.”': '"…고마워요. 이제 숨이 쉬어지네."',
    'The intern is rehearsing under his breath.': '인턴이 작은 소리로 연습하고 있다.',
    "An intern with cue cards fanned like a hand of cards. “One quick game? My hands won't stop shaking.”": '큐카드를 카드 패처럼 펼쳐 든 인턴. "딱 한 판만요? 손이 계속 떨려서."',
    '“Steadier. Good. Good luck in there.”': '"좀 진정됐어요. 좋아요. 들어가서 잘해요."',
    'The intern is reading her cue cards again.': '인턴이 다시 큐카드를 읽고 있다.',
    "An intern in a hard hat and overalls — his team's costume for their PT — stands square in the aisle. “Our turn first. Unless you can get past me.”": '안전모에 작업복을 입은 인턴, 그 팀의 PT 분장이다, 이 통로 한가운데 버티고 서 있다. "우리 차례가 먼저예요. 나를 넘어갈 수 있으면 몰라도."',
    '“…Fine. Go on. Break a leg.”': '"…좋아요. 가세요. 잘해요."',
    'The intern in the hard hat is adjusting his costume.': '안전모 쓴 인턴이 분장을 고쳐 입고 있다.',
    "The copier groans out Kim Dong-sik's thirty pages, warm.": '복사기가 신음하며 김동식 대리의 서른 장을 따끈하게 뱉어 낸다.',
    "The copier. You've done Kim's copies.": '복사기. 김 대리님 복사는 끝냈다.',
    "Third drawer down, under O: section head Oh's file.": "세 번째 서랍, 'ㅇ' 칸 아래. 오 과장님 파일.",
    "The filing cabinets. You have Oh's file.": '서류 캐비닛. 오 과장님 파일은 챙겼다.',
    'One coffee from the machine, black, for the deputy.': '자판기 커피 한 잔, 블랙, 차장님 거.',
    "The pantry. You have the deputy's coffee.": '탕비실. 차장님 커피는 챙겼다.',
    'Kim Dong-sik taps the desk. “The copies, Jang. Today, if you can.”': '김동식 대리가 책상을 두드린다. "복사, 장그래. 오늘 안에 되면 좋겠는데."',
    'Kim Dong-sik takes the copies without looking up. “Thirty? I said thirty-two. …No, thirty. Fine.”': '김동식 대리가 고개도 안 들고 복사본을 받는다. "서른 장? 서른두 장이라고 했는데. …아니, 서른 장 맞네. 됐어."',
    'Kim Dong-sik is reading the copies.': '김동식 대리가 복사본을 읽고 있다.',
    "Section head Oh doesn't look up. “The file. I asked for it ten minutes ago.”": '오 과장은 고개도 안 든다. "파일. 십 분 전에 달라고 했잖아."',
    'Section head Oh holds out his hand for the file, and keeps reading the one in front of him.': '오 과장이 파일을 받으려 손을 내민다. 눈은 보던 서류에 그대로 둔 채.',
    'Oh has his file.': '오 과장은 파일을 받았다.',
    'The deputy waves an empty cup at you. “Coffee? Sometime this morning?”': '차장이 빈 컵을 흔든다. "커피? 오전 중에는 되나?"',
    'The deputy takes the coffee, sips, and winces. “Black. Right. Thanks.”': '차장이 커피를 받아 한 모금 마시고 얼굴을 찡그린다. "블랙. 맞다. 고마워."',
    'The deputy is drinking his coffee.': '차장이 커피를 마시고 있다.',
    "A woman from the next team. “Sales Team 3? They're the ones who work through lunch.”": '옆 팀 여직원. "영업 3팀? 점심도 안 먹고 일하는 팀이잖아."',
    'A deputy from Sales Team 1, reading a fax. “Another intern? We used to get six a year.”': '팩스를 읽고 있는 영업 1팀 대리. "또 인턴이야? 예전엔 일 년에 여섯 명씩 왔는데."',
    'Section head Oh is reading, in his socks.': '오 과장이 양말 바람으로 서류를 읽고 있다.',
    'My slippers? …Fine. Bring them back.” He pushes them across the floor with his foot.': '"내 실내화? …그래. 갖다 놔." 그는 발로 실내화를 바닥 너머로 밀어 준다.',
    'You have them. Go on, sell them.': '챙겼다. 가서 팔아.',
    "Someone from the textile team, a swatch in each hand. “Navy, or midnight? The buyer says they're different.”": '섬유팀 직원이 양손에 원단 샘플을 들고 있다. "네이비냐, 미드나잇이냐? 바이어는 다르대."',
    "You go through the bins by the gates, sheet by sheet. Stuck to the back of a torn page: the rest of the waybill, glue on the back, and a name on it in someone else's hand. Kim Seok-ho.": '게이트 옆 분리수거함을 한 장 한 장 뒤진다. 찢어진 종이 뒤에 붙어 있다. 운송장의 나머지, 뒤에 풀이 묻어 있고, 다른 사람의 글씨로 이름이 적혀 있다. 김석호.',
    "The recycling bins. You've found what you were looking for.": '분리수거함. 찾던 걸 찾았다.',
    '“Visitor passes are issued here. Who are you here to see?”': '"방문증은 여기서 발급합니다. 누구를 만나러 오셨어요?"',
    'A security guard by the ID gates. “Card on the reader, please. One at a time.”': '출입 게이트 옆의 경비원. "카드를 리더기에 대 주세요. 한 분씩."',
    'Someone waiting for a lift taps his card against his leg. “Come on, come on.”': '엘리베이터를 기다리는 사람이 카드로 다리를 툭툭 친다. "빨리, 빨리."',
    "The teacher. “You're here for Somi? Her mother rang. You must be from her office.”": '선생님. "소미 데리러 오셨어요? 어머님이 전화하셨어요. 회사 분이시죠?"',
    "A small boy with a toy car. “Are you somebody's dad?”": '장난감 자동차를 든 꼬마. "아저씨 누구 아빠예요?"',
    'A mother with a pushchair. “The daycare closes at seven. On the dot.”': '유모차를 미는 엄마. "어린이집은 일곱 시에 닫아요. 칼같이."',
    'His mother looks up from the ironing. “Eat something before you go.”': '어머니가 다림질하다 고개를 든다. "가기 전에 뭐라도 먹고 가."',
    'An uncle, red in the face. “So what is it you do now, exactly? An intern? At your age?”': '얼굴이 벌건 삼촌. "그래서 지금 하는 일이 정확히 뭐라고? 인턴? 그 나이에?"',
    'An aunt. “Our boy got into a big company. Regular, of course.”': '숙모. "우리 애는 대기업 들어갔어. 정규직으로, 당연히."',
    'An ajumma with a shopping trolley. “The Jang boy? Up before dawn every day of his life, that one.”': '장바구니 수레를 끄는 아주머니. "장씨네 아들? 평생 새벽같이 일어나는 애야, 그 애는."',
    'An old man on a plastic stool by the lane. “Seven years at those stones. Now what?”': '골목 옆 플라스틱 의자의 노인. "칠 년을 그 돌 앞에 앉아 있더니. 이제 뭐 하나."',
    'A man asleep on his feet, swaying with the train.': '선 채로 졸며 열차와 함께 흔들리는 남자.',
    'A woman in a suit reads the same page of her phone for three stops.': '정장 차림의 여자가 세 정거장 내내 휴대폰의 같은 페이지를 보고 있다.',
    "A man in a grey suit stands in the doorway with a magnetic pocket board, a problem half-solved. “Excuse me. Do you play? I've been stuck on this since Hapjeong.”": '회색 정장의 남자가 반쯤 푼 문제가 놓인 자석 포켓 바둑판을 들고 문가에 서 있다. "실례지만, 바둑 두세요? 합정부터 이것 때문에 막혀 있어서요."',
    '“…Oh. Of course. Thank you. This is my stop too.”': '"…아. 그렇구나. 고마워요. 저도 여기서 내려요."',
    'The man with the pocket board is on the next problem.': '포켓 바둑판을 든 남자는 다음 문제를 풀고 있다.',
}
