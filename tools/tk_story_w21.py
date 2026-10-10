"""World 21: Misaeng, Book 1, "착수" (The First Move): episodes 0-16 of Yoon Tae-ho's webtoon 『미생』 (Daum, 2012).

English on screen, Korean voice-over (KO21). Season 1 is nine books, one per printed volume (worlds 21-29; the user:
"lets have some variance, allow between 1-2 beats per episode depending on what fits best"). This is volume 1.
Episodes 0-11 are written from the comic itself (read on Kakao Webtoon: docs/book2/misaeng-read-ep0-10.md and
misaeng-read-ep11.md); episodes 12-16 from fan sources (docs/book2/misaeng-research-ep0-33.md) until they can be read. Design:
docs/book2/misaeng-arc.md ("Book 1"); engine syntax: docs/book2/misaeng-engine.md (claude/integration-alt2).
The comic's events, people and order are kept; dialogue is a close paraphrase with only short key lines quoted.
Beats marked (staging) or (invented) in comments are not in the comic. One reordering: episode 1 (the sponsor's walk,
the present-day frame) is played after episode 2's flashback, so the story runs in time order.

The frame: every beat opens on the 1st Ing Cup final, game 5 (1989), Nie Weiping (White) against Cho Hunhyun (Black),
played to the beat's "move". Record boards are multiple choice (the user): Cho's move and three "choices" picked by
the player's rank, each choice carrying its points lost against Cho's move (KataGo, the repo's small net, scored on
the position after the move). Every candidate scores below Cho's move.
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
    "ms_jang": "am_liam", "ms_jang_young": "am_liam", "ms_jang_child": "af_sky", "ms_mother": "bf_emma",
    "ms_oh": "am_onyx", "ms_kimds": "am_eric", "ms_ahn": "af_bella", "ms_han": "am_michael", "ms_kimsh": "am_adam",
    "ms_kimbr": "bm_george", "ms_director": "bm_fable", "ms_hr": "am_michael", "ms_trainee": "af_sky",
    "ms_stevehan": "am_echo", "ms_go": "am_fenrir", "ms_buyer": "bm_lewis", "ms_sponsor": "bm_daniel", "ms_exec": "bm_lewis",
    # new in this book (Graphics: to draw)
    "ms_uncle": "am_fenrir", "ms_hoyong": "am_puck", "ms_sanggi": "am_adam", "ms_bujang": "bm_george",
    "ms_ohwife": "af_sarah", "ms_ohson": "af_sky", "ms_kangsil": "am_echo", "ms_glasses": "am_puck",
    "ms_amhead": "bm_fable", "ms_ulsan": "am_fenrir", "ms_teacher": "bm_daniel",
}


def _scenes():
    return {
        # M1 · 착수0 (first half). The uncle's stones; "단수"; the neighbourhood class. The child plays the atari himself.
        "m1": {"title": T("Atari"), "kind": "main", "steps": [
            ["spawn", "un", "ms_uncle", "m1", 4, -2],
            N("Misaeng: not yet alive. A group on a go board that is neither alive nor dead."),
            N("It started with a toy: his uncle's set of stones. The small boy couldn't leave them alone."),
            S("ms_uncle", "Go on, then. Where would you play?"),
            ["problem"],   # the child: find the atari
            S("ms_jang_child", "Atari!"),
            N("He said the word right, the first time. His uncle took him to the baduk class in the neighbourhood, and his mother was happy to pay."),
            N("He learned fast. Soon he held his own in his uncle's and his father's betting games, and won their money back from the man at the corner shop."),
            N("On the class director's advice he moved to an amateur six-dan's academy. Nobody could stop a nine-year-old who laid out book problems alone at dawn."),
            N("Genius. To his parents the word was a sweet hypnosis. They sent him to a professional's dojang, and they burned for it all the hotter "
              "because his father's company had just gone under."),
            ["remove", "un"],
            ["party", ["ms_jang_young"], {"to": {"place": "korea-baduk-association--kba-trainees", "spot": "kba-trainees"}}],   # a deliberate cut: years pass
        ]},

        # M2 · 착수0 (second half). Seven years a trainee; he fails; the excuses; the stones dropped a few at a time.
        # (staging) The comic never shows a deciding game; it says the half-point losses kept coming. The board is one of them.
        "m2": {"title": T("Seven Years"), "kind": "main", "steps": [
            ["spawn", "tr", "ms_trainee", "m2", 6, -2],
            N("At eleven he entered the Korea Baduk Association as a trainee. Around then his parents began clipping Lee Chang-ho's and Lee Sedol's "
              "rankings and prize money out of the newspapers."),
            N("Seven years passed."),
            ["problem"],   # Jang: another half-point game; lost
            ["remove", "tr"],
            N("He failed to turn pro."),
            N("Only now does he see his father's wrinkles, and how dull his mother's eyes have gone."),
            N("The world sheds its skin. He hasn't changed, he tells himself: tomorrow he'd still be here, losing to younger kids with higher rankings. "
              "Only the world in his eyes has changed. Blue and green have gone grey."),
            N("It wasn't talent. It wasn't bad luck, or losing by half a point again and again. It wasn't playing between part-time jobs, or parents who "
              "couldn't give him pocket money. It wasn't his father dying and his mother taking to her bed."),
            N("Those would hurt too much. So: it's not that I didn't try. But I'll say it's because I didn't try hard enough."),
            ["still", "ms_lastgame", "slow zoom out"],
            N("He walks away dropping stones from his pocket, a few at a time."),
        ]},

        # M3 · 2수 (first scene). Two friends who passed ask "Really quitting?"; he throws out his board and his game records.
        "m3": {"title": T("Really Quitting?"), "kind": "main", "steps": [
            ["spawn", "hy", "ms_hoyong", "m3", 4, -2], ["spawn", "sg", "ms_sanggi", "m3", 8, -2],
            N("Kang Ho-ryong and Ahn Sang-gi turned pro last year. They were his friends in the trainee room."),
            S("ms_hoyong", "You're really quitting? After everything you've put in?"),
            S("ms_sanggi", "Won't you regret it?"),
            N("He says nothing. They were friends. He's going because there's nothing else he can do."),
            ["remove", "hy"], ["remove", "sg"],
            N("He ties up his game records in bundles, and puts them out with the board."),
            ["party", ["ms_jang"], {"to": {"place": "Susaek-dong", "spot": "home"}}],   # grown up (ms_jang); a cut: the years after
        ]},

        # M4 · 2수 (flashback). The family's decline; the GED; the sponsor's company; the army. His mother: go and thank him.
        "m4": {"title": T("Washing Her Back"), "kind": "main", "steps": [
            ["spawn", "mo", "ms_mother", "m4", 4, -2],
            N("They moved to the edge of the city on what was left of the deposit. The tripe restaurant failed; the shutters said for rent."),
            N("His mother worked on building sites until her body gave out. He studied for the high-school equivalency exam between part-time jobs. "
              "In winter she signed up for public-works jobs at the ward office. In the bathroom, he washed her back."),
            N("After the exam, at his sponsor's suggestion, he worked at the sponsor's company. At first his colleagues were curious. Baduk? What dan? "
              "Can you play blindfold? Then: why did you quit? Then: no flexibility. Look at this copy."),
            N("He fled to the army."),
            N("Failed trainees work at the association, or teach, or join an online baduk company, or report on games, or go to university. Only me."),
            S("ms_mother", "Go and thank him. The president who gave you that job. You owe him that."),
            ["remove", "mo"],
            ["party", ["ms_jang"], {"to": {"place": "Jongno", "from": "Susaek-dong"}}],
        ]},

        # M5 · 2수 + 착수1 (played in time order). The sponsor: a friend's company, the 낙하산 warning; the walk through
        # the evening city (the montage is Places' townsfolk on Jongno); "a simple interview"; the lights.
        "m5": {"title": T("A Light Allowed Me"), "kind": "main", "steps": [
            ["spawn", "sp", "ms_sponsor", "m5", 4, -2],
            N("Eight months after his discharge."),
            S("ms_sponsor", "You took your time. ...I'm sorry about last time. At my place. That was uncomfortable for you."),
            S("ms_sponsor", "I've talked to a friend. He runs a trading company. Only he knows about the baduk, and he'll keep it to himself. "
              "They've been told the ordinary things. It'll be a simple interview."),
            S("ms_sponsor", "But your papers are thin for a regular hire. You'll come in with nothing on you. Some will call you a parachute."),
            S("ms_jang", "Thank you. Thank you, sir."),
            N("The city has put its make-up on. Office workers fill the street: toasting, flattering, complaining, going home."),
            ["remove", "sp"],
            N("On the platform, and from the night bus along the expressway: start from the bottom, the way everyone else did. "
              "I won't fail again, the way I failed at baduk."),
            N("If there's a light I must keep burning, I'll answer for it. If there's a light allowed me. Is there one, for me?"),
            N("One by one the lights gather, and light the night."),
            ["party", ["ms_jang"], {"to": {"place": "Susaek-dong", "spot": "home"}}],   # a cut: the next morning
        ]},

        # M6 · 2수 (last panel). The first morning: he oversleeps. A struggling group from the first move.
        "m6": {"title": T("A Weak Group from the Start"), "kind": "main", "steps": [
            N("The first morning. The alarm. The alarm again."),
            S("ms_jang", "...!"),
            N("He takes the alley stairs three at a time in his new suit. A struggling group from the very first move."),
            N("The department head's message: don't come to the office. Go straight to a café in Jongno. There's a buyer, and nobody else to meet him."),
            ["gain", "cafe_address"],
        ]},

        # M7 · 3수. Cutaway: Oh Sang-sik. The weight of life; the forgotten meeting; the mountain; the jam; "fear is rational".
        "m7": {"title": T("The Weight of Life"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "m7", 4, -2], ["spawn", "wf", "ms_ohwife", "m7", 8, -2], ["spawn", "sn", "ms_ohson", "m7", 6, 0],
            N("Oh Sang-sik, section head, Sales Team 3. Red eyes. Stubble. Three sons climbing on him on the sofa, and food pushed into his mouth at the table."),
            N("You only find out how heavy your body is, how heavy your life is, when you're thrown into it."),
            N("At night he sleeps on the floor under his wife and three boys, and apologises to someone in his sleep."),
            N("Last year he begged his department head for more people. Last month, buried in paper cups, he was promised them soon. Then the golf bag went out of the door."),
            S("ms_ohson", "Dad! You said the mountain!"),
            N("Yesterday the boys woke him, and he took them hiking on a weekday. He managed to forget the Wednesday eleven o'clock meeting with an overseas buyer. "
              "On the summit, his phone rings."),
            ["remove", "wf"], ["remove", "sn"],
            S("ms_bujang", "Where are you? The buyer's waiting. If he walks, we both die."),
            S("ms_oh", "Anyone can go, sir. The director. The executives. The president himself."),
            S("ms_bujang", "I've hired someone. A new man. He goes in your team first. When can you get there?"),
            N("He runs down the mountain. Five hundred metres in thirty minutes on the road in."),
            S("ms_oh", "There was a paper at the workshop. Fear is mostly irrational..."),
            S("ms_bujang", "Shall I tell you about dismissal-notice pay?"),
            S("ms_oh", "Mangwon-dong crossroads. Twelve kilometres an hour. Eight to go. Thirty minutes late. Fear is rational."),
            S("ms_bujang", "I'm sending today's new hire straight to the meeting."),
            S("ms_oh", "A rookie? On his first day? Sent down from upstairs?"),
            S("ms_bujang", "Okada at the Japan branch says even a cat's paw would help. Are we in a position to be picky?"),
            ["remove", "oh"],
        ]},

        # M8 · 4수 (the café). Jang holds the buyer with a baduk quiz: a snapback. Oh bursts in. "Baduk."
        "m8": {"title": T("Baduk, Not Go"), "kind": "main", "steps": [
            ["spawn", "by", "ms_buyer", "m8", 6, -4], ["spawn", "ks", "ms_kangsil", "m8", 10, -4],
            N("A café in Jongno. A buyer from overseas, and his Korean manager, Kang. Nobody from One International has come but a new hire with no papers."),
            N("He can't talk trade. He can talk one thing. He draws a problem on a sheet and slides it across the table."),
            S("ms_buyer", "A puzzle? All right. Black to play?"),
            ["problem"],   # Jang: the buyer's quiz, a snapback (as printed in the episode)
            N("Play inside. Let them take it. Take back more."),
            ["spawn", "oh", "ms_oh", "m8", 16, 0], ["move", "oh", "m8", 12, -2],
            N("Oh Sang-sik bursts in, thirty minutes late, red-eyed, in hiking clothes under his jacket. He stops dead."),
            S("ms_oh", "Sorry, sorry. Traffic. Very sorry."),
            S("ms_kangsil", "Your young man kept us busy. The quiz was fun."),
            S("ms_buyer", "What is this game called?"),
            S("ms_jang", "Baduk."),
            S("ms_oh", "You play?"),
            S("ms_jang", "No. I found it on the internet."),
            ["remove", "by"], ["remove", "ks"], ["remove", "oh"],
        ]},

        # M9 · 4수 (the car). Oh's call to Kim about the Malaysian claim, FOB; Jang reads Oh's style through a game he lost.
        "m9": {"title": T("His Style"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "m9", 2, -2],
            N("Oh's car. A battered laptop, an old phone, paper cups. Red eyes on the road."),
            S("ms_oh", "Tissue. ...Kim. The Malaysian claim. The contract was FOB, the damage is in the wooden packing, that's the carrier. Push back. We're not suckers."),
            N("FOB. Claim. Certificate of origin. Jang understands none of it. But he knows how to read a man from his things."),
            N("He once lost a game to a trainee just like this: sloppy, red-eyed, bored-looking, glasses. He'd read him as careless. He was wrong."),
            ["problem"],   # Jang: read the opponent's style (a game he lost, remembered)
            N("Obsessive. Responsible. A man who carries everything."),
            S("ms_oh", "A month on a desert island. That's all I want. ...You speak English? No? Sign up at a language school."),
            N("Oh nods at the wheel, and washes down a handful of vitamins."),
            N("The first day was a test. He passed it. Baduk helped, though he hid it."),
            ["remove", "oh"],
        ]},

        # M10 · 4수 (lobby, HR) + 5수 (mentor and buddy). The lobby's politics; intern, PT in two months; Kim Dong-sik; the requisition.
        "m10": {"title": T("Mentor and Buddy"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "m10", 2, -4], ["spawn", "hr", "ms_hr", "m10", 8, -4],
            N("In the lobby Oh shakes a managing director's hand, greets a deputy general manager, and needles the head of a rival team, and explains them all to Jang on the way to the lift."),
            S("ms_hr", "Jang Geu-rae is an intern, attached to Sales Team 3. In two months there's a PT test."),
            S("ms_oh", "An intern? That's my reinforcement?"),
            S("ms_hr", "So teach him well."),
            ["remove", "hr"],
            N("One International: the trading arm of a group. He doesn't yet know what a trading company does."),
            ["spawn", "kd", "ms_kimds", "m10", 8, -2],
            S("ms_oh", "I'm your mentor. Kim Dong-sik is your buddy."),
            S("ms_kimds", "Assistant manager Kim. Ask me anything. First: this requisition, to General Affairs. Supplies."),
            ["gain", "requisition"],
            S("ms_kimds", "And greet people louder. Pitch it up. Sol!"),
            N("A grey memory: an executive telling him he's a special case. No university, no specialty, picked by the owner's eye, an experiment. "
              "Build a specialty before the PT."),
            S("ms_kimds", "I came in from a provincial college on clubs and contest prizes. Nobody here cares where you're from. Once you're in, though, "
              "you're up against people with credentials."),
            ["remove", "oh"], ["remove", "kd"],
        ]},
        "m11_wait": {"title": T("General Affairs"), "kind": "main", "steps": [
            S("ms_jang", "The requisition first. General Affairs."),
        ]},

        # M11 · 5수. The folders; the mind map; the glasses intern's "find the dud"; Kim: "Who do you think you are?"
        "m11": {"title": T("Who Do You Think You Are?"), "kind": "main", "steps": [
            N("General Affairs hands over a box of supplies: pens, sticky notes, a glue stick."),
            ["gain", "glue_stick"],
            ["spawn", "kd", "ms_kimds", "m11", 2, -2],
            S("ms_kimds", "Sort these files into my folders. Check the numbers. Retype the reports."),
            N("Indonesian IT export proposals, folder after folder. He draws a mind map, designs a better tree, and makes new folders. It takes an afternoon."),
            ["spawn", "gl", "ms_glasses", "m11", 10, 0],
            S("ms_glasses", "Interns' study tonight. PT topics, rehearsals. And we find out who the dud is."),
            S("ms_jang", "I'll help you find him."),
            ["remove", "gl"],
            ["emote", "kd", "anger"],
            S("ms_kimds", "Where are my folders? Who do you think you are?"),
            S("ms_kimds", "That structure is the company's. Everybody uses it. If you don't understand it, ask. This isn't work you do alone. It's work you do together."),
            N("When he was fifteen he filed his game records by tournament, by player, by opening. A system only he ever had to read."),
            S("ms_kimds", "Done by tomorrow."),
            ["remove", "kd"],
            ["spawn", "gl", "ms_glasses", "m11", 10, 0],
            S("ms_glasses", "Come on. It's how you learn the tricks of the job."),
            ["remove", "gl"],
            ["party", ["ms_jang"], {"to": {"place": "Jongno", "from": "One International"}}],
        ]},

        # M12 · 6수 (the study, a bar). Ahn Young-yi; "listening alone won't teach you"; 아생연후살타.
        "m12": {"title": T("Secure Yourself First"), "kind": "main", "steps": [
            ["spawn", "ahn", "ms_ahn", "m12", 4, -2], ["spawn", "gl", "ms_glasses", "m12", 8, -2],
            N("A bar full of interns. Topics are pitched and torn apart: numbers people against feelings people. The only woman is introduced. Ahn Young-yi."),
            S("ms_ahn", "You haven't said anything."),
            S("ms_jang", "I don't know enough yet."),
            S("ms_ahn", "You won't learn by listening."),
            S("ms_jang", "Are we going to talk about the actual work?"),
            S("ms_ahn", "That's bar talk. This is PT prep. There's no trick to the work but time. You've got that much filing due tomorrow, and you're sitting here? "
              "Secure your own stones, then attack."),
            ["problem"],   # Jang: secure your own group first
            N("He runs back to the office saying it over and over. He lived by that proverb his whole life, and he had to hear it from someone else."),
            N("His teacher at the board: however good the point, what use is it if your own stones die?"),
            S("ms_ahn", "He really does have filing due. Come on. You're going to apologise."),
            ["remove", "ahn"], ["remove", "gl"],
            ["party", ["ms_ahn"]],   # the lead passes to Ahn: she takes the glasses intern back to the office (her stretch, m13)
        ]},

        # M13 · 6수 (the office at night). Ahn leads (from the bar; the glasses intern follows her): she brings the glasses intern to apologise, reviews Jang's scheme, and
        # puts it to Oh and Kim so that both live. The dream of white stones.
        "m13": {"title": T("Both Live"), "kind": "main", "steps": [
            ["spawn", "jg", "ms_jang", "m13", 4, -2], ["spawn", "gl", "ms_glasses", "m13", 8, 0],
            N("Jang is at his desk, with the folders spread around him."),
            S("ms_glasses", "Sorry. I didn't know you had urgent work. Do it Kim's way. Familiar is efficient."),
            N("Ahn reads Jang's folder scheme over his shoulder."),
            S("ms_ahn", "It's rational. Anyone could use it, if they knew the categories. But only the staff share the old order. Change it when you're in charge."),
            ["spawn", "oh", "ms_oh", "m13", 14, -4], ["spawn", "kd", "ms_kimds", "m13", 16, -2],
            S("ms_oh", "A party?"),
            S("ms_oh", "You're doing fine. Don't worry so much."),
            ["problem"],   # Ahn: make both live
            S("ms_ahn", "The file's a settlement summary for a few executives, so date order is enough. But his cross-index has something. You keep a private re-sort anyway, don't you? "
              "Use it from the planning stage and related work across departments could line up. For a company this size, we're inefficient."),
            S("ms_kimds", "...Good idea."),
            N("She kept herself alive, and him too. Both live."),
            ["remove", "jg"], ["remove", "gl"], ["remove", "oh"], ["remove", "kd"],
            ["still", "ms_25stones", "slow zoom out"],
            N("That night, as after every game, he replays the day. He dreams of a board: rows of white stones, and one black. Baduk. It drives me mad."),
            ["party", ["ms_jang"], {"to": {"place": "Susaek-dong", "spot": "home"}}],   # a cut: the next dawn
        ]},

        # M14 · 7수. The dawn commute; the claim yelling; work from every side (three real errands); "the world is faster than me".
        "m14_wait": {"title": T("Every Side"), "kind": "main", "steps": [
            S("ms_jang", "Kim's B/L call to the forwarder. The copies. The floor. All at once."),
        ]},
        "m14": {"title": T("The World Is Faster"), "kind": "main", "steps": [
            ["spawn", "am", "ms_amhead", "m14", 10, -4],
            N("He woke before the alarm. Yesterday's filing isn't done. The crush on the train."),
            N("Am I the only one still dreaming? The world is faster than me."),
            N("The trading teams work to their partners' clocks. The Americas team head is yelling at a junior: an offer sheet, a ten-day claim window, missed."),
            S("ms_amhead", "Ten days! Ten! ...I'm going to the sauna."),
            ["remove", "am"],
            N("On the frame strip, Black approaches and touches White. The hard fight in the office begins."),
            ["problem"],   # the record: Black 7
            N("He catches himself making useless high-quality work, and makes it plain and safe instead."),
        ]},

        # M15 · 7수. Ahn announces the PT and hints; the glasses intern; Kim's warning: beware whoever comes to you first.
        "m15": {"title": T("Whoever Comes First"), "kind": "main", "steps": [
            ["spawn", "ahn", "ms_ahn", "m15", 4, -2],
            S("ms_ahn", "Asleep? Set your priorities. The PT dates are fixed: first week of next month, at the training centre, a whole week. "
              "Individual tasks and a team task. Think about partners."),
            S("ms_ahn", "Who'd want a dud for a partner? ...We might work well together, you and I."),
            ["remove", "ahn"],
            ["spawn", "gl", "ms_glasses", "m15", 8, 0],
            S("ms_glasses", "So. Got a partner yet?"),
            S("ms_jang", "Me? Popular?"),
            ["remove", "gl"],
            ["spawn", "kd", "ms_kimds", "m15", 2, -2],
            S("ms_kimds", "Choose carefully. You have everything the other interns want. No confidence, no grasp of the work, no skills."),
            S("ms_kimds", "With a dream team everybody scores. But if you're paired with a sure dud, you shine. A sacrificial lamb."),
            S("ms_kimds", "Be careful of whoever comes to you first."),
            ["remove", "kd"],
        ]},

        # M16 · 8수. The workday; Ahn on the plaza: trust your partner, only the one inside the board can't see; Kim's
        # "who reads settlement files"; Han: "Have you picked a partner?"
        "m16": {"title": T("Inside the Board"), "kind": "main", "steps": [
            N("Copies. Trays of snacks pushed at him: eat while you work. Bread alone at his desk. A senior takes him aside: bring it to me first, Oh hates "
              "obvious mistakes. A kindness that only makes more work."),
            ["spawn", "ahn", "ms_ahn", "m16", 4, -2],
            S("ms_ahn", "Not going home? Got a partner?"),
            S("ms_ahn", "Whoever it is, trust them. The moment you see your partner as a rival, your own scheming shows. The one inside the board doesn't see it. "
              "Everyone watching does."),
            ["still", "ms_ringed", "slow zoom in"],
            N("A trainee at a board, ringed by onlookers. Everyone outside already knows."),
            ["problem"],   # Jang: see what the watchers see
            S("ms_ahn", "If I trust my partner to the end, the judges outside will see me. It's not about choosing. Do your part, and trust the rest."),
            ["remove", "ahn"],
            N("A different view from Kim's, and a good one. But she's being judged too."),
            ["spawn", "kd", "ms_kimds", "m16", 10, -4],
            S("ms_jang", "The filing's done."),
            S("ms_kimds", "Put it in the cabinet. Who reads settlement files anyway? Next: re-sort this by quantity and check it against the purchase orders."),
            ["remove", "kd"],
            ["spawn", "han", "ms_han", "m16", 14, 0], ["move", "han", "m16", 6, -2],
            S("ms_han", "Have you picked a partner?"),
            ["remove", "han"],
        ]},

        # M17 · 9수. The roof at night: Jang tries to take sente; Han slams down stone after stone; Han picks him. The gossip.
        "m17": {"title": T("Sente"), "kind": "main", "steps": [
            ["spawn", "han", "ms_han", "m17", 4, -2],
            S("ms_han", "Han Seok-yul. They had me at the Ulsan plant; I came straight back when I heard about the PT."),
            N("Taking sente: leading the game. Until now he has always handed it over. This time he leads."),
            S("ms_jang", "Let's talk somewhere else."),
            S("ms_han", "Bad air up here. But a roof clears your head. I love factories. Ports. Airports."),
            S("ms_jang", "Why did you choose me?"),
            ["problem"],   # Jang: take sente; Han overwhelms him (fails, as written)
            S("ms_han", "I joined half a month before you. Mechanical engineering. Contest prizes. I don't like tinkering, I like understanding a machine and getting it across. "
              "That's sales. That's trade. They sent me to Ulsan because I'm as good as hired. Plant tours, interviews, foreign buyers. I've even had a meal with the president!"),
            N("Stone after stone, slammed down in handfuls. Chase his moves and you end up a struggling group."),
            S("ms_han", "Team up with me. Build the PT however you like. You'll shine. Send me your progress by mail, I'll cover my parts."),
            S("ms_jang", "...Thanks."),
            S("ms_han", "Yes, sir! Loyalty! I'm on my way."),
            ["remove", "han"],
            ["spawn", "gl", "ms_glasses", "m17", 8, 2], ["spawn", "ahn", "ms_ahn", "m17", 12, 2],
            S("ms_glasses", "Isn't that the one they call the Peeper? Comes in early to watch the women arrive."),
            S("ms_ahn", "He begged to go to Ulsan. Said he had to know the machines he'd sell. Passionate? No. Showing off. They say he made a big mistake in front of a buyer there."),
            S("ms_glasses", "A total dud. Who's going to be the bomb squad?"),
            ["remove", "gl"], ["remove", "ahn"],
            N("Jang is at the copier, humming."),
        ]},

        # M18 · 10수. Kinder and warmer in the morning; the items emailed; "Again!"; Ahn's "nuclear bomb"; "Find it yourself."
        "m18": {"title": T("Again!"), "kind": "main", "steps": [
            N("A dream: a great player's hand, a veteran's face. Giants who talk while countless people listen, and him with his eyes and ears shut. "
              "Next to the board where you fight alone, the world seems kinder, and warmer."),
            N("On the train he scrolls his PT notes. The one thing he kept from giving up baduk is concentration. Right thinking shows the one proper move. "
              "The best of thought and experience: that's what baduk calls joseki. And he has sente. Build it however you like."),
            N("He mails Han three PT items and asks for feedback by tomorrow, then goes to lunch with the interns. Grilled mackerel. Pollack stew."),
            ["gain", "phone_text"],
            N("A text from Han: Again!"),
            ["spawn", "ahn", "ms_ahn", "m18", 6, -2], ["spawn", "gl", "ms_glasses", "m18", 10, -2],
            S("ms_glasses", "Picked yours? Not Jang, surely. Everyone thinks he's easy."),
            S("ms_ahn", "Easy? Who knows. Maybe a big dud. A nuclear bomb."),
            ["remove", "ahn"], ["remove", "gl"],
            N("In the afternoon lull, people read the news on the sly, or nap. Only the interns are still busy. He calls Han from the restroom."),
            S("ms_jang", "You said I could build it my way."),
            S("ms_han", "I said share it. I never said I'd keep my mouth shut. I know how this company works. Who should be listening to whom? I'm helping you."),
            ["problem"],   # Jang: hold your ground on the phone (fails, as written)
            S("ms_jang", "Then what kind of item?"),
            S("ms_han", "Find it yourself."),
            N("In the next stall, the glasses intern heard every word. By evening it's everywhere: a dud hugging a dud."),
        ]},

        # M18b · 10수. Cutaway: Ulsan. Han scolded by the site's department head.
        "m18b": {"title": T("One More Chance"), "kind": "main", "steps": [
            ["spawn", "hn", "ms_han", "m18b", 4, -2], ["spawn", "ul", "ms_ulsan", "m18b", 8, -4],
            N("The Ulsan plant. Han runs across the factory floor."),
            S("ms_ulsan", "You begged, so you got one more chance. No mistakes. If you're not sure of yourself, go back to a desk and stop prancing round my site."),
            S("ms_han", "I can do it!"),
            N("The department head mutters something as he goes. Han stands there, shaking."),
            ["remove", "hn"], ["remove", "ul"],
            N("Night, in Seoul. Stones spilled on the floor by an abandoned board, and Jang at his screen. The world is far colder, and more heartless."),
        ]},

        # M19 · 11수 (read in the comic). Han at Ulsan; the all-nighter; Oh on the messy document; Kim covers; "Shrink the boxes."
        "m19": {"title": T("Shrink the Boxes"), "kind": "main", "steps": [
            N("Ulsan. In a fibre warehouse, the site's department head shows Han the bolts: strength, carbonisation, density. "
              "Leave that to the buyer's experts, he says. Your job is the samples and the papers, on the day, with no mistakes."),
            N("Han asks for help anyway. The old man softens. Buy me a soju when it's done."),
            N("Han rings Jang from outside the plant, cigarette in hand."),
            S("ms_han", "You call this a plan? An after-school hobby? Where I interned, I spent four days on one item. Twenty pages, packed tight."),
            S("ms_jang", "Please check it. If it's short, I'll redo it."),
            N("Night, the lounge. He types alone. Forty-two pages. Forty. Fifty-three. More pages don't make it better; an item plan isn't a book report. He keeps going."),
            ["spawn", "oh", "ms_oh", "m19", 10, -6], ["spawn", "kim", "ms_kimds", "m19", 6, -4],
            N("Morning. Oh, red-eyed, holds up a document Jang made for the team."),
            ["emote", "oh", "anger"],
            S("ms_oh", "You should have followed the seniors' materials. Fixing it now won't help, I have to take this in and report! "
                       "Colours that don't match, boxes all over the place, no order to any of it. What did you do yesterday?"),
            S("ms_jang", "Sorry."),
            S("ms_kimds", "The interns had the PT exam. They were short of time."),
            S("ms_oh", "Kim. Playing house? Really?"),
            S("ms_kimds", "Sorry. Jang, can you fix it now?"),
            S("ms_jang", "Yes. Yes, yes."),
            N("Kim, under his breath: answer that fast and he gets angrier. He never got the time to be angry."),
            S("ms_oh", "Shrink the boxes."),
            N("He yawns, eyes watering, and goes back to his desk."),
            ["problem"],   # Jang: fix the document
            ["remove", "oh"], ["remove", "kim"],
        ]},

        # M19b · 11수 (read in the comic). The second call from an empty meeting room: "Again?"; Jang takes the PT back; the age question.
        "m19b": {"title": T("How Old Are You?"), "kind": "main", "steps": [
            N("He slips into an empty meeting room and calls Ulsan."),
            S("ms_han", "Interns are staff too, you know. Is this company work, or your own? Look at the size of it..."),
            S("ms_jang", "How is it?"),
            S("ms_han", "Well..."),
            S("ms_jang", "Again?"),
            S("ms_han", "...The second item is good."),
            S("ms_jang", "You're sure?"),
            S("ms_han", "Yes. Decided."),
            N("On the frame strip, Black's stones sit in the lower-left corner beside White's. Cho makes them solid first, then turns to fight."),
            ["problem"],   # the record: Black 11
            N("Baduk is a fight at bottom, a war. You give way when pressed, sometimes you look to share the board, but the winner and the loser are plain. "
              "He lived in that world for over ten years. A beaten soldier, but raised to compete."),
            N("A player who doesn't hand over sente."),
            ["problem"],   # Jang: take the PT back
            S("ms_jang", "Then it's settled. We chose the item together, and you agreed to it. From here I write the PT, my way. "
                         "I'll share the progress, but I don't take instructions. That's what we agreed, isn't it?"),
            S("ms_han", "What?"),
            S("ms_jang", "And."),
            N("He drops the honorifics."),
            S("ms_jang", "How old are you, anyway?"),
            S("ms_han", "Huh...?"),
            S("ms_han", "This little runt..."),
            S("ms_jang", "Not going to say?"),
        ]},

        # M19c · 12수. Asleep in a meeting room; Oh and Kim size up the pair; the heroes fade in a dream; Ahn: the eye of the storm,
        # "insight"; the seniors have called the interns out. A walk to the dinner (m19d).
        "m19c": {"title": T("The Eye of the Storm"), "kind": "main", "steps": [
            N("A board covered in white stones. One of them falls to the floor."),
            N("After many short nights, he sleeps deeply at last: slumped in a chair in an empty meeting room."),
            ["spawn", "oh", "ms_oh", "m19c", 12, 2], ["spawn", "kd", "ms_kimds", "m19c", 14, 2],
            S("ms_oh", "All those items. Is he doing the PT alone?"),
            S("ms_kimds", "His partner's Han Seok-yul, the one who went to the Ulsan plant. Han's a talker. I'd bet Jang's doing all the work."),
            S("ms_oh", "A smooth talker, and one who can't tell he's being used. Some team."),
            ["remove", "oh"], ["remove", "kd"],
            N("He dreams of his heroes. Cho Nam-chul. Cho Hunhyun. Lee Chang-ho, Yoo Chang-hyuk. Lee Sedol. Cho Chikun, Segoe. One by one they fade. "
              "Don't go, he begs them. I'll do better."),
            N("My heroes are fading away. If they stayed, what could I do? Haven't I let go of baduk yet?"),
            ["spawn", "ahn", "ms_ahn", "m19c", 6, -2],
            S("ms_ahn", "You were crying. And talking in your sleep. Picked your partner?"),
            S("ms_jang", "Han Seok-yul. He's at the Ulsan plant."),
            S("ms_ahn", "I've heard. Hungry for it. He'll use a weak partner to shine, and a strong one too."),
            S("ms_jang", "I sensed that."),
            S("ms_ahn", "An ambitious man is a tornado. He wrecks everything round him. But the eye of a tornado is calm. "
              "Get into his centre, and you two could really work. Forget the gossip."),
            S("ms_jang", "I don't have that kind of skill."),
            S("ms_ahn", "No. Your résumé's specialties box is empty. Shame insight doesn't count. You've got an unusual eye."),
            S("ms_jang", "And your partner?"),
            S("ms_ahn", "Still deciding. Nobody wants to team up with me."),
            S("ms_jang", "Anyone good enough would work well with you."),
            S("ms_ahn", "See? Insight. ...I just complimented myself."),
            S("ms_ahn", "Wait, that's why I came! The seniors have called all the interns out. It's evening. You slept the whole day."),
            ["remove", "ahn"],
            ["party", ["ms_jang"], {"to": {"place": "Jongno", "from": "One International"}}],
        ]},

        # M19d · 12수. The team dinner (a pork-rind place in the comic; staged in the hof); three penalty glasses; "not an outsider".
        "m19d": {"title": T("Not an Outsider"), "kind": "main", "steps": [
            ["spawn", "oh", "ms_oh", "m19d", 10, -4], ["spawn", "kd", "ms_kimds", "m19d", 6, -2],
            N("Here to sleep, or to work? He's late. Three penalty glasses."),
            S("ms_jang", "Sorry. Yes, sir."),
            N("For the first time, he feels part of the team. The ones who use him, help him, get angry with him and scold him: all of them are on his side. "
              "Here, he is not an outsider."),
            ["remove", "oh"], ["remove", "kd"],
            N("With that, he ends today's baduk. Where the white stone fell from the board, there's a black one."),
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],
        ]},

        # M20 · 13수. Kim's rule on glue and confidential paper; the waybill left to shred later; Seok-ho glues his report over it
        # at Jang's desk; the lobby desk; the director's kick; the interns on the roof; Oh finds the scrap glued to the waybill.
        "m20": {"title": T("The Waybill"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m20", 4, -2],
            S("ms_kimds", "I've told you. Don't glue on top of other papers; it gets on the sheet underneath. Move it first."),
            S("ms_kimds", "And before anything goes in the scrap bin, check it isn't confidential. Figures, anything confidential: the shredder at the end of the floor. "
              "No paper of ours is ever found outside this team."),
            S("ms_jang", "Yes, sir."),
            ["spawn", "sh", "ms_kimsh", "m20", 10, 0],
            N("Kim Seok-ho, an intern on another team, hurries by."),
            S("ms_jang", "Done your weekly report?"),
            S("ms_kimsh", "Not yet. There are parts I don't get, and my section head's out on site."),
            ["remove", "sh"],
            S("ms_jang", "The waybill copy and the payment details. Shred those?"),
            S("ms_kimds", "Shred them."),
            N("He'll wait for a few more approved papers and shred the lot at once. The yellow waybill stays on his desk: Sales Team 3, DH-14."),
            ["remove", "kd"],
            ["spawn", "sh", "ms_kimsh", "m20", 10, 0],
            S("ms_kimsh", "Can I borrow your glue?"),
            S("ms_jang", "On my desk. Doesn't your team have any?"),
            S("ms_kimsh", "The cabinet's locked, and nobody gives me the key. I have to beg every time."),
            N("At Jang's desk he glues his report pages flat, the waybill underneath. The glue soaks through. Late again, he scoops up his papers and runs, "
              "the waybill stuck to their back."),
            ["remove", "sh"],
            N("Jang gathers his pile and feeds the shredder, humming. He doesn't notice what isn't there."),
            N("Down in the lobby, Seok-ho finds the yellow sheet on his papers, tears it off and asks the security desk to throw it away. It slides off the counter "
              "onto the floor. A director stops beside it, and taps it with his shoe."),
            ["spawn", "dir", "ms_director", "m20", 8, 2], ["spawn", "oh", "ms_oh", "m20", 14, -6], ["spawn", "kd", "ms_kimds", "m20", 4, -2],
            S("ms_oh", "Director! Is this about a team dinner?"),
            N("Without a word, the director kicks the team's paper box over. His aide hands Oh the waybill: found on the lobby floor."),
            S("ms_director", "Let's do our jobs properly."),
            S("ms_oh", "Yes, sir! Yes, sir!"),
            ["remove", "dir"],
            S("ms_oh", "Clean this up."),
            N("Kim and Jang go down on their knees for the papers."),
            S("ms_oh", "Get all the interns together!"),
            ["remove", "kd"],
            N("On the roof, a senior yells at a line of interns. Do they think they've got the job already? Focus!"),
            N("At his desk, Oh turns the waybill over. Glued to it is a torn scrap of white paper. Weekly report. Internship. Kim Seok-ho."),
            ["gain", "waybill_scrap"],
            ["party", ["ms_oh"]],   # the lead passes to Oh, at his own desk (his stretch, m21-m21b)
        ]},

        # M21 · 14수. Oh leads. Go brags about his intern; Oh's flat questions; the cabinet key; Jang takes the blame; "let's drink".
        "m21": {"title": T("A Secret"), "kind": "main", "steps": [
            ["spawn", "go", "ms_go", "m21", 8, 0],
            N("Applause from across the floor. Go, a section head on Sales Team 1, comes over pumping his fists."),
            S("ms_go", "My baby intern, Kim Seok-ho! Drafts like a machine, all-nighters with us. Left another firm's internship because he wanted a real trading company. "
              "Newly married, and he barely goes home. Married young: eldest son of an eldest son. And we've just landed it."),
            S("ms_oh", "He comes to our team a lot. To borrow supplies."),
            S("ms_go", "Ha! My fault. The cabinet key's on my key ring."),
            ["problem"],   # Oh: read what Go's bragging gives away
            S("ms_oh", "They grade interns on everything. Keep him from careless slips."),
            S("ms_go", "Results are what count. He did all our translating. ...The interns are off somewhere. Back soon."),
            ["remove", "go"],
            N("Oh looks at the folder in his hands. A locked cabinet. A borrowed glue stick. A waybill that walked."),
            ["spawn", "jg", "ms_jang", "m21", 4, -2],
            N("By the copier, the interns troop back from the roof, groaning. Jang tells a staffer it was his fault: he left a waybill lying about, "
              "the director picked it up in the lobby, and everyone paid for it."),
            N("At the end of the day Kim is still on a shipping request. Oh takes the phone and bullies the buyer onto a container ship: the contract date doesn't move."),
            S("ms_oh", "Let's go and drink."),
            ["remove", "jg"],
            ["party", ["ms_oh"], {"to": {"place": "Jongno", "from": "One International"}}],
        ]},

        # M21b · 14수. The street after drinks: "a secret"; Go's team, drunk; "Get your intern his own glue!"; Seok-ho's sorry;
        # "Stay on your toes"; Seok-ho's homecoming (the baby awake); Jang alone at a board.
        "m21b": {"title": T("His Own Glue"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m21b", 4, -2], ["spawn", "jg", "ms_jang", "m21b", 6, -2],
            N("It isn't nine yet, and Oh is already tipsy."),
            S("ms_kimds", "Sore about Go's big win?"),
            S("ms_oh", "No. Geu-rae did nothing wrong today."),
            S("ms_kimds", "Why dig it up? It's done."),
            S("ms_oh", "It's bad to be misunderstood."),
            S("ms_kimds", "Then who did it?"),
            S("ms_oh", "A secret."),
            S("ms_jang", "Thank you. It was still my carelessness."),
            ["spawn", "go", "ms_go", "m21b", 12, 0], ["spawn", "sh", "ms_kimsh", "m21b", 14, 0],
            N("Go's team comes up the street, drunk on their win."),
            S("ms_go", "Jealous, Oh? You snub my intern over a few supplies, and now you want to spoil our win?"),
            S("ms_oh", "Get your intern his own glue! Mine took the blame because yours got glue on a document and dropped it!"),
            S("ms_go", "Supplies! Always supplies!"),
            N("Go doesn't take it in. Kim Seok-ho does."),
            S("ms_kimsh", "...I'm sorry."),
            N("He says he'll ring his wife, and goes back to drinking with his team."),
            ["remove", "go"], ["remove", "sh"],
            S("ms_oh", "Stay on your toes, punk."),
            S("ms_jang", "Yes, sir."),
            ["remove", "kd"], ["remove", "jg"],
            ["still", "ms_babyfinger", "slow zoom in"],
            N("Late, Kim Seok-ho comes home to one room. His wife has only just got to sleep. The baby is awake, and knows him. Dada. "
              "Her hand closes round his finger. He falls asleep beside them in his suit."),
            N("In another room, in the dark, Jang sets stones on a board, one at a time."),
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],   # the lead passes back to Jang: the next day, at the office
        ]},

        # M22 · 15수. Incheon at dawn; Steve Han against Kim Bu-ryeon on the 13th floor (the thick report); "everyone plays
        # their own baduk" on the Black 15 board; Oh presses Go: dog meat.
        "m22": {"title": T("Their Own Baduk"), "kind": "main", "steps": [
            N("Incheon harbour, at first light. Cargo meant for Gunsan was unloaded here, some of it damaged, and he came to see it with his own eyes. "
              "The more you lean on paper, the further you drift from the site, until you have to take the other side's word for it."),
            N("He settles it with the forwarder and the insurer. Every arrival date has a few spare days in it; no real harm. A late breakfast. He's pleased with himself."),
            N("Back on the thirteenth floor, the air is tight. Kim Dong-sik waves him over to watch."),
            ["spawn", "st", "ms_stevehan", "m22", 6, -4], ["spawn", "br", "ms_kimbr", "m22", 10, -4], ["spawn", "oh", "ms_oh", "m22", 14, -6],
            N("Steve Han: an American citizen, his family emigrated after middle school. Department head of the Americas textile team. Facing him, Kim Bu-ryeon, "
              "department head over Sales Teams 1, 2 and 3. The same rank. Steve has come onto Kim's floor to pick a fight, with everyone watching."),
            S("ms_kimbr", "My team was up all night. You had the report on time."),
            S("ms_stevehan", "I don't have time for a report this thick. A fat report hands over every scrap so nobody has to take responsibility. "
              "A title means you take responsibility."),
            S("ms_kimbr", "We wanted to help you understand the situation."),
            S("ms_stevehan", "My job is selling textiles in the Americas. I need to understand the client, not your catalogue. Don't write me a thesis. "
              "Come and see me. Answer my questions."),
            S("ms_kimbr", "A report is more accurate."),
            S("ms_stevehan", "Stop making other people do your team's work. I don't care where the yarn came from. Who's it for? What climate do they live in? "
              "What taste went into the design? Just tell me what I need."),
            S("ms_kimbr", "...We'll revise it."),
            ["remove", "st"],
            N("Everyone is playing their own baduk, and wants to play the best moves they've prepared. Whoever prepared better is happier with the result. "
              "Whoever rushed to keep pace, and lost, has no excuse."),
            ["problem"],   # the record: Black 15
            N("And Kim Bu-ryeon lost on his own ground, with a crowd to watch."),
            ["remove", "br"],
            ["spawn", "go", "ms_go", "m22", 2, 0],
            N("In a meeting room afterwards, Oh presses Go. Why would Steve lecture their department head on the basics?"),
            S("ms_go", "Poor communication. He's picky. Too American."),
            S("ms_oh", "He spoke to us in Korean just now. Out with it."),
            S("ms_go", "The buyers came. Steve suggested dinner with my team, and I picked the place. I'd had a few. I told them this is how Koreans get friendly over work."),
            S("ms_oh", "What did you feed them?"),
            S("ms_go", "...Dog meat."),
            ["remove", "go"], ["remove", "oh"],
        ]},

        # M22b · 16수. How it happened (narrated); Sales 3's table: "checkmate"; Jang laughs and is scolded; don't leave dead
        # stones on the board; Oh: politics with class. Kim Bu-ryeon has gone; the walk to the textile floor (m22c).
        "m22b": {"title": T("Dead Stones"), "kind": "main", "steps": [
            N("How it happened. Over drinks at a dog-meat place, section heads from rival companies traded buyer stories. Plenty of foreigners love it, they said; "
              "more of them can't stand perilla leaves. Go envied their adventurous spirit."),
            N("So he took a buyer, and Steve, to a dog-meat restaurant. He read Steve wrong: a foreigner who wouldn't know, or a Korean at heart under the American "
              "passport. Steve saved the deal. Go never apologised, and his paperwork was sloppy, so Steve sat on Sales Team 1's approvals. "
              "Then Kim Bu-ryeon called him up to complain, and lost."),
            ["spawn", "oh", "ms_oh", "m22b", 12, -4], ["spawn", "kd", "ms_kimds", "m22b", 8, -2],
            S("ms_oh", "Go wanted to take Steve to a sauna and settle it man to man. I talked him out of it."),
            S("ms_kimds", "A sauna? Steve looks easy-going, but he's a very private man."),
            S("ms_oh", "And our department head is too sore to apologise. In a way, it's checkmate."),
            N("Baduk words, from people who don't play. Jang grins."),
            ["emote", "kd", "anger"],
            S("ms_kimds", "You're laughing while your seniors talk?"),
            S("ms_jang", "Sorry."),
            N("If it's checkmate, you stop clinging to the stone. You give it up."),
            ["problem"],   # Jang: give up the dead stone
            S("ms_jang", "Apologising is the only way. In baduk they say don't leave dead stones on the board. Steve will do it again, "
              "and a dead stone left lying there grows into a bigger problem."),
            S("ms_kimds", "Easier said. He's proud, and he was shamed in front of his people. An office runs on politics."),
            ["emote", "oh", "anger"],
            S("ms_oh", "Getting nervous over something this petty hurts his pride more. If it's politics, let's do it with class. Being humble when it counts: that's class. Let's go."),
            ["remove", "kd"], ["remove", "oh"],
            N("Kim Bu-ryeon isn't at his desk. He left scowling, someone says, with Go."),
            S("ms_jang", "He's gone to Steve."),
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "one-international--sales3"}}],   # walk to the textile floor
        ]},

        # M22c · 16수. Kim Bu-ryeon got there first; Go's "so the approvals will go faster?"; the obvious move is the hardest;
        # the dry sauna: "Don't touch me!"
        "m22c": {"title": T("The Obvious Move"), "kind": "main", "steps": [
            ["spawn", "st", "ms_stevehan", "m22c", 6, -4], ["spawn", "br", "ms_kimbr", "m22c", 10, -2], ["spawn", "go", "ms_go", "m22c", 12, -2],
            N("Behind a partition on the textile floor: Kim Bu-ryeon is already there, with Go. He got there first."),
            S("ms_kimbr", "I didn't know what had happened. I'm sorry."),
            S("ms_stevehan", "And I'm sorry I lost my temper. Thank you for coming yourself. I expected Go to come alone."),
            S("ms_go", "I was petty. I sulked. I'm sorry. ...So will the approvals go faster now?"),
            S("ms_stevehan", "Is that why you're apologising?"),
            S("ms_kimbr", "I'm sorry for him, too."),
            N("Everyone laughs."),
            ["remove", "st"], ["remove", "br"], ["remove", "go"],
            N("Often the obvious move is the hardest. Players lose games they could have won because they won't take the plain path, and each refusal tangles "
              "things further. Some things you must do however hard, and some you must not do however easy. He has seen it twice today: this morning, and now."),
            ["still", "ms_sauna", "slow pan across"],
            N("A dry sauna. Towels on wooden benches. Steve alone at the far end."),
            S("ms_go", "Steve! Come on, scoot over."),
            S("ms_stevehan", "Don't touch me!"),
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
        node("m1", 20, 240, "m1", place="Susaek-dong", room="baduk-class", move=0, dilemma=D(
            "ms_jang_child", "Find the atari.",
            "Two liberties. If I put one here...",
            "Atari!",
            "Look again.")),
        node("m2", 32, 234, "m2", place="Korea Baduk Association", room="kba-trainees", move=0, dilemma=D(
            "ms_jang_young", "Win by half a point.",
            "Seven years. Again, half a point. Win this one.",
            "Half a point short. Again.",
            "Read it again.")),
        node("m3", 44, 228, "m3", place="Korea Baduk Association", room="kba-cafe", move=2, board=False),
        node("m4", 56, 222, "m4", place="Susaek-dong", room="home", move=2, board=False),
        node("m5", 68, 216, "m5", place="Jongno", room="sponsor-office", move=2, board=False),
        node("m6", 78, 211, "m6", place="Susaek-dong", room="home", move=2, board=False),
        node("m7", 86, 207, "m7", place="Oh's home", move=3, board=False, cutaway=True),
        node("m8", 96, 202, "m8", place="Jongno", room="cafe", move=4, dilemma=D(
            "ms_jang", "Give the buyer a puzzle: the move that gives one stone to take more.",
            "I can't talk trade. I can talk this.",
            "Snapback.",
            "Not that. Again.")),
        node("m9", 108, 196, "m9", place="Jongno", room="forecourt", move=4, dilemma=D(
            "ms_jang", "Read the man from his game.",
            "Sloppy, red-eyed, bored. I read him wrong once. Not again.",
            "Obsessive. Responsible.",
            "Read him again.")),
        node("m10", 120, 190, "m10", room="hr", move=5, board=False),
        node("m11", 130, 185, "m11", room="sales3", move=5, board=False,
             gate=[{"needs": ["mark:requisition"], "else": "m11_wait",
                    "objective": T("Take Kim's requisition to General Affairs, then go back to your desk in Sales 3."),
                    "at": "One International"}]),
        node("m12", 142, 179, "m12", place="Jongno", room="hof", move=6, dilemma=D(
            "ms_jang", "Secure your own stones first.",
            "I lived by this my whole life. Make the group live, then attack.",
            "Alive.",
            "It's dead. Again.")),
        node("m13", 154, 173, "m13", room="sales3", move=6, dilemma=D(
            "ms_ahn", "Make both live.",
            "His scheme or Kim's? Neither has to die.",
            "Both live.",
            "One of them dies. Again.")),
        node("m14", 166, 167, "m14", room="sales3", move=6, record=7,
             choices={7: [['dj', 0.08], ['ep', 0.11], ['cj', 0.14], ['qk', 0.26], ['do', 0.29], ['cm', 0.31], ['bp', 0.51], ['co', 1.05], ['qn', 3.87]]},
             gate=[{"needs": ["mark:errand_bl", "mark:errand_copy", "mark:errand_floor"], "else": "m14_wait",
                    "objective": T("Work from every side on Sales 3's floor: the forwarder call about the B/L at the team phone, Kim's copies at the copier, and mop the floor."),
                    "at": "One International"}],
             dilemma=D(
                 "ms_jang", "Which move did Cho Hunhyun play?",
                 "Black approaches. The hard fight starts here.",
                 "Black 7.",
                 "Not that one. Look again.")),
        node("m15", 176, 162, "m15", room="meeting", move=7, board=False),
        node("m16", 188, 156, "m16", place="Jongno", room="forecourt", move=8, dilemma=D(
            "ms_jang", "See what the watchers see.",
            "The one inside the board can't see it. Step outside it.",
            "There.",
            "Still inside. Again.")),
        node("m17", 200, 150, "m17", room="roof", move=9, dilemma=D(
            "ms_jang", "Take sente.",
            "Lead this time. Don't hand it over.",
            "He takes it back with both hands.",
            "Again.")),
        node("m18", 212, 144, "m18", room="sales3", move=10, dilemma=D(
            "ms_jang", "Hold your ground on the phone.",
            "He said build it my way. Hold him to it.",
            "Find it yourself.",
            "Again.")),
        node("m18b", 218, 141, "m18b", place="Ulsan", move=10, board=False, cutaway=True),
        node("m19", 226, 137, "m19", room="sales3", move=10, dilemma=D(
            "ms_jang", "Fix the document.",
            "Same colours. Big groups over small ones. Smaller boxes.",
            "Shrink the boxes.",
            "Still a mess. Again.")),
        node("m19b", 232, 134, "m19b", room="sales3", move=10, record=[11, None], choices={11: [['dl', 3.1], ['dr', 3.55], ['dc', 3.97], ['bp', 4.04], ['cc', 4.58], ['ed', 4.84], ['ip', 6.15]]}, dilemma=[
            D("ms_jang", "Which move did Cho Hunhyun play?",
              "Make the corner solid, then fight.",
              "Black 11.",
              "Not that one. Look again."),
            D("ms_jang", "Take the PT back.",
              "We chose it together. He agreed. Hold him to it.",
              "That's what we agreed.",
              "Again."),
        ]),
        node("m19c", 236, 133, "m19c", room="meeting", move=12, board=False),
        node("m19d", 240, 131, "m19d", place="Jongno", room="hof", move=12, board=False),
        node("m20", 244, 128, "m20", room="sales3", move=13, board=False),
        node("m21", 250, 125, "m21", room="sales3", move=14, dilemma=D(
            "ms_oh", "Read what Go's bragging gives away.",
            "His intern lives on our supplies. Why?",
            "The cabinet key. The glue.",
            "Read him again.")),
        node("m21b", 256, 122, "m21b", place="Jongno", move=14, board=False),
        node("m22", 262, 119, "m22", room="sales3", move=14, record=15, choices={15: [['cf', 0.05], ['gc', 0.1], ['ic', 0.26], ['fd', 0.34], ['ed', 0.57], ['dm', 0.78], ['dj', 0.95], ['cj', 0.95], ['dl', 1.1], ['ec', 1.51]]}, dilemma=D(
            "ms_jang", "Which move did Cho Hunhyun play?",
            "Everyone plays their own baduk. The better prepared is happier.",
            "Black 15.",
            "Not that one. Look again.")),
        node("m22b", 268, 116, "m22b", room="sales3", move=16, dilemma=D(
            "ms_jang", "Give up the dead stone.",
            "Checkmate. Don't cling to it. Don't leave it on the board.",
            "Give it up. Apologise.",
            "It's still on the board. Again.")),
        node("m22c", 274, 113, "m22c", room="textile", move=16, board=False),
    ]


_ORDER = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m14", "m15", "m16", "m17",
          "m18", "m18b", "m19", "m19b", "m19c", "m19d", "m20", "m21", "m21b", "m22", "m22b", "m22c"]
_EDGES = [[a, b] for a, b in zip(_ORDER, _ORDER[1:])]

_ITEMS = {
    "cafe_address": {"name": "The café's address", "kind": "key", "text": "A café in Jongno. The buyer is waiting. Go straight there."},
    "requisition": {"name": "Supplies requisition", "kind": "key", "text": "For General Affairs. Kim Dong-sik's signature."},
    "glue_stick": {"name": "Glue stick", "kind": "key"},
    "copy": {"name": "Kim's copies", "kind": "key"},
    "mop": {"name": "A mop and bucket", "kind": "key"},
    "phone_text": {"name": "Han's text", "kind": "key", "text": "Again!"},
    "waybill_scrap": {"name": "Waybill scrap", "kind": "key", "text": "Glued to the waybill: a torn scrap of a weekly report. Internship. Kim Seok-ho."},
}

_OPENING = [
    ["scroll", T("The First Move"), [
        T("Every chapter of this story opens on one move of a real game: the 1st Ing Cup final, game 5, 1989. "
          "Nie Weiping has White. Cho Hunhyun has Black. It will last 145 moves."),
        T("You are Jang Geu-rae. It begins with a set of stones, and a small boy who can't leave them alone."),
    ]],
]

_CLOSING = [
    ["scroll", T("Book 2: Challenge"), [
        T("Sixteen moves played. Jang has a desk, a team that's on his side, a partner who no longer gives the orders, and a PT in a few weeks."),
        T("Next: a man with a resignation letter in his jacket, a child at a daycare door, and the test."),
    ]],
]


def _world():
    return {
        "n": 21,
        "lang": "en",
        "voice": "ko",   # Korean voice-over, English screen (the user, via Integration alt2); lines in KO21
        "name": T("The First Move"),
        "zh": "",
        "chapters": [],
        "record": {"sgf": "docs/book2/misaeng-ing-cup-g5.sgf",
                   "title": "1st Ing Cup final, game 5", "black": "Cho Hunhyun", "white": "Nie Weiping"},
        "grades": ["11K", "11K+"],
        "boss": "redmond",
        "party": ["ms_jang_child"],
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


# Korean voice-over (the user: Korean voice, English screen). Every spoken line: N/S lines, scroll paragraphs, the
# dilemmas' open/win/slip, and Places' map lines for w21. Close to the webtoon's own words for its key lines.
KO21 = {
    'Misaeng: not yet alive. A group on a go board that is neither alive nor dead.': '미생. 아직 살아 있지 못한 자. 바둑판 위에서 살지도 죽지도 않은 돌.',
    "It started with a toy: his uncle's set of stones. The small boy couldn't leave them alone.": '시작은 장난감이었다. 삼촌의 바둑돌. 꼬마는 그 돌에서 손을 떼지 못했다.',
    'Go on, then. Where would you play?': '자, 어디 둬 볼래?',
    'Atari!': '단수!',
    'He said the word right, the first time. His uncle took him to the baduk class in the neighbourhood, and his mother was happy to pay.': '그 말을 처음부터 정확히 했다. 삼촌은 그를 동네 바둑교실에 데려갔고, 어머니는 기꺼이 돈을 냈다.',
    "He learned fast. Soon he held his own in his uncle's and his father's betting games, and won their money back from the man at the corner shop.": '그는 빨리 배웠다. 곧 삼촌과 아버지의 내기 바둑에서도 밀리지 않았고, 동네 가게 아저씨에게 잃은 돈을 되찾아 왔다.',
    "On the class director's advice he moved to an amateur six-dan's academy. Nobody could stop a nine-year-old who laid out book problems alone at dawn.": '원장님의 권유로 아마 6단의 학원으로 옮겼다. 새벽에 혼자 책의 문제를 늘어놓는 아홉 살을 아무도 말릴 수 없었다.',
    "Genius. To his parents the word was a sweet hypnosis. They sent him to a professional's dojang, and they burned for it all the hotter because his father's company had just gone under.": '영재. 부모님에겐 달콤한 최면제였다. 그들은 그를 프로기사의 도장에 보냈고, 마침 아버지의 회사가 부도를 맞았기에 그 응원은 더 뜨거웠다.',
    "At eleven he entered the Korea Baduk Association as a trainee. Around then his parents began clipping Lee Chang-ho's and Lee Sedol's rankings and prize money out of the newspapers.": '열한 살에 한국기원 연구생으로 들어갔다. 부모님이 이창호, 이세돌의 순위와 상금을 신문에서 오려 모으기 시작한 것도 그 무렵이다.',
    'Seven years passed.': '7년이 지났다.',
    'He failed to turn pro.': '입단에 실패했다.',
    "Only now does he see his father's wrinkles, and how dull his mother's eyes have gone.": '이제야 아버지의 주름이, 흐려진 어머니의 눈이 보인다.',
    "The world sheds its skin. He hasn't changed, he tells himself: tomorrow he'd still be here, losing to younger kids with higher rankings. Only the world in his eyes has changed. Blue and green have gone grey.": '세상이 허물을 벗는다. 나는 변하지 않았다고 그는 생각한다. 내일도 여기서, 나이 어린 상위 랭커들에게 지고 있을 것이다. 변한 건 내 눈 속의 세상뿐. 파랑과 초록이 회색이 되었다.',
    "It wasn't talent. It wasn't bad luck, or losing by half a point again and again. It wasn't playing between part-time jobs, or parents who couldn't give him pocket money. It wasn't his father dying and his mother taking to her bed.": '재능이 없어서가 아니다. 운이 없어서도, 번번이 반집으로 져서도 아니다. 아르바이트 사이에 바둑을 둬서도, 용돈 한 번 못 주는 부모님 때문도 아니다. 아버지가 돌아가시고 어머니가 자리에 누우셔서도 아니다.',
    "Those would hurt too much. So: it's not that I didn't try. But I'll say it's because I didn't try hard enough.": '그건 너무 아프니까. 그러니까, 열심히 안 한 것은 아니지만, 열심히 안 해서인 걸로 생각하겠다.',
    'He walks away dropping stones from his pocket, a few at a time.': '그는 주머니의 돌을 조금씩, 몇 개씩 떨어뜨리며 걸어간다.',
    'Kang Ho-ryong and Ahn Sang-gi turned pro last year. They were his friends in the trainee room.': '강호룡과 안상기는 작년에 입단했다. 연구생실의 친구들이었다.',
    "You're really quitting? After everything you've put in?": '정말 그만두려고? 지금까지 해 온 게 있는데?',
    "Won't you regret it?": '후회 안 하겠어?',
    "He says nothing. They were friends. He's going because there's nothing else he can do.": '그는 아무 말도 하지 않는다. 친구였다. 다른 방법이 없어서 떠나는 것이다.',
    'He ties up his game records in bundles, and puts them out with the board.': '그는 기보를 묶어, 바둑판과 함께 내다 놓는다.',
    'They moved to the edge of the city on what was left of the deposit. The tripe restaurant failed; the shutters said for rent.': '그들은 줄어든 보증금으로 도시 변두리로 이사했다. 곱창집은 망했다. 셔터에는 임대 문의가 붙었다.',
    'His mother worked on building sites until her body gave out. He studied for the high-school equivalency exam between part-time jobs. In winter she signed up for public-works jobs at the ward office. In the bathroom, he washed her back.': '어머니는 몸이 버티지 못할 때까지 공사판에서 일했다. 그는 아르바이트를 하며 검정고시를 준비했다. 겨울이면 어머니는 구청 공공근로를 신청했다. 욕실에서, 그는 어머니의 등을 밀어 드렸다.',
    "After the exam, at his sponsor's suggestion, he worked at the sponsor's company. At first his colleagues were curious. Baduk? What dan? Can you play blindfold? Then: why did you quit? Then: no flexibility. Look at this copy.": '검정고시 뒤, 후원자의 권유로 그의 회사에서 일했다. 처음엔 동료들이 궁금해했다. 바둑? 몇 단? 눈 감고도 둬? 그다음엔, 왜 그만뒀어? 그다음엔, 융통성이 없어. 이 복사 좀 봐.',
    'He fled to the army.': '그는 도망치듯 군대에 갔다.',
    'Failed trainees work at the association, or teach, or join an online baduk company, or report on games, or go to university. Only me.': '실패한 연구생들은 기원에서 일하거나, 가르치거나, 인터넷 바둑 회사에 들어가거나, 관전기를 쓰거나, 대학에 간다. 나만.',
    'Go and thank him. The president who gave you that job. You owe him that.': '가서 인사드려. 너한테 일자리 주셨던 사장님. 그 정도는 해야지.',
    'Eight months after his discharge.': '제대하고 여덟 달 뒤.',
    "You took your time. ...I'm sorry about last time. At my place. That was uncomfortable for you.": '늦게도 왔구나. ...저번엔 미안했다. 우리 회사에서. 불편했지.',
    "I've talked to a friend. He runs a trading company. Only he knows about the baduk, and he'll keep it to himself. They've been told the ordinary things. It'll be a simple interview.": '친구한테 얘기해 뒀다. 무역회사를 하는 친구야. 바둑 얘기는 그 친구만 알고, 입 다물어 줄 거다. 거기엔 평범한 것만 얘기해 뒀어. 간단한 면접일 거다.',
    "But your papers are thin for a regular hire. You'll come in with nothing on you. Some will call you a parachute.": '그런데 정규직으로 들어가기엔 네 이력이 너무 얇아. 아무것도 없이 들어가는 셈이지. 낙하산이라고 하는 사람도 있을 거다.',
    'Thank you. Thank you, sir.': '감사합니다. 정말 감사합니다.',
    'The city has put its make-up on. Office workers fill the street: toasting, flattering, complaining, going home.': '도시가 화장을 했다. 직장인들이 거리를 메운다. 건배하고, 아부하고, 불평하고, 집으로 간다.',
    "On the platform, and from the night bus along the expressway: start from the bottom, the way everyone else did. I won't fail again, the way I failed at baduk.": '플랫폼에서, 고속도로를 달리는 밤 버스에서. 남들처럼 바닥부터 시작하자. 다시는 바둑처럼 실패하지 않겠다.',
    "If there's a light I must keep burning, I'll answer for it. If there's a light allowed me. Is there one, for me?": '제가 밝혀야 할 불빛이 있다면 책임질 겁니다. 내게 허락된 불빛이 있다면요. 그런 게 있을까, 내게.',
    'One by one the lights gather, and light the night.': '불빛이 하나씩 모여, 밤을 밝힌다.',
    'The first morning. The alarm. The alarm again.': '첫날 아침. 알람. 또 알람.',
    '...!': '...!',
    'He takes the alley stairs three at a time in his new suit. A struggling group from the very first move.': '그는 새 양복을 입고 골목 계단을 세 칸씩 뛰어내린다. 시작부터 곤마.',
    "The department head's message: don't come to the office. Go straight to a café in Jongno. There's a buyer, and nobody else to meet him.": '부장의 메시지. 회사로 오지 말고 종로의 카페로 바로 가라. 바이어가 있는데, 만날 사람이 아무도 없다.',
    'Oh Sang-sik, section head, Sales Team 3. Red eyes. Stubble. Three sons climbing on him on the sofa, and food pushed into his mouth at the table.': '영업 3팀 오상식 과장. 빨간 눈. 덥수룩한 수염. 소파에서 그를 타고 오르는 세 아들, 식탁에서 입에 밀어 넣어지는 음식.',
    "You only find out how heavy your body is, how heavy your life is, when you're thrown into it.": '현실에 던져져 봐야 안다. 내 몸이, 내 삶이 얼마나 무거운지.',
    'At night he sleeps on the floor under his wife and three boys, and apologises to someone in his sleep.': '밤이면 그는 아내와 세 아들에게 깔려 바닥에서 자고, 잠결에 누군가에게 사과한다.',
    'Last year he begged his department head for more people. Last month, buried in paper cups, he was promised them soon. Then the golf bag went out of the door.': '작년엔 부장에게 사람을 더 달라고 빌었다. 지난달엔 종이컵에 파묻힌 채 곧 준다는 약속을 받았다. 그리고 골프백이 문을 나갔다.',
    'Dad! You said the mountain!': '아빠! 산에 간다며!',
    "Yesterday the boys woke him, and he took them hiking on a weekday. He managed to forget the Wednesday eleven o'clock meeting with an overseas buyer. On the summit, his phone rings.": '어제, 아이들이 그를 깨웠고, 그는 평일에 아들들을 데리고 산에 갔다. 수요일 오전 열한 시 해외 바이어 미팅을 깜빡 잊은 채로. 정상에서, 전화가 울린다.',
    "Where are you? The buyer's waiting. If he walks, we both die.": '어디야? 바이어가 기다려. 놓치면 우리 둘 다 죽어.',
    'Anyone can go, sir. The director. The executives. The president himself.': '아무나 가면 되잖아요, 부장님. 국장님도 있고, 임원들도 있고, 사장님도 계시고.',
    "I've hired someone. A new man. He goes in your team first. When can you get there?": '사람 하나 뽑았어. 신입이야. 너희 팀에 먼저 넣을 거다. 언제 올 수 있어?',
    'He runs down the mountain. Five hundred metres in thirty minutes on the road in.': '그는 산을 뛰어 내려간다. 들어오는 길은 30분에 500미터.',
    'There was a paper at the workshop. Fear is mostly irrational...': '워크숍에서 그런 논문이 있었는데요. 공포는 대부분 비합리적이라고...',
    'Shall I tell you about dismissal-notice pay?': '해고예고수당 얘기 좀 해 줄까?',
    'Mangwon-dong crossroads. Twelve kilometres an hour. Eight to go. Thirty minutes late. Fear is rational.': '망원동 사거리. 시속 12킬로. 8킬로 남았습니다. 30분 늦습니다. 공포는 합리적입니다.',
    "I'm sending today's new hire straight to the meeting.": '오늘 들어온 신입을 바로 미팅에 보낸다.',
    'A rookie? On his first day? Sent down from upstairs?': '신입을요? 첫날에? 위에서 내려온?',
    "Okada at the Japan branch says even a cat's paw would help. Are we in a position to be picky?": '일본 지사 오카다가 그러더라. 고양이 손이라도 빌려야 할 판이라고. 지금 가릴 처지야?',
    'A café in Jongno. A buyer from overseas, and his Korean manager, Kang. Nobody from One International has come but a new hire with no papers.': '종로의 카페. 해외 바이어와 그의 한국인 실장 강씨. 원 인터내셔널에선 이력도 없는 신입 하나만 와 있다.',
    "He can't talk trade. He can talk one thing. He draws a problem on a sheet and slides it across the table.": '무역 얘기는 못 한다. 할 수 있는 얘기는 하나뿐. 그는 종이에 문제를 그려 탁자 너머로 민다.',
    'A puzzle? All right. Black to play?': '퍼즐? 좋아요. 흑 차례?',
    'Play inside. Let them take it. Take back more.': '안에 둔다. 따내게 둔다. 더 많이 되따낸다.',
    'Oh Sang-sik bursts in, thirty minutes late, red-eyed, in hiking clothes under his jacket. He stops dead.': '오상식이 30분 늦게, 빨간 눈으로, 재킷 아래 등산복 차림으로 뛰어든다. 그리고 멈춰 선다.',
    'Sorry, sorry. Traffic. Very sorry.': '죄송합니다, 죄송합니다. 차가 막혀서요. 정말 죄송합니다.',
    'Your young man kept us busy. The quiz was fun.': '이 젊은 분 덕에 지루하지 않았어요. 퀴즈가 재밌던데요.',
    'What is this game called?': '이 게임 이름이 뭐죠?',
    'Baduk.': '바둑입니다.',
    'You play?': '너 바둑 둬?',
    'No. I found it on the internet.': '아니요. 인터넷에서 찾았습니다.',
    "Oh's car. A battered laptop, an old phone, paper cups. Red eyes on the road.": '오 과장의 차. 낡은 노트북, 오래된 휴대폰, 종이컵들. 도로 위의 빨간 눈.',
    "Tissue. ...Kim. The Malaysian claim. The contract was FOB, the damage is in the wooden packing, that's the carrier. Push back. We're not suckers.": '휴지. ...김 대리. 말레이시아 클레임. 계약이 FOB였고, 파손은 목재 포장 문제니까 운송사 책임이야. 밀어붙여. 우리가 봉이야?',
    'FOB. Claim. Certificate of origin. Jang understands none of it. But he knows how to read a man from his things.': 'FOB. 클레임. 원산지 증명서. 장그래는 하나도 모른다. 하지만 물건으로 사람을 읽는 법은 안다.',
    "He once lost a game to a trainee just like this: sloppy, red-eyed, bored-looking, glasses. He'd read him as careless. He was wrong.": '예전에 꼭 이런 연구생에게 진 적이 있다. 너저분하고, 눈이 빨갛고, 지루해 보이는, 안경 쓴. 덤벙댄다고 읽었다. 틀렸다.',
    'Obsessive. Responsible. A man who carries everything.': '집요하다. 책임감이 강하다. 모든 걸 짊어지는 사람.',
    "A month on a desert island. That's all I want. ...You speak English? No? Sign up at a language school.": '무인도에서 한 달. 그거면 돼. ...너 영어 해? 못 해? 학원 등록해.',
    'Oh nods at the wheel, and washes down a handful of vitamins.': '오 과장은 운전대 앞에서 꾸벅 졸다가, 비타민 한 움큼을 삼킨다.',
    'The first day was a test. He passed it. Baduk helped, though he hid it.': '첫날이 곧 시험이었다. 그는 통과했다. 숨겼지만, 바둑이 도왔다.',
    "In the lobby Oh shakes a managing director's hand, greets a deputy general manager, and needles the head of a rival team, and explains them all to Jang on the way to the lift.": '로비에서 오 과장은 상무와 악수하고, 차장에게 인사하고, 경쟁 팀장을 한마디 찌르고, 엘리베이터까지 가는 길에 장그래에게 그들을 하나하나 설명한다.',
    "Jang Geu-rae is an intern, attached to Sales Team 3. In two months there's a PT test.": '장그래 씨는 인턴입니다. 영업 3팀 소속이고요. 두 달 뒤에 PT 시험이 있습니다.',
    "An intern? That's my reinforcement?": '인턴? 그게 내 충원이야?',
    'So teach him well.': '그러니까 잘 가르쳐 주세요.',
    "One International: the trading arm of a group. He doesn't yet know what a trading company does.": '원 인터내셔널. 한 그룹의 종합상사. 그는 아직 종합상사가 무슨 일을 하는지 모른다.',
    "I'm your mentor. Kim Dong-sik is your buddy.": '나는 네 멘토, 김동식이 네 버디다.',
    'Assistant manager Kim. Ask me anything. First: this requisition, to General Affairs. Supplies.': '김동식 대리야. 뭐든 물어봐. 우선 이 비품 신청서, 총무팀에 갖다 줘.',
    'And greet people louder. Pitch it up. Sol!': '그리고 인사는 크게. 톤을 올려. 솔!',
    "A grey memory: an executive telling him he's a special case. No university, no specialty, picked by the owner's eye, an experiment. Build a specialty before the PT.": '회색의 기억. 너는 특별한 경우라고 말하던 임원. 대학도, 전공도 없이, 오너의 눈으로 뽑힌 실험. PT 전에 전문성을 만들어라.',
    "I came in from a provincial college on clubs and contest prizes. Nobody here cares where you're from. Once you're in, though, you're up against people with credentials.": '나는 지방대에서 동아리랑 공모전 수상으로 들어왔어. 여기선 출신은 상관 안 해. 하지만 일단 들어오면, 스펙으로 무장한 사람들이랑 경쟁하는 거야.',
    'The requisition first. General Affairs.': '신청서부터. 총무팀.',
    'General Affairs hands over a box of supplies: pens, sticky notes, a glue stick.': '총무팀에서 비품 한 상자를 건넨다. 펜, 포스트잇, 딱풀.',
    'Sort these files into my folders. Check the numbers. Retype the reports.': '이 파일들 내 폴더에 정리해. 숫자 확인하고. 보고서는 다시 쳐.',
    'Indonesian IT export proposals, folder after folder. He draws a mind map, designs a better tree, and makes new folders. It takes an afternoon.': '인도네시아 IT 수출 제안서가 폴더마다 가득하다. 그는 마인드맵을 그려 더 나은 폴더 구조를 짜고, 새 폴더를 만든다. 오후 한나절이 걸린다.',
    "Interns' study tonight. PT topics, rehearsals. And we find out who the dud is.": '오늘 밤 인턴 스터디 있어요. PT 주제도 정하고 리허설도 하고. 그리고 누가 폭탄인지 찾아내는 거죠.',
    "I'll help you find him.": '제가 찾는 거 도와드릴게요.',
    'Where are my folders? Who do you think you are?': '내 폴더 어디 갔어? 당신이 뭔데?',
    "That structure is the company's. Everybody uses it. If you don't understand it, ask. This isn't work you do alone. It's work you do together.": '그 구조는 회사 거야. 다들 그걸로 일해. 모르겠으면 물어봐. 이건 혼자 하는 일이 아니야. 같이 하는 일이지.',
    'When he was fifteen he filed his game records by tournament, by player, by opening. A system only he ever had to read.': '열다섯 살 때 그는 기보를 대회별로, 기사별로, 포석별로 정리했다. 오직 그만 읽으면 되는 체계였다.',
    'Done by tomorrow.': '내일까지.',
    "Come on. It's how you learn the tricks of the job.": '같이 가요. 그래야 일하는 요령도 배우죠.',
    'A bar full of interns. Topics are pitched and torn apart: numbers people against feelings people. The only woman is introduced. Ahn Young-yi.': '인턴들로 가득한 술집. 주제가 나오고 난도질당한다. 숫자파 대 감성파. 유일한 여자가 소개된다. 안영이.',
    "You haven't said anything.": '아무 말도 안 하시네요.',
    "I don't know enough yet.": '아직 잘 몰라서요.',
    "You won't learn by listening.": '듣기만 해선 안 배워져요.',
    'Are we going to talk about the actual work?': '실제 업무 얘기는 안 해요?',
    "That's bar talk. This is PT prep. There's no trick to the work but time. You've got that much filing due tomorrow, and you're sitting here? Secure your own stones, then attack.": '그건 술자리 얘기고요. 여긴 PT 준비하는 자리예요. 일에 요령 같은 건 없어요, 시간밖에. 내일까지 정리할 게 그렇게 많은데 여기 앉아 계세요? 아생연후살타.',
    'He runs back to the office saying it over and over. He lived by that proverb his whole life, and he had to hear it from someone else.': '그는 그 말을 되뇌며 회사로 뛰어간다. 평생 그 격언대로 살았는데, 남에게서 듣게 되다니.',
    'His teacher at the board: however good the point, what use is it if your own stones die?': '바둑판 앞의 사부님. 아무리 좋은 자리라도, 내 돌이 죽으면 무슨 소용이냐.',
    "He really does have filing due. Come on. You're going to apologise.": '정말 정리할 게 있었네요. 가요. 사과하러 가는 거예요.',
    'Jang is at his desk, with the folders spread around him.': '장그래는 폴더를 늘어놓은 채 책상에 앉아 있다.',
    "Sorry. I didn't know you had urgent work. Do it Kim's way. Familiar is efficient.": '미안해요. 급한 일 있는 줄 몰랐어요. 김 대리님 방식대로 하세요. 익숙한 게 효율적이에요.',
    "Ahn reads Jang's folder scheme over his shoulder.": '안영이가 장그래의 어깨 너머로 폴더 체계를 본다.',
    "It's rational. Anyone could use it, if they knew the categories. But only the staff share the old order. Change it when you're in charge.": '합리적이네요. 분류만 알면 누구나 쓸 수 있겠어요. 하지만 기존 질서는 직원들만 공유해요. 바꾸는 건 장그래 씨가 책임자가 됐을 때 하세요.',
    'A party?': '파티야?',
    "You're doing fine. Don't worry so much.": '잘하고 있어. 너무 걱정하지 마.',
    "The file's a settlement summary for a few executives, so date order is enough. But his cross-index has something. You keep a private re-sort anyway, don't you? Use it from the planning stage and related work across departments could line up. For a company this size, we're inefficient.": '이 파일은 임원 몇 분이 보시는 사후 정산 요약이라, 날짜순이면 충분해요. 그런데 이 사람의 교차 색인은 쓸 데가 있어요. 대리님도 따로 재정리해 두시죠? 기획 단계부터 쓰면 부서 간 관련 업무가 맞물릴 수 있어요. 이 규모 회사치고 우린 비효율적이에요.',
    '...Good idea.': '...좋은 생각이네.',
    'She kept herself alive, and him too. Both live.': '그녀는 자신을 살리고, 그도 살렸다. 상생.',
    'That night, as after every game, he replays the day. He dreams of a board: rows of white stones, and one black. Baduk. It drives me mad.': '그날 밤, 대국이 끝날 때마다 그랬듯 그는 하루를 복기한다. 꿈에 바둑판이 나온다. 줄지은 백돌, 그리고 흑돌 하나. 바둑... 미치겠다.',
    "Kim's B/L call to the forwarder. The copies. The floor. All at once.": '김 대리님 포워더 B/L 전화. 복사. 바닥. 한꺼번에.',
    "He woke before the alarm. Yesterday's filing isn't done. The crush on the train.": '알람보다 먼저 깼다. 어제 정리가 안 끝났다. 지하철 안의 인파.',
    'Am I the only one still dreaming? The world is faster than me.': '나만 아직 꿈속인가. 세상은 나보다 빠르다.',
    "The trading teams work to their partners' clocks. The Americas team head is yelling at a junior: an offer sheet, a ten-day claim window, missed.": '무역팀들은 거래처의 시계에 맞춰 일한다. 미주팀장이 후배에게 소리를 지른다. 오퍼 시트, 열흘짜리 클레임 기한, 놓쳤다.',
    "Ten days! Ten! ...I'm going to the sauna.": '열흘! 열흘이라고! ...나 사우나 간다.',
    'On the frame strip, Black approaches and touches White. The hard fight in the office begins.': '흑이 다가가 백에 붙인다. 사무실에서의 힘든 싸움이 시작된다.',
    'He catches himself making useless high-quality work, and makes it plain and safe instead.': '그는 쓸데없이 고퀄리티로 일하려는 자신을 붙잡고, 평범하고 안전하게 만든다.',
    'Asleep? Set your priorities. The PT dates are fixed: first week of next month, at the training centre, a whole week. Individual tasks and a team task. Think about partners.': '졸아요? 우선순위를 정하세요. PT 날짜 나왔어요. 다음 달 첫 주, 연수원에서, 일주일. 개인 과제랑 팀 과제. 파트너 생각해 두세요.',
    "Who'd want a dud for a partner? ...We might work well together, you and I.": '폭탄이랑 누가 파트너 하고 싶겠어요? ...우리 둘, 잘 맞을지도 모르겠네요.',
    'So. Got a partner yet?': '그래서. 파트너 정했어요?',
    'Me? Popular?': '제가요? 인기가?',
    'Choose carefully. You have everything the other interns want. No confidence, no grasp of the work, no skills.': '신중하게 골라. 넌 다른 인턴들이 원하는 걸 다 갖췄어. 자신감 없지, 업무 파악 안 됐지, 기술 없지.',
    "With a dream team everybody scores. But if you're paired with a sure dud, you shine. A sacrificial lamb.": '드림팀이면 다 같이 점수 받아. 근데 확실한 폭탄이랑 짝이 되면, 내가 빛나지. 희생양.',
    'Be careful of whoever comes to you first.': '먼저 접근하는 사람 잘 가려서 봐.',
    'Copies. Trays of snacks pushed at him: eat while you work. Bread alone at his desk. A senior takes him aside: bring it to me first, Oh hates obvious mistakes. A kindness that only makes more work.': '복사. 일하면서 먹으라고 밀어 주는 간식 쟁반. 자리에서 혼자 먹는 빵. 선배 하나가 그를 따로 부른다. 오 과장님은 뻔한 실수 싫어하시니까 나한테 먼저 가져와. 일만 늘리는 친절.',
    'Not going home? Got a partner?': '퇴근 안 해요? 파트너는요?',
    "Whoever it is, trust them. The moment you see your partner as a rival, your own scheming shows. The one inside the board doesn't see it. Everyone watching does.": '누구든 믿으세요. 파트너를 경쟁자로 보는 순간, 내 꼼수가 드러나요. 판 안의 사람만 모르죠. 보는 사람은 다 알아요.',
    'A trainee at a board, ringed by onlookers. Everyone outside already knows.': '구경꾼들에게 둘러싸인 바둑판 앞의 연구생. 밖에선 이미 다 안다.',
    "If I trust my partner to the end, the judges outside will see me. It's not about choosing. Do your part, and trust the rest.": '제가 끝까지 파트너를 믿으면, 밖의 심사위원들이 저를 보겠죠. 고르는 게 문제가 아니에요. 내 몫을 하고, 나머진 믿는 거예요.',
    "A different view from Kim's, and a good one. But she's being judged too.": '김 대리와는 다른 시각, 좋은 시각이다. 하지만 그녀도 평가받는 사람이다.',
    "The filing's done.": '정리 끝났습니다.',
    'Put it in the cabinet. Who reads settlement files anyway? Next: re-sort this by quantity and check it against the purchase orders.': '캐비닛에 넣어 둬. 정산 파일을 누가 읽는다고. 다음. 이거 수량별로 다시 정리해서 발주서랑 대조해.',
    'Have you picked a partner?': '파트너 정했어요?',
    'Han Seok-yul. They had me at the Ulsan plant; I came straight back when I heard about the PT.': '한석율입니다. 울산 공장에 가 있었는데, PT 소식 듣고 바로 올라왔어요.',
    'Taking sente: leading the game. Until now he has always handed it over. This time he leads.': '선수를 차지한다는 것. 판을 이끄는 것. 지금까지 그는 늘 선수를 내줬다. 이번엔 내가 이끈다.',
    "Let's talk somewhere else.": '다른 데서 얘기하죠.',
    'Bad air up here. But a roof clears your head. I love factories. Ports. Airports.': '여기 공기는 안 좋은데, 옥상은 머리가 맑아져요. 저는 공장이 좋아요. 항구랑 공항도.',
    'Why did you choose me?': '왜 저를 고르셨어요?',
    "I joined half a month before you. Mechanical engineering. Contest prizes. I don't like tinkering, I like understanding a machine and getting it across. That's sales. That's trade. They sent me to Ulsan because I'm as good as hired. Plant tours, interviews, foreign buyers. I've even had a meal with the president!": '저는 장그래 씨보다 보름 먼저 들어왔어요. 기계공학 전공에, 공모전 수상도 많고요. 근데 만지작거리는 건 안 좋아해요. 기계를 이해하고 그걸 전달하는 게 좋아요. 그게 영업이고 무역이죠. 회사가 저를 울산에 보낸 건 합격이나 다름없어서예요. 공장 견학, 인터뷰, 외국 바이어 안내. 사장님과 밥도 먹었습니다!',
    'Stone after stone, slammed down in handfuls. Chase his moves and you end up a struggling group.': '돌을 한 움큼씩 쾅쾅 내려놓는다. 그의 수를 쫓아가다간 곤마가 된다.',
    "Team up with me. Build the PT however you like. You'll shine. Send me your progress by mail, I'll cover my parts.": '저랑 같이 해요. PT는 장그래 씨 마음대로 만들어요. 빛날 거예요. 진행 상황은 메일로 보내 주세요. 제 몫은 제가 할게요.',
    '...Thanks.': '...고맙습니다.',
    "Yes, sir! Loyalty! I'm on my way.": '네, 부장님! 충성! 지금 갑니다.',
    "Isn't that the one they call the Peeper? Comes in early to watch the women arrive.": '저 사람 개벽이라고 부르는 그 사람 아니에요? 아침 일찍 와서 출근하는 여자들 구경한다던.',
    "He begged to go to Ulsan. Said he had to know the machines he'd sell. Passionate? No. Showing off. They say he made a big mistake in front of a buyer there.": '울산 보내 달라고 졸랐대요. 팔 기계는 알아야 한다고. 열정? 아니요, 허세죠. 거기서 바이어 앞에서 큰 실수를 했다는 소문도 있어요.',
    "A total dud. Who's going to be the bomb squad?": '완전 폭탄이네. 누가 폭탄 처리반 하려나?',
    'Jang is at the copier, humming.': '장그래는 복사기 앞에서 콧노래를 부른다.',
    "A dream: a great player's hand, a veteran's face. Giants who talk while countless people listen, and him with his eyes and ears shut. Next to the board where you fight alone, the world seems kinder, and warmer.": '꿈. 위대한 기사의 손, 노장의 얼굴. 거인들이 말하고 수많은 사람이 듣는데, 나는 눈과 귀를 막고 있다. 혼자 싸우는 바둑판에 비하면, 세상은 더 친절하고 따뜻해 보인다.',
    "On the train he scrolls his PT notes. The one thing he kept from giving up baduk is concentration. Right thinking shows the one proper move. The best of thought and experience: that's what baduk calls joseki. And he has sente. Build it however you like.": '지하철에서 그는 PT 메모를 넘겨 본다. 바둑을 포기하고 남은 유일한 자산은 집중력. 바른 생각은 하나의 정수를 보여 준다. 생각과 경험의 최선, 바둑에서 그것을 정석이라 한다. 그리고 나는 선수를 잡았다. 마음대로 만들어요.',
    'He mails Han three PT items and asks for feedback by tomorrow, then goes to lunch with the interns. Grilled mackerel. Pollack stew.': '그는 한석율에게 PT 아이템 세 개를 메일로 보내고 내일까지 의견을 달라고 한 뒤, 인턴들과 점심을 먹으러 간다. 고등어구이. 동태찌개.',
    'A text from Han: Again!': '한석율의 문자. 다시!',
    "Picked yours? Not Jang, surely. Everyone thinks he's easy.": '정했어요? 설마 장그래 씨는 아니죠? 다들 만만하게 보던데.',
    'Easy? Who knows. Maybe a big dud. A nuclear bomb.': '만만하다고요? 모르죠. 큰 폭탄일지도. 누끌리어 범.',
    'In the afternoon lull, people read the news on the sly, or nap. Only the interns are still busy. He calls Han from the restroom.': '오후의 나른함. 사람들은 몰래 기사를 읽거나 존다. 인턴들만 아직 바쁘다. 그는 화장실에서 한석율에게 전화한다.',
    'You said I could build it my way.': '마음대로 만들라고 하셨잖아요.',
    "I said share it. I never said I'd keep my mouth shut. I know how this company works. Who should be listening to whom? I'm helping you.": '공유하라고 했죠. 입 다물고 있겠다고는 안 했어요. 저는 회사가 어떻게 돌아가는지 알아요. 누가 누구 말을 들어야 할까요? 저는 도와드리는 거예요.',
    'Then what kind of item?': '그럼 어떤 아이템이요?',
    'Find it yourself.': '본인이 찾으세요.',
    "In the next stall, the glasses intern heard every word. By evening it's everywhere: a dud hugging a dud.": '옆 칸에서 안경 인턴이 다 들었다. 저녁이면 소문이 다 퍼진다. 폭탄이 폭탄을 안았다고.',
    'The Ulsan plant. Han runs across the factory floor.': '울산 공장. 한석율이 공장 바닥을 가로질러 뛴다.',
    "You begged, so you got one more chance. No mistakes. If you're not sure of yourself, go back to a desk and stop prancing round my site.": '사정사정해서 한 번 더 기회 준 거야. 실수하지 마. 자신 없으면 책상으로 돌아가서 내 현장에서 까불지 마.',
    'I can do it!': '할 수 있습니다!',
    'The department head mutters something as he goes. Han stands there, shaking.': '부장이 지나가며 뭐라고 중얼거린다. 한석율은 그 자리에서 떨고 있다.',
    'Night, in Seoul. Stones spilled on the floor by an abandoned board, and Jang at his screen. The world is far colder, and more heartless.': '서울의 밤. 버려진 바둑판 옆 바닥에 흩어진 돌, 모니터 앞의 장그래. 세상은 훨씬 더 차갑고, 비정하다.',
    'Not going to say?': '말 안 할래?',
    'Every chapter of this story opens on one move of a real game: the 1st Ing Cup final, game 5, 1989. Nie Weiping has White. Cho Hunhyun has Black. It will last 145 moves.': '이 이야기의 모든 장은 실제 바둑 한 판의 한 수로 시작한다. 1989년 제1회 응씨배 결승 5국. 백은 녜웨이핑, 흑은 조훈현. 이 대국은 145수까지 간다.',
    "You are Jang Geu-rae. It begins with a set of stones, and a small boy who can't leave them alone.": '당신은 장그래다. 모든 건 바둑돌 한 벌과, 그 돌에서 손을 떼지 못하던 꼬마에서 시작된다.',
    "Sixteen moves played. Jang has a desk, a team that's on his side, a partner who no longer gives the orders, and a PT in a few weeks.": '16수까지 두었다. 장그래에게는 책상 하나, 자기 편인 팀, 더는 지시하지 못하는 파트너, 그리고 몇 주 뒤의 PT가 있다.',
    'Next: a man with a resignation letter in his jacket, a child at a daycare door, and the test.': '다음: 재킷 안에 사직서를 넣고 다니는 남자, 어린이집 문 앞의 아이, 그리고 시험.',
    'Two liberties. If I put one here...': '활로가 둘. 여기에 하나 놓으면...',
    'Look again.': '다시 봐.',
    'Seven years. Again, half a point. Win this one.': '7년. 또 반집. 이번 판은 이기자.',
    'Half a point short. Again.': '반집 모자라. 또.',
    'Read it again.': '다시 읽어.',
    "I can't talk trade. I can talk this.": '무역 얘기는 못 해. 이건 할 수 있어.',
    'Snapback.': '환격.',
    'Not that. Again.': '그거 말고. 다시.',
    'Sloppy, red-eyed, bored. I read him wrong once. Not again.': '너저분하고, 눈 빨갛고, 지루해 보여. 한 번 잘못 읽었어. 이번엔 아니야.',
    'Obsessive. Responsible.': '집요하다. 책임감 있다.',
    'Read him again.': '다시 읽어.',
    'I lived by this my whole life. Make the group live, then attack.': '평생 이걸로 살았어. 먼저 살고, 그다음에 공격.',
    'Alive.': '살았다.',
    "It's dead. Again.": '죽었다. 다시.',
    "His scheme or Kim's? Neither has to die.": '그의 방식이냐 김 대리님 방식이냐? 어느 쪽도 죽을 필요 없어.',
    'Both live.': '둘 다 산다.',
    'One of them dies. Again.': '하나가 죽었다. 다시.',
    'Black approaches. The hard fight starts here.': '흑이 다가간다. 힘든 싸움은 여기서 시작돼.',
    'Black 7.': '흑 7.',
    'Not that one. Look again.': '그게 아니야. 다시 봐.',
    "The one inside the board can't see it. Step outside it.": '판 안에 있으면 안 보여. 밖으로 나가.',
    'There.': '거기.',
    'Still inside. Again.': '아직 안이야. 다시.',
    "Lead this time. Don't hand it over.": '이번엔 내가 이끈다. 넘겨주지 마.',
    'He takes it back with both hands.': '그가 두 손으로 다시 가져간다.',
    'Again.': '다시.',
    'He said build it my way. Hold him to it.': '마음대로 만들라고 했잖아. 그 말을 붙잡아.',
    'Black 11.': '흑 11.',
    'Black 15.': '흑 15.',
    # Places' map lines (claude/places-misaeng, w21); kept from the first Book 1 until Places rebuilds for this one
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
    "Kim Dong-sik doesn't look up from his screen.": '김동식 대리는 모니터에서 눈을 떼지 않는다.',
    'Section head Oh is on the phone, and holds up one finger.': '오 과장은 통화 중이다. 손가락 하나를 들어 보인다.',
    'The deputy turns his empty cup round and round.': '차장이 빈 컵을 빙글빙글 돌린다.',
    # Places' map lines for the rewritten Book 1 (claude/places-misaeng bc9b524)
    'A salaryman at the next table, his tie round his head. “Students! Interns! Play me, the loser pays!”': '넥타이를 머리에 두른 옆 테이블 직장인. "학생들! 인턴들! 나랑 한 판 두자. 지는 쪽이 계산!"',
    "“…Bah. Barman! Their table's on me.”": '"…에잇. 사장님! 저 테이블 계산 제가 해요."',
    'The salaryman is asleep on his arms.': '직장인이 팔을 베고 잠들어 있다.',
    'A table of office workers outside a beer hall, ties loose, toasting nobody in particular.': '호프집 밖 테이블의 직장인들, 넥타이를 풀고 딱히 누구랄 것도 없이 건배한다.',
    "A team dinner spills onto the pavement. “To the director's leadership!” The glasses go up. The director beams.": '회식이 인도까지 넘쳐 나온다. "부장님의 리더십을 위하여!" 잔들이 올라간다. 부장이 활짝 웃는다.',
    "A man smoking by the kerb. “Our department head? Useless. Couldn't find his own—” His phone rings. “Yes, sir! Of course, sir. Right away, sir.”": '연석에서 담배를 피우는 남자. "우리 부장? 쓸모없어. 자기 거 하나도 못 찾—" 전화가 울린다. "네, 부장님! 물론이죠, 부장님. 바로 가겠습니다, 부장님."',
    "Two juniors share a cigarette. “Cogs. That's all we are. Ants, carrying crumbs home.”": '담배 한 개비를 나눠 피우는 두 막내. "톱니바퀴야. 우린 그게 다야. 부스러기 나르는 개미들."',
    "A drunk sways at the crossing and points at the sky. “See that plane? It's circling Seoul! For me! A genius, you know, one genius feeds thousands!”": '건널목에서 비틀거리던 취객이 하늘을 가리킨다. "저 비행기 봐! 서울을 한 바퀴 돈다! 나를 위해서! 천재 한 명이, 천재 한 명이 수천 명을 먹여 살린다고!"',
    "An old man at the stone table, in the evening, waves you over without looking up. “You. You've got a player's hands. Sit.”": '저녁, 돌 탁자의 노인이 쳐다보지도 않고 손짓한다. "자네. 바둑 두는 손이구먼. 앉아."',
    '“Hm. Where did you learn that? Go on, then.”': '"흠. 어디서 배웠나? 그럼 가 봐."',
    "An intern from the other teams leans in the hof's doorway. “The parachute. The rest of us got in on paper. Beat me, and you can sit with us.”": '다른 팀 인턴이 호프집 문간에 기대어 있다. "낙하산이네. 우린 다 서류로 들어왔는데. 나 이기면, 우리랑 앉아도 돼."',
    "“…Huh. Sit down, then. You're buying.”": '"…허. 그럼 앉아. 네가 사."',
    'The intern at the door has gone in to his table.': '문간의 인턴은 자기 테이블로 들어갔다.',
    'A trainee from the room, still in his school uniform, with a pocket board. “One more? Before you go home and they ask how it went?”': '아직 교복을 입은 연구생 하나가 포켓 바둑판을 들고 있다. "한 판 더? 집에 가서 어땠냐고 물어보기 전에?"',
    "“…You'll make it next year. Probably.”": '"…내년엔 될 거야. 아마."',
    'The trainee is replaying your game, move by move.': '연구생이 당신의 대국을 한 수씩 복기하고 있다.',
    'The clerk looks up. “Requisition? You need the form. Signed.”': '직원이 고개를 든다. "신청서요? 양식이 있어야 해요. 서명된 걸로."',
    "The clerk stamps Kim Dong-sik's requisition without reading it. “Supplies are by the lift. Sign here.”": '직원이 김동식 대리의 신청서를 읽지도 않고 도장을 찍는다. "비품은 엘리베이터 옆이에요. 여기 서명하세요."',
    'General Affairs has the requisition.': '총무팀이 신청서를 받았다.',
    "A clerk at General Affairs' counter, sorting forms into trays.": '총무팀 창구의 직원이 서류를 칸칸이 나눠 넣고 있다.',
    "The copier groans out Kim Dong-sik's copies, warm.": '복사기가 신음하며 김동식 대리의 복사본을 따끈하게 뱉어 낸다.',
    'The team phone.': '팀 전화.',
    'You ring the forwarder about the B/L. On hold. Then a voice: the bill of lading went out this morning. You write it down.': '포워더에게 B/L 건으로 전화한다. 대기음. 그리고 목소리. 선하증권은 오늘 아침에 나갔습니다. 받아 적는다.',
    "The team phone. The forwarder's call is done.": '팀 전화. 포워더 통화는 끝났다.',
    "Crushed against the door at dawn, a woman holds a pocket board over everyone's heads. “Black to live. You look like you'd know.”": '새벽, 문에 짓눌린 채 한 여자가 사람들 머리 위로 포켓 바둑판을 들고 있다. "흑 사는 수. 아실 것 같은데."',
    "“…Of course. Thank you. I'll be thinking about that all day.”": '"…역시. 고마워요. 하루 종일 그 생각 할 것 같아요."',
    'The woman with the pocket board is asleep on her feet.': '포켓 바둑판을 든 여자가 선 채로 졸고 있다.',
    'A mop and a bucket, behind the cupboard door. You take them.': '청소 도구함 문 뒤에 대걸레와 양동이. 꺼내 든다.',
    "The cleaning cupboard. The mop's back on its hook.": '청소 도구함. 대걸레는 다시 걸이에 걸려 있다.',
    'Coffee, trodden into the carpet all morning. You mop it, wring it, mop it again. Nobody looks up.': '아침 내내 밟혀 카펫에 스민 커피. 닦고, 짜고, 다시 닦는다. 아무도 고개를 들지 않는다.',
    'Coffee, trodden into the carpet. Someone said: wipe this floor.': '카펫에 밟힌 커피 자국. 누군가 말했다. 여기 바닥 좀 닦아.',
    "The floor's clean. Nobody noticed.": '바닥이 깨끗해졌다. 아무도 몰랐다.',
    '...The second item is good.': '...두 번째 아이템은 괜찮네.',
    "A player who doesn't hand over sente.": '선수를 넘기지 않는 선수다.',
    'Again?': '다시?',
    'And.': '그리고.',
    'Baduk is a fight at bottom, a war. You give way when pressed, sometimes you look to share the board, but the winner and the loser are plain. He lived in that world for over ten years. A beaten soldier, but raised to compete.': '바둑은 결국 싸움이고 전쟁이다. 밀리면 물러서고 때로는 공존을 찾지만, 승자와 패자는 분명하다. 그는 그 세계에서 십 년 넘게 살았다. 패잔병이지만, 승부사로 길러진 사람.',
    "Han asks for help anyway. The old man softens. Buy me a soju when it's done.": '그래도 한석율은 도와 달라고 한다. 노인이 누그러진다. 끝나면 소주나 한잔 사.',
    'Han rings Jang from outside the plant, cigarette in hand.': '한석율이 공장 밖에서 담배를 든 채 장그래에게 전화한다.',
    'He drops the honorifics.': '그가 존댓말을 내려놓는다.',
    'He slips into an empty meeting room and calls Ulsan.': '그는 빈 회의실로 들어가 울산에 전화를 건다.',
    'He yawns, eyes watering, and goes back to his desk.': '그는 눈물이 맺히도록 하품을 하고 자리로 돌아간다.',
    'How is it?': '어때요?',
    'How old are you, anyway?': '너 몇 살이냐?',
    'Huh...?': '어...?',
    'Interns are staff too, you know. Is this company work, or your own? Look at the size of it...': '인턴도 직원이에요. 이게 회사 일이에요, 개인 일이에요? 이 분량 좀 봐...',
    'Kim, under his breath: answer that fast and he gets angrier. He never got the time to be angry.': '김대리가 작게 말한다. 그렇게 빨리 대답하면 더 화내. 화낼 시간을 못 받았으니까.',
    'Kim. Playing house? Really?': '김대리, 소꿉장난해? 진짜?',
    'Make the corner solid, then fight.': '귀를 단단히 하고, 그다음에 싸운다.',
    'Morning. Oh, red-eyed, holds up a document Jang made for the team.': '아침. 눈이 충혈된 오과장이 장그래가 팀을 위해 만든 문서를 들어 보인다.',
    "Night, the lounge. He types alone. Forty-two pages. Forty. Fifty-three. More pages don't make it better; an item plan isn't a book report. He keeps going.": '밤, 휴게실. 그는 혼자 타자를 친다. 42쪽. 40쪽. 53쪽. 쪽수가 많다고 좋은 게 아니다. 아이템 기획서는 독후감이 아니다. 그래도 그는 계속한다.',
    "On the frame strip, Black's stones sit in the lower-left corner beside White's. Cho makes them solid first, then turns to fight.": '기보 띠 위, 흑돌이 좌하귀에 백돌과 붙어 있다. 조훈현은 먼저 그 돌들을 단단히 하고, 그다음 싸움으로 돌아선다.',
    "Please check it. If it's short, I'll redo it.": '확인해 주세요. 부족하면 다시 하겠습니다.',
    'Same colours. Big groups over small ones. Smaller boxes.': '색은 통일하고. 큰 묶음 아래 작은 묶음. 박스는 작게.',
    'Shrink the boxes.': '박스 줄여.',
    'Sorry.': '죄송합니다.',
    'Sorry. Jang, can you fix it now?': '죄송합니다. 장그래 씨, 지금 고칠 수 있지?',
    'Still a mess. Again.': '아직 엉망이야. 다시.',
    "That's what we agreed.": '그렇게 하기로 했잖아요.',
    'The interns had the PT exam. They were short of time.': '인턴들이 PT 시험 때문에 시간이 없었을 겁니다.',
    "Then it's settled. We chose the item together, and you agreed to it. From here I write the PT, my way. I'll share the progress, but I don't take instructions. That's what we agreed, isn't it?": '그럼 정해졌네요. 아이템은 같이 골랐고, 동의하셨죠. 이제부터 PT는 제 방식대로 씁니다. 진행 상황은 공유하지만, 지시는 받지 않습니다. 그렇게 하기로 했잖아요?',
    'This little runt...': '이 자식이...',
    "Ulsan. In a fibre warehouse, the site's department head shows Han the bolts: strength, carbonisation, density. Leave that to the buyer's experts, he says. Your job is the samples and the papers, on the day, with no mistakes.": '울산. 섬유 창고에서 현장 부장이 한석율에게 원단을 보여 준다. 강도, 탄화, 밀도. 그건 바이어 쪽 전문가에게 맡기라고 한다. 네 일은 샘플과 서류를 약속한 날에, 실수 없이 전하는 거라고.',
    'We chose it together. He agreed. Hold him to it.': '같이 골랐어. 그도 동의했어. 그 약속을 지키게 해.',
    'Well...': '글쎄...',
    'What?': '뭐?',
    'Yes. Decided.': '응. 정했어.',
    'Yes. Yes, yes.': '네. 네, 네.',
    'You call this a plan? An after-school hobby? Where I interned, I spent four days on one item. Twenty pages, packed tight.': '이게 기획서예요? 방과후 취미 계획이에요? 내가 인턴 했던 회사에선 아이템 하나에 나흘, 빽빽하게 스무 장씩 썼어요.',
    "You should have followed the seniors' materials. Fixing it now won't help, I have to take this in and report! Colours that don't match, boxes all over the place, no order to any of it. What did you do yesterday?": '선배들이 만든 자료를 따라 했어야지. 지금 고친다고 해결돼? 이거 들고 가서 보고해야 된다고! 색깔은 제각각, 박스는 여기저기, 체계도 하나 없고. 어제 뭐 했어?',
    "You're sure?": '확실해요?',
    'A board covered in white stones. One of them falls to the floor.': '흰 돌로 덮인 바둑판. 그중 하나가 바닥으로 떨어진다.',
    'After many short nights, he sleeps deeply at last: slumped in a chair in an empty meeting room.': '짧은 밤들 끝에, 마침내 깊이 잠들었다. 빈 회의실 의자에 축 늘어진 채로.',
    'All those items. Is he doing the PT alone?': '아이템을 저렇게나. 혼자 PT 하는 거야?',
    "His partner's Han Seok-yul, the one who went to the Ulsan plant. Han's a talker. I'd bet Jang's doing all the work.": '파트너가 한석율입니다. 울산 공장 간 친구요. 한석율이 말을 잘하니까, 일은 장그래가 다 하고 있을 겁니다.',
    "A smooth talker, and one who can't tell he's being used. Some team.": '말발 좋은 놈하고, 이용당하는 줄도 모르는 놈이라. 팀 한번 좋네.',
    "He dreams of his heroes. Cho Nam-chul. Cho Hunhyun. Lee Chang-ho, Yoo Chang-hyuk. Lee Sedol. Cho Chikun, Segoe. One by one they fade. Don't go, he begs them. I'll do better.": '그는 영웅들의 꿈을 꾼다. 조남철. 조훈현. 이창호, 유창혁. 이세돌. 조치훈, 세고에. 하나씩 희미해진다. 가지 마세요, 그는 빈다. 더 잘할게요.',
    "My heroes are fading away. If they stayed, what could I do? Haven't I let go of baduk yet?": '나의 영웅들이 사라져 간다. 남아 있은들 내가 뭘 할 수 있을까. 나는 아직 바둑을 놓지 못한 걸까.',
    'You were crying. And talking in your sleep. Picked your partner?': '울던데요. 잠꼬대도 하고. 파트너는 정했어요?',
    "Han Seok-yul. He's at the Ulsan plant.": '한석율 씨요. 지금 울산 공장에 있어요.',
    "I've heard. Hungry for it. He'll use a weak partner to shine, and a strong one too.": '들었어요. 욕심 많은 사람이라고. 약한 파트너는 돋보이려고 쓰고, 강한 파트너도 이용할 거예요.',
    'I sensed that.': '저도 느꼈어요.',
    'An ambitious man is a tornado. He wrecks everything round him. But the eye of a tornado is calm. Get into his centre, and you two could really work. Forget the gossip.': '야심가는 토네이도예요. 주변을 다 부수죠. 그런데 토네이도의 눈은 고요해요. 그 사람 중심으로 들어가면 두 사람, 정말 잘 맞을 수 있어요. 소문은 잊어요.',
    "I don't have that kind of skill.": '저한텐 그런 능력이 없어요.',
    "No. Your résumé's specialties box is empty. Shame insight doesn't count. You've got an unusual eye.": '그렇죠. 이력서 특기란이 비어 있으니까. 통찰력이 특기로 안 쳐지는 게 아쉽네요. 보는 눈이 남달라요.',
    'And your partner?': '그쪽 파트너는요?',
    'Still deciding. Nobody wants to team up with me.': '아직 고민 중이에요. 나랑 하겠다는 사람이 없네요.',
    'Anyone good enough would work well with you.': '실력 있는 사람이라면 누구든 잘 맞을 거예요.',
    'See? Insight. ...I just complimented myself.': '봐요, 통찰력. ...방금 내 자랑 한 거죠.',
    "Wait, that's why I came! The seniors have called all the interns out. It's evening. You slept the whole day.": '아, 그래서 온 건데! 선배들이 인턴 전부 모이래요. 벌써 저녁이에요. 하루 종일 잤어요.',
    "Here to sleep, or to work? He's late. Three penalty glasses.": '잠자러 왔어, 일하러 왔어? 늦었으니 벌주 석 잔.',
    'Sorry. Yes, sir.': '죄송합니다. 네.',
    'For the first time, he feels part of the team. The ones who use him, help him, get angry with him and scold him: all of them are on his side. Here, he is not an outsider.': '처음으로, 팀의 일원이라고 느낀다. 나를 이용하고, 돕고, 화내고, 꾸짖는 사람들, 모두가 내 편이다. 여기서 나는 이방인이 아니다.',
    "With that, he ends today's baduk. Where the white stone fell from the board, there's a black one.": '이것으로 오늘의 바둑을 마친다. 흰 돌이 떨어져 나간 자리에, 검은 돌이 놓여 있다.',
    "I've told you. Don't glue on top of other papers; it gets on the sheet underneath. Move it first.": '말했잖아. 다른 서류 위에서 풀칠하지 마. 밑에 있는 종이에 묻어. 먼저 치워.',
    "And before anything goes in the scrap bin, check it isn't confidential. Figures, anything confidential: the shredder at the end of the floor. No paper of ours is ever found outside this team.": '그리고 이면지함에 넣기 전에 기밀인지 확인해. 숫자 있는 거, 기밀은 전부 층 끝에 있는 파쇄기로. 우리 서류가 부서 밖에서 발견되는 일은 절대 없어야 돼.',
    'Yes, sir.': '네.',
    'Kim Seok-ho, an intern on another team, hurries by.': '다른 팀 인턴 김석호가 바삐 지나간다.',
    'Done your weekly report?': '주간 보고서 다 했어요?',
    "Not yet. There are parts I don't get, and my section head's out on site.": '아직요. 모르는 부분이 있는데, 과장님이 현장에 나가 계셔서요.',
    'The waybill copy and the payment details. Shred those?': '선하증권 사본이랑 대금 내역, 파쇄하면 되죠?',
    'Shred them.': '파쇄해.',
    "He'll wait for a few more approved papers and shred the lot at once. The yellow waybill stays on his desk: Sales Team 3, DH-14.": '결재 서류가 좀 더 모이면 한꺼번에 파쇄하기로 한다. 노란 선하증권은 책상 위에 남는다. 영업 3팀, DH-14.',
    'Can I borrow your glue?': '풀 좀 빌릴 수 있을까요?',
    "On my desk. Doesn't your team have any?": '제 책상에 있어요. 그쪽 팀엔 없어요?',
    "The cabinet's locked, and nobody gives me the key. I have to beg every time.": '비품함이 잠겨 있는데 아무도 열쇠를 안 줘요. 매번 빌리러 다녀야 해요.',
    "At Jang's desk he glues his report pages flat, the waybill underneath. The glue soaks through. Late again, he scoops up his papers and runs, the waybill stuck to their back.": '장그래의 책상에서 그는 보고서를 풀로 붙여 꾹 누른다. 밑에는 선하증권이 있다. 풀이 배어든다. 또 늦은 그는 서류를 쓸어 담아 뛰어간다. 선하증권이 뒤에 붙은 채로.',
    "Jang gathers his pile and feeds the shredder, humming. He doesn't notice what isn't there.": '장그래는 서류 더미를 모아 콧노래를 부르며 파쇄기에 넣는다. 무엇이 빠졌는지는 알아채지 못한다.',
    'Down in the lobby, Seok-ho finds the yellow sheet on his papers, tears it off and asks the security desk to throw it away. It slides off the counter onto the floor. A director stops beside it, and taps it with his shoe.': '로비에서 석호는 서류에 붙은 노란 종이를 발견하고, 떼어 내 보안 데스크에 버려 달라고 맡긴다. 종이는 카운터에서 미끄러져 바닥에 떨어진다. 한 상무가 그 옆에 멈춰 서서 구두 끝으로 툭 건드린다.',
    'Director! Is this about a team dinner?': '상무님! 회식 때문에 오셨습니까?',
    "Without a word, the director kicks the team's paper box over. His aide hands Oh the waybill: found on the lobby floor.": '상무는 말없이 팀의 이면지 박스를 걷어찬다. 수행원이 오 과장에게 선하증권을 건넨다. 1층 로비 바닥에서 주운 것이다.',
    "Let's do our jobs properly.": '일들 똑바로 합시다.',
    'Yes, sir! Yes, sir!': '네! 알겠습니다!',
    'Clean this up.': '치워.',
    'Kim and Jang go down on their knees for the papers.': '김 대리와 장그래가 무릎을 꿇고 서류를 줍는다.',
    'Get all the interns together!': '인턴들 전부 집합시켜!',
    "On the roof, a senior yells at a line of interns. Do they think they've got the job already? Focus!": '옥상에서 한 선배가 줄 선 인턴들에게 소리친다. 벌써 정직원이라도 된 줄 아나? 정신 차려!',
    'At his desk, Oh turns the waybill over. Glued to it is a torn scrap of white paper. Weekly report. Internship. Kim Seok-ho.': '자리에서 오 과장이 선하증권을 뒤집는다. 찢어진 흰 종잇조각이 붙어 있다. 주간 보고서. 인턴. 김석호.',
    'Applause from across the floor. Go, a section head on Sales Team 1, comes over pumping his fists.': '사무실 건너편에서 박수가 터진다. 영업 1팀 고 과장이 주먹을 흔들며 건너온다.',
    "My baby intern, Kim Seok-ho! Drafts like a machine, all-nighters with us. Left another firm's internship because he wanted a real trading company. Newly married, and he barely goes home. Married young: eldest son of an eldest son. And we've just landed it.": '우리 막내 인턴 김석호! 문서를 기계처럼 뽑아. 우리랑 밤도 새우고. 종합상사에 오고 싶어서 다른 회사 인턴도 그만두고 왔대. 신혼인데 집에도 잘 안 가. 장남의 장남이라 일찍 장가갔다더라고. 그리고 우리가 방금 따냈지.',
    'He comes to our team a lot. To borrow supplies.': '그 친구, 우리 팀에 자주 오던데. 비품 빌리러.',
    "Ha! My fault. The cabinet key's on my key ring.": '하! 내 탓이지. 비품함 열쇠가 내 열쇠고리에 있거든.',
    'They grade interns on everything. Keep him from careless slips.': '인턴은 다 평가받아. 사소한 실수 안 하게 잘 챙겨.',
    'Results are what count. He did all our translating. ...The interns are off somewhere. Back soon.': '결과가 중요하지. 번역이랑 통역은 그 친구가 다 했어. ...인턴들 어디 갔나 보네. 곧 오겠지.',
    'Oh looks at the folder in his hands. A locked cabinet. A borrowed glue stick. A waybill that walked.': '오 과장은 손에 든 서류철을 내려다본다. 잠긴 비품함. 빌려 간 풀. 걸어 나간 선하증권.',
    'By the copier, the interns troop back from the roof, groaning. Jang tells a staffer it was his fault: he left a waybill lying about, the director picked it up in the lobby, and everyone paid for it.': '복사기 옆으로 인턴들이 끙끙대며 옥상에서 돌아온다. 장그래는 한 직원에게 자기 잘못이라고 말한다. 선하증권을 아무 데나 두었고, 상무가 로비에서 주웠고, 다들 그 값을 치렀다고.',
    "At the end of the day Kim is still on a shipping request. Oh takes the phone and bullies the buyer onto a container ship: the contract date doesn't move.": '퇴근 무렵에도 김 대리는 선적 요청서를 붙들고 있다. 오 과장이 전화를 뺏어 바이어를 몰아붙여 컨테이너선으로 바꾸게 한다. 계약일은 못 미룬다.',
    "Let's go and drink.": '한잔하러 가자.',
    'His intern lives on our supplies. Why?': '그 인턴은 우리 비품으로 산다. 왜?',
    'The cabinet key. The glue.': '비품함 열쇠. 그리고 풀.',
    "It isn't nine yet, and Oh is already tipsy.": '아홉 시도 안 됐는데 오 과장은 벌써 취했다.',
    "Sore about Go's big win?": '고 과장님 대박 난 게 배 아프세요?',
    'No. Geu-rae did nothing wrong today.': '아니. 오늘 그래는 잘못한 거 없어.',
    "Why dig it up? It's done.": '다 끝난 걸 왜 들추세요?',
    "It's bad to be misunderstood.": '오해받는 건 나쁜 거야.',
    'Then who did it?': '그럼 누가 그랬는데요?',
    'A secret.': '비밀.',
    'Thank you. It was still my carelessness.': '감사합니다. 그래도 제 부주의였습니다.',
    "Go's team comes up the street, drunk on their win.": '승리에 취한 고 과장네 팀이 길을 따라 올라온다.',
    'Jealous, Oh? You snub my intern over a few supplies, and now you want to spoil our win?': '배 아파, 오 과장? 비품 몇 개 가지고 우리 인턴 구박하더니, 이제 우리 잔치까지 망치려고?',
    'Get your intern his own glue! Mine took the blame because yours got glue on a document and dropped it!': '니 인턴한테 풀이나 사 줘! 니 인턴이 서류에 풀 묻혀서 떨어뜨리는 바람에 우리 인턴이 덤터기 썼어!',
    'Supplies! Always supplies!': '비품! 맨날 비품!',
    "Go doesn't take it in. Kim Seok-ho does.": '고 과장은 알아듣지 못한다. 김석호는 알아듣는다.',
    "...I'm sorry.": '...죄송합니다.',
    "He says he'll ring his wife, and goes back to drinking with his team.": '그는 아내에게 전화하겠다고 말하고, 팀과 함께 다시 술자리로 돌아간다.',
    'Stay on your toes, punk.': '정신 바짝 차려, 인마.',
    'Late, Kim Seok-ho comes home to one room. His wife has only just got to sleep. The baby is awake, and knows him. Dada. Her hand closes round his finger. He falls asleep beside them in his suit.': '늦은 밤, 김석호가 단칸방으로 돌아온다. 아내는 막 잠들었다. 아기는 깨어 있고, 아빠를 알아본다. 아빠. 작은 손이 그의 손가락을 꼭 쥔다. 그는 양복 차림 그대로 그 옆에서 잠든다.',
    'In another room, in the dark, Jang sets stones on a board, one at a time.': '다른 방, 어둠 속에서 장그래가 바둑판에 돌을 하나씩 놓는다.',
    "Incheon harbour, at first light. Cargo meant for Gunsan was unloaded here, some of it damaged, and he came to see it with his own eyes. The more you lean on paper, the further you drift from the site, until you have to take the other side's word for it.": '새벽의 인천항. 군산으로 가야 할 화물이 여기 내려졌고, 일부는 파손됐다. 그는 직접 눈으로 보러 왔다. 서류에 기댈수록 현장에서 멀어지고, 결국 상대의 말을 믿을 수밖에 없게 된다.',
    "He settles it with the forwarder and the insurer. Every arrival date has a few spare days in it; no real harm. A late breakfast. He's pleased with himself.": '포워더, 보험사와 정리한다. 도착 예정일엔 늘 여유가 며칠 있으니 큰 탈은 없다. 늦은 아침. 스스로가 뿌듯하다.',
    'Back on the thirteenth floor, the air is tight. Kim Dong-sik waves him over to watch.': '13층에 돌아오니 공기가 팽팽하다. 김동식 대리가 와서 보라고 손짓한다.',
    "Steve Han: an American citizen, his family emigrated after middle school. Department head of the Americas textile team. Facing him, Kim Bu-ryeon, department head over Sales Teams 1, 2 and 3. The same rank. Steve has come onto Kim's floor to pick a fight, with everyone watching.": '스티브 한. 미국 시민권자, 중학교를 마치고 가족과 이민 갔다. 미주 섬유팀 부장. 그 맞은편엔 영업 1, 2, 3팀을 이끄는 김부련 부장. 같은 직급이다. 스티브는 모두가 지켜보는 가운데 김 부장의 층에 싸움을 걸러 왔다.',
    'My team was up all night. You had the report on time.': '우리 팀이 밤새웠습니다. 보고서는 제때 드렸고요.',
    "I don't have time for a report this thick. A fat report hands over every scrap so nobody has to take responsibility. A title means you take responsibility.": '이렇게 두꺼운 보고서 볼 시간 없습니다. 두꺼운 보고서는 정보를 다 넘겨서 아무도 책임 안 지려는 거예요. 직함이 있다는 건 책임을 진다는 겁니다.',
    'We wanted to help you understand the situation.': '상황을 이해하시는 데 도움이 되려고 했습니다.',
    "My job is selling textiles in the Americas. I need to understand the client, not your catalogue. Don't write me a thesis. Come and see me. Answer my questions.": '내 일은 미주에 섬유를 파는 겁니다. 내가 알아야 할 건 고객이지, 당신네 카탈로그가 아니에요. 논문 쓰지 말고, 찾아와서 내 질문에 답하세요.',
    'A report is more accurate.': '보고서가 더 정확합니다.',
    "Stop making other people do your team's work. I don't care where the yarn came from. Who's it for? What climate do they live in? What taste went into the design? Just tell me what I need.": '당신 팀 일을 남한테 시키지 마세요. 원사가 어디서 왔는지는 관심 없어요. 누구를 위한 건지, 그 사람들이 어떤 기후에 사는지, 디자인에 어떤 취향이 들어갔는지. 내가 필요한 것만 말해 주세요.',
    "...We'll revise it.": '...수정하겠습니다.',
    "Everyone is playing their own baduk, and wants to play the best moves they've prepared. Whoever prepared better is happier with the result. Whoever rushed to keep pace, and lost, has no excuse.": '모두가 자신만의 바둑을 두고 있다. 저마다 준비한 최선의 수를 두고 싶어 한다. 더 잘 준비한 쪽이 결과에 더 만족한다. 상대를 따라가느라 서두르다 진 쪽은 변명할 거리가 없다.',
    'And Kim Bu-ryeon lost on his own ground, with a crowd to watch.': '그리고 김부련 부장은 자기 땅에서, 구경꾼들 앞에서 졌다.',
    'In a meeting room afterwards, Oh presses Go. Why would Steve lecture their department head on the basics?': '그 뒤 회의실에서, 오 과장이 고 과장을 추궁한다. 스티브가 왜 우리 부장님한테 일의 기본을 훈계하겠어?',
    "Poor communication. He's picky. Too American.": '소통이 안 돼서 그래. 까다롭잖아. 너무 미국식이야.',
    'He spoke to us in Korean just now. Out with it.': '방금 우리한테 한국말로 했어. 털어놔.',
    "The buyers came. Steve suggested dinner with my team, and I picked the place. I'd had a few. I told them this is how Koreans get friendly over work.": '바이어들이 왔었어. 스티브가 우리 팀이랑 저녁 하자고 했고, 장소는 내가 골랐지. 좀 취했어. 한국에선 일하면서 이렇게 친해지는 거라고 했지.',
    'What did you feed them?': '뭘 먹였는데?',
    '...Dog meat.': '...개고기.',
    'Everyone plays their own baduk. The better prepared is happier.': '모두 자신만의 바둑을 둔다. 더 준비한 쪽이 웃는다.',
    "How it happened. Over drinks at a dog-meat place, section heads from rival companies traded buyer stories. Plenty of foreigners love it, they said; more of them can't stand perilla leaves. Go envied their adventurous spirit.": '일의 시작은 이랬다. 보신탕집 술자리에서 다른 회사 과장들이 바이어 이야기를 주고받았다. 외국인도 잘만 먹더라, 깻잎을 더 싫어하더라. 고 과장은 그들의 도전 정신이 부러웠다.',
    "So he took a buyer, and Steve, to a dog-meat restaurant. He read Steve wrong: a foreigner who wouldn't know, or a Korean at heart under the American passport. Steve saved the deal. Go never apologised, and his paperwork was sloppy, so Steve sat on Sales Team 1's approvals. Then Kim Bu-ryeon called him up to complain, and lost.": '그래서 그는 바이어와 스티브를 보신탕집에 데려갔다. 스티브를 잘못 읽었다. 모를 외국인이거나, 미국 여권 아래 속은 한국인이거나. 스티브는 거래를 살려 냈다. 고 과장은 끝내 사과하지 않았고 서류도 엉성했다. 스티브는 영업 1팀의 결재를 묶어 두었다. 그러자 김부련 부장이 그를 불러 따졌고, 졌다.',
    'Go wanted to take Steve to a sauna and settle it man to man. I talked him out of it.': '고 과장이 스티브를 사우나에 데려가서 남자 대 남자로 풀겠다더라. 내가 말렸어.',
    "A sauna? Steve looks easy-going, but he's a very private man.": '사우나요? 스티브 부장님, 털털해 보여도 엄청 사적인 사람이에요.',
    "And our department head is too sore to apologise. In a way, it's checkmate.": '부장님은 자존심 상해서 사과도 못 하시고. 어떻게 보면 외통수야.',
    "Baduk words, from people who don't play. Jang grins.": '바둑 안 두는 사람 입에서 바둑 말이 나온다. 장그래가 웃는다.',
    "You're laughing while your seniors talk?": '선배들 얘기하는데 웃어?',
    "If it's checkmate, you stop clinging to the stone. You give it up.": '외통수라면 그 돌에 매달리지 말아야 한다. 버려야 한다.',
    "Apologising is the only way. In baduk they say don't leave dead stones on the board. Steve will do it again, and a dead stone left lying there grows into a bigger problem.": '사과하는 수밖에 없습니다. 바둑에선 죽은 돌을 판 위에 남겨 두지 말라고 합니다. 스티브 부장님은 또 그러실 거고, 남겨 둔 사석은 더 큰 문제로 자랍니다.',
    "Easier said. He's proud, and he was shamed in front of his people. An office runs on politics.": '말이 쉽지. 자존심 센 분인데, 부하들 앞에서 망신당하셨어. 회사는 정치로 굴러가.',
    "Getting nervous over something this petty hurts his pride more. If it's politics, let's do it with class. Being humble when it counts: that's class. Let's go.": '이런 쩨쩨한 일에 전전긍긍하는 게 더 자존심 상하는 거야. 정치를 할 거면 품위 있게 하자. 숙일 때 숙이는 게 품위야. 가자.',
    "Kim Bu-ryeon isn't at his desk. He left scowling, someone says, with Go.": '김부련 부장은 자리에 없다. 인상을 쓰고 고 과장이랑 나갔다고 누군가 말한다.',
    "He's gone to Steve.": '스티브 부장님한테 가셨어요.',
    "Checkmate. Don't cling to it. Don't leave it on the board.": '외통수다. 매달리지 마라. 판 위에 남겨 두지 마라.',
    'Give it up. Apologise.': '버린다. 사과한다.',
    "It's still on the board. Again.": '아직 판 위에 있다. 다시.',
    'Behind a partition on the textile floor: Kim Bu-ryeon is already there, with Go. He got there first.': '섬유팀 층의 파티션 너머. 김부련 부장이 이미 고 과장과 함께 와 있다. 먼저 와 있었다.',
    "I didn't know what had happened. I'm sorry.": '무슨 일이 있었는지 몰랐습니다. 죄송합니다.',
    "And I'm sorry I lost my temper. Thank you for coming yourself. I expected Go to come alone.": '저도 화낸 건 죄송합니다. 직접 와 주셔서 고맙습니다. 고 과장 혼자 올 줄 알았는데요.',
    "I was petty. I sulked. I'm sorry. ...So will the approvals go faster now?": '제가 쩨쩨했습니다. 삐쳐 있었어요. 죄송합니다. ...그럼 이제 결재는 빨리 나는 겁니까?',
    "Is that why you're apologising?": '그래서 사과하는 겁니까?',
    "I'm sorry for him, too.": '이 친구 대신 그것도 사과드립니다.',
    'Everyone laughs.': '모두가 웃는다.',
    "Often the obvious move is the hardest. Players lose games they could have won because they won't take the plain path, and each refusal tangles things further. Some things you must do however hard, and some you must not do however easy. He has seen it twice today: this morning, and now.": '당연한 수가 가장 어려울 때가 많다. 쉬운 길을 두고 가지 않아서, 이길 판을 지는 기사들이 있다. 거부할 때마다 일은 더 꼬인다. 아무리 어려워도 해야 할 일이 있고, 아무리 쉬워도 하지 말아야 할 일이 있다. 오늘 두 번 보았다. 아침에, 그리고 지금.',
    'A dry sauna. Towels on wooden benches. Steve alone at the far end.': '건식 사우나. 나무 의자 위의 수건들. 스티브는 맨 끝에 혼자 앉아 있다.',
    'Steve! Come on, scoot over.': '스티브! 이리 좀 붙어 앉아요.',
    "Don't touch me!": '건드리지 마!',
}
