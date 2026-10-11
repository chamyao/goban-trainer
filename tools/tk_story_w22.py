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
    "ms_supceo": "bm_daniel", "ms_ithead": "bm_george", "ms_kwon": "am_echo", "ms_hateacher": "af_bella",
}


def _scenes():
    return {
        # B17 · 17수 (W). Park Jong-gi's day: the tirade, the academy fees, the soft call, bread and vomit; the night
        # drink alone; "take responsibility"; the alley. The player is Park.
        "b17": {"title": T("Bread on the Street"), "kind": "main", "steps": [
            N('Park Jong-gi, assistant manager, IT Sales. Four years in the job, and always the nice one.'),
            N("All morning his team leader's voice follows him down the street: the price, the delays at the Guangzhou plant, and the night a restaurant gave the team extra meat and Park made everyone pay for it. Whose side is he on?"),
            N("His wife calls: she has enrolled their son in an academy. He calls the supplier about the late shipment, hears that the man's daughter is having a hard time, and tells him not to worry about it."),
            ["still", "ms_bread", "slow zoom in"],
            N("He eats a bun and a carton of milk standing on a strip of grass by the crossing. Then his heart starts pounding, and he brings it all back up."),
            N("That night he drinks alone at a street stall and calls an old friend who quit his job and started again."),
            N("His friend, on the phone: you can't make everyone happy. Choose, and take responsibility for the choice."),
            ["still", "ms_alley", "slow pan across"],
            N("In the alley by his front gate he sits down and doesn't go in. He's happy: a wife, a son, a home, all resting on a job he's afraid of. That's the trouble. He doesn't have the nerve to carry this much happiness."),
            ["party", ["ms_parkjg"], {"to": {"place": "One International", "from": "Jongno"}}],   # a cut: the next morning; he walks up to the roof
        ]},

        # B17b · 17-18수 (W). The roof: the resignation letter; Jang, rehearsing; Oh's praise, and more made up;
        # Park's invented victory; "come and see". Oh's "a bit much" (a cutaway line). Park and Jang set off.
        "b17b": {"title": T("An Exemplary Salesman"), "kind": "main", "steps": [
            N("The next morning, on the roof. Thirteen days to the interns' PT, not that Park knows or cares. An envelope in his hand: RESIGNATION LETTER."),
            ["spawn", "jg", "ms_jang", "b17b", 24, 8],
            N("An intern comes out onto the roof rehearsing a presentation under his breath, waving one arm."),
            ["move", "jg", "b17b", 8, 0],
            N("Park slips the envelope into his jacket."),
            S("ms_jang", "Mr. Park from IT Sales? I'm Jang Geu-rae, an intern. Mr. Oh says you're an exemplary salesman, the kind who builds relationships with compassion."),
            S("ms_parkjg", "M-me?"),
            N("That was all Oh said. But Park's eyes are shining."),
            ["problem"],   # Jang: say more than Oh did? (the deliberation; the choice comes after)
            N("So Jang adds a little more: Oh says he knows how to keep both sides happy."),
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
            N("No trick of his own. He takes the president at his word, out loud, where it can't be taken back."),
            ["remove", "ceo"], ["remove", "kw"],
            ["party", ["ms_jang", "ms_parkjg"], {"to": {"place": "One International", "from": "Jongno"}}],
        ]},

        # B20 · 20수 (W). Meeting Room 3: the reports; "BE IRRESPONSIBLE!"; the confession; every face his own; the
        # director keeps the partner; "everyone plays their own game of baduk"; "I'm sorry" / "Thank you".
        "b20": {"title": T("Be Irresponsible"), "kind": "main", "steps": [
            ["spawn", "dir", "ms_director", "b20", 16, -8], ["spawn", "hd", "ms_ithead", "b20", 24, -8],
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
            S("ms_director", "How long have you been with us?"),
            S("ms_ithead", "Four years, sir."),
            S("ms_director", "You're a sentimental man. Nobody drops a ten-year partner over this. Bring me their president."),
            ["remove", "dir"], ["remove", "hd"],
            N("Afterwards Jang sits with his head down. He has never felt so wretched, not even after losing a game."),
            N("Everyone plays their own game of baduk. And he tried to play Park's for him."),
            S("ms_jang", "I'm sorry."),
            S("ms_parkjg", "Thank you, Mr. Jang. You took off the skin that was holding me in. Thank you."),
            N("Park takes the envelope out of his jacket and feeds it to the shredder."),
            N("That evening he calls his wife. Their son won't go to the academy after all. Let the boy have time to think."),
            N("You can't play another man's game for him. In twelve days Jang will have to play his own."),
            ["party", ["ms_jang"]],   # Park goes back to IT Sales
        ]},

        # B21 · 21수 (W). Sales 3: the supplier settles; no scapegoat; Sun Ji-young and her rules; the husband on the
        # phone; "it's personal"; Jang volunteers.
        "b21": {"title": T("It's Personal"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "b21", "@chair-kim"],
            N("Twelve days to the PT. The supplier signs a new contract: three per cent off for two years. Park isn't punished. He writes a report on what went wrong."),
            S("ms_kimds", "Risk is part of trade. There's no end to hunting for a scapegoat, so the company hunts for improvements. You still write that report carefully, mind."),
            S("ms_kimds", "Now go and help Sun Ji-young with her buyer meeting, both of you. Learn from her."),
            ["spawn", "ahn", "ms_ahn", "b21", 16, 8], ["spawn", "sun", "ms_sun", "b21", -24, -8],
            N("Sun Ji-young, deputy head of Sales Team 1: wiry, fast and exact. Hard subcontractors turn helpful after one meeting with her."),
            N("She is on the phone to her husband: she can't get to the daycare by seven; he was supposed to fetch their daughter by six."),
            S("ms_sun", "Fewer words, more pictures. Times New Roman, fourteen point, black. No hyperlinks. Show me the layout before you place a single image."),
            S("ms_jang", "Should I add the delivery figures?"),
            S("ms_ahn", "Ask Mr. Han. You picked him as your partner over everyone in the intake. I hold grudges."),
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
            ["problem"],   # a light board while the children play
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
            N("Late at night. Through the kitchen door, her husband is washing up. Somi is asleep. In Somi's bag there's a crayon drawing."),
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
            ["party", ["ms_jang"], {"to": {"place": "one-international--sales3", "spot": "sales3"}}],   # back to Jang, at the office
        ]},

        # B23 · 23수 (W). The PT looms: fifteen interns, two survived last time; Han back from Ulsan; "limited by
        # culture"; PP innerwear and sweat-proof cosmetics; "From! The! Internet!" Ms. Ha's call (22, end) opens it.
        "b23": {"title": T("Limited by Culture"), "kind": "main", "steps": [
            N("Jang is in at eight, as Sun told them. Sun is late, and comes in looking lighter."),
            N("On Thursday she takes them to lunch, as promised, and shows them a new drawing from Somi. This time Mummy has a face."),   # (invented: the comic sets the lunch and ends on Sun asking Somi for a new picture)
            N("Back at his desk the phone rings: Ms. Ha, from the daycare, asking if he'd like a drink some time."),
            N("Ten days to the PT. The pair topic is free. The individual topic comes the day before."),
            ["problem"],   # the record: Black 23 (digging under a wall for territory)
            ["spawn", "ahn", "ms_ahn", "b23", 16, 8], ["spawn", "bk", "ms_glasses", "b23", 24, 8],
            N("The intern in glasses from the study group, Jang Baek-gi, top school and top marks, asks what they're all thinking."),
            S("ms_glasses", "Fifteen of us. They'll take half, surely?"),
            S("ms_ahn", "Last time they started with thirty. Two got in."),
            ["remove", "ahn"], ["remove", "bk"],
            N("Somewhere on the floor a senior bellows at somebody: the calculator does the sums, so how did you get them wrong?"),
            N('Then Han is back from the Ulsan plant and bursts into the reference room: Geu-rae! Great, great! Champagne when the results come out.'),
            ["spawn", "han", "ms_han", "b23", 8, -8],
            S("ms_han", "Culture and trade. Nice idea, boring title. It's not what we sell. It's who we sell to, and why they need it."),
            N("Jang's proposal had one phrase in it: limited by culture. Han builds the whole pitch on it."),
            S("ms_han", "A woman in a hot, humid country: does she give up make-up, or want make-up that won't melt? And polypropylene fibre: light, warm, dries fast, but it won't take dye, so nobody uses it. As thermal underwear for long winters, who cares about the colour?"),
            S("ms_jang", "How do you know all this?"),
            S("ms_han", "From! The! Internet! Next question."),
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
            N("Baek-gi and his partner pool their research and find it's identical, down to the same typo. They both paid for the same website."),
            ["spawn", "han", "ms_han", "b24", 8, -8],
            S("ms_jang", 'Some customs people embrace, and some feel like a cage. There has to be a point in between that satisfies both.'),
            S("ms_han", "That's it. The intersection. They don't want an answer from two-month interns. They know more than we do. What matters is the question."),
            S("ms_han", "Isn't a business that satisfies that person a business that satisfies everyone? We end the PT on that question, and we put it to the man who decides: the president."),
            N("Han thinks like a fast baduk player. Every time Jang says he'll read up on something, Han has already named the book and dismissed it."),
            ["problem"],   # Jang: read how far the fast player has calculated
            S("ms_jang", "What music do you like?"),
            S("ms_han", "None. No films, no dramas either. And don't laugh. I like working best."),
            N("That's the secret of his speed. Why would Jang laugh?"),
            ["remove", "han"],
        ]},

        # B25 · 25수 (W). Copying; Kim's advice; "I don't take orders from people who don't know the field"; the
        # punch; the CD handed in; the stopwatch; the bombs fighting; eight o'clock: the individual task.
        "b25": {"title": T("The Last Person"), "kind": "main", "steps": [
            N("That evening, waiting outside the tower, Jang goes back over the day."),
            ["problem"],   # the record: Black 25 (a butting move)
            N("A week to the PT, and the interns still have their day jobs. Han is sent to the copier again and stands there shaking with fury."),
            N("Kim's advice to Jang: text on the slides is safer than pictures; the judges sit through a dozen PTs, and words give them a map. Oh's: say the script out loud. Nerves make you fast."),
            N("Sun said fewer words and more pictures; Kim says words. Each is right for their own audience, and the judges are Kim's."),
            ["spawn", "han", "ms_han", "b25", 8, -8],
            S("ms_han", "That's Mr. Kim's opinion. I don't call anyone boss who doesn't know what goes on in the field."),
            S("ms_jang", "But he's my boss."),
            S("ms_han", "Your boss? We're both interns, punk."),
            S("ms_jang", "Don't call me 'punk', punk!"),
            ["emote", "han", "anger"],
            N("A fist, a grab, a scuffle. Then a truce of sorts. Do your job in the PT, Han tells him, and don't get in my way."),
            N('The files go in on a CD. Then the stopwatch: Han runs fourteen minutes, then seventeen, and his hands shake on the script. The limit is ten, and five for questions. He has memorised every sentence, and they shout at each other over which ones to cut.'),
            ["spawn", "ahn", "ms_ahn", "b25", 24, 8], ["spawn", "lee", "ms_leesh", "b25", 32, 8],
            S("ms_leesh", "The bombs are fighting."),
            S("ms_ahn", "Look who's talking. Let's go, nuclear bomb."),
            ["remove", "ahn"], ["remove", "lee"], ["remove", "han"],
            N("Eight o'clock at night. Every intern is hanging about outside the tower. Their phones all go off at once."),
            ["still", "ms_8pm", "slow pan across"],
            N("From Human Resources: what would you sell to your team-project partner, and why?"),
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
            N("PT day. The interns file in carrying boxes. Oh's slippers are poking out of Jang's box. Han sees them and mutters: is he out of his mind?"),
            ["problem"],   # the record: Black 27 (a hane underneath, to connect)
            ["spawn", "han", "ms_han", "b27", 8, 0], ["spawn", "ex", "ms_examiner", "b27", 16, -16], ["spawn", "oh", "ms_oh", "b27", 24, -16],
            N("Executives in the front row, department heads behind, Oh among them. One executive smiles at the company video; Jang guesses he's remembering a mine contract and his years in the field. He hopes Han gets a middle age with moments like that."),
            N("Ten minutes to present, five for questions, nothing that wasn't submitted, and the clock starts when your names are called."),
            N("The first pair, Jang Ki-seok and Ku Hyun-woo, flap up the aisle in onesies and swimming flippers: they're the Jang-Ku Team, here to leave their footprints on the world."),
            S("ms_examiner", "Next! Come back in proper clothes. We're not here to play."),
            ["spawn", "ahn", "ms_ahn", "b27", -8, 8], ["spawn", "lee", "ms_leesh", "b27", -16, 8],
            N("Ahn and Lee: Avatar, global companies stripping the resources of poor countries, and an alternative. Ahn presents alone and never once looks at the screen."),
            S("ms_examiner", "Mr. Lee hasn't said a word. Ms. Ahn, why didn't you warn your partner?"),
            S("ms_ahn", "Because we're being interviewed for the job."),
            ["remove", "lee"],
            N('The Jang-Ku Team come back in suits. A judge spots the company logo on their slide, screen-captured off the website.'),
            S("ms_examiner", "Next!"),
            N("Nobody in the room is laughing now."),
            ["remove", "han"], ["remove", "ex"], ["remove", "oh"], ["remove", "ahn"],
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
            ["party", ["ms_jang"]],   # the lead passes back to Jang (applied when the scene ends; Han stays at the podium)
            ["problem"],   # Jang: your partner can't speak (the deliberation; the choice comes after)
            S("ms_jang", "My partner choked on his drink. I'll continue."),
            N("His old baduk teacher's voice: there's no such thing as a stone played for no reason. Chance is a gift to those already prepared. So shall we get ready?"),
            N("Jang knows the material. He has never presented. He stammers."),
            S("ms_oh", "Someone's paying attention to Geu-rae."),
            S("ms_examiner", "It's hard to listen to. No business vocabulary. Have you ever been out in the field? To a factory? You've never left the office, have you?"),
            S("ms_jang", "No, sir."),
            N("Han hears Jang's \"No, sir\", plain and unashamed, and remembers."),
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
            ["spawn", "han", "ms_han", "b30", 8, 0], ["spawn", "ex", "ms_examiner", "b30", 24, -16],
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
            N('Jang wonders: did she help them, or herself? Would she ever do that for him? What are the two of them to her?'),
            ["remove", "ahn"], ["remove", "ex"], ["remove", "han"],
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
            N('Wallets, a belt, a brag about shoes. Baek-gi sells his partner a hand mirror: learn to manage your face before you do business. The partner, red to the ears, buys it.'),
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
            N("In the second row, Oh looks down at his socks. So that's where they went."),
            S("ms_han", "I won't buy them. Call the office the field? A few sheets of office paper can get a whole line fired. Real combat boots have steel toes, so a dropped tool doesn't break your foot."),
            S("ms_han", "I won't buy your product!"),
            ["problem"],   # the boss: answer Han
            S("ms_jang", "The packed train in. Ten departments to agree one number. A lawyer over a single line of a contract. All night, waiting for a buyer abroad to say yes. What the factory makes starts as a row of decisions."),
            N("His teacher: there is no meaningless stone on the board. A stone in a dead group means a misreading; leave it to die, and use it to win."),
            S("ms_jang", "No product this company makes exists for no reason. A failed one means a bad estimate. You learn from it. I don't think my field is so different from yours."),
            ["still", "ms_slippers_on", "slow zoom in"],
            N("Han looks at the slippers for a long moment. He steps out of his own shoes and into them."),
            S("ms_han", "I'll... buy these slippers. And let's sell those together."),
            ["remove", "ex"], ["remove", "oh"], ["remove", "han"],
            N("That's the end of the PT. Results by email and text, in a week."),
        ]},

        # B32b · 32수 (W). Upstairs: the desks cleared; Oh's goodbye; Ahn, "I've done this before"; Han's slippers under
        # every desk; home.
        "b32b": {"title": T("A Week"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "b32b", "@chair-oh"], ["spawn", "kd", "ms_kimds", "b32b", "@chair-kim"],
            N("Back upstairs, the interns clear their desks into boxes."),
            S("ms_oh", "You did well. Not all of you will get in. But I hope to see you again."),
            ["remove", "oh"], ["remove", "kd"],
            N("In the lobby on the way out, Jang tells Ahn she was amazing. She shrugs: she's done this a few times before."),
            ["still", "ms_underdesks", "slow pan across"],
            N("That night Han carries two bags into an empty office and drops a new pair of slippers under every desk."),
            ["party", ["ms_jang"], {"to": {"place": "Susaek-dong", "spot": "home"}}],   # a cut: a week later, at home
        ]},

        # B33 · 33수 (W). A week of sleep, Cho Chikun's wheelchair game; the results by phone; Jang calls his mother.
        "b33": {"title": T("Contract"), "kind": "main", "steps": [
            N("For a week he sleeps, and doesn't touch the computer. He replays Cho Chikun's game, the one he played in a wheelchair, so he can accept whatever comes."),
            N("A week later he logs in. All over Seoul, phones chime."),
            N('Baek-gi, on a mountain top: hired. A safe bet. Ahn, in a department store: hired. Han, in his rented room: hired.'),
            ["problem"],   # the record: Black 33 ("his real company life is about to begin")
            ["still", "ms_contract", "slow zoom in"],
            N("Intern Jang Geu-rae. Hired as a contract worker for two years."),
            N("The others are permanent staff. He has two years. The parachute is in, but only on a lease."),
            S("ms_jang", "Mum. I... I think I got a job. Thank you."),
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
            N("Past the subway exit, along a stone wall, banners: give back the jobs of the wrongly fired."),
            ["still", "ms_memorial", "slow zoom in"],
            N("A tarpaulin tent on the pavement. A portrait with a black ribbon, rows of names, candles, flowers. Workers laid off from a car plant, and the ones who didn't live to see it end."),
            S("ms_oh", "Before you start working for a living, come and see the people who lost theirs. Go on. Pay your respects."),
            N("They bow, in their black ties. Han bows longest."),
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
        node("b17b", 34, 233, "b17b", room="roof", move=17, dilemma=D(
            "ms_jang", "Park's eyes are shining. Say more than Oh did?",
            "It's only a little more. He looks like he needs it.",
            "He adds a little more.",
            "Again.", pool="tesuji")),
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
            "He puts the note face down.",
            "Again.", pool="tesuji sacrifice")),
        node("b21", 90, 205, "b21", room="sales3", move=21, board=False),
        node("b21b", 104, 198, "b21b", place="Daycare", move=21, dilemma=D(
            "ms_jang", "Every child at the door is hoping. Get them all home.",
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
        node("b32b", 272, 114, "b32b", room="sales3", move=32, board=False),
        node("b33", 278, 111, "b33", place="Susaek-dong", room="home", move=33, record=33, dilemma=D(
            "ms_jang", "Cho makes the lower side his. Where?",
            "Territory, and the real game begins.",
            "Black 33.",
            "Not that one. Look again.")),
        node("b33b", 290, 105, "b33b", room="sales3", move=33, board=False),
        node("b33c", 302, 99, "b33c", place="Daehanmun", move=33, board=False),
    ]


_ORDER = ["b17", "b17b", "b18", "b19", "b20", "b21", "b21b", "b22", "b22b", "b23", "b24", "b25", "b26", "b27",
          "b28", "b29", "b30", "b31", "b32", "b32b", "b33", "b33b", "b33c"]
_EDGES = [[a, b] for a, b in zip(_ORDER, _ORDER[1:])]

_ITEMS = {
    "jang_note": {"name": "Jang's note", "kind": "key", "text": "BE IRRESPONSIBLE!"},
    # found by Jang under Oh's desk at night (a "gives" spot, Places), b27's gate
    "oh_slippers": {"name": "Oh's slippers", "kind": "key",
                    "text": "Brown office slippers with massage spikes, worn down to the shape of Oh's foot, and his good black dress shoes from the box under his desk."},
}

_OPENING = [
    ["scroll", T("Challenge"), [
        T("Jang Geu-rae spent his childhood at a baduk board and never turned professional. At twenty-six, with no degree, "
          "he is an intern at One International, a trading company, on Sales Team 3 under section head Oh Sang-sik."),
        T("In two weeks the interns sit the PT, the presentation test that decides who stays. Jang's partner is Han Seok-yul, "
          "who believes only in the factory floor. The top of the intake is Ahn Young-yi, who believes in nobody's help."),
        T("Two weeks to the PT, and Jang has never seen anyone in this company actually sell. He's about to watch two people at work: a salesman who is too kind, and a deputy head who can't be in two places at once."),
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


# Korean (the user: Korean voice, English screen). Every spoken line, scroll paragraph, the dilemmas' lines, objectives
# and items for w22; Places' map lines are added as they arrive.
KO22 = {
    "His wife calls: she has enrolled their son in an academy. He calls the supplier about the late shipment, hears that the man's daughter is having a hard time, and tells him not to worry about it.": '아내가 전화한다. 아들을 학원에 등록했다고. 그는 납품 지연 건으로 협력업체에 전화를 걸었다가, 그쪽 사람의 딸이 힘든 시기를 보내고 있다는 말을 듣고 신경 쓰지 말라고 한다.',
    'He eats a bun and a carton of milk standing on a strip of grass by the crossing. Then his heart starts pounding, and he brings it all back up.': '건널목 옆 잔디밭에 선 채로 빵 하나와 우유 한 팩을 먹는다. 그러다 심장이 쿵쾅거리기 시작하고, 먹은 걸 전부 게워 낸다.',
    'That night he drinks alone at a street stall and calls an old friend who quit his job and started again.': '그날 밤 그는 포장마차에서 혼자 술을 마시다가, 회사를 그만두고 새로 시작한 옛 친구에게 전화를 건다.',
    "His friend, on the phone: you can't make everyone happy. Choose, and take responsibility for the choice.": '수화기 너머 친구의 말. 모두를 만족시킬 순 없어. 선택해. 그리고 그 선택에 책임을 져.',
    'An intern comes out onto the roof rehearsing a presentation under his breath, waving one arm.': '인턴 하나가 한 팔을 휘저으며 작은 소리로 발표 연습을 하면서 옥상으로 나온다.',
    'Park slips the envelope into his jacket.': '박 대리는 봉투를 재킷 안으로 밀어 넣는다.',
    "Mr. Park from IT Sales? I'm Jang Geu-rae, an intern. Mr. Oh says you're an exemplary salesman, the kind who builds relationships with compassion.": 'IT영업팀 박 대리님이시죠? 인턴 장그래입니다. 오 과장님이 그러시던데요, 대리님은 연민으로 관계를 쌓는 모범적인 영업맨이시라고요.',
    'M-me?': '저, 저요?',
    "Sales is a war of nerves. Let the other side see you're soft, and they'll walk all over you.": '영업은 신경전이야. 물렁하게 보이면 상대가 밟고 들어와.',
    "A supplier missed a deadline once. Their director came to beg. I told him: we'll hold you to the terms of the contract.": '언젠가 협력업체가 납기를 못 맞췄지. 거기 이사가 빌러 왔더라고. 내가 그랬어. 계약 조건대로 하겠습니다.',
    'It never happened. But saying it, he feels lighter.': '그런 일은 없었다. 그래도 말하고 나니 마음이 가볍다.',
    "Come with me to one of our suppliers. They've caused a little trouble today. I'll square it with Mr. Oh.": '나랑 협력업체 한 군데 같이 가자. 오늘 거기서 문제가 좀 생겼거든. 오 과장님한텐 내가 말해 둘게.',
    'Back in Sales 3, Oh hears where Jang has gone. Park from IT Sales, suddenly so friendly? A bit much, he thinks.': '영업 3팀으로 돌아온 오 과장이 장그래가 어디 갔는지 듣는다. IT영업팀 박 대리가 갑자기 그렇게 살갑게? 좀 과한데, 싶다.',
    'The supplier deals with a Chinese semiconductor firm. Lately its shipments to One International keep slipping.': '그 협력업체는 중국 반도체 회사와 거래한다. 요즘 원인터내셔널로 가는 물량이 자꾸 밀린다.',
    "I'm not here to accuse anyone. It's a relationship of trust. A visit just keeps them on their toes.": '따지러 온 거 아니야. 신뢰 관계니까. 한 번씩 얼굴 비추면 다들 긴장하거든.',
    'In the corridor, voices behind a half-open door: the new client comes first; hold One International off by phone. Park is soft. Give him an excuse.': '복도, 반쯤 열린 문 너머로 목소리들이 들린다. 새 거래처가 먼저야. 원인터내셔널은 전화로 막아. 박 대리는 물러. 핑계 하나 대 주면 돼.',
    'Mr. Kwon comes out whistling, sees them, and freezes.': '권 대리가 휘파람을 불며 나오다가 두 사람을 보고 얼어붙는다.',
    "Mr. Park! You should have called first. We've just been diversifying a little...": '박 대리님! 미리 연락이라도 주시지. 저희가 거래처를 좀 다변화하던 참이라...',
    'So this is how they see him. Easy. And Jang is watching him with shining eyes, waiting to see the man from the story on the roof.': '그들 눈에 그는 이렇게 보이는 것이다. 만만하게. 그리고 장그래는 반짝이는 눈으로 그를 지켜본다. 옥상에서 들은 이야기 속 그 남자를 기다리며.',
    'Mr. Kwon. Can we hold to... the terms of the contract?': '권 대리님. 계약… 조건대로 해도 되겠습니까?',
    "If he doesn't change now, he never will.": '지금 변하지 않으면 영영 못 변한다.',
    "I'm very sorry.": '정말 죄송합니다.',
    "The president is calm. Ten years they've done business together, he says. Problems on both sides, always settled like friends.": '사장은 침착하다. 함께 거래한 지 10년이라고 그는 말한다. 양쪽 다 문제가 있었지만, 늘 친구처럼 해결해 왔다고.',
    'So when you say the contract, Mr. Park: do you mean ending it, or compensation?': '그래서 박 대리님, 계약이라고 하시면, 해지 말씀입니까, 보상 말씀입니까?',
    "I... I'll have to ask head office.": '저… 저는 본사에 여쭤봐야…',
    "Then the president turns on his own men: how could they betray their oldest partner for a few more won? He'll go to One International himself and beg.": '그러자 사장이 자기 직원들에게 돌아선다. 몇 푼 더 벌자고 제일 오래된 파트너를 배신하다니. 자기가 직접 원인터내셔널에 가서 빌겠다고 한다.',
    'Park is shaking. Ten years, ended because of him, when all he had to do was look the other way. He opens his mouth to back down.': '박 대리는 떨고 있다. 10년이 자기 때문에 끝났다. 눈만 감아 주면 됐을 것을. 그는 물러서려고 입을 연다.',
    "Jang reads the room like a board. The rage is for his staff, but it's aimed at Park. A clever trick only proves the game has been going badly for the one who plays it.": '장그래는 판을 읽듯 방 안을 읽는다. 분노는 직원들을 향하지만, 겨냥한 건 박 대리다. 꼼수는 그걸 쓰는 쪽의 판이 나빴다는 증거일 뿐이다.',
    'Under the table, Jang texts Kim Dong-sik: call me, please. The phone rings.': '탁자 밑에서 장그래가 김동식 대리에게 문자를 보낸다. 전화 좀 주세요. 전화가 울린다.',
    "We've stayed too long. You'll get told off. Maybe we should have called first...": '너무 오래 있었네. 너 혼나겠다. 미리 연락할 걸 그랬나...',
    "Why would I get told off? We're here on business. And I'm with you.": '제가 왜 혼나요? 업무로 온 건데요. 그리고 대리님이랑 같이 있잖아요.',
    "Jang steps into the doorway and answers loudly: yes, Mr. Kim, the president says he'll come to One International himself to explain. Yes, he said so himself.": '장그래는 문간으로 나가 큰 소리로 받는다. 네, 김 대리님, 사장님께서 직접 원인터내셔널에 오셔서 설명하시겠답니다. 네, 사장님이 직접 그렇게 말씀하셨어요.',
    "Meeting Room 3. Director Choi of IT, the department head, and the risk, evaluation and legal teams. The supplier's president waits in another room.": '제3회의실. IT 담당 최 상무, 부서장, 그리고 리스크관리팀, 심사팀, 법무팀. 협력업체 사장은 다른 방에서 기다린다.',
    'Evaluation: small losses. Risk: low. Legal: this is the seventh late shipment, so the contract must be looked at again.': '심사팀: 손실은 미미함. 리스크관리팀: 위험도 낮음. 법무팀: 이번이 일곱 번째 납기 지연이므로 계약을 재검토해야 함.',
    'How did it come to this?': '어쩌다 일이 이렇게 됐지?',
    "Park stands up. The room is airless, and he's still worrying about the supplier. Jang scribbles on a sheet of paper and slides it over as if it were a reference document.": '박 대리가 일어선다. 방 안은 숨이 막히는데, 그는 아직도 협력업체 걱정이다. 장그래가 종이에 뭔가를 휘갈겨 참고 자료인 양 슬쩍 밀어 준다.',
    "BE IRRESPONSIBLE! In baduk you have to know when to abandon stones in danger. You can't save everyone. Save yourself first.": '무책임해지세요! 바둑에선 위험에 빠진 돌을 버릴 줄 알아야 합니다. 다 살릴 순 없어요. 대리님부터 사세요.',
    "Park explains: seven delays, a new Chinese client, a supplier putting first orders first. The executives nod: without his visit they'd never have known.": '박 대리가 설명한다. 일곱 번의 지연, 새로운 중국 거래처, 먼저 들어온 주문부터 챙기는 협력업체. 임원들이 고개를 끄덕인다. 그가 찾아가지 않았다면 몰랐을 일이다.',
    "But I never took the measures I should have. I didn't see how serious it was. The one who's been deceiving everyone... was me.": '하지만 저는 했어야 할 조치를 하지 않았습니다. 사안이 얼마나 심각한지 보지 못했습니다. 모두를 속여 온 건... 바로 저였습니다.',
    'Every face around the table becomes his own. Shipping costs went up with oil, he says, and One International still cut what it paid, and he never argued for them. Hold him responsible, not them.': '탁자에 둘러앉은 얼굴들이 모두 그 자신의 얼굴이 된다. 유가가 오르면서 운송비도 올랐는데, 원인터내셔널은 납품가를 깎았고, 그는 한 번도 그들 편에서 말하지 않았다고 한다. 책임은 그들이 아니라 자신에게 물어 달라고.',
    'Afterwards Jang sits with his head down. He has never felt so wretched, not even after losing a game.': '그 뒤 장그래는 고개를 숙이고 앉아 있다. 이렇게 비참했던 적은 없다. 대국에서 졌을 때조차.',
    "Everyone plays their own game of baduk. And he tried to play Park's for him.": '모두에겐 자신만의 바둑이 있다. 그런데 그는 박 대리의 바둑을 대신 두려 했다.',
    "I'm sorry.": '죄송합니다.',
    'Thank you, Mr. Jang. You took off the skin that was holding me in. Thank you.': '고마워요, 장그래 씨. 날 가두고 있던 껍질을 벗겨 줘서. 고마워요.',
    "Risk is part of trade. There's no end to hunting for a scapegoat, so the company hunts for improvements. You still write that report carefully, mind.": '리스크는 무역의 일부야. 희생양 찾기엔 끝이 없으니까, 회사는 개선책을 찾는 거고. 그래도 그 보고서는 꼼꼼히 써, 알았지?',
    'Now go and help Sun Ji-young with her buyer meeting, both of you. Learn from her.': '이제 둘 다 선지영 차장 바이어 미팅 도우러 가. 가서 배워.',
    'Sun Ji-young, deputy head of Sales Team 1: wiry, fast and exact. Hard subcontractors turn helpful after one meeting with her.': '영업 1팀 선지영 차장. 마르고, 빠르고, 정확하다. 까다로운 하청업체도 그녀와 한 번 만나고 나면 협조적으로 변한다.',
    "She is on the phone to her husband: she can't get to the daycare by seven; he was supposed to fetch their daughter by six.": '그녀는 남편과 통화 중이다. 일곱 시까지 어린이집에 못 가. 여섯 시까지 딸 데리러 가기로 했잖아.',
    'Fewer words, more pictures. Times New Roman, fourteen point, black. No hyperlinks. Show me the layout before you place a single image.': '글은 줄이고, 그림은 늘리고. 타임스 뉴 로먼, 14포인트, 검은색. 하이퍼링크는 빼요. 이미지 하나라도 넣기 전에 레이아웃부터 보여 줘요.',
    "The meeting goes well. Then Sun's phone again: her husband can't come, the teacher has to go home.": '미팅은 순조롭다. 그런데 선 차장의 전화가 또 울린다. 남편은 못 오고, 선생님은 퇴근해야 한단다.',
    'Is something wrong?': '무슨 일 있으세요?',
    "It's personal. You two did very well today. You can go.": '개인적인 일이에요. 두 사람 오늘 아주 잘했어요. 가 봐요.',
    "She won't ask a junior for a personal favour. But the next call ends with: it'll be midnight before I can get there.": '그녀는 후배에게 사적인 부탁을 하지 않는다. 하지만 다음 통화는 이렇게 끝난다. 거기 가려면 자정은 돼야 할 거예요.',
    "Ma'am, I live out that way.": '차장님, 저 그쪽에 살아요.',
    'I go past it too.': '저도 그쪽 지나가요.',
    'In the taxi, Ahn says it plainly: men never see what it costs a woman to become a deputy head.': '택시 안에서 안영이가 분명하게 말한다. 여자가 차장이 되기까지 무엇을 치러야 하는지 남자들은 절대 모른다고.',
    'The doorbell rings. Every child left in the all-day class comes to the door to see whose mother it is. Then they go back to their blocks.': '초인종이 울린다. 종일반에 남은 아이들이 모두 누구 엄마인지 보러 문으로 몰려온다. 그러고는 다시 블록 놀이로 돌아간다.',
    "Jang asks if they can take the children out to the playground. Someone has to supervise. The young teacher, Ms. Ha, says she'll stay.": '장그래가 아이들을 데리고 놀이터에 나가도 되는지 묻는다. 누군가는 지켜봐야 한다. 젊은 선생님, 하 선생님이 남겠다고 한다.',
    'Ahn pushes the swings. Jang carries a boy on his shoulders. One by one the mothers come, all of them running.': '안영이가 그네를 밀어 준다. 장그래는 남자아이를 목말 태운다. 엄마들이 하나둘 온다. 모두 뛰어서.',
    'Are you two a couple? It feels like you like her.': '두 분 사귀세요? 저분을 좋아하시는 것 같아서요.',
    "She's a coworker I can rely on.": '믿을 수 있는 동료예요.',
    'Sun comes long after dark. Somi is asleep on the bench next to Jang.': '선 차장은 한참 어두워진 뒤에야 온다. 소미는 장그래 옆 벤치에서 잠들어 있다.',
    "Thursday, lunch. My treat. Promises like this are easy to forget, so I'm fixing it now. And come in at eight tomorrow.": '목요일 점심. 내가 살게요. 이런 약속은 잊어버리기 쉬우니까 지금 정해 두는 거예요. 그리고 내일은 여덟 시까지 출근해요.',
    "They work this hard for the three of them, and they're hurting themselves doing it. Things will be easier when Somi's older, he says. He has golf tomorrow.": '셋을 위해 이렇게 열심히 일하는데, 그러면서 스스로를 다치게 하고 있다. 소미가 크면 나아질 거라고 남편은 말한다. 그는 내일 골프가 있다.',
    'Before office hours, a client is already on the phone. Sun rings the bell and keeps talking. Ms. Ha takes Somi in. Sun turns to go.': '업무 시간 전부터 거래처 전화다. 선 차장은 통화를 하며 벨을 누른다. 하 선생님이 소미를 데리고 들어간다. 선 차장이 돌아선다.',
    "Let's say bye to Mummy.": '엄마한테 인사하자.',
    'Somi stands behind the glass door, watching her mother walk away.': '소미는 유리문 뒤에 서서 멀어지는 엄마를 바라본다.',
    'Bye-bye, Mummy!': '엄마, 안녕!',
    "Sun tells the client she'll call back. She comes back, kneels and bows to her daughter, and Somi giggles. She holds her.": '선 차장은 거래처에 다시 전화하겠다고 말한다. 그녀는 돌아와 무릎을 꿇고 딸에게 꾸벅 인사하고, 소미는 까르르 웃는다. 그녀가 딸을 안는다.',
    "She won't put her daughter off for the sake of making a living.": '먹고사는 일 때문에 딸을 뒤로 미루지는 않겠다.',
    'Ten days to the PT. The pair topic is free. The individual topic comes the day before.': 'PT까지 열흘. 페어 주제는 자유. 개인 주제는 전날 나온다.',
    "Fifteen of us. They'll take half, surely?": '우리 열다섯 명이잖아. 반은 뽑겠지?',
    'Last time they started with thirty. Two got in.': '지난번엔 서른 명으로 시작했어. 두 명 붙었고.',
    'Somewhere on the floor a senior bellows at somebody: the calculator does the sums, so how did you get them wrong?': '층 어딘가에서 선배 하나가 누군가에게 고함을 친다. 계산은 계산기가 하는데 어떻게 틀릴 수가 있어?',
    "Culture and trade. Nice idea, boring title. It's not what we sell. It's who we sell to, and why they need it.": '문화와 무역. 아이디어는 좋은데 제목이 지루해요. 중요한 건 뭘 파느냐가 아니에요. 누구에게 파느냐, 그 사람한테 그게 왜 필요하냐죠.',
    "Jang's proposal had one phrase in it: limited by culture. Han builds the whole pitch on it.": '장그래의 기획안에는 한 구절이 있었다. 문화에 갇힌. 한석율은 그 위에 발표 전체를 쌓는다.',
    "A woman in a hot, humid country: does she give up make-up, or want make-up that won't melt? And polypropylene fibre: light, warm, dries fast, but it won't take dye, so nobody uses it. As thermal underwear for long winters, who cares about the colour?": '덥고 습한 나라의 여자는 화장을 포기할까요, 아니면 녹지 않는 화장품을 원할까요? 그리고 폴리프로필렌 섬유. 가볍고 따뜻하고 빨리 마르는데, 염색이 안 돼서 아무도 안 써요. 겨울이 긴 나라의 내복이라면, 색깔 따위 누가 신경 써요?',
    'How do you know all this?': '이런 건 다 어떻게 알아요?',
    'From! The! Internet! Next question.': '인! 터! 넷! 다음 질문.',
    'Is this what fieldwork at the Ulsan plant does to a person?': '울산 공장 현장 실습을 하면 사람이 이렇게 되나?',
    "Nine days to the PT. Ahn's partner, Lee Sang-hyun, is at his old university making a video with the broadcasting club.": 'PT까지 아흐레. 안영이의 파트너 이상현은 모교에서 방송반과 영상을 찍고 있다.',
    "It's a team project. Respect my opinion too. ...Honestly, I've been teamed up with a bomb.": '팀 프로젝트잖아요. 제 의견도 존중해 주세요. ...솔직히, 폭탄이랑 걸렸네.',
    'Who are you calling a bomb?': '누구보고 폭탄이래요?',
    "That's it. The intersection. They don't want an answer from two-month interns. They know more than we do. What matters is the question.": '바로 그거예요. 교집합. 두 달짜리 인턴한테서 답을 원하는 게 아니에요. 그분들이 우리보다 더 잘 아니까. 중요한 건 질문이에요.',
    'What music do you like?': '음악은 뭐 좋아해요?',
    "None. No films, no dramas either. And don't laugh. I like working best.": '없어요. 영화도, 드라마도. 그리고 웃지 마요. 난 일하는 게 제일 좋아요.',
    "That's the secret of his speed. Why would Jang laugh?": '그게 그 속도의 비결이다. 장그래가 왜 웃겠는가?',
    'A week to the PT, and the interns still have their day jobs. Han is sent to the copier again and stands there shaking with fury.': 'PT까지 일주일, 그래도 인턴들의 본업은 그대로다. 한석율은 또 복사기 앞으로 보내지고, 분을 못 이겨 몸을 떨며 서 있다.',
    "Kim's advice to Jang: text on the slides is safer than pictures; the judges sit through a dozen PTs, and words give them a map. Oh's: say the script out loud. Nerves make you fast.": '김 대리가 장그래에게 주는 조언. 슬라이드엔 그림보다 글이 안전하다. 심사위원들은 PT를 열 몇 개씩 듣는데, 글이 있어야 길을 잡는다. 오 과장의 조언. 대본을 소리 내서 읽어 봐라. 긴장하면 빨라진다.',
    "That's Mr. Kim's opinion. I don't call anyone boss who doesn't know what goes on in the field.": '그건 김 대리님 생각이죠. 난 현장이 어떻게 돌아가는지 모르는 사람은 상사로 안 쳐요.',
    "Don't call me 'punk', punk!": '인마라고 부르지 마, 인마!',
    "A fist, a grab, a scuffle. Then a truce of sorts. Do your job in the PT, Han tells him, and don't get in my way.": '주먹 한 방, 멱살, 몸싸움. 그리고 휴전 비슷한 것. PT에서 네 몫이나 해, 한석율이 말한다. 내 앞길 막지 말고.',
    'The bombs are fighting.': '폭탄들이 싸우네.',
    "Look who's talking. Let's go, nuclear bomb.": '누가 할 소리. 가요, 핵폭탄.',
    "Eight o'clock at night. Every intern is hanging about outside the tower. Their phones all go off at once.": '밤 여덟 시. 인턴들이 모두 타워 앞에서 서성인다. 휴대폰이 일제히 울린다.',
    'From Human Resources: what would you sell to your team-project partner, and why?': '인사팀 공지: 팀 프로젝트 파트너에게 무엇을 팔 것인가, 그리고 그 이유는?',
    "They have to sell something to the last person they'd want to sell to.": '가장 팔고 싶지 않은 상대에게 뭔가를 팔아야 한다.',
    "Whatever you sell, your partner's answer will show how you judged him. The other person will tell you who you are.": '무엇을 팔든, 파트너의 대답이 당신이 그를 어떻게 판단했는지 보여 줄 것이다. 상대가 당신이 누구인지 말해 줄 것이다.',
    'Some interns live in the catalogue room. Some trawl the internet. Lee rings a friend who sells insurance.': '어떤 인턴들은 카탈로그실에서 산다. 어떤 인턴들은 인터넷을 뒤진다. 이상현은 보험 영업하는 친구에게 전화를 건다.',
    "A pen? Everything made in the field ends up on paper in the office. But a pen won't persuade Han.": '펜? 현장에서 만든 모든 건 결국 사무실의 종이 위로 온다. 하지만 펜으로는 한석율을 설득 못 한다.',
    'Oh is in the lobby, on his way out to a factory.': '오 과장은 로비에 있다. 공장에 가는 길이다.',
    'Is the field as important as the office?': '사무실도 현장만큼 중요한가요?',
    'Important in different ways. If only the field mattered, why would we need a building this size? Everything made in the field is finished in the office. You run till your feet burn out there, and you sweat your feet in here.': '중요한 방식이 다른 거지. 현장만 중요하면 이렇게 큰 건물이 왜 필요하겠어? 현장에서 만든 건 다 사무실에서 완성되는 거야. 현장에선 발바닥에 불나게 뛰고, 여기선 발에 땀 나게 뛰는 거지.',
    'Sweat your feet in here. Jang thanks him and runs back inside.': '발에 땀 나게. 장그래는 고맙다고 인사하고 안으로 뛰어 들어간다.',
    "Executives in the front row, department heads behind, Oh among them. One executive smiles at the company video; Jang guesses he's remembering a mine contract and his years in the field. He hopes Han gets a middle age with moments like that.": '앞줄엔 임원들, 그 뒤엔 부서장들, 그 사이에 오 과장. 회사 홍보 영상에 한 임원이 미소 짓는다. 광산 계약과 현장 시절을 떠올리는 거라고 장그래는 짐작한다. 한석율의 중년에도 그런 순간이 있기를 바란다.',
    "Ten minutes to present, five for questions, nothing that wasn't submitted, and the clock starts when your names are called.": '발표 10분, 질의응답 5분, 제출하지 않은 자료는 사용할 수 없고, 이름이 불리는 순간부터 시간이 갑니다.',
    "Next! Come back in proper clothes. We're not here to play.": '다음! 제대로 된 옷 입고 다시 와. 놀러 온 거 아니야.',
    'Ahn and Lee: Avatar, global companies stripping the resources of poor countries, and an alternative. Ahn presents alone and never once looks at the screen.': '안영이와 이상현. 아바타, 가난한 나라의 자원을 빼앗는 글로벌 기업들, 그리고 대안. 안영이는 혼자 발표하고, 단 한 번도 화면을 보지 않는다.',
    "Mr. Lee hasn't said a word. Ms. Ahn, why didn't you warn your partner?": '이상현 씨는 한마디도 안 했는데. 안영이 씨, 왜 파트너한테 미리 말 안 했어요?',
    "Because we're being interviewed for the job.": '저희는 지금 채용 면접을 보고 있는 거니까요.',
    'Next!': '다음!',
    "One presenter forgets his lines and asks to start again. One mixes up risks and crises. One admits he chose this company because he didn't think he'd get in anywhere better.": '한 발표자는 대사를 잊어버리고 처음부터 다시 하게 해 달라고 한다. 누구는 리스크와 위기를 혼동한다. 누구는 더 좋은 데는 못 갈 것 같아서 이 회사를 골랐다고 털어놓는다.',
    'Are you asking us to hire you or not?': '뽑아 달라는 거야, 말라는 거야?',
    'One team has a flashy show and is told it belongs at an advertising firm. One runs out of time. One quotes 2010 figures, when the company has its own research institute.': '한 팀은 화려한 쇼를 하고 광고 회사에나 어울리겠다는 소리를 듣는다. 한 팀은 시간이 모자란다. 한 팀은 2010년 자료를 인용한다. 회사에 자체 연구소가 있는데도.',
    "Only Ahn hasn't lost the war of nerves. The judges mutter that they may hire a record low. How many last year? Two. Then one?": '신경전에서 지지 않은 건 안영이뿐이다. 심사위원들이 역대 최저 채용이 되겠다고 수군거린다. 작년엔 몇 명? 두 명. 그럼 이번엔 한 명?',
    'Next: Jang Geu-rae and Han Seok-yul. Han has always been the confident one. He swallows, and swallows again.': '다음: 장그래, 한석율. 늘 자신만만하던 한석율이다. 그가 침을 삼킨다. 또 삼킨다.',
    "In his team's office the phones keep ringing for him. On his desk his mobile buzzes: a text from Mum. Did you take your anxiety medicine?": '그의 팀 사무실에선 그를 찾는 전화가 계속 울린다. 책상 위에서 휴대폰이 진동한다. 엄마의 문자다. 불안증 약은 먹었니?',
    'He forgot.': '깜빡했다.',
    'Our topic is a proposal for people limited by culture. Culture is defined as...': '저희 주제는 문화에 갇힌 사람들을 위한 제안입니다. 문화란...',
    "He's reading it off the page, breathing hard.": '그는 원고를 읽고 있다. 숨이 가쁘다.',
    'Is something chasing you? Catch your breath.': '누가 쫓아오나? 숨 좀 돌려.',
    "May I take my medicine, sir? It's a drink. I'll be quick.": '약 좀 먹어도 되겠습니까? 마시는 겁니다. 금방 하겠습니다.',
    "He gulps it, and sprays it out coughing. He can't speak.": '그는 벌컥 들이켜다가 기침과 함께 내뿜는다. 말을 못 한다.',
    'Seven minutes left.': '7분 남았습니다.',
    "My partner choked on his drink. I'll continue.": '제 파트너가 사레가 들렸습니다. 제가 이어서 하겠습니다.',
    'Jang knows the material. He has never presented. He stammers.': '장그래는 내용을 안다. 발표는 해 본 적이 없다. 말을 더듬는다.',
    "Someone's paying attention to Geu-rae.": '누가 그래를 눈여겨보고 있네.',
    "It's hard to listen to. No business vocabulary. Have you ever been out in the field? To a factory? You've never left the office, have you?": '듣기가 힘드네. 비즈니스 용어가 하나도 없어. 현장에 나가 본 적 있나? 공장에? 사무실 밖으로 나가 본 적 없지?',
    'No, sir.': '없습니다.',
    "A small boy tells his father his fingernails are dirty. Grease, the father says. It won't come off. Are you ashamed? Then a strike, and everyone who joined it is fired, and a boy in the street jeers at the factory man with no job.": '어린 소년이 아버지에게 손톱이 더럽다고 말한다. 기름때야, 아버지가 말한다. 안 빠져. 창피하니? 그러다 파업이 일어나고, 참여한 사람은 모두 해고되고, 길에서 한 아이가 일자리 잃은 공장 사람을 놀린다.',
    'Han tips his head back. His lip trembles. Yes. The field is the best.': '한석율이 고개를 젖힌다. 입술이 떨린다. 그래. 현장이 최고다.',
    "Well done, Mr. Jang. I'm sorry for the trouble. I'll pick up where he left off.": '수고했어요, 장그래 씨. 폐 끼쳐서 미안해요. 제가 이어서 하겠습니다.',
    "Dad. I'm not ashamed of you. Or of the field.": '아버지. 저는 아버지가 부끄럽지 않아요. 현장도요.',
    'Now Han speaks the language of the field: full-container loads, the forwarder, the plant. The executive who once worked a mine is smiling.': '이제 한석율은 현장의 언어로 말한다. FCL, 포워더, 공장. 한때 광산에서 일했던 임원이 미소 짓고 있다.',
    "It's never been traded from Korea, so your costing's an estimate. Did you get it right? Too much for you?": '한국에서 거래된 적 없는 품목이니 원가 계산은 추정치일 텐데. 맞게 했나? 자네한텐 벅찬가?',
    "Too much, sir? I'll work it out now.": '벅차냐고요? 지금 계산해 보겠습니다.',
    "He has Jang read him the numbers. The exchange rate? Look it up yourself, sir, he says. I'm past that. The estimate is right.": '그는 장그래에게 숫자를 불러 달라고 한다. 환율이요? 그건 직접 찾아보시면 됩니다, 하고 그는 말한다. 그 단계는 지났습니다. 추정치는 정확합니다.',
    "And freight? Didn't it go up with oil?": '운임은? 유가 따라 오르지 않았나?',
    "Han hesitates. A voice from the interns' seats:": '한석율이 머뭇거린다. 인턴석에서 목소리가 들린다.',
    "No, sir. Air freight rose sixteen point six per cent. Sea and land didn't. And on a CNF contract the exporter pays cost and freight.": '아닙니다. 항공 운임은 16.6퍼센트 올랐지만, 해상과 육상은 오르지 않았습니다. 그리고 CNF 계약에선 수출자가 원가와 운임을 부담합니다.',
    "Th-that's what I meant.": '그, 그게 제가 하려던 말입니다.',
    "Don't tell me you're the president's daughter. Or staff pretending to be an intern.": '설마 사장 딸은 아니겠지. 아니면 인턴인 척하는 직원이거나.',
    "Jang didn't stand out today.": '장그래는 오늘 눈에 안 띄었어.',
    "He wrote the text and found the papers. Speaking isn't writing. If you don't hold the room, the words go thin. That's his limit, for now. I'd like him to stay.": '원고는 그 친구가 썼고, 자료도 그 친구가 찾았습니다. 말하는 건 쓰는 것과 다릅니다. 좌중을 못 잡으면 말이 힘을 잃죠. 지금으로선 그게 그 친구 한계입니다. 남았으면 좋겠습니다.',
    "I hope he doesn't fall for the question tomorrow. It's a paradox.": '내일 질문에 안 넘어가야 할 텐데. 역설이거든.',
    "The next day. Each intern sells to their partner, the partner says whether they'll buy and why, and the questions come from the seniors of each intern's own team.": '다음 날. 인턴은 각자 파트너에게 물건을 팔고, 파트너는 살지 말지와 그 이유를 말하며, 질문은 각 인턴이 속한 팀의 선배들이 던진다.',
    "Ahn plays it safe and doesn't stand out, because she doesn't need to. A judge writes: a textbook.": '안영이는 안전하게 가고 튀지 않는다. 튈 필요가 없으니까. 한 심사위원이 적는다. 교과서.',
    "Synthetic textiles from our Ulsan plant. Nylon, polyester, acrylic, polypropylene. And with them, this notebook: the losses, the miscommunication, the conditions on the line. I'm selling Mr. Jang the voice of the field.": '울산 공장의 합성섬유입니다. 나일론, 폴리에스터, 아크릴, 폴리프로필렌. 그리고 이 노트를 함께 드립니다. 손실, 소통 실패, 생산 라인의 환경. 저는 장그래 씨에게 현장의 목소리를 팝니다.',
    "I'll buy the notebook. Not the textiles.": '노트는 사겠습니다. 섬유는 안 삽니다.',
    'Why?': '왜요?',
    "Because I want to sell them with Mr. Han. I'll study these notes so I'm not a burden to him. Can we sell them together?": '한석율 씨와 함께 팔고 싶기 때문입니다. 이 노트로 공부해서 짐이 되지 않겠습니다. 같이 팔아도 되겠습니까?',
    "I'll answer when I've seen what you're selling me.": '그건 장그래 씨가 파는 걸 보고 답하죠.',
    "My boss's dress shoes. Clean, because office workers rarely go out, but must look right when they do. And these, the same man's slippers, the spikes worn down to the shape of his foot. The office is a field too. I'm selling you the combat boots of the office.": '제 상사의 구두입니다. 사무직은 밖에 나갈 일이 드물어 깨끗하지만, 나갈 땐 제대로 갖춰야 합니다. 그리고 이건 같은 분의 슬리퍼입니다. 지압 돌기가 그분 발 모양대로 닳았습니다. 사무실도 현장입니다. 저는 사무실의 전투화를 팝니다.',
    "I won't buy them. Call the office the field? A few sheets of office paper can get a whole line fired. Real combat boots have steel toes, so a dropped tool doesn't break your foot.": '안 삽니다. 사무실이 현장이라고요? 사무실 종이 몇 장이면 라인 하나가 통째로 잘려 나갑니다. 진짜 전투화는 앞코에 쇠가 들어 있어요. 공구를 떨어뜨려도 발이 안 부러지게.',
    "I won't buy your product!": '당신 상품은 안 삽니다!',
    'The packed train in. Ten departments to agree one number. A lawyer over a single line of a contract. All night, waiting for a buyer abroad to say yes. What the factory makes starts as a row of decisions.': '꽉 찬 출근 전철. 숫자 하나에 합의해야 하는 열 개 부서. 계약서 한 줄을 붙들고 씨름하는 변호사. 해외 바이어의 승낙을 기다리는 밤. 공장이 만드는 것은 줄지은 결정들에서 시작된다.',
    'His teacher: there is no meaningless stone on the board. A stone in a dead group means a misreading; leave it to die, and use it to win.': '스승의 말. 바둑판 위에 의미 없는 돌은 없다. 죽은 대마 속의 돌은 수읽기가 틀렸다는 뜻이다. 사석으로 버리고, 이기는 데 써라.',
    "No product this company makes exists for no reason. A failed one means a bad estimate. You learn from it. I don't think my field is so different from yours.": '이 회사가 만드는 상품 중에 이유 없이 존재하는 건 없습니다. 실패한 상품은 잘못된 추정이란 뜻이죠. 거기서 배웁니다. 제 현장이 한석율 씨의 현장과 그렇게 다르다고 생각하지 않습니다.',
    'Han looks at the slippers for a long moment. He steps out of his own shoes and into them.': '한석율이 한참 동안 슬리퍼를 내려다본다. 자기 구두를 벗고 그 슬리퍼에 발을 넣는다.',
    "I'll... buy these slippers. And let's sell those together.": '이 슬리퍼… 사겠습니다. 그리고 저건 같이 팝시다.',
    'You did well. Not all of you will get in. But I hope to see you again.': '모두 수고했어요. 전부 붙진 못할 거예요. 그래도 다시 볼 수 있으면 좋겠어요.',
    'That night Han carries two bags into an empty office and drops a new pair of slippers under every desk.': '그날 밤 한석율은 가방 두 개를 들고 빈 사무실로 들어가, 책상마다 새 슬리퍼를 한 켤레씩 놓는다.',
    "For a week he sleeps, and doesn't touch the computer. He replays Cho Chikun's game, the one he played in a wheelchair, so he can accept whatever comes.": '일주일 동안 그는 잠만 자고 컴퓨터는 건드리지 않는다. 조치훈의 그 대국, 휠체어에 앉아 둔 그 대국을 다시 놓아 본다. 무엇이 오든 받아들일 수 있도록.',
    'A week later he logs in. All over Seoul, phones chime.': '일주일 뒤 그는 로그인한다. 서울 곳곳에서 휴대폰이 울린다.',
    'Intern Jang Geu-rae. Hired as a contract worker for two years.': '인턴 장그래. 2년 계약직으로 채용.',
    'Mum. I... I think I got a job. Thank you.': '엄마. 나… 나 취직한 것 같아. 고마워요.',
    'The first day. Han at the door: not bad. A fist bump. Then Ahn and Baek-gi, who of course got in.': '첫날. 문 앞의 한석율: 나쁘지 않네요. 주먹 인사. 그리고 당연히 붙은 안영이와 장백기.',
    "The president reads Ahn's file: two companies already, an executive track she walked away from because it was too easy. To Jang he says nothing at all.": '사장은 안영이의 서류를 읽는다. 이미 두 회사를 거쳤고, 너무 쉬워서 임원 코스를 박차고 나온 사람. 장그래에게는 아무 말도 하지 않는다.',
    'For the next two years Jang belongs to the team whose leader asked for him: Sales Team 3, the Storm Troops.': '앞으로 2년, 장그래는 팀장이 직접 그를 요청한 팀에 속한다. 영업 3팀, 돌격대.',
    'Tradition, says Oh: the new hires choose their first work suits at a department store. The prices are four, six hundred thousand won. Card or cash? They panic. Oh and Kim are behind a rail, laughing.': '오 과장 말로는 전통이다. 신입은 백화점에서 첫 출근 정장을 고른다. 가격은 40만 원, 60만 원. 카드요, 현금이요? 그들은 당황한다. 오 과장과 김 대리는 옷걸이 뒤에서 웃고 있다.',
    'A suit? On what you earn? Here. Our gift to new people.': '정장? 너희 월급으로? 자. 신입한테 주는 우리 선물이다.',
    'Black ties for the men. A black scarf for Ahn.': '남자들에겐 검은 넥타이. 안영이에겐 검은 스카프.',
    'Put them on now. We have somewhere to go.': '지금 매. 갈 데가 있다.',
    'Past the subway exit, along a stone wall, banners: give back the jobs of the wrongly fired.': '지하철 출구를 지나 돌담을 따라 현수막이 걸려 있다. 부당 해고자들의 일자리를 돌려 달라.',
    "A tarpaulin tent on the pavement. A portrait with a black ribbon, rows of names, candles, flowers. Workers laid off from a car plant, and the ones who didn't live to see it end.": '인도 위의 방수포 천막. 검은 리본을 두른 영정, 줄지은 이름들, 촛불, 꽃. 자동차 공장에서 해고된 노동자들, 그리고 끝을 보지 못하고 떠난 이들.',
    "To live by your work is to endure, whatever comes. It's the road toward a life that's complete.": '일로 먹고산다는 건, 무슨 일이 와도 견뎌 낸다는 거다. 그게 완생으로 가는 길이다.',
    'Look here.': '여기 봐요.',
    'Ahn takes his photo. Behind him, an office tower. In front of him, the first day of two years.': '안영이가 그의 사진을 찍는다. 그의 뒤엔 오피스 타워. 그의 앞엔 2년의 첫날.',
    'Not yet. What does an office worker wear into battle?': '아직이야. 직장인은 무엇을 신고 싸우나?',
    'Not that one. Look again.': '그게 아니야. 다시 봐.',
    "Ten years, and I've never once pushed. Jang is watching.": '10년, 한 번도 밀어붙인 적이 없다. 장그래가 보고 있다.',
    'He knows what he has to say.': '그는 무슨 말을 해야 하는지 안다.',
    'Not yet. Again.': '아직이야. 다시.',
    'A clever trick means his game has been going badly. Answer it plainly.': '꼼수는 판이 나빴다는 뜻이다. 정수로 받아라.',
    'The proper move.': '정수.',
    'Still a trick. Again.': '아직 꼼수다. 다시.',
    'The note says save yourself. Abandon the stones in danger.': '쪽지에는 대리님부터 살라고 적혀 있다. 위험에 빠진 돌은 버려라.',
    'He stands up.': '그가 일어선다.',
    'Again.': '다시.',
    'One by one. Nobody gets left on the bench.': '하나씩. 벤치에 남는 아이는 없다.',
    'All of them, home.': '모두, 집으로.',
    "One's left behind. Again.": '하나가 남았다. 다시.',
    'Work, or the girl who watches my back every morning?': '일인가, 매일 아침 내 뒷모습을 지켜보는 아이인가?',
    'She turns round.': '그녀가 돌아선다.',
    'Take territory underneath while White builds in the centre.': '백이 중앙을 쌓는 동안 아래쪽 실리를 챙겨라.',
    'Black 23.': '흑 23.',
    'Fast players have the temperament and the speed of reading. Both.': '속기파는 기질도, 수읽기의 속도도 갖췄다. 둘 다.',
    'There.': '거기.',
    "He's further ahead. Again.": '그가 더 앞서 있다. 다시.',
    'No compromise. Straight into him.': '타협은 없다. 정면으로 부딪쳐라.',
    'Black 25.': '흑 25.',
    'The field is finished in the office. Then what does the office stand in?': '현장은 사무실에서 완성된다. 그럼 사무실은 무엇을 딛고 서 있나?',
    'He knows where to look.': '그는 어디를 봐야 하는지 안다.',
    'Not that. Again.': '그거 말고. 다시.',
    'Safety first, like every intern in this room. Or is it?': '이 방의 다른 인턴들처럼 안전 제일. 정말 그럴까?',
    'Black 27.': '흑 27.',
    "Sales 3, at night: find what you'll sell Han. Then the PT.": '밤의 영업 3팀. 한석율에게 팔 것을 찾아라. 그다음은 PT.',
    "I wrote it. I've never said it out loud to anyone.": '내가 썼다. 하지만 누구 앞에서도 소리 내어 말해 본 적은 없다.',
    'Seven minutes. Again.': '7분. 다시.',
    'Too much for me? Count it. Every point.': '나한테 벅차다고? 세어 봐. 한 집도 빠짐없이.',
    'The estimate holds.': '추정치는 버틴다.',
    'Count again.': '다시 세어 봐.',
    "If I buy it all, he shines. If I refuse it all, I'm petty.": '다 사 주면 그가 빛난다. 다 거절하면 내가 쩨쩨해진다.',
    "He knows what he's buying.": '그는 자기가 무엇을 사는지 안다.',
    'Territory, and the real game begins.': '실리. 그리고 진짜 대국이 시작된다.',
    'Black 33.': '흑 33.',
    'Challenge': '도전',
    'Jang Geu-rae spent his childhood at a baduk board and never turned professional. At twenty-six, with no degree, he is an intern at One International, a trading company, on Sales Team 3 under section head Oh Sang-sik.': '장그래는 어린 시절을 바둑판 앞에서 보냈지만 끝내 입단하지 못했다. 스물여섯, 대학 졸업장도 없이, 그는 무역회사 원인터내셔널 영업 3팀에서 오상식 과장 밑의 인턴으로 일한다.',
    "In two weeks the interns sit the PT, the presentation test that decides who stays. Jang's partner is Han Seok-yul, who believes only in the factory floor. The top of the intake is Ahn Young-yi, who believes in nobody's help.": '2주 뒤 인턴들은 PT를 치른다. 누가 남을지 정하는 프레젠테이션 시험이다. 장그래의 파트너는 공장 현장만 믿는 한석율. 동기 수석은 누구의 도움도 믿지 않는 안영이다.',
    'Book 3: Style': '3권: 기풍',
    'Thirty-three moves played. Jang is in, on a two-year contract, with a desk on Sales Team 3 and a black tie.': '33수까지 두었다. 장그래는 붙었다. 2년 계약, 영업 3팀의 책상 하나, 그리고 검은 넥타이.',
    'Next: a first month of real work, and finding out what kind of player each of them is.': '다음: 진짜 일의 첫 달, 그리고 저마다 어떤 기풍의 기사인지 알아 가는 시간.',
    "Jang's note": '장그래의 쪽지',
    'BE IRRESPONSIBLE!': '무책임해지세요!',
    "Oh's slippers": '오 과장의 슬리퍼',
    'Mummy, in her office suit, seen from behind: walking away, a phone at her ear.': '정장 차림의 엄마, 뒷모습이다. 전화기를 귀에 대고 걸어가고 있다.',
    "This is me. She's drawn me from behind.": '이게 나야. 뒷모습을 그렸네.',
    "That's the drawing. Not her face. Her back, walking away. It's what Somi sees every morning.": '그 그림이다. 얼굴이 아니라, 걸어가는 뒷모습. 소미가 매일 아침 보는 모습이다.',
    'The bakery': '빵집',
    'The roof': '옥상',
    "The smokers' corner": '흡연 구역',
    'The corridor, by the staff room': '복도, 직원실 앞',
    "The president's office": '사장실',
    'The executive meeting room': '임원 회의실',
    'Sales Team 3': '영업 3팀',
    'Your desk': '네 자리',
    "Oh's desk": '오 과장 자리',
    "The daycare's glass door": '어린이집 유리문',
    "Sun Ji-young's flat": '선지영의 집',
    'The reference room': '자료실',
    'The plaza, at night': '밤의 광장',
    'The lobby': '로비',
    'The PT hall': 'PT 홀',
    "The interns' seats": '인턴석',
    'The podium': '단상',
    "The evaluators' table": '심사위원석',
    "Jang's home": '장그래의 집',
    'The memorial tent': '분향소',
    "Under Oh's desk, among cables and dust: a pair of brown office slippers, the massage spikes worn down to the shape of his foot. The office worker's combat boots.": '오 과장 책상 밑, 전선과 먼지 사이에 갈색 사무실 슬리퍼 한 켤레. 지압 돌기가 그의 발 모양대로 닳아 있다. 사무직의 전투화.',
    "Oh's desk. You've already taken the slippers.": '오 과장 자리. 슬리퍼는 이미 챙겼다.',
    'Section head Oh reads a contract, red pen in hand, heels out of his office slippers under the desk.': '오 과장은 빨간 펜을 들고 계약서를 읽는다. 책상 밑에서 발뒤꿈치가 사무실 슬리퍼 밖으로 빠져나와 있다.',
    'A bakery': '빵집',
    'The counter, the till, a bell': '계산대, 금전등록기, 종',
    'Bread, still warm': '아직 따뜻한 빵',
    'Milk and coffee in the fridge': '냉장고 속 우유와 커피',
    "The supplier's building": '협력업체 건물',
    "The supplier's corridor": '협력업체 복도',
    "A noticeboard: the month's orders": '게시판: 이달의 주문',
    'Samples in boxes': '상자에 든 샘플',
    'A bench for visitors': '방문객용 벤치',
    'The staff room': '직원실',
    'A kettle and paper cups': '전기 주전자와 종이컵',
    "The president's desk": '사장 책상',
    'Samples and plaques': '샘플과 감사패',
    'The playroom': '놀이방',
    'The teacher': '선생님',
    'The long table': '긴 테이블',
    'The head of the table': '상석',
    'Trade directories, ten years of them': '10년 치 무역 디렉토리',
    'Binders: past PTs, past proposals': '바인더: 지난 PT, 지난 기획서',
    'A reading table': '열람 테이블',
    'The podium, and the laptop on it': '단상과 그 위의 노트북',
    'A water cooler': '정수기',
    'A delivery man stacks boxes by the door. “Second floor. Mind the stairs.”': '택배 기사가 문 옆에 상자를 쌓는다. “2층이에요. 계단 조심하세요.”',
    'The teacher, counting coats on the pegs. “Going-home time is seven. On the dot.”': '선생님이 옷걸이의 외투를 센다. “하원은 일곱 시예요. 정각에.”',
    "A small boy with a toy car. “Are you somebody's dad?”": '장난감 자동차를 든 남자아이. “누구 아빠예요?”',
    'A girl in a yellow raincoat, watching the door.': '노란 우비를 입은 여자아이가 문을 지켜본다.',
    'A grandmother with a pushchair. “They all run to the door when it opens. Every one of them.”': '유모차를 끄는 할머니. “문만 열리면 애들이 다 문으로 달려가요. 하나도 빠짐없이.”',
    'The bakery on Jongno, before work.': '출근 전, 종로의 빵집.',
    'Up to the roof.': '옥상으로.',
    "The supplier's office, up the stairs.": '계단 위, 협력업체 사무실.',
    "The president's office, at the end of the corridor.": '복도 끝, 사장실.',
    'The executive meeting room, seventeenth floor.': '17층, 임원 회의실.',
    'Sales Team 3.': '영업 3팀.',
    'The daycare, before it closes.': '문 닫기 전에, 어린이집으로.',
    'Home.': '집으로.',
    'The daycare, in the morning.': '아침, 어린이집.',
    'The reference room, twelfth floor.': '12층, 자료실.',
    'Out on the plaza in front of the tower.': '건물 앞 광장으로.',
    'The lobby.': '로비.',
    'The PT hall, fourth floor.': '4층, PT 홀.',
    'Your desk, Sales Team 3.': '영업 3팀, 네 자리.',
    'Daehanmun, the tent by the wall.': '대한문, 담장 옆 천막.',
    "Two weeks to the PT, and Jang has never seen anyone in this company actually sell. He's about to watch two people at work: a salesman who is too kind, and a deputy head who can't be in two places at once.": 'PT까지 2주. 장그래는 이 회사에서 누군가 실제로 파는 모습을 본 적이 없다. 이제 두 사람의 일을 보게 된다. 너무 착한 영업 사원, 그리고 몸이 두 개라도 모자란 차장.',
    'Park Jong-gi, assistant manager, IT Sales. Four years in the job, and always the nice one.': '박종기, IT 영업팀 대리. 입사 4년 차, 언제나 착한 사람.',
    "All morning his team leader's voice follows him down the street: the price, the delays at the Guangzhou plant, and the night a restaurant gave the team extra meat and Park made everyone pay for it. Whose side is he on?": '오전 내내 팀장의 목소리가 거리까지 그를 따라온다. 가격, 광저우 공장의 납기 지연, 그리고 회식 때 식당이 서비스로 준 고기값을 굳이 다 내게 했던 일. 너는 대체 누구 편이냐?',
    "In the alley by his front gate he sits down and doesn't go in. He's happy: a wife, a son, a home, all resting on a job he's afraid of. That's the trouble. He doesn't have the nerve to carry this much happiness.": '집 앞 골목에서 그는 주저앉아 들어가지 못한다. 그는 행복하다. 아내, 아들, 집. 그 모든 게 그가 두려워하는 일 위에 놓여 있다. 그게 문제다. 이만한 행복을 감당할 자신이 없다.',
    "The next morning, on the roof. Thirteen days to the interns' PT, not that Park knows or cares. An envelope in his hand: RESIGNATION LETTER.": '다음 날 아침, 옥상. 인턴들의 PT까지 13일. 박 대리가 알 바도, 상관할 바도 아니다. 그의 손에 봉투 하나. 사직서.',
    "No trick of his own. He takes the president at his word, out loud, where it can't be taken back.": '자기 꼼수가 아니다. 사장의 말을 그대로 받아, 되돌릴 수 없게 소리 내어 못 박았을 뿐이다.',
    'How long have you been with us?': '우리 회사 몇 년 차지?',
    'Four years, sir.': '4년 차입니다, 상무님.',
    "You're a sentimental man. Nobody drops a ten-year partner over this. Bring me their president.": '감성적인 사람이군. 이런 일로 10년 된 협력사를 버리진 않아. 그쪽 사장 데려와.',
    'Park takes the envelope out of his jacket and feeds it to the shredder.': '박 대리는 재킷에서 봉투를 꺼내 파쇄기에 넣는다.',
    "That evening he calls his wife. Their son won't go to the academy after all. Let the boy have time to think.": '그날 저녁 그는 아내에게 전화한다. 아들은 학원에 보내지 않기로 한다. 아이에게 생각할 시간을 주자고.',
    "You can't play another man's game for him. In twelve days Jang will have to play his own.": '남의 바둑을 대신 둘 수는 없다. 12일 뒤, 장그래는 자기 바둑을 둬야 한다.',
    'He puts the note face down.': '그는 쪽지를 뒤집어 놓는다.',
    "Twelve days to the PT. The supplier signs a new contract: three per cent off for two years. Park isn't punished. He writes a report on what went wrong.": 'PT까지 12일. 협력업체는 새 계약서에 서명한다. 2년간 3퍼센트 할인. 박 대리는 징계를 받지 않는다. 대신 무엇이 잘못됐는지 보고서를 쓴다.',
    'Should I add the delivery figures?': '납기 수치도 넣을까요?',
    'Ask Mr. Han. You picked him as your partner over everyone in the intake. I hold grudges.': '한석율 씨한테 물어보세요. 동기들 다 놔두고 그 사람을 파트너로 골랐잖아요. 저 뒤끝 있어요.',
    "Late at night. Through the kitchen door, her husband is washing up. Somi is asleep. In Somi's bag there's a crayon drawing.": '늦은 밤. 부엌 문 너머로 남편이 설거지를 한다. 소미는 잠들었다. 소미 가방에 크레파스 그림이 하나 있다.',
    'Jang is in at eight, as Sun told them. Sun is late, and comes in looking lighter.': '장그래는 선 차장 말대로 여덟 시에 출근한다. 선 차장은 늦게, 한결 가벼운 얼굴로 들어온다.',
    'On Thursday she takes them to lunch, as promised, and shows them a new drawing from Somi. This time Mummy has a face.': '목요일, 선 차장은 약속대로 두 사람에게 점심을 사고, 소미가 새로 그린 그림을 보여 준다. 이번엔 엄마에게 얼굴이 있다.',
    "Back at his desk the phone rings: Ms. Ha, from the daycare, asking if he'd like a drink some time.": '자리로 돌아오자 전화가 울린다. 어린이집의 하 선생님이다. 언제 술 한잔하지 않겠느냐고.',
    "The intern in glasses from the study group, Jang Baek-gi, top school and top marks, asks what they're all thinking.": '스터디 모임의 그 안경 쓴 인턴, 명문대에 학점까지 좋은 장백기가 다들 궁금해하던 걸 묻는다.',
    'Then Han is back from the Ulsan plant and bursts into the reference room: Geu-rae! Great, great! Champagne when the results come out.': '그때 울산 공장에서 돌아온 한석율이 자료실로 뛰어든다. 그래 씨! 좋아요, 좋아! 결과 나오면 샴페인 터뜨려요.',
    "Baek-gi and his partner pool their research and find it's identical, down to the same typo. They both paid for the same website.": '장백기와 그의 파트너는 자료를 모아 보고 똑같다는 걸 알게 된다. 오타까지 똑같다. 둘 다 같은 사이트에 돈을 냈던 것이다.',
    'Some customs people embrace, and some feel like a cage. There has to be a point in between that satisfies both.': '어떤 관습은 받아들이고, 어떤 관습은 굴레처럼 느끼죠. 양쪽을 다 만족시키는 중간 지점이 있어야 해요.',
    "Isn't a business that satisfies that person a business that satisfies everyone? We end the PT on that question, and we put it to the man who decides: the president.": '그 사람을 만족시키는 사업이야말로 모두를 만족시키는 사업 아닐까요? PT를 그 질문으로 끝내는 거예요. 그리고 결정하는 사람한테 던지죠. 사장님한테.',
    "Han thinks like a fast baduk player. Every time Jang says he'll read up on something, Han has already named the book and dismissed it.": '한석율은 속기 바둑 기사처럼 생각한다. 장그래가 뭘 좀 찾아보겠다고 할 때마다, 한석율은 이미 책 제목을 대고 깎아내린 뒤다.',
    'That evening, waiting outside the tower, Jang goes back over the day.': '그날 저녁, 건물 밖에서 기다리며 장그래는 하루를 되짚는다.',
    "Sun said fewer words and more pictures; Kim says words. Each is right for their own audience, and the judges are Kim's.": '선 차장은 글은 줄이고 그림을 늘리라 했고, 김 대리는 글이라고 한다. 둘 다 각자의 청중에겐 맞는 말이고, 심사위원은 김 대리 쪽 청중이다.',
    "But he's my boss.": '그래도 제 상사잖아요.',
    "Your boss? We're both interns, punk.": '상사? 우리 둘 다 인턴이야, 인마.',
    'The files go in on a CD. Then the stopwatch: Han runs fourteen minutes, then seventeen, and his hands shake on the script. The limit is ten, and five for questions. He has memorised every sentence, and they shout at each other over which ones to cut.': '파일은 CD로 제출한다. 그리고 스톱워치. 한석율은 14분, 다시 17분을 쓴다. 대본을 쥔 손이 떨린다. 제한은 발표 10분, 질의응답 5분. 그는 문장 하나하나를 다 외웠고, 둘은 어느 문장을 뺄지를 두고 고함을 지른다.',
    "The first pair, Jang Ki-seok and Ku Hyun-woo, flap up the aisle in onesies and swimming flippers: they're the Jang-Ku Team, here to leave their footprints on the world.": '첫 번째 팀, 장기석과 구현우가 우주복 같은 옷에 오리발을 신고 통로를 철퍽철퍽 걸어 나온다. 세상에 발자국을 남기러 온 장구 팀이란다.',
    'Nobody in the room is laughing now.': '이제 웃는 사람은 아무도 없다.',
    'The Jang-Ku Team come back in suits. A judge spots the company logo on their slide, screen-captured off the website.': '장구 팀이 정장으로 갈아입고 돌아온다. 심사위원 하나가 슬라이드의 회사 로고를 알아본다. 홈페이지에서 화면 캡처한 것이다.',
    "His old baduk teacher's voice: there's no such thing as a stone played for no reason. Chance is a gift to those already prepared. So shall we get ready?": '옛 바둑 스승의 목소리. 이유 없이 놓는 돌은 없다. 우연은 준비가 끝난 사람에게 오는 선물이다. 그럼 준비해 볼까?',
    'Han hears Jang\'s "No, sir", plain and unashamed, and remembers.': '한석율은 장그래의 "아닙니다"를 듣는다. 담담하고, 부끄러움 없는 대답. 그리고 기억한다.',
    'Wallets, a belt, a brag about shoes. Baek-gi sells his partner a hand mirror: learn to manage your face before you do business. The partner, red to the ears, buys it.': '지갑, 벨트, 구두 자랑. 장백기는 파트너에게 손거울을 판다. 장사하기 전에 표정 관리부터 하라고. 귀까지 빨개진 파트너는 그것을 산다.',
    "In the second row, Oh looks down at his socks. So that's where they went.": '둘째 줄에서 오 과장이 양말 신은 자기 발을 내려다본다. 어디 갔나 했더니.',
    "That's the end of the PT. Results by email and text, in a week.": '이로써 PT는 끝이다. 결과는 일주일 뒤 이메일과 문자로.',
    'Back upstairs, the interns clear their desks into boxes.': '위층으로 돌아온 인턴들은 책상을 상자에 정리한다.',
    "In the lobby on the way out, Jang tells Ahn she was amazing. She shrugs: she's done this a few times before.": '나가는 길에 로비에서 장그래가 안영이에게 대단했다고 말한다. 그녀는 어깨를 으쓱한다. 몇 번 해 본 일이라고.',
    'Baek-gi, on a mountain top: hired. A safe bet. Ahn, in a department store: hired. Han, in his rented room: hired.': '산꼭대기의 장백기, 합격. 안전한 선택. 백화점의 안영이, 합격. 하숙방의 한석율, 합격.',
    'The others are permanent staff. He has two years. The parachute is in, but only on a lease.': '다른 사람들은 정규직이다. 그에겐 2년이 있다. 낙하산은 들어갔지만, 기한이 정해진 자리다.',
    'Before you start working for a living, come and see the people who lost theirs. Go on. Pay your respects.': '밥벌이를 시작하기 전에, 그걸 잃은 사람들부터 보고 가라. 가. 인사드려.',
    'They bow, in their black ties. Han bows longest.': '그들은 검은 넥타이를 매고 고개를 숙인다. 한석율이 가장 오래 숙이고 있다.',
    "Brown office slippers with massage spikes, worn down to the shape of Oh's foot, and his good black dress shoes from the box under his desk.": '지압 돌기가 오 과장 발 모양대로 닳은 갈색 사무실 슬리퍼, 그리고 책상 밑 상자에 든 그의 좋은 검은 구두.',
    "That was all Oh said. But Park's eyes are shining.": '오 과장이 한 말은 그게 다였다. 하지만 박 대리의 눈이 반짝인다.',
    'So Jang adds a little more: Oh says he knows how to keep both sides happy.': '그래서 장그래는 조금 보탠다. 양쪽 입장을 다 맞출 줄 아는 분이라고 오 과장님이 그러셨다고.',
    "It's only a little more. He looks like he needs it.": '조금 더 보태는 것뿐이야. 저 사람한테 필요해 보여.',
    'He adds a little more.': '그는 조금 더 보탠다.',
    "PT day. The interns file in carrying boxes. Oh's slippers are poking out of Jang's box. Han sees them and mutters: is he out of his mind?": 'PT 당일. 인턴들이 상자를 들고 줄지어 들어온다. 장그래의 상자 밖으로 오 과장의 슬리퍼가 삐져나와 있다. 그걸 본 한석율이 중얼거린다. 미친 거 아냐?',
    'Jang wonders: did she help them, or herself? Would she ever do that for him? What are the two of them to her?': '장그래는 생각한다. 그녀는 우리를 도운 걸까, 자기 자신을 도운 걸까? 나를 위해서도 그렇게 해 줄까? 그녀에게 우리 둘은 무엇일까?',
}
