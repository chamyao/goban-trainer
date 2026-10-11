"""World 22: Misaeng, Book 2, "도전" (Challenge): episodes 17-33 of Yoon Tae-ho's webtoon 『미생』 (Daum, 2012).

English on screen; Korean lines in KO22. Plan: docs/book2/misaeng-book2-plan.md. Built from readers first
(docs/book2/misaeng-research-ep0-33.md), the comic last (docs/book2/misaeng-read-ep17-33.md, the Toomics English
edition). The comic's events, people and order are kept; dialogue is a close paraphrase with only short key lines
quoted. (staging) / (invented) in comments mark what isn't on the page. Engine syntax as Book 1 (tk_story_w21.py);
Integration wires this file in tools/tk_story.py (world 22, hidden until published).

The frame game continues: each beat opens on its move of the 1st Ing Cup final, game 5 (1989), Nie Weiping (White)
against Cho Hunhyun (Black). Record boards (Cho's move, multiple choice) are on Black's odd moves.
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


def D(who, q, open_, win, slip, **kw):
    """A decision board: the caption over the problem, and the decider's own lines on it."""
    return {"q": q, "who": who, "open": open_, "win": win, "slip": slip, **kw}


# New cast for Book 2 (Book 1's CAST21 still applies). Kokoro voice ids already used in the repo.
# ms_glasses is Jang Baek-gi from here on (Book 1's glasses intern; named in the comic at 33수).
from tk_story_w21 import CAST21  # noqa: E402

CAST22 = {
    **CAST21,
    "ms_parkjg": "am_adam", "ms_sun": "af_sarah", "ms_somi": "af_sky", "ms_leesh": "am_puck",
    "ms_hanfather": "bm_george", "ms_examiner": "bm_lewis",
    # new (Graphics: to draw)
    "ms_supceo": "bm_daniel", "ms_kwon": "am_echo", "ms_hateacher": "af_bella",
}


def _scenes():
    return {
        # B17 · 17수 (W). Park Jong-gi's day: the tirade, the academy fees, the soft call, bread and vomit; the night
        # drink alone; "take responsibility"; the alley. The player is Park.
        "b17": {"title": T("Bread on the Street"), "kind": "main", "steps": [
            N("Park Jong-gi, assistant manager, IT Sales. Twelve years of being the nice one."),
            N("All morning his team leader's voice follows him down the street: the price, the delays at the Guangzhou plant, and the time he reported the restaurant for giving the team free meat. Why is he always on the other side?"),
            N("His wife calls: she has enrolled their son in an academy. He calls the supplier about the late shipment, hears that the man's daughter is having a hard time, and tells him not to worry about it."),
            ["still", "ms_bread", "slow zoom in"],
            N("He eats a bun and a carton of milk standing on a strip of grass by the crossing. Then his heart starts pounding, and he brings it all back up."),
            N("That night he drinks alone at a street stall and calls an old friend who quit his job and started again."),
            N("His friend, on the phone: you can't make everyone happy. Choose, and take responsibility for the choice."),
            ["still", "ms_alley", "slow pan across"],
            N("In the alley by his front gate he sits down and doesn't go in. He's happy. That's the trouble. He doesn't have the nerve to carry this much happiness."),
            ["party", ["ms_parkjg"], {"to": {"place": "One International", "from": "Jongno"}}],   # a cut: the next morning; he walks up to the roof
        ]},

        # B17b · 17-18수 (W). The roof: the resignation letter; Jang, rehearsing; Oh's praise, and more made up;
        # Park's invented victory; "come and see". Oh's "a bit much" (a cutaway line). Park and Jang set off.
        "b17b": {"title": T("An Exemplary Salesman"), "kind": "main", "steps": [
            N("The next morning, on the roof. An envelope in his hand: RESIGNATION LETTER."),
            ["spawn", "jg", "ms_jang", "b17b", 24, 8],
            N("An intern comes out onto the roof rehearsing a presentation under his breath, waving one arm."),
            ["move", "jg", "b17b", 8, 0],
            N("Park slips the envelope into his jacket."),
            S("ms_jang", "Mr. Park from IT Sales? I'm Jang Geu-rae, an intern. Mr. Oh says you're an exemplary salesman, the kind who builds relationships with compassion."),
            S("ms_parkjg", "M-me?"),
            N("That was all Oh said. But Park's eyes are shining, so Jang adds a little more."),
            ["problem"],   # the record: Black 17 ("to thrust hard, plant your feet")
            S("ms_parkjg", "Sales is a war of nerves. Let the other side see you're soft, and they'll walk all over you."),
            S("ms_parkjg", "A supplier missed a deadline once. Their director came to beg. I told him: we'll hold you to the terms of the contract."),
            N("It never happened. But saying it, he feels lighter."),
            S("ms_parkjg", "Come with me to one of our suppliers. They've caused a little trouble today. I'll square it with Mr. Oh."),
            N("Back in Sales 3, Oh hears where Jang has gone. Park from IT Sales, suddenly so friendly? A bit much, he thinks."),
            ["remove", "jg"],
            ["party", ["ms_jang", "ms_parkjg"], {"to": {"place": "Supplier", "from": "Jongno"}}],   # the lead passes back to Jang; Park walks with him
        ]},

        # B18 · 18수 (W). The supplier's corridor: overheard through a door; Kwon; Jang's eyes; "hold to the contract";
        # the wings.
        "b18": {"title": T("Through the Door"), "kind": "main", "steps": [
            N("The supplier deals with a Chinese semiconductor firm. Lately its shipments to One International keep slipping."),
            S("ms_parkjg", "I'm not here to accuse anyone. It's a relationship of trust. A visit just keeps them on their toes."),
            N("In the corridor, voices behind a half-open door: the new client comes first; hold One International off by phone. Park is soft. Give him an excuse."),
            ["spawn", "kw", "ms_kwon", "b18", 16, -8],
            ["move", "kw", "b18", 8, -4],
            N("Mr. Kwon comes out whistling, sees them, and freezes."),
            S("ms_kwon", "Mr. Park! You should have called first. We've just been diversifying a little..."),
            N("So this is how they see him. Easy. And Jang is watching him with shining eyes, waiting to see the man from the story on the roof."),
            ["problem"],   # Park: hold them to it? (the deliberation; the choice comes after)
            S("ms_parkjg", "Mr. Kwon. Can we hold to... the terms of the contract?"),
            ["still", "ms_wings", "slow zoom out"],
            N("If he doesn't change now, he never will."),
            ["remove", "kw"],
        ]},

        # B19 · 19수 (W). The supplier president's office: the apology; "termination or compensation?"; the staged
        # tantrum at his own men; Park about to fold; Jang's proper move (the call); "I'm with you".
        "b19": {"title": T("The Proper Move"), "kind": "main", "steps": [
            ["spawn", "ceo", "ms_supceo", "b19", 16, -8], ["spawn", "kw", "ms_kwon", "b19", 24, 0],
            S("ms_supceo", "I'm very sorry."),
            N("The president is calm. Ten years they've done business together, he says. Problems on both sides, always settled like friends."),
            S("ms_supceo", "So when you say the contract, Mr. Park: do you mean ending it, or compensation?"),
            S("ms_parkjg", "I... I'll have to ask head office."),
            ["emote", "ceo", "anger"],
            N("Then the president turns on his own men: how could they betray their oldest partner for a few more won? He'll go to One International himself and beg."),
            N("Park is shaking. Ten years, ended because of him, when all he had to do was look the other way. He opens his mouth to back down."),
            N("Jang reads the room like a board. The rage is for his staff, but it's aimed at Park. A clever trick only proves the game has been going badly for the one who plays it."),
            ["problem"],   # Jang: answer the trick with the proper move
            N("Under the table, Jang texts Kim Dong-sik: call me, please. The phone rings."),
            S("ms_parkjg", "We've stayed too long. You'll get told off. Maybe we should have called first..."),
            S("ms_jang", "Why would I get told off? We're here on business. And I'm with you."),
            N("Jang steps into the doorway and answers loudly: yes, Mr. Kim, the president says he'll come to One International himself to explain. Yes, he said so himself."),
            ["remove", "ceo"], ["remove", "kw"],
            ["party", ["ms_jang", "ms_parkjg"], {"to": {"place": "One International", "from": "Jongno"}}],
        ]},

        # B20 · 20수 (W). Meeting Room 3: the reports; "BE IRRESPONSIBLE!"; the confession; every face his own; the
        # director keeps the partner; "everyone plays their own game of baduk"; "I'm sorry" / "Thank you".
        "b20": {"title": T("Be Irresponsible"), "kind": "main", "steps": [
            ["spawn", "dir", "ms_director", "b20", 16, -8],
            N("Meeting Room 3. Director Choi of IT, the department head, and the risk, evaluation and legal teams. The supplier's president waits in another room."),
            N("Evaluation: small losses. Risk: low. Legal: this is the seventh late shipment, so the contract must be looked at again."),
            S("ms_director", "How did it come to this?"),
            N("Park stands up. The room is airless, and he's still worrying about the supplier. Jang scribbles on a sheet of paper and slides it over as if it were a reference document."),
            ["gain", "jang_note"],
            ["still", "ms_note", "slow zoom in"],
            N("BE IRRESPONSIBLE! In baduk you have to know when to abandon stones in danger. You can't save everyone. Save yourself first."),
            N("Park explains: seven delays, a new Chinese client, a supplier putting first orders first. The executives nod: without his visit they'd never have known."),
            ["problem"],   # Park: whose mistake was it? (the deliberation; the choice comes after)
            S("ms_parkjg", "But I never took the measures I should have. I didn't see how serious it was. The one who's been deceiving everyone... was me."),
            ["still", "ms_faces", "slow pan across"],
            N("Every face around the table becomes his own. Shipping costs went up with oil, he says, and One International still cut what it paid, and he never argued for them. Hold him responsible, not them."),
            S("ms_director", "How long have you been with us? Four years? You're a sentimental man. Nobody drops a ten-year partner over this. Bring me their president."),
            ["remove", "dir"],
            N("Afterwards Jang sits with his head down. He has never felt so wretched, not even after losing a game."),
            N("Everyone plays their own game of baduk. And he tried to play Park's for him."),
            S("ms_jang", "I'm sorry."),
            S("ms_parkjg", "Thank you, Mr. Jang. You took off the skin that was holding me in. Thank you."),
            N("That evening Park calls his wife. Their son won't go to the academy after all. Let the boy have time to think."),
        ]},

        # B21 · 21수 (W). Sales 3: the supplier settles; no scapegoat; Sun Ji-young and her rules; the husband on the
        # phone; "it's personal"; Jang volunteers.
        "b21": {"title": T("It's Personal"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "b21", "@chair-kim"],
            N("The supplier signs a new contract: three per cent off for two years. Park isn't punished. He writes a report on what went wrong."),
            S("ms_kimds", "Risk is part of trade. There's no end to hunting for a scapegoat, so the company hunts for improvements. You still write that report carefully, mind."),
            S("ms_kimds", "Now go and help Sun Ji-young with her buyer meeting, both of you. Learn from her."),
            ["spawn", "ahn", "ms_ahn", "b21", 16, 8], ["spawn", "sun", "ms_sun", "b21", -24, -8],
            N("Sun Ji-young, deputy head of Sales Team 1: wiry, fast and exact. Hard subcontractors turn helpful after one meeting with her."),
            N("She is on the phone to her husband: she can't get to the daycare by seven; he was supposed to fetch their daughter by six."),
            S("ms_sun", "Fewer words, more pictures. Times New Roman, fourteen point, black. No hyperlinks. Show me the layout before you place a single image."),
            S("ms_ahn", "Ask Mr. Han. He's your partner. I hold grudges."),
            N("The meeting goes well. Then Sun's phone again: her husband can't come, the teacher has to go home."),
            S("ms_ahn", "Is something wrong?"),
            S("ms_sun", "It's personal. You two did very well today. You can go."),
            N("She won't ask a junior for a personal favour. But the next call ends with: it'll be midnight before I can get there."),
            S("ms_jang", "Ma'am, I live out that way."),
            S("ms_ahn", "I go past it too."),
            ["remove", "kd"], ["remove", "sun"], ["remove", "ahn"],
            ["party", ["ms_jang", "ms_ahn"], {"to": {"place": "Daycare", "from": "Jongno"}}],   # a cut: the taxi; at the daycare door
        ]},

        # B21b · 21-22수 (W). The daycare: the children at the door; Ms. Ha stays; the playground; Sun, late.
        "b21b": {"title": T("The Doorbell"), "kind": "main", "steps": [
            N("In the taxi, Ahn says it plainly: men never see what it costs a woman to become a deputy head."),
            ["spawn", "ha", "ms_hateacher", "b21b", 8, -8], ["spawn", "somi", "ms_somi", "b21b", 16, -8],
            N("The doorbell rings. Every child left in the all-day class comes to the door to see whose mother it is. Then they go back to their blocks."),
            ["still", "ms_doorbell", "slow zoom in"],
            N("Jang asks if they can take the children out to the playground. Someone has to supervise. The young teacher, Ms. Ha, says she'll stay."),
            ["problem"],   # the record: Black 21 (a light board while the children play)
            N("Ahn pushes the swings. Jang carries a boy on his shoulders. One by one the mothers come, all of them running."),
            S("ms_hateacher", "Are you two a couple? It feels like you like her."),
            S("ms_jang", "She's a coworker I can rely on."),
            ["spawn", "sun", "ms_sun", "b21b", 24, 8],
            N("Sun comes long after dark. Somi is asleep on the bench next to Jang."),
            S("ms_sun", "Thursday, lunch. My treat. Promises like this are easy to forget, so I'm fixing it now. And come in at eight tomorrow."),
            ["remove", "ha"], ["remove", "somi"],
            ["party", ["ms_sun"], {"to": "b22"}],   # the lead passes to Sun: home
        ]},

        # B22 · 22수 (W). Sun's flat at night: the husband at the sink; Somi's drawing, her mother from behind (the comic: a blank face, the back of her head; the existing still ms_drawing shows her back).
        "b22": {"title": T("The Drawing"), "kind": "main", "steps": [
            N("Late at night. Her husband washes up. Somi is asleep. In Somi's bag there's a crayon drawing."),
            ["still", "ms_drawing", "slow zoom in"],
            N("Mummy, in her office suit, seen from behind: walking away, a phone at her ear."),
            S("ms_sun", "This is me. She's drawn me from behind."),
            N("They work this hard for the three of them, and they're hurting themselves doing it. Things will be easier when Somi's older, he says. He has golf tomorrow."),
            ["party", ["ms_sun", "ms_somi"], {"to": {"place": "Daycare", "from": "Sun's neighbourhood"}}],   # the next morning: the walk to the daycare
        ]},

        # B22b · 22수 (W). The daycare door, morning: the client call; Somi watching her back; the black crayon; the bow.
        "b22b": {"title": T("Her Back"), "kind": "main", "steps": [
            ["offstage", "ms_hateacher"],
            N("Before office hours, a client is already on the phone. Sun rings the bell and keeps talking. Ms. Ha takes Somi in. Sun turns to go."),
            S("ms_hateacher", "Let's say bye to Mummy."),
            N("Somi stands behind the glass door, watching her mother walk away."),
            ["problem"],   # Sun: the client, or the girl behind the glass? (the deliberation; the choice comes after)
            N("That's the drawing. Not her face. Her back, walking away. It's what Somi sees every morning."),
            S("ms_somi", "Bye-bye, Mummy!"),
            ["still", "ms_bow", "slow zoom in"],
            N("Sun tells the client she'll call back. She comes back, kneels and bows to her daughter, and Somi giggles. She holds her."),
            N("She won't put her daughter off for the sake of making a living."),
            ["party", ["ms_jang"], {"to": {"place": "One International", "spot": "sales3"}}],   # back to Jang, at the office
        ]},

        # B23 · 23수 (W). The PT looms: fifteen interns, two survived last time; Han back from Ulsan; "limited by
        # culture"; PP innerwear and sweat-proof cosmetics; "From! The! Internet!" Ms. Ha's call (22, end) opens it.
        "b23": {"title": T("Limited by Culture"), "kind": "main", "steps": [
            N("Sun is late this morning. Jang's desk phone rings: Ms. Ha, from the daycare, asking if he'd like a drink some time."),
            N("Ten days to the PT. The pair topic is free. The individual topic comes the day before."),
            ["spawn", "ahn", "ms_ahn", "b23", 16, 8], ["spawn", "bk", "ms_glasses", "b23", 24, 8],
            S("ms_glasses", "Fifteen of us. They'll take half, surely?"),
            S("ms_ahn", "Last time they started with thirty. Two got in."),
            ["remove", "ahn"], ["remove", "bk"],
            N("Somewhere on the floor a senior bellows at somebody: the calculator does the sums, so how did you get them wrong?"),
            N("Then Han is back from the Ulsan plant, running across the plaza: Geu-rae! Great, great! Champagne when the results come out."),
            ["spawn", "han", "ms_han", "b23", 8, -8],
            S("ms_han", "Culture and trade. Nice idea, boring title. It's not what we sell. It's who we sell to, and why they need it."),
            N("Jang's proposal had one phrase in it: limited by culture. Han builds the whole pitch on it."),
            S("ms_han", "A woman in a hot, humid country: does she give up make-up, or want make-up that won't melt? And polypropylene fibre: light, warm, dries fast, but it won't take dye, so nobody uses it. As thermal underwear for long winters, who cares about the colour?"),
            S("ms_jang", "How do you know all this?"),
            S("ms_han", "From! The! Internet! Next question."),
            ["problem"],   # the record: Black 23 (digging under a wall for territory)
            N("Is this what fieldwork at the Ulsan plant does to a person?"),
            ["remove", "han"],
        ]},

        # B24 · 24수 (W). Ahn and her partner Lee (the video, "teamed with a bomb"); two interns with the same typo
        # (Baek-gi); "the intersection"; Han's method: the question; Han, the workaholic, on the roof.
        "b24": {"title": T("The Question"), "kind": "main", "steps": [
            ["offstage", "ms_leesh"],
            N("Nine days to the PT. Ahn's partner, Lee Sang-hyun, is at his old university making a video with the broadcasting club."),
            S("ms_leesh", "It's a team project. Respect my opinion too. ...Honestly, I've been teamed up with a bomb."),
            S("ms_ahn", "Who are you calling a bomb?"),
            N("Jang Baek-gi and his partner pool their research and find it's identical, down to the same typo. They both paid for the same website."),
            ["spawn", "han", "ms_han", "b24", 8, -8],
            S("ms_jang", "Some of it they'll accept and some of it feels like a cage. There has to be a point in between that satisfies both."),
            S("ms_han", "That's it. The intersection. They don't want an answer from two-month interns. They know more than we do. What matters is the question."),
            S("ms_han", "Isn't a business that satisfies that person a business that satisfies everyone? And we ask it of... the president."),
            N("Han plays fast baduk. Every time Jang says he'll read up on something, Han has already named the book and dismissed it."),
            ["problem"],   # Jang: read how far the fast player has calculated
            S("ms_jang", "What music do you like?"),
            S("ms_han", "None. No films, no dramas either. And don't laugh. I like working best."),
            N("That's the secret of his speed. Why would Jang laugh?"),
            ["remove", "han"],
        ]},

        # B25 · 25수 (W). Copying; Kim's advice; "I don't take orders from people who don't know the field"; the
        # punch; the CD handed in; the stopwatch; the bombs fighting; eight o'clock: the individual task.
        "b25": {"title": T("The Last Person"), "kind": "main", "steps": [
            N("A week to the PT, and the interns still have their day jobs. Han is sent to the copier again and stands there shaking with fury."),
            N("Kim's advice to Jang: text on the slides is safer than pictures; the judges sit through a dozen PTs, and words give them a map. Oh's: say the script out loud. Nerves make you fast."),
            ["spawn", "han", "ms_han", "b25", 8, -8],
            S("ms_han", "That's Mr. Kim's opinion. I don't call anyone boss who doesn't know what goes on in the field."),
            S("ms_jang", "Don't call me 'punk', punk!"),
            ["emote", "han", "anger"],
            N("A fist, a grab, a scuffle. Then a truce of sorts. Do your job in the PT, Han tells him, and don't get in my way."),
            N("The files go in on a CD. Then the stopwatch: Han runs fourteen minutes, then seventeen. The limit is ten, and five for questions. He has memorised every sentence, and they shout at each other over which ones to cut."),
            ["spawn", "ahn", "ms_ahn", "b25", 24, 8], ["spawn", "lee", "ms_leesh", "b25", 32, 8],
            S("ms_leesh", "The bombs are fighting."),
            S("ms_ahn", "Look who's talking. Let's go, nuclear bomb."),
            ["remove", "ahn"], ["remove", "lee"], ["remove", "han"],
            N("Eight o'clock at night. Every intern is hanging about outside the tower. Their phones all go off at once."),
            ["still", "ms_8pm", "slow pan across"],
            N("From Human Resources: what would you sell to your team-project partner, and why?"),
            ["problem"],   # the record: Black 25 (a butting move)
            N("They have to sell something to the last person they'd want to sell to."),
        ]},

        # B26 · 26수 (W). The individual task: "the other person will tell you who you are"; the pen, rejected; Oh in
        # the lobby: "everything made in the field is finished in the office". Then, at night, the slippers (a find).
        "b26": {"title": T("Through Others"), "kind": "main", "steps": [
            N("Whatever you sell, your partner's answer will show how you judged him. The other person will tell you who you are."),
            N("Some interns live in the catalogue room. Some trawl the internet. Lee rings a friend who sells insurance."),
            N("A pen? Everything made in the field ends up on paper in the office. But a pen won't persuade Han."),
            ["spawn", "oh", "ms_oh", "b26", 8, -8],
            N("Oh is in the lobby, on his way out to a factory."),
            S("ms_jang", "Is the field as important as the office?"),
            S("ms_oh", "Important in different ways. If only the field mattered, why would we need a building this size? Everything made in the field is finished in the office. You run till your feet burn out there, and you sweat your feet in here."),
            ["problem"],   # Jang: what do you sell a man who only trusts the field? (the deliberation; the answer is found)
            N("Sweat your feet in here. Jang thanks him and runs back inside."),
            ["remove", "oh"],
        ]},
        "b27_wait": {"title": T("The Office at Night"), "kind": "main", "steps": [
            S("ms_jang", "Not yet. What does an office worker wear into battle?"),
        ]},

        # B27 · 27수 (W). PT day: the judges; the proud executive; the rules; the "Jangku" team; Ahn and Lee's
        # "Avatar"; "because we're being interviewed for the job"; the logo; "Next!"
        "b27": {"title": T("Next!"), "kind": "main", "steps": [
            N("PT day. The interns file in carrying boxes. Han sees Jang's slippers and mutters: is he out of his mind?"),
            ["spawn", "ex", "ms_examiner", "b27", 16, -16], ["spawn", "oh", "ms_oh", "b27", 24, -16],
            N("Executives in the front row, department heads behind, Oh among them. One executive smiles at the company video; Jang guesses he's remembering a mine contract and his years in the field. He hopes Han gets a middle age with moments like that."),
            N("Ten minutes to present, five for questions, nothing that wasn't submitted, and the clock starts when your names are called."),
            N("The first pair flap up the aisle in onesies and swimming flippers: they're the Jangku Team, here to leave their footprints on the world."),
            S("ms_examiner", "Next! Come back in proper clothes. We're not here to play."),
            ["spawn", "ahn", "ms_ahn", "b27", -8, 8], ["spawn", "lee", "ms_leesh", "b27", -16, 8],
            N("Ahn and Lee: Avatar, global companies stripping the resources of poor countries, and an alternative. Ahn presents alone and never once looks at the screen."),
            S("ms_examiner", "Mr. Lee hasn't said a word. Ms. Ahn, why didn't you warn your partner?"),
            S("ms_ahn", "Because we're being interviewed for the job."),
            ["remove", "lee"],
            N("The Jangku Team come back in suits. A judge spots the company logo on their slide, screen-captured off the website."),
            S("ms_examiner", "Next!"),
            ["problem"],   # the record: Black 27 (a hane underneath, to connect)
        ]},

        # B28 · 28수 (W). Team after team falls; Ahn alone wins the war of nerves; "Then one?"; their turn; the phones
        # in Han's office; Mum's text; the forgotten medicine. The player walks Han to the front.
        "b28": {"title": T("Nerves"), "kind": "main", "steps": [
            N("One presenter forgets his lines and asks to start again. One mixes up risks and crises. One admits he chose this company because he didn't think he'd get in anywhere better."),
            S("ms_examiner", "Are you asking us to hire you or not?"),
            N("One team has a flashy show and is told it belongs at an advertising firm. One runs out of time. One quotes 2010 figures, when the company has its own research institute."),
            N("Only Ahn hasn't lost the war of nerves. The judges mutter that they may hire a record low. How many last year? Two. Then one?"),
            N("Next: Jang Geu-rae and Han Seok-yul. Han has always been the confident one. He swallows, and swallows again."),
            N("In his team's office the phones keep ringing for him. On his desk his mobile buzzes: a text from Mum. Did you take your anxiety medicine?"),
            N("He forgot."),
            ["party", ["ms_han"]],   # the lead passes to Han: walk him to the front
        ]},

        # B29 · 29수 (W). The choke (on the medicine); seven minutes; Jang takes over and stammers; the teacher's
        # lesson; "have you ever been in the field?"; Han's father's black nails, the strike; "the field is the best".
        "b29": {"title": T("Black Nails"), "kind": "main", "steps": [
            ["offstage", "ms_hanfather"],
            ["spawn", "jg", "ms_jang", "b29", -8, 0], ["spawn", "ex", "ms_examiner", "b29", 24, -16],
            S("ms_han", "Our topic is a proposal for people limited by culture. Culture is defined as..."),
            N("He's reading it off the page, breathing hard."),
            S("ms_examiner", "Is something chasing you? Catch your breath."),
            S("ms_han", "May I take my medicine, sir? It's a drink. I'll be quick."),
            ["still", "ms_choke", "slow zoom in"],
            N("He gulps it, and sprays it out coughing. He can't speak."),
            S("ms_examiner", "Seven minutes left."),
            ["party", ["ms_jang"]],   # the lead passes back to Jang, at the laptop
            ["problem"],   # Jang: your partner can't speak (the deliberation; the choice comes after)
            S("ms_jang", "My partner choked on his drink. I'll continue."),
            N("His teacher's voice: there's no such thing as a stone played for no reason. Chance is a gift to those already prepared. So shall we get ready?"),
            N("Jang knows the material. He has never presented. He stammers."),
            S("ms_oh", "Someone's paying attention to Geu-rae."),
            S("ms_examiner", "It's hard to listen to. No business vocabulary. Have you ever been out in the field? To a factory? You've never left the office, have you?"),
            S("ms_jang", "No, sir."),
            ["still", "ms_blacknails", "slow pan across"],
            N("A small boy tells his father his fingernails are dirty. Grease, the father says. It won't come off. Are you ashamed? Then a strike, and everyone who joined it is fired, and a boy in the street jeers at the factory man with no job."),
            N("Han tips his head back. His lip trembles. Yes. The field is the best."),
            S("ms_han", "Well done, Mr. Jang. I'm sorry for the trouble. I'll pick up where he left off."),
            N("Dad. I'm not ashamed of you. Or of the field."),
            ["remove", "ex"],
        ]},

        # B30 · 30수 (W). Han in the language of the field; the bait: work it out here; "look it up yourself, sir"; Ahn
        # answers the freight question from the floor; "the president's daughter?"; Oh to Sun: "his limit, for now".
        "b30": {"title": T("The President's Daughter?"), "kind": "main", "steps": [
            ["spawn", "ex", "ms_examiner", "b30", 24, -16],
            N("Now Han speaks the language of the field: full-container loads, the forwarder, the plant. The executive who once worked a mine is smiling."),
            S("ms_examiner", "It's never been traded from Korea, so your costing's an estimate. Did you get it right? Too much for you?"),
            S("ms_han", "Too much, sir? I'll work it out now."),
            ["problem"],   # Han: count it, on the spot
            N("He has Jang read him the numbers. The exchange rate? Look it up yourself, sir, he says. I'm past that. The estimate is right."),
            S("ms_examiner", "And freight? Didn't it go up with oil?"),
            N("Han hesitates. A voice from the interns' seats:"),
            ["spawn", "ahn", "ms_ahn", "b30", -16, 16],
            S("ms_ahn", "No, sir. Air freight rose sixteen point six per cent. Sea and land didn't. And on a CNF contract the exporter pays cost and freight."),
            S("ms_han", "Th-that's what I meant."),
            S("ms_examiner", "Don't tell me you're the president's daughter. Or staff pretending to be an intern."),
            N("Did she help them, or herself? Would she ever do that for him? What are they to her?"),
            ["remove", "ahn"], ["remove", "ex"],
            ["spawn", "oh", "ms_oh", "b30", 8, -8], ["spawn", "sun", "ms_sun", "b30", 16, -8],
            S("ms_sun", "Jang didn't stand out today."),
            S("ms_oh", "He wrote the text and found the papers. Speaking isn't writing. If you don't hold the room, the words go thin. That's his limit, for now. I'd like him to stay."),
            S("ms_sun", "I hope he doesn't fall for the question tomorrow. It's a paradox."),
            ["remove", "oh"], ["remove", "sun"],
        ]},

        # B31 · 31수 (W). The individual round: the buyer must say why; the mirror; Ahn, "a textbook"; Han's
        # swatches and the notebook, "the voice of the field"; "I'll buy the notebook"; "can we sell them together?"
        "b31": {"title": T("The Voice of the Field"), "kind": "main", "steps": [
            ["spawn", "ex", "ms_examiner", "b31", 24, -16], ["spawn", "oh", "ms_oh", "b31", 32, -16],
            N("The next day. Each intern sells to their partner, the partner says whether they'll buy and why, and the questions come from the seniors of each intern's own team."),
            N("Wallets, a belt, a brag about shoes. Jang Baek-gi sells his partner a hand mirror: learn to manage your face before you do business. The partner, red to the ears, buys it."),
            N("Ahn plays it safe and doesn't stand out, because she doesn't need to. A judge writes: a textbook."),
            ["spawn", "han", "ms_han", "b31", 8, 0],
            ["still", "ms_swatches", "slow pan across"],
            S("ms_han", "Synthetic textiles from our Ulsan plant. Nylon, polyester, acrylic, polypropylene. And with them, this notebook: the losses, the miscommunication, the conditions on the line. I'm selling Mr. Jang the voice of the field."),
            ["problem"],   # Jang: buy, or not? (the deliberation; the choice comes after)
            S("ms_jang", "I'll buy the notebook. Not the textiles."),
            S("ms_oh", "Why?"),
            S("ms_jang", "Because I want to sell them with Mr. Han. I'll study these notes so I'm not a burden to him. Can we sell them together?"),
            S("ms_han", "I'll answer when I've seen what you're selling me."),
        ]},

        # B32 · 32수 (W) · the boss. Jang's item: the boss's shoes, then his slippers, "the combat boots of the office";
        # "I won't buy your product!"; no meaningless stones; Han steps into the slippers; "let's sell these together";
        # the aftermath: Oh's goodbye, Ahn, Han's slippers under every desk, a week of sleep.
        "b32": {"title": T("Combat Boots"), "kind": "main", "steps": [
            ["spawn", "ex", "ms_examiner", "b32", 24, -16], ["spawn", "oh", "ms_oh", "b32", 32, -16],
            ["spawn", "han", "ms_han", "b32", 8, 0],
            S("ms_jang", "My boss's dress shoes. Clean, because office workers rarely go out, but must look right when they do. And these, the same man's slippers, the spikes worn down to the shape of his foot. The office is a field too. I'm selling you the combat boots of the office."),
            S("ms_han", "I won't buy them. Call the office the field? A few sheets of office paper can get a whole line fired. Real combat boots have steel toes, so a dropped tool doesn't break your foot."),
            S("ms_han", "I won't buy your product!"),
            ["problem"],   # the boss: answer Han
            S("ms_jang", "The packed train in. Ten departments to agree one number. A lawyer over a single line of a contract. All night, waiting for a buyer abroad to say yes. What the factory makes starts as a row of decisions."),
            N("His teacher: there is no meaningless stone on the board. A stone in a dead group means a misreading; leave it to die, and use it to win."),
            S("ms_jang", "No product this company makes exists for no reason. A failed one means a bad estimate. You learn from it. I don't think my field is so different from yours."),
            ["still", "ms_slippers_on", "slow zoom in"],
            N("Han looks at the slippers for a long moment. He steps out of his own shoes and into them."),
            S("ms_han", "I'll... buy these slippers. And let's sell those together."),
            ["remove", "ex"],
            N("Results by email and text in a week. The interns clear their desks into boxes."),
            S("ms_oh", "You did well. Not all of you will get in. But I hope to see you again."),
            ["remove", "oh"],
            S("ms_ahn", "You were amazing? I've done this a few times before."),
            ["still", "ms_underdesks", "slow pan across"],
            N("That night Han carries two bags into an empty office and drops a new pair of slippers under every desk."),
            ["remove", "han"],
            ["party", ["ms_jang"], {"to": {"place": "Susaek-dong", "spot": "home"}}],   # a cut: a week later, at home
        ]},

        # B33 · 33수 (W). A week of sleep, Cho Chikun's wheelchair game; the results by phone; Jang calls his mother.
        "b33": {"title": T("Contract"), "kind": "main", "steps": [
            N("For a week he sleeps, and doesn't touch the computer. He replays Cho Chikun's game, the one he played in a wheelchair, so he can accept whatever comes."),
            N("A week later he logs in. All over Seoul, phones chime."),
            N("Jang Baek-gi, on a mountain top: hired. A safe bet. Ahn, in a department store: hired. Han, in his rented room: hired."),
            ["problem"],   # the record: Black 33 ("his real company life is about to begin")
            ["still", "ms_contract", "slow zoom in"],
            N("Intern Jang Geu-rae. Hired as a contract worker for two years."),
            ["spawn", "mom", "ms_mother", "b33", 8, -8],
            S("ms_jang", "Mum. I... I think I got a job. Thank you."),
            ["remove", "mom"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],   # a few days later: the first day
        ]},

        # B33b · 33수 (W). The first day: the fist bump; the president; Sales 3, "the Storm Troops"; the suit prank;
        # the black ties: "we have somewhere to go".
        "b33b": {"title": T("The First Day"), "kind": "main", "steps": [
            ["spawn", "han", "ms_han", "b33b", 16, 8], ["spawn", "ahn", "ms_ahn", "b33b", 24, 8], ["spawn", "bk", "ms_glasses", "b33b", 32, 8],
            ["spawn", "oh", "ms_oh", "b33b", "@chair-oh"], ["spawn", "kd", "ms_kimds", "b33b", "@chair-kim"],
            N("The first day. Han at the door: not bad. A fist bump. Then Ahn and Baek-gi, who of course got in."),
            N("The president reads Ahn's file: two companies already, an executive track she walked away from because it was too easy. To Jang he says nothing at all."),
            N("For the next two years Jang belongs to the team whose leader asked for him: Sales Team 3, the Storm Troops."),
            N("Tradition, says Oh: the new hires choose their first work suits at a department store. The prices are four, six hundred thousand won. Card or cash? They panic. Oh and Kim are behind a rail, laughing."),
            S("ms_oh", "A suit? On what you earn? Here. Our gift to new people."),
            N("Black ties for the men. A black scarf for Ahn."),
            S("ms_oh", "Put them on now. We have somewhere to go."),
            ["remove", "kd"],
            ["party", ["ms_jang", "ms_oh", "ms_ahn", "ms_han", "ms_glasses"], {"to": {"place": "Daehanmun", "from": "Jongno"}}],
        ]},

        # B33c · 33수 (W). The memorial: a tent against the palace wall, a portrait, banners for the fired;
        # "offer your greetings"; enduring; Ahn's photograph. A quiet end, no fanfare.
        "b33c": {"title": T("The First Morning"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "b33c", 8, -8], ["spawn", "ahn", "ms_ahn", "b33c", 16, 8], ["spawn", "han", "ms_han", "b33c", 24, 8], ["spawn", "bk", "ms_glasses", "b33c", 32, 8],
            N("Past the subway exit, along a stone wall, banners: give back the jobs of the wrongly fired."),
            ["still", "ms_memorial", "slow zoom in"],
            N("A tarpaulin tent on the pavement. A portrait with a black ribbon, rows of names, candles, flowers. Workers laid off from a car plant, and the ones who didn't live to see it end."),
            S("ms_oh", "Go on. Pay your respects."),
            N("They bow, in their black ties."),
            N("To live by your work is to endure, whatever comes. It's the road toward a life that's complete."),
            S("ms_ahn", "Look here."),
            N("Ahn takes his photo. Behind him, an office tower. In front of him, the first day of two years."),
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
        node("b17", 20, 240, "b17", place="Jongno", room="bakery", move=17, board=False),
        node("b17b", 34, 233, "b17b", room="roof", move=17, record=17, dilemma=D(
            "ms_parkjg", "Cho plants his feet before he strikes. Which move?",
            "To thrust hard, your feet have to be planted.",
            "Black 17.",
            "Not that one. Look again.")),
        node("b18", 48, 226, "b18", place="Supplier", room="corridor", move=18, dilemma=D(
            "ms_parkjg", "They're laughing at you behind the door. Keep the peace?",
            "Ten years, and I've never once pushed. Jang is watching.",
            "He knows what he has to say.",
            "Not yet. Again.", pool="race")),
        node("b19", 62, 219, "b19", place="Supplier", room="president", move=19, dilemma=D(
            "ms_jang", "The president is putting on a show. Answer it.",
            "A clever trick means his game has been going badly. Answer it plainly.",
            "The proper move.",
            "Still a trick. Again.", pool="tesuji")),
        node("b20", 76, 212, "b20", room="meeting3", move=20, dilemma=D(
            "ms_parkjg", "Whose mistake was it?",
            "The note says save yourself. Abandon the stones in danger.",
            "He stands up.",
            "Again.", pool="tesuji sacrifice")),
        node("b21", 90, 205, "b21", room="sales3", move=21, board=False),
        node("b21b", 104, 198, "b21b", place="Daycare", move=21, dilemma=D(
            "ms_jang", "Children at the door, all of them hoping. Keep them all alive.",
            "One by one. Nobody gets left on the bench.",
            "All of them, home.",
            "One's left behind. Again.", pool="ld live")),
        node("b22", 118, 191, "b22", place="Sun's neighbourhood", room="sun-flat", move=22, board=False),
        node("b22b", 132, 184, "b22b", place="Daycare", move=22, dilemma=D(
            "ms_sun", "The client is on the line. Somi is behind the glass.",
            "Work, or the girl who watches my back every morning?",
            "She turns round.",
            "Again.", pool="ld live")),
        node("b23", 146, 177, "b23", room="reference", move=23, record=23, dilemma=D(
            "ms_jang", "Cho digs in under White's wall. Where?",
            "Take territory underneath while White builds in the centre.",
            "Black 23.",
            "Not that one. Look again.")),
        node("b24", 160, 170, "b24", room="roof", move=24, dilemma=D(
            "ms_jang", "Han plays fast. How far has he read?",
            "Fast players have the temperament and the speed of reading. Both.",
            "There.",
            "He's further ahead. Again.", pool="tesuji")),
        node("b25", 174, 163, "b25", place="Jongno", room="forecourt", move=25, record=25, dilemma=D(
            "ms_jang", "A butting move: Cho meets White head-on. Where?",
            "No compromise. Straight into him.",
            "Black 25.",
            "Not that one. Look again.")),
        node("b26", 188, 156, "b26", room="lobby", move=26, dilemma=D(
            "ms_jang", "What do you sell a man who only trusts the field?",
            "The field is finished in the office. Then what does the office stand in?",
            "He knows where to look.",
            "Not that. Again.", pool="tesuji")),
        node("b27", 202, 149, "b27", room="pt-hall", move=27, record=27,
             gate=[{"needs": ["item:oh_slippers"], "else": "b27_wait",
                    "objective": T("Sales 3, at night: find what you'll sell Han. Then the PT."),
                    "at": "One International"}],
             dilemma=D(
                 "ms_jang", "Cho slips underneath to connect. Where?",
                 "Safety first, like every intern in this room. Or is it?",
                 "Black 27.",
                 "Not that one. Look again.")),
        node("b28", 216, 142, "b28", room="pt-hall", move=28, board=False),
        node("b29", 230, 135, "b29", room="pt-hall", move=29, dilemma=D(
            "ms_jang", "Your partner can't speak. Seven minutes left.",
            "I wrote it. I've never said it out loud to anyone.",
            "He stands up.",
            "Seven minutes. Again.", pool="race")),
        node("b30", 242, 129, "b30", room="pt-hall", move=30, dilemma=D(
            "ms_han", "Work it out here, in front of them.",
            "Too much for me? Count it. Every point.",
            "The estimate holds.",
            "Count again.", pool="endgame")),
        node("b31", 254, 123, "b31", room="pt-hall", move=31, dilemma=D(
            "ms_jang", "Two things on the table. Buy, or not?",
            "If I buy it all, he shines. If I refuse it all, I'm petty.",
            "He knows what he's buying.",
            "Again.", pool="tesuji")),
        node("b32", 266, 117, "b32", room="pt-hall", move=32, role="boss", boss={
            "who": "ms_han", "name": "Han Seok-yul", "title": "The Field",
            "taunt": "I won't buy your product!"}),
        node("b33", 278, 111, "b33", place="Susaek-dong", room="home", move=33, record=33, dilemma=D(
            "ms_jang", "Cho makes the lower side his. Where?",
            "Territory, and the real game begins.",
            "Black 33.",
            "Not that one. Look again.")),
        node("b33b", 290, 105, "b33b", room="sales3", move=33, board=False),
        node("b33c", 302, 99, "b33c", place="Daehanmun", move=33, board=False),
    ]


_ORDER = ["b17", "b17b", "b18", "b19", "b20", "b21", "b21b", "b22", "b22b", "b23", "b24", "b25", "b26", "b27",
          "b28", "b29", "b30", "b31", "b32", "b33", "b33b", "b33c"]
_EDGES = [[a, b] for a, b in zip(_ORDER, _ORDER[1:])]

_ITEMS = {
    "jang_note": {"name": "Jang's note", "kind": "key", "text": "BE IRRESPONSIBLE!"},
    # found by Jang under Oh's desk at night (a "gives" spot, Places), b27's gate
    "oh_slippers": {"name": "Oh's slippers", "kind": "key",
                    "text": "Brown office slippers with massage spikes, worn down to the shape of Oh's foot."},
}

_OPENING = [
    ["scroll", T("Challenge"), [
        T("Jang Geu-rae spent his childhood at a baduk board and never turned professional. At twenty-six, with no degree, "
          "he is an intern at One International, a trading company, on Sales Team 3 under section head Oh Sang-sik."),
        T("In two weeks the interns sit the PT, the presentation test that decides who stays. Jang's partner is Han Seok-yul, "
          "who believes only in the factory floor. The top of the intake is Ahn Young-yi, who believes in nobody's help."),
        T("Until then, there's other people's work to watch. It begins with a salesman who is too kind."),
    ]],
]

_CLOSING = [
    ["scroll", T("Book 3: Style"), [
        T("Thirty-three moves played. Jang is in, on a two-year contract, with a desk on Sales Team 3 and a black tie."),
        T("Next: a first month of real work, and finding out what kind of player each of them is."),
    ]],
]


def _world():
    return {
        "n": 22,
        "lang": "en",
        "voice": "ko",
        "name": T("Challenge"),
        "zh": "",
        "chapters": [],
        "record": {"sgf": "docs/book2/misaeng-ing-cup-g5.sgf",
                   "title": "1st Ing Cup final, game 5", "black": "Cho Hunhyun", "white": "Nie Weiping"},
        "grades": ["11K", "11K+"],
        "boss": "redmond",
        "party": ["ms_parkjg"],
        "lead_portrait": True,
        "items": _ITEMS,
        "nodes": _nodes(),
        "edges": _EDGES,
        "scenes": _scenes(),
        "opening": _OPENING,
        "closing": _CLOSING,
    }


WORLD22 = _world()
