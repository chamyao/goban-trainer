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


def D(who, q, open_, win, slip, **kw):
    """A decision board: the caption over the problem, and the decider's own lines on it."""
    return {"q": q, "who": who, "open": open_, "win": win, "slip": slip, **kw}


# Cast id (Graphics' TK_CHARS keys) -> Kokoro English voice (ids already used in the repo).
CAST21 = {
    "ms_jang": "am_liam", "ms_jang_young": "am_liam", "ms_jang_child": "af_sky", "ms_mother": "bf_emma",
    "ms_oh": "am_onyx", "ms_oh_hike": "am_onyx", "ms_kimds": "am_eric", "ms_ahn": "af_bella", "ms_han": "am_michael", "ms_kimsh": "am_adam",
    "ms_kimbr": "bm_george", "ms_director": "bm_fable", "ms_hr": "am_michael", "ms_trainee": "af_sky",
    "ms_stevehan": "am_echo", "ms_go": "am_fenrir", "ms_buyer": "bm_lewis", "ms_sponsor": "bm_daniel", "ms_exec": "bm_lewis",
    # new in this book (Graphics: to draw)
    "ms_uncle": "am_fenrir", "ms_hoyong": "am_puck", "ms_sanggi": "am_adam", "ms_bujang": "bm_george",
    "ms_ohwife": "af_sarah", "ms_ohson": "af_sky", "ms_kangsil": "am_echo", "ms_glasses": "am_puck",
    "ms_amhead": "bm_fable", "ms_ulsan": "am_fenrir", "ms_teacher": "bm_daniel",
}


def _scenes():
    return {
        # M1 · 착수0 (W; at the family flat, on playtest). The uncle's stones; "단수"; the class, the bets, the academy, the dojang.
        "m1": {"title": T("Atari"), "kind": "main", "steps": [
            ["spawn", "un", "ms_uncle", "m1", 4, -2],
            N('Misaeng means "not yet alive": on a go board, a group of stones that is neither alive nor dead.'),
            N("It started when his uncle brought a set of stones round to the flat. The boy nearly swallowed a few, and loved them anyway."),
            S("ms_uncle", "Go on, then. Where would you play?"),
            ["problem"],   # the child: find the atari (a fixed problem)
            S("ms_jang_child", "Atari!"),
            ["still", "ms_class", "slow zoom in"],
            N("Baduk is good for concentration, his uncle said, and his mother gladly paid for the neighbourhood class. "
              "Soon he was winning his uncle's and his father's bets back from Mr. Kim at the laundromat."),
            ["still", "ms_academy_dawn", "slow pan across"],
            N("Next came an academy run by a strong amateur. His mother was against it, and nobody expected him to conquer the baduk world, but no one could stop a nine-year-old who got up at dawn to work through his problem book."),
            ["still", "ms_dojang", "slow zoom out"],
            N("Then a professional's dojang. People called him a prodigy, and the word soothed his parents like a sedative, just as his father's company went under."),
            ["remove", "un"],
            ["still", "ms_trainees11", "slow pan across"],
            N("At eleven he joined the trainees' room: rows of boards, and children who all meant to turn professional."),
            ["scroll", T("Seven Years Later"), [
                T("At eleven he entered the Korea Baduk Association as a trainee: a child studying to turn professional. "
                  "The age limit comes at eighteen. He is eighteen now."),
            ]],
            ["party", ["ms_jang_young"], {"to": {"place": "korea-baduk-association--kba-trainees", "spot": "kba-trainees"}}],   # a deliberate cut: years pass
        ]},

        # M2 · 착수0 (W). Seven years; the failure; the faces; "the others changed"; the excuses; thrown away.
        # (staging) The comic never shows a deciding game; the half-point losses kept coming. The board is one of them.
        "m2": {"title": T("Thrown Away"), "kind": "main", "steps": [
            ["spawn", "tr", "ms_trainee", "m2", 6, -2],
            N("At home, his parents cut out newspaper stories about Lee Chang-ho and Lee Sedol, their rankings and their prize money."),
            N("A baduk game is scored in points, and a draw is impossible: the smallest margin is half a point. "
              "For seven years he has lost that way, over and over. This is his last chance to turn pro."),
            ["problem"],   # Jang: another half-point game; lost
            N("They count."),
            N("Half a point short. It's over."),
            ["remove", "tr"],
            N("He failed to turn pro."),
            N("Only now does he see his father's wrinkles, and how dull his mother's eyes have gone."),
            N("Not long after, his father died, and his mother took to her bed."),
            N("The day he leaves is an ordinary day. It feels as if he'll be back tomorrow, losing to younger kids again. He hasn't changed; everyone else has, and the colour has drained out of the world."),
            N("It wasn't talent, or luck, or all those half-point losses. It wasn't the part-time jobs, or his father's death, or his mother in bed. Those reasons would hurt too much. So he tells himself he just didn't try hard enough."),
            ["still", "ms_lastgame", "slow zoom out"],
            N("He walks away dropping stones from his pocket, a few at a time."),
            N("Because he didn't try hard enough, he had to come out into the world. Because he didn't try hard enough, he was thrown away."),
            ["party", ["ms_jang"], {"to": {"place": "Susaek-dong", "spot": "home"}}],   # a cut: the years after
        ]},

        # M4 · 2수 (W, simplified on playtest). The friends who passed; the decline; the GED; the army; "go and see your old sponsor".
        "m4": {"title": T("Washing Her Back"), "kind": "main", "steps": [
            N("His friends from the trainees' room turned pro. When he packed up, they asked if he was really quitting, and he had no answer. He put his game records out with the rubbish, along with his board."),
            N("The family restaurant failed. His mother worked building sites until her body gave out. He studied for the equivalency exam "
              "between part-time jobs, and in the bathroom he washed her back."),
            N("Then he did his military service."),
            ["scroll", T("Years Later"), [
                T("He is home from the army: no degree, no trade, and a mother to look after."),
            ]],
            ["spawn", "mo", "ms_mother", "m4", 4, -2],
            S("ms_mother", "Your old sponsor was asking after you, the man who paid for all your baduk. Go and see him."),
            ["remove", "mo"],
            ["party", ["ms_jang"], {"to": {"place": "Jongno", "from": "Susaek-dong"}}],
        ]},

        # M5 · 착수1 + 2수 (W; the tie, D). The sponsor; the parachute; the lights; the first morning; then Oh's set-up (the hike,
        # the forgotten meeting, the call), so the run plays before we return to Jang at the café (playtest).
        "m5": {"title": T("A Light Allowed Me"), "kind": "main", "steps": [
            ["spawn", "sp", "ms_sponsor", "m5", 4, -2],
            S("ms_sponsor", "A friend of mine runs a trading company, One International. I've spoken to him. He's the only one there who knows about your baduk, and it'll be a simple interview."),
            S("ms_sponsor", "But your résumé is thin, and you'll be going in with nothing. Some people will call you a parachute: someone who only got in through connections."),
            S("ms_jang", "Thank you. Thank you, sir."),
            ["remove", "sp"],
            N("As the city lights come on, office workers spill out to drink, flatter and head home. He'll start from the bottom like everyone else, and this time he won't fail the way he failed at baduk."),
            N("If there's a light I'm meant to keep burning, I'll take responsibility for it. But is there a light allowed for someone like me?"),
            N("On the morning of his first day, he sleeps through the alarm twice. His mother ties his tie for him."),
            N("Across the city that same Wednesday, Oh Sang-sik, a section head at One International, is hiking up a mountain with his three sons. "
              "He has forgotten an eleven o'clock meeting with a buyer from overseas. On the summit, his phone rings."),
            S("ms_bujang", "Where are you? The buyer's waiting, and if he walks out, we're both finished. I'm sending today's new hire. We're in no position to be picky."),
            ["party", ["ms_oh_hike"], {"to": {"place": "Mountain", "spot": "summit"}}],   # a cut: Oh, on the summit
        ]},

        # M7 · 3수 (W). Oh leads: the run down the trail (the clock), the car, the jam; "fear is rational". A cut to the café.
        "m7": {"title": T("Fear Is Rational"), "kind": "main", "steps": [
            N("He makes it to the car, but the road into the city is crawling: five hundred metres in half an hour."),
            S("ms_oh_hike", "Someone at a workshop said most fear is irrational..."),
            S("ms_bujang", "Shall I tell you about dismissal-notice pay?"),
            S("ms_oh_hike", "I'm at the Mangwon-dong crossroads, doing twelve kilometres an hour, with eight to go. I'll be thirty minutes late. This fear is completely rational."),
            ["party", ["ms_jang"], {"to": {"place": "jongno--cafe", "spot": "cafe"}}],   # a cut: the café, where the rookie is
        ]},

        # M8 · 4수 (W). The café: the buyer's quiz (the snapback); Oh bursts in; "Baduk." Oh's car: reading Oh; HR; the requisition.
        "m8": {"title": T("Baduk, Not Go"), "kind": "main", "steps": [
            ["spawn", "by", "ms_buyer", "m8", 6, -4], ["spawn", "ks", "ms_kangsil", "m8", 10, -4],
            N("Jang's first-day message told him to skip the office and go straight to a café in Jongno. The overseas buyer and his manager, Kang, have been waiting there for an hour. Jang can't talk trade, but he can talk about one thing."),
            S("ms_buyer", "A puzzle? All right. I'm Black, and it's my move?"),
            ["problem"],   # Jang: the buyer's quiz, a snapback (a fixed problem)
            ["spawn", "oh", "ms_oh_hike", "m8", 16, 0], ["move", "oh", "m8", 12, -2],
            N("Oh bursts in, thirty minutes late, hiking clothes under his jacket."),
            S("ms_kangsil", "Your young man kept us busy. The quiz was fun."),
            S("ms_buyer", "What is this game called?"),
            S("ms_jang", "Baduk."),
            ["remove", "by"], ["remove", "ks"],
            N("In Oh's car there are paper cups everywhere, and Oh argues a claim down the phone with red eyes. Jang once lost to a trainee just like him: sloppy, red-eyed, bored-looking. He'd taken him for careless, and he'd been wrong."),
            ["problem"],   # Jang: read the man from his game
            N("He's obsessive, and responsible: a man who carries everything himself."),
            ["remove", "oh"],
            ["spawn", "hr", "ms_hr", "m8", 4, -2],
            S("ms_hr", "Jang Geu-rae, you'll be an intern with Sales Team 3. In two months the interns sit a PT, a presentation test. Pass it, and you stay on."),
            ["remove", "hr"],
            ["spawn", "kd", "ms_kimds", "m8", 8, -2],
            S("ms_kimds", "I'm Kim Dong-sik, assistant manager. I'm your buddy, and Section Head Oh is your mentor. First job: take this requisition to General Affairs."),
            ["gain", "requisition"],
            ["remove", "kd"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],
        ]},
        "m10_wait": {"title": T("General Affairs"), "kind": "main", "steps": [
            S("ms_jang", "I should take the requisition to General Affairs first."),
        ]},

        # M10 · 5수 (W). The folders; the mind map; "Who do you think you are?"; the interns' "find the dud".
        "m10": {"title": T("Who Do You Think You Are?"), "kind": "main", "steps": [
            N("General Affairs hands over a box of supplies, a glue stick among them."),
            ["gain", "glue_stick"],
            ["spawn", "kd", "ms_kimds", "m10", 2, -2],
            S("ms_kimds", "Sort these files into my folders."),
            N("He draws a mind map and designs a better filing system. It takes him all afternoon."),
            ["emote", "kd", "anger"],
            S("ms_kimds", "Where are my folders? Who do you think you are?"),
            S("ms_kimds", "That filing system belongs to the company. This isn't work you do alone; it's work we do together."),
            N("At fifteen he filed his game records his own way, in a system only he ever had to read."),
            ["remove", "kd"],
            ["spawn", "gl", "ms_glasses", "m10", 10, 0],
            S("ms_glasses", "Interns' study group tonight. We're going to work out who the dud is."),
            ["remove", "gl"],
            ["party", ["ms_jang"], {"to": {"place": "Jongno", "from": "One International"}}],
        ]},

        # M12 · 6수 (W). The interns' bar; Ahn: 아생연후살타.
        "m12": {"title": T("Secure Yourself First"), "kind": "main", "steps": [
            ["spawn", "ahn", "ms_ahn", "m12", 4, -2], ["spawn", "gl", "ms_glasses", "m12", 8, -2],
            N("The bar is full of interns pitching PT topics. Ahn Young-yi, top of their intake and the only woman there, is watching him."),
            S("ms_ahn", "You haven't said a word all night. You won't learn just by listening."),
            S("ms_ahn", "And you've got filing due tomorrow, but you're sitting here? Make your own stones safe before you attack."),
            ["problem"],   # Jang: secure your own group first
            N("He's lived by that proverb his whole life, and he had to hear it from someone else. He runs back to the office."),
            S("ms_ahn", "He really does have filing due. Come on, you're going to go and apologise."),
            ["remove", "ahn"], ["remove", "gl"],
            ["party", ["ms_ahn"]],   # the lead passes to Ahn: she takes the glasses intern back to the office (her stretch, m13)
        ]},

        # M13 · 6수 (W). Ahn leads: the apology; her review; both schemes live (상생). The dream of the stones.
        "m13": {"title": T("Both Live"), "kind": "main", "steps": [
            ["spawn", "jg", "ms_jang", "m13", 4, -2], ["spawn", "gl", "ms_glasses", "m13", 8, 0],
            ["spawn", "oh", "ms_oh", "m13", 14, -4], ["spawn", "kd", "ms_kimds", "m13", 16, -2],
            S("ms_glasses", "Sorry. I didn't know you had urgent work."),
            S("ms_ahn", "His system makes sense. The trouble is, everyone on staff already knows the old one."),
            ["problem"],   # Ahn: make both live
            S("ms_ahn", "Keep Mr. Kim's order for the executives' file, but use Jang's cross-index from the planning stage. Then the departments could actually line up."),
            S("ms_kimds", "...Good idea."),
            N("She kept her own group alive, and his too. Both live."),
            ["remove", "jg"], ["remove", "gl"], ["remove", "oh"], ["remove", "kd"],
            ["still", "ms_25stones", "slow zoom out"],
            N("That night he dreams of a board: rows of white stones, and one black."),
            ["party", ["ms_jang"], {"to": {"place": "Susaek-dong", "spot": "home"}}],   # a cut: the next dawn; the commute
        ]},

        # M14 · 7수 (W). The commute; the missed claim; three errands at once; Black 7; the PT announced; Kim's warning.
        "m14_wait": {"title": T("Every Side"), "kind": "main", "steps": [
            S("ms_jang", "Kim's call to the forwarder about the B/L, the copies, the floor. All at once."),
        ]},
        "m14": {"title": T("The World Is Faster"), "kind": "main", "steps": [
            N("He's up before the alarm and crushed on the train. The world moves faster than he does."),
            ["problem"],   # the record: Black 7
            N("Better plain and on time than perfect and late."),
            ["spawn", "ahn", "ms_ahn", "m14", 4, -2],
            S("ms_ahn", "The PT dates are set: the first week of next month, a whole week at the training centre. There's an individual task and a team task, so start thinking about partners."),
            ["remove", "ahn"],
            ["spawn", "kd", "ms_kimds", "m14", 2, -2],
            S("ms_kimds", "Everyone's going to want you. You've got no confidence and no skills, and if you pair with a sure dud, you shine."),
            S("ms_kimds", "Be careful of whoever comes to you first."),
            ["remove", "kd"],
            ["party", ["ms_jang"], {"to": {"place": "Jongno", "from": "One International"}}],
        ]},

        # M16 · 8수 (W). Ahn on the plaza: only the one inside the board can't see; Han: "Have you picked a partner?"
        "m16": {"title": T("Inside the Board"), "kind": "main", "steps": [
            ["spawn", "ahn", "ms_ahn", "m16", 4, -2],
            S("ms_ahn", "Whoever your partner is, trust them. The player inside the game can't see his own scheming, but everyone watching can."),
            ["still", "ms_ringed", "slow zoom in"],
            N("A trainee sits at a board, ringed by onlookers. Everyone watching already knows how it ends."),
            ["problem"],   # Jang: see what the watchers see
            S("ms_ahn", "Do your part, and trust the rest."),
            ["remove", "ahn"],
            ["spawn", "han", "ms_han", "m16", 14, 0], ["move", "han", "m16", 6, -2],
            S("ms_han", "Have you picked a partner yet? Meet me on the roof tonight."),
            ["remove", "han"],
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],
        ]},

        # M17 · 9수 (W). The roof: Jang tries to take sente; Han slams down stone after stone and picks him. The gossip.
        "m17": {"title": T("Sente"), "kind": "main", "steps": [
            ["spawn", "han", "ms_han", "m17", 4, -2],
            S("ms_han", "I'm Han Seok-yul. I came back from the Ulsan plant for the PT."),
            N("Sente is the initiative: the right to lead the game. He's always handed it over. This time he means to keep it."),
            S("ms_jang", "Why did you choose me?"),
            ["problem"],   # Jang: take sente (fails, as written)
            N("Han reels it off: mechanical engineering, contest prizes, plant tours, foreign buyers, even a meal with the president. It's like stones slammed down by the handful."),
            S("ms_han", "Team up with me. You can build the PT however you like; just email me your progress."),
            S("ms_jang", "...Thanks."),
            ["remove", "han"],
            ["spawn", "gl", "ms_glasses", "m17", 8, 2], ["spawn", "ahn", "ms_ahn", "m17", 12, 2],
            S("ms_ahn", "They say he made a big mistake in front of a buyer at Ulsan."),
            S("ms_glasses", "A total dud. Who's going to volunteer for the bomb squad?"),
            ["remove", "gl"], ["remove", "ahn"],
        ]},

        # M18 · 10수 (W). Kinder and warmer; "Again!"; Ahn's "nuclear bomb"; "Find it yourself."; Han scolded at Ulsan.
        "m18": {"title": T("Again!"), "kind": "main", "steps": [
            N("After a board where you fight alone, the world seems kinder and warmer. He emails Han three ideas for the PT."),
            ["gain", "phone_text"],
            N("Han texts back one word: Again!"),
            ["spawn", "ahn", "ms_ahn", "m18", 6, -2], ["spawn", "gl", "ms_glasses", "m18", 10, -2],
            S("ms_glasses", "Picked your partner yet? Not Jang, surely."),
            S("ms_ahn", "Who knows? Maybe he's a big dud. A nuclear bomb."),
            ["remove", "ahn"], ["remove", "gl"],
            S("ms_jang", "You said I could build it my way."),
            S("ms_han", "I said you'd share it with me. I never said I'd keep my mouth shut."),
            ["problem"],   # Jang: hold your ground on the phone (fails, as written)
            S("ms_jang", "Then what kind of idea do you want?"),
            S("ms_han", "Find it yourself."),
            N("At the Ulsan plant, Han is told he has one last chance and should go back to a desk if he isn't up to it. In Seoul, Jang sits at his screen beside an abandoned board. The world is far colder and more heartless than he thought."),
        ]},

        # M19 · 11수 (W). Oh on the layout; the second call: "Again?"; Black 11; Jang takes the PT back; the age question.
        "m19": {"title": T("How Old Are You?"), "kind": "main", "steps": [
            N("He works all night on three new ideas, forty pages each. In the morning, Oh tears into a team document he made."),
            ["spawn", "oh", "ms_oh", "m19", 10, -6], ["spawn", "kim", "ms_kimds", "m19", 6, -4],
            ["emote", "oh", "anger"],
            S("ms_oh", "The colours don't match and the boxes are all over the place. What were you doing yesterday? Shrink the boxes."),
            ["remove", "oh"], ["remove", "kim"],
            N("He slips into an empty meeting room and calls Han."),
            S("ms_jang", "Well? Should I do it again?"),
            S("ms_han", "...The second one's good. Let's go with that."),
            ["problem"],   # the record: Black 11
            N("Baduk is a war with a plain winner and loser, and he lived in it for over ten years. He may be a beaten soldier, but he was raised to compete, and he doesn't hand over sente."),
            ["problem"],   # Jang: take the PT back
            S("ms_jang", "Then we chose it together. From here on I'll write the PT my way. I'll keep you posted, but I won't be taking instructions."),
            S("ms_han", "What?"),
            S("ms_jang", "And how old are you, anyway?"),
            S("ms_han", "This little runt..."),
        ]},

        # M19c · 12수 (W). Asleep in a meeting room; Oh and Kim size up the pair; the heroes fade; Ahn: the eye of the storm; the dinner.
        "m19c": {"title": T("The Eye of the Storm"), "kind": "main", "steps": [
            N("After too many short nights, he finally falls into a deep sleep, slumped in a chair in an empty meeting room."),
            ["spawn", "oh", "ms_oh", "m19c", 12, 2], ["spawn", "kd", "ms_kimds", "m19c", 14, 2],
            S("ms_kimds", "His partner's Han Seok-yul, and Han's a talker. I bet Jang's doing all the work."),
            S("ms_oh", "A smooth talker, and a kid who can't tell he's being used. Some team."),
            ["remove", "oh"], ["remove", "kd"],
            N("He dreams of his heroes, the great players: Cho Nam-chul, Cho Hunhyun, Lee Chang-ho, Lee Sedol. One by one they fade away. Hasn't he let go of baduk yet?"),
            ["spawn", "ahn", "ms_ahn", "m19c", 6, -2],
            S("ms_ahn", "You were crying in your sleep. So your partner's Han? He'll use anyone to make himself shine."),
            S("ms_ahn", "An ambitious man is like a tornado. But the eye of a tornado is calm. If you can get to his centre, you two could make it work."),
            S("ms_ahn", "Wait, that's why I came! The seniors want all the interns out tonight. It's evening already; you slept the whole day."),
            ["remove", "ahn"],
            N("He's late to the team dinner, so he has to down three penalty drinks. The people who use him, help him, get angry with him and scold him are all on his side. Here, he's not an outsider."),
        ]},

        # M20 · 13수 (W). Kim's rule on paper; the shredding put off; Seok-ho's glue at Jang's desk; the lobby; the director's kick;
        # the roof; Oh finds the scrap glued to the waybill. The lead passes to Oh.
        "m20": {"title": T("The Waybill"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m20", 4, -2],
            S("ms_kimds", "Anything with figures on it goes in the shredder. Not one of our papers should ever turn up outside this team."),
            N("He decides to shred the waybill later with the next batch, and leaves it on his desk: Sales Team 3, DH-14."),
            ["remove", "kd"],
            ["spawn", "sh", "ms_kimsh", "m20", 10, 0],
            S("ms_kimsh", "Can I borrow your glue? Our supply cabinet's locked and nobody will give me the key."),
            S("ms_jang", "Sure, it's on my desk."),
            N("Kim Seok-ho, an intern on another team, glues his report together at Jang's desk, right on top of the waybill, and hurries off."),
            ["remove", "sh"],
            N("Jang hums as he feeds the shredder. Down in the lobby, a yellow sheet slides off the security desk onto the floor, and a passing director taps it with his shoe."),
            ["spawn", "dir", "ms_director", "m20", 8, 2], ["spawn", "oh", "ms_oh", "m20", 14, -6],
            S("ms_oh", "Director! Is this about a team dinner?"),
            N("Without a word, the director kicks the team's paper box over. His aide hands Oh the waybill: they found it on the lobby floor."),
            S("ms_director", "Let's all do our jobs properly, shall we?"),
            ["remove", "dir"],
            S("ms_oh", "Get all the interns together!"),
            N("The interns get yelled at on the roof. Back at his desk, Oh turns the waybill over. Glued to the back is a torn scrap of someone's weekly report, with a name on it: Kim Seok-ho."),
            ["gain", "waybill_scrap"],
            ["party", ["ms_oh"]],   # the lead passes to Oh, at his own desk (his stretch, m21-m21b)
        ]},

        # M21 · 14수 (W). Oh leads. Go brags; the cabinet key. Oh links it on the clue board (the comic: in his head).
        "m21": {"title": T("A Secret"), "kind": "main", "steps": [
            ["spawn", "go", "ms_go", "m21", 8, 0],
            N("Applause from across the floor. Go, a section head on Sales Team 1, comes over pumping his fists."),
            S("ms_go", "My baby intern, Kim Seok-ho! He pulls all-nighters with us, he's newly married, he's the eldest son of an eldest son, and we've just landed the deal."),
            S("ms_oh", "He comes over to our team a lot, to borrow supplies."),
            S("ms_go", "Ha! That's my fault. The supply cabinet key's on my key ring."),
            ["gain", "cabinet_key"],
            ["remove", "go"],
            N("Oh looks at the waybill in his hands: a locked cabinet, a borrowed glue stick, and a scrap with a name on it."),
            ["gain", "borrowed_glue"],
            ["party", ["ms_oh"], {"to": {"place": "Jongno", "from": "One International"}}],
        ]},
        "m21b_wait": {"title": T("Oh's Desk"), "kind": "main", "steps": [
            S("ms_oh", "Not yet. The scrap, the glue, the key... I need to put it together first."),
        ]},

        # M21b · 14수 (W; "우리 애", D). Drinks; "a secret"; Go's team in the street; Oh defends Jang; Seok-ho's sorry; the homecoming.
        "m21b": {"title": T("Our Kid"), "kind": "main", "steps": [
            ["spawn", "kd", "ms_kimds", "m21b", 4, -2], ["spawn", "jg", "ms_jang", "m21b", 6, -2],
            N("Jang has told everyone the waybill was his fault. Oh takes him and Kim out for a drink, and it isn't even nine before he's tipsy."),
            S("ms_oh", "Geu-rae didn't do anything wrong today. Being misunderstood is a terrible thing."),
            S("ms_kimds", "Then who did it?"),
            S("ms_oh", "That's a secret."),
            ["spawn", "go", "ms_go", "m21b", 12, 0], ["spawn", "sh", "ms_kimsh", "m21b", 14, 0],
            S("ms_go", "Jealous, Oh? You snub my intern over a few supplies, and now you want to spoil our win?"),
            S("ms_oh", "Get your intern his own glue! Our kid took the blame because yours got glue on a document and dropped it!"),
            N("It doesn't sink in for Go, but it does for Kim Seok-ho."),
            S("ms_kimsh", "...I'm sorry."),
            ["remove", "go"], ["remove", "sh"],
            N("Our kid. He called him our kid."),
            S("ms_oh", "Stay on your toes, punk."),
            S("ms_jang", "Yes, sir."),
            ["remove", "kd"], ["remove", "jg"],
            ["still", "ms_babyfinger", "slow zoom in"],
            N("Late that night, Kim Seok-ho gets home to his one-room flat. The baby is still awake and knows him at once. Her tiny hand closes round his finger."),
            ["party", ["ms_jang"], {"to": {"place": "One International", "from": "Jongno"}}],   # the lead passes back to Jang: the next day
        ]},

        # M22 · 15수 (W). Incheon at dawn; Steve Han against Kim Bu-ryeon over the thick report; Black 15; Oh gets the truth from Go.
        "m22": {"title": T("Their Own Baduk"), "kind": "main", "steps": [
            N("At first light he's at Incheon harbour, where cargo meant for Gunsan was unloaded by mistake, some of it damaged. He came to see it for himself; paperwork alone drifts away from what's really happening on site."),
            ["spawn", "st", "ms_stevehan", "m22", 6, -4], ["spawn", "br", "ms_kimbr", "m22", 10, -4], ["spawn", "oh", "ms_oh", "m22", 14, -6],
            N("Back on the thirteenth floor, Steve Han, head of the Americas textile team, has come to pick a fight with Kim Bu-ryeon, who runs Sales Teams 1 to 3. They're the same rank, and everyone is watching."),
            S("ms_stevehan", "I don't have time for a report this thick. A fat report is just a way for nobody to take responsibility."),
            S("ms_kimbr", "My team was up all night on it."),
            S("ms_stevehan", "I need to understand the client, not your catalogue. Who's it for? What's their climate? What do they like? Just tell me what I need."),
            S("ms_kimbr", "...We'll revise it."),
            ["remove", "st"], ["remove", "br"],
            N("Everyone is playing their own game of baduk. Whoever prepared better ends up happier with the result, and whoever rushed just to keep up has no excuse."),
            ["problem"],   # the record: Black 15
            ["spawn", "go", "ms_go", "m22", 2, 0],
            S("ms_oh", "Why would Steve come down on our department head? Out with it."),
            S("ms_go", "Steve suggested dinner with the buyers, and I picked the place. I'd had a few drinks."),
            S("ms_oh", "What did you feed them?"),
            S("ms_go", "...Dog meat."),
            ["remove", "go"], ["remove", "oh"],
        ]},

        # M22b · 16수 (W). "Checkmate"; Jang scolded for laughing; don't leave dead stones; Oh: humble with class;
        # Kim Bu-ryeon got there first; the obvious move; the dry sauna.
        "m22b": {"title": T("Dead Stones"), "kind": "main", "steps": [
            N("Go had taken a buyer, and Steve, to a dog-meat restaurant and never apologised. Ever since, Steve has been sitting on Sales Team 1's approvals."),
            ["spawn", "oh", "ms_oh", "m22b", 12, -4], ["spawn", "kd", "ms_kimds", "m22b", 8, -2],
            S("ms_oh", "And our department head is too sore to apologise. In a way, it's checkmate."),
            N("A baduk word, from someone who doesn't play. Jang can't help grinning."),
            ["emote", "kd", "anger"],
            S("ms_kimds", "You're laughing while your seniors talk?"),
            ["problem"],   # Jang: give up the dead stone
            S("ms_jang", "Apologising is the only way. In baduk, you don't leave dead stones lying on the board. Leave one there, and it grows into a bigger problem."),
            S("ms_oh", "Then let's play politics with some class. Knowing when to bow your head: that's class. Let's go."),
            ["remove", "kd"], ["remove", "oh"],
            N("They go looking for Kim Bu-ryeon, only to find him already on the textile floor with Go, apologising to Steve. Then Go asks whether the approvals will go faster now, and everyone laughs."),
            N("Often the obvious move is the hardest one to play. Some things you have to do however hard they are, and some you mustn't do however easy."),
            ["still", "ms_sauna", "slow pan across"],
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
        node("m1", 20, 240, "m1", place="Susaek-dong", room="home", move=0, dilemma=D(
            "ms_jang_child", "Find the atari.",
            "It has two liberties. If I put one here...",
            "Atari!",
            "Look again.", problem="specialized-training-in-tesuji-1/81759")),
        node("m2", 34, 233, "m2", place="Korea Baduk Association", room="kba-trainees", move=0, dilemma=D(
            "ms_jang_young", "Win by half a point.",
            "Seven years of losing by half a point. Not this time.",
            "The last stone.",
            "Read it again.", pool="endgame")),
        node("m4", 48, 226, "m4", place="Susaek-dong", room="home", move=2, board=False),
        node("m5", 62, 219, "m5", place="Jongno", room="sponsor-office", move=2, board=False),
        node("m7", 76, 212, "m7", place="Mountain", move=3, board=False, clock={"start": "11:00", "tiles": 3}),
        node("m8", 90, 205, "m8", place="Jongno", room="cafe", move=4, dilemma=[
            D("ms_jang", "Give the buyer a puzzle: the move that gives one stone to take more.",
              "I can't talk trade, but I can talk about this.",
              "Snapback.",
              "Not that. Again.", problem="lee-chang-hos-selected-tesuji-part-2/222"),
            D("ms_jang", "Read the man from his game.",
              "Sloppy, red-eyed, bored-looking. I misread a player like him once. Not again.",
              "Obsessive, and responsible.",
              "Read him again.", pool="tesuji"),
        ]),
        node("m10", 104, 198, "m10", room="sales3", move=5, board=False,
             gate=[{"needs": ["mark:requisition"], "else": "m10_wait",
                    "objective": T("Take Kim's requisition to General Affairs, then go back to your desk in Sales 3."),
                    "at": "One International"}]),
        node("m12", 118, 191, "m12", place="Jongno", room="hof", move=6, dilemma=D(
            "ms_jang", "Secure your own stones first.",
            "I've lived by this all my life: make your group safe, then attack.",
            "Alive.",
            "It's dead. Again.", pool="ld live")),
        node("m13", 132, 184, "m13", room="sales3", move=6, dilemma=D(
            "ms_ahn", "Make both live.",
            "His system or Mr. Kim's? Neither has to die.",
            "Both live.",
            "One of them dies. Again.", pool="ld live")),
        node("m14", 146, 177, "m14", room="sales3", move=6, record=7,
             choices={7: [['dj', 0.08], ['ep', 0.11], ['cj', 0.14], ['qk', 0.26], ['do', 0.29], ['cm', 0.31], ['bp', 0.51], ['co', 1.05], ['qn', 3.87]]},
             gate=[{"needs": ["mark:errand_bl", "mark:errand_copy", "mark:errand_floor"], "else": "m14_wait",
                    "objective": T("Work from every side on Sales 3's floor: the forwarder call about the B/L at the team phone, Kim's copies at the copier, and mop the floor."),
                    "at": "One International"}],
             dilemma=D(
                 "ms_jang", "Which move did Cho Hunhyun play?",
                 "Black approaches, and the hard fight starts here.",
                 "Black 7.",
                 "Not that one. Look again.")),
        node("m16", 160, 170, "m16", place="Jongno", room="forecourt", move=8, dilemma=D(
            "ms_jang", "See what the watchers see.",
            "The one inside the game can't see it. Step outside.",
            "There.",
            "Still inside. Again.", pool="tesuji")),
        node("m17", 174, 163, "m17", room="roof", move=9, dilemma=D(
            "ms_jang", "Take sente.",
            "Lead this time. Don't hand it over.",
            "Han snatches it back with both hands.",
            "Again.", pool="endgame")),
        node("m18", 188, 156, "m18", room="sales3", move=10, dilemma=D(
            "ms_jang", "Hold your ground on the phone.",
            "He said I could build it my way. Hold him to that.",
            "Find it yourself.",
            "Again.", pool="race")),
        node("m19", 202, 149, "m19", room="sales3", move=10, record=[11, None], choices={11: [['br', 1.86], ['dl', 2.72], ['bq', 3.07], ['dr', 3.1], ['ck', 3.11], ['dk', 4.11], ['bp', 4.98]]}, dilemma=[
            D("ms_jang", "Which move did Cho Hunhyun play?",
              "Make the corner solid first, then fight.",
              "Black 11.",
              "Not that one. Look again."),
            D("ms_jang", "Take the PT back.",
              "We chose it together, and he agreed. Hold him to that.",
              "That's what we agreed.",
              "Again.", pool="race"),
        ]),
        node("m19c", 216, 142, "m19c", room="meeting", move=12, board=False),
        node("m20", 230, 135, "m20", room="sales3", move=13, board=False),
        node("m21", 242, 129, "m21", room="sales3", move=14, board=False),
        node("m21b", 254, 123, "m21b", place="Jongno", move=14, board=False,
             gate=[{"needs": ["mark:audit"], "else": "m21b_wait",
                    "objective": T("Work out how the waybill got out of Sales 3: open Oh's desk from the bag and link the clues. Then meet Kim and Jang on Jongno."),
                    "at": "Jongno"}]),
        node("m22", 266, 117, "m22", room="sales3", move=14, record=15, choices={15: [['cf', 0.05], ['gc', 0.1], ['ic', 0.26], ['fd', 0.34], ['ed', 0.57], ['dm', 0.78], ['dj', 0.95], ['cj', 0.95], ['dl', 1.1], ['ec', 1.51]]}, dilemma=D(
            "ms_jang", "Which move did Cho Hunhyun play?",
            "Everyone plays their own baduk. Whoever prepared better comes out happier.",
            "Black 15.",
            "Not that one. Look again.")),
        node("m22b", 278, 111, "m22b", room="sales3", move=16, dilemma=D(
            "ms_jang", "Give up the dead stone.",
            "If it's checkmate, don't cling to it. Don't leave it on the board.",
            "Give it up, and apologise.",
            "It's still on the board. Again.", pool="tesuji sacrifice")),
    ]


_ORDER = ["m1", "m2", "m4", "m5", "m7", "m8", "m10", "m12", "m13", "m14", "m16", "m17", "m18", "m19", "m19c",
          "m20", "m21", "m21b", "m22", "m22b"]
_EDGES = [[a, b] for a, b in zip(_ORDER, _ORDER[1:])]

_ITEMS = {
    "cafe_address": {"name": "The café's address", "kind": "key", "text": "A café in Jongno. The buyer is waiting. Go straight there."},
    "requisition": {"name": "Supplies requisition", "kind": "key", "text": "For General Affairs. Kim Dong-sik's signature."},
    "glue_stick": {"name": "Glue stick", "kind": "key"},
    "copy": {"name": "Kim's copies", "kind": "key"},
    "mop": {"name": "A mop and bucket", "kind": "key"},
    "phone_text": {"name": "Han's text", "kind": "key", "text": "Again!"},
    # Oh's desk (the audit board, m21): the clues
    "waybill_scrap": {"name": "Waybill scrap", "kind": "clue", "text": "Glued to the waybill: a torn scrap of a weekly report. Internship. Kim Seok-ho."},
    "borrowed_glue": {"name": "The borrowed glue", "kind": "clue", "text": "Go's intern keeps borrowing Sales 3's supplies. Jang's glue stick was on Jang's desk, next to the waybill."},
    "cabinet_key": {"name": "Go's key ring", "kind": "clue", "text": "Sales Team 1's supply cabinet key is on Go's key ring. His intern can't get at the glue."},
}

# Oh's deduction in 14수 (the comic plays it in his head; here the player links it on the audit board).
_AUDIT = {
    "title": "Oh's desk",
    "clues": ["waybill_scrap", "borrowed_glue", "cabinet_key"],
    "links": [
        {"q": "Why does Go's intern keep borrowing our supplies?", "pair": ["cabinet_key", "borrowed_glue"],
         "a": "Go walked off with the cabinet key. The kid has to beg for glue."},
        {"q": "How did a Sales 3 waybill get down to the lobby?", "pair": ["borrowed_glue", "waybill_scrap"],
         "a": "He glued his report at Jang's desk, on top of the waybill. It went with him."},
    ],
    "done": "audit",
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
        "audit": _AUDIT,
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
    'Go on, then. Where would you play?': '자, 어디 둬 볼래?',
    'Atari!': '단수!',
    'Seven Years Later': '7년 후',
    'He failed to turn pro.': '입단에 실패했다.',
    "Only now does he see his father's wrinkles, and how dull his mother's eyes have gone.": '이제야 아버지의 주름이, 흐려진 어머니의 눈이 보인다.',
    'He walks away dropping stones from his pocket, a few at a time.': '그는 주머니의 돌을 조금씩, 몇 개씩 떨어뜨리며 걸어간다.',
    'Thank you. Thank you, sir.': '감사합니다. 정말 감사합니다.',
    'Shall I tell you about dismissal-notice pay?': '해고예고수당 얘기 좀 해 줄까?',
    'Your young man kept us busy. The quiz was fun.': '이 젊은 분 덕에 지루하지 않았어요. 퀴즈가 재밌던데요.',
    'What is this game called?': '이 게임 이름이 뭐죠?',
    'Baduk.': '바둑입니다.',
    'Where are my folders? Who do you think you are?': '내 폴더 어디 갔어? 당신이 뭔데?',
    '...Good idea.': '...좋은 생각이네.',
    'Be careful of whoever comes to you first.': '먼저 접근하는 사람 잘 가려서 봐.',
    'Why did you choose me?': '왜 저를 고르셨어요?',
    '...Thanks.': '...고맙습니다.',
    'You said I could build it my way.': '마음대로 만들라고 하셨잖아요.',
    'Find it yourself.': '본인이 찾으세요.',
    'Every chapter of this story opens on one move of a real game: the 1st Ing Cup final, game 5, 1989. Nie Weiping has White. Cho Hunhyun has Black. It will last 145 moves.': '이 이야기의 모든 장은 실제 바둑 한 판의 한 수로 시작한다. 1989년 제1회 응씨배 결승 5국. 백은 녜웨이핑, 흑은 조훈현. 이 대국은 145수까지 간다.',
    "You are Jang Geu-rae. It begins with a set of stones, and a small boy who can't leave them alone.": '당신은 장그래다. 모든 건 바둑돌 한 벌과, 그 돌에서 손을 떼지 못하던 꼬마에서 시작된다.',
    "Sixteen moves played. Jang has a desk, a team that's on his side, a partner who no longer gives the orders, and a PT in a few weeks.": '16수까지 두었다. 장그래에게는 책상 하나, 자기 편인 팀, 더는 지시하지 못하는 파트너, 그리고 몇 주 뒤의 PT가 있다.',
    'Next: a man with a resignation letter in his jacket, a child at a daycare door, and the test.': '다음: 재킷 안에 사직서를 넣고 다니는 남자, 어린이집 문 앞의 아이, 그리고 시험.',
    'Look again.': '다시 봐.',
    'Read it again.': '다시 읽어.',
    'Snapback.': '환격.',
    'Not that. Again.': '그거 말고. 다시.',
    'Read him again.': '다시 읽어.',
    'Alive.': '살았다.',
    "It's dead. Again.": '죽었다. 다시.',
    'Both live.': '둘 다 산다.',
    'One of them dies. Again.': '하나가 죽었다. 다시.',
    'Black 7.': '흑 7.',
    'Not that one. Look again.': '그게 아니야. 다시 봐.',
    'There.': '거기.',
    'Still inside. Again.': '아직 안이야. 다시.',
    'Again.': '다시.',
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
    "That's what we agreed.": '그렇게 하기로 했잖아요.',
    'This little runt...': '이 자식이...',
    'What?': '뭐?',
    'Yes, sir.': '네.',
    'Director! Is this about a team dinner?': '상무님! 회식 때문에 오셨습니까?',
    'Get all the interns together!': '인턴들 전부 집합시켜!',
    'Applause from across the floor. Go, a section head on Sales Team 1, comes over pumping his fists.': '사무실 건너편에서 박수가 터진다. 영업 1팀 고 과장이 주먹을 흔들며 건너온다.',
    'Then who did it?': '그럼 누가 그랬는데요?',
    'Jealous, Oh? You snub my intern over a few supplies, and now you want to spoil our win?': '배 아파, 오 과장? 비품 몇 개 가지고 우리 인턴 구박하더니, 이제 우리 잔치까지 망치려고?',
    "...I'm sorry.": '...죄송합니다.',
    'Stay on your toes, punk.': '정신 바짝 차려, 인마.',
    "...We'll revise it.": '...수정하겠습니다.',
    'What did you feed them?': '뭘 먹였는데?',
    '...Dog meat.': '...개고기.',
    "And our department head is too sore to apologise. In a way, it's checkmate.": '부장님은 자존심 상해서 사과도 못 하시고. 어떻게 보면 외통수야.',
    "You're laughing while your seniors talk?": '선배들 얘기하는데 웃어?',
    "It's still on the board. Again.": '아직 판 위에 있다. 다시.',
    'Steve! Come on, scoot over.': '스티브! 이리 좀 붙어 앉아요.',
    "Don't touch me!": '건드리지 마!',
    "Baduk is good for concentration, his uncle said, and his mother gladly paid for the neighbourhood class. Soon he was winning his uncle's and his father's bets back from Mr. Kim at the laundromat.": '바둑이 집중력에 좋다는 삼촌 말에 어머니는 기꺼이 동네 바둑교실 돈을 냈다. 곧 그는 세탁소 김 사장에게서 삼촌과 아버지의 내기 돈을 되찾아 오고 있었다.',
    "Because he didn't try hard enough, he had to come out into the world. Because he didn't try hard enough, he was thrown away.": '열심히 하지 않아서, 세상에 나와야 했다. 열심히 하지 않아서, 버려진 것이다.',
    'Oh bursts in, thirty minutes late, hiking clothes under his jacket.': '오 과장이 30분 늦게 뛰어든다. 재킷 안엔 등산복 차림이다.',
    'General Affairs hands over a box of supplies, a glue stick among them.': '총무팀이 비품 상자를 건넨다. 그 안에 딱풀도 하나.',
    'Sort these files into my folders.': '이 파일들 내 폴더에 정리해.',
    "Sorry. I didn't know you had urgent work.": '미안해요. 급한 일이 있는 줄 몰랐어요.',
    'That night he dreams of a board: rows of white stones, and one black.': '그날 밤 그는 바둑판 꿈을 꾼다. 줄지은 흰 돌, 그리고 검은 돌 하나.',
    'Do your part, and trust the rest.': '자기 몫을 하고, 나머지는 믿는 거예요.',
    'They say he made a big mistake in front of a buyer at Ulsan.': '울산에서 바이어 앞에서 큰 실수를 했대요.',
    'And how old are you, anyway?': '그리고 너 몇 살이냐?',
    'My team was up all night on it.': '우리 팀이 밤새워 만든 겁니다.',
    'Why would Steve come down on our department head? Out with it.': '스티브가 왜 우리 부장님을 잡겠어? 털어놔.',
    # Places (Misaeng), the Mountain (bf15b83)
    'An old man in full hiking kit, poles and all, steps aside. “Running down? On a weekday? Young people.”': '등산 장비를 다 갖춘 노인이 스틱을 들고 비켜선다. “뛰어 내려가? 평일에? 젊은 사람이.”',
    'A woman with a thermos and a visor. “Careful going down. The steps are wet.”': '보온병에 선캡을 쓴 아주머니. “내려갈 때 조심해요. 계단이 젖었어요.”',
    "A man in a suit jacket and trainers, phone to his ear, by his car. “…No, I'm at my desk. Yes. My desk.”": '정장 재킷에 운동화 차림의 남자가 차 옆에서 전화를 받는다. “…아뇨, 자리에 있습니다. 네. 자리에요.”',
    'The summit': '정상',
    "Oh's car": '오 과장의 차',
    'The summit rocks': '정상의 바위',
    'A bench, and Seoul below': '벤치, 그리고 아래로 서울',
    'The trail map': '등산로 안내도',
    'The summit.': '정상.',
    "Run down the trail to the car. The deal won't wait.": '등산로를 뛰어 내려가 차로. 거래는 기다려 주지 않는다.',
    'At eleven he entered the Korea Baduk Association as a trainee: a child studying to turn professional. The age limit comes at eighteen. He is eighteen now.': '열한 살에 한국기원 연구생이 되었다. 프로 입단을 준비하는 아이들이다. 나이 제한은 열여덟. 이제 그는 열여덟 살이다.',
    'Years Later': '몇 년 후',
    'The family restaurant failed. His mother worked building sites until her body gave out. He studied for the equivalency exam between part-time jobs, and in the bathroom he washed her back.': '집안의 식당은 망했다. 어머니는 몸이 버티지 못할 때까지 공사판에서 일했다. 그는 아르바이트 틈틈이 검정고시를 공부했고, 욕실에서 어머니의 등을 밀어 드렸다.',
    'He slips into an empty meeting room and calls Han.': '그는 빈 회의실에 들어가 한석율에게 전화한다.',
    'Get your intern his own glue! Our kid took the blame because yours got glue on a document and dropped it!': '니 인턴한테 풀이나 사 줘! 니 인턴이 서류에 풀 묻혀서 떨어뜨리는 바람에 우리 애가 덤터기 썼어!',
    'Your desk in Sales Team 3, fourteenth floor. Take the lift.': '14층 영업 3팀의 네 자리. 엘리베이터를 타라.',
    'A baduk game is scored in points, and a draw is impossible: the smallest margin is half a point. For seven years he has lost that way, over and over. This is his last chance to turn pro.': '바둑은 집으로 승부를 가리고, 비기는 일은 없다. 가장 작은 차이가 반집이다. 칠 년 동안 그는 그렇게, 번번이 졌다. 입단할 마지막 기회다.',
    'Not long after, his father died, and his mother took to her bed.': '얼마 뒤 아버지가 돌아가셨고, 어머니는 자리에 누우셨다.',
    'Seven years of losing by half a point. Not this time.': '칠 년 동안 반집으로 졌다. 이번엔 아니다.',
    "Half a point short. It's over.": '반집이 모자란다. 끝났다.',
    'Home. Your uncle has brought something.': '집. 삼촌이 뭔가를 가져오셨다.',
    'The last stone.': '마지막 한 수.',
    'They count.': '계가를 한다.',
    'He is home from the army: no degree, no trade, and a mother to look after.': '군대에서 돌아왔다. 학위도, 기술도 없고, 돌봐야 할 어머니가 있다.',
    "Across the city that same Wednesday, Oh Sang-sik, a section head at One International, is hiking up a mountain with his three sons. He has forgotten an eleven o'clock meeting with a buyer from overseas. On the summit, his phone rings.": '같은 수요일, 도시 건너편. 원 인터내셔널의 오상식 과장은 세 아들과 산을 오르고 있다. 해외 바이어와의 열한 시 미팅을 잊었다. 정상에서, 전화가 울린다.',
    "Who knows? Maybe he's a big dud. A nuclear bomb.": '누가 알아요? 엄청 큰 폭탄일지도. 핵폭탄.',
    'Team up with me. You can build the PT however you like; just email me your progress.': '나랑 해요. PT는 마음대로 짜고, 진행 상황만 메일로 보내 줘요.',
    "The colours don't match and the boxes are all over the place. What were you doing yesterday? Shrink the boxes.": '색은 안 맞고 박스는 중구난방이잖아. 어제 뭐 했어? 박스 줄여.',
    "In Oh's car there are paper cups everywhere, and Oh argues a claim down the phone with red eyes. Jang once lost to a trainee just like him: sloppy, red-eyed, bored-looking. He'd taken him for careless, and he'd been wrong.": '오 과장의 차 안엔 종이컵이 굴러다니고, 그는 빨간 눈으로 전화에 대고 클레임을 다툰다. 장그래는 이런 연구생에게 진 적이 있다. 엉성하고, 눈이 빨갛고, 지루해 보이던. 대충 하는 사람이라 여겼다가 틀렸었다.',
    "Han reels it off: mechanical engineering, contest prizes, plant tours, foreign buyers, even a meal with the president. It's like stones slammed down by the handful.": '한석율이 줄줄이 늘어놓는다. 기계공학, 공모전 수상, 공장 견학, 해외 바이어, 사장님과의 식사까지. 돌을 한 움큼씩 내리치는 것 같다.',
    'Better plain and on time than perfect and late.': '완벽하고 늦은 것보다 평범해도 제때가 낫다.',
    "My baby intern, Kim Seok-ho! He pulls all-nighters with us, he's newly married, he's the eldest son of an eldest son, and we've just landed the deal.": '우리 막내 인턴 김석호! 우리랑 밤새우지, 신혼이지, 장남의 장남이지, 그리고 우리가 방금 계약 따냈어!',
    'Sloppy, red-eyed, bored-looking. I misread a player like him once. Not again.': '엉성하고, 눈이 빨갛고, 지루해 보이는 사람. 이런 사람을 한 번 잘못 읽었었지. 이번엔 아니야.',
    "Back on the thirteenth floor, Steve Han, head of the Americas textile team, has come to pick a fight with Kim Bu-ryeon, who runs Sales Teams 1 to 3. They're the same rank, and everyone is watching.": '13층으로 돌아오니, 미주 섬유팀 스티브 한 부장이 영업 1~3팀을 이끄는 김부련 부장에게 싸움을 걸러 와 있다. 같은 직급이고, 모두가 지켜본다.',
    "I can't talk trade, but I can talk about this.": '무역 얘기는 못 해도, 이 얘기는 할 수 있어.',
    'Everyone is playing their own game of baduk. Whoever prepared better ends up happier with the result, and whoever rushed just to keep up has no excuse.': '모두가 자신만의 바둑을 둔다. 더 잘 준비한 쪽이 결과에 웃고, 따라가느라 서두른 쪽은 변명할 거리가 없다.',
    "You haven't said a word all night. You won't learn just by listening.": '밤새 한마디도 안 했네요. 듣기만 해서는 안 늘어요.',
    'Picked your partner yet? Not Jang, surely.': '파트너 정했어? 설마 장그래는 아니지?',
    'Then he did his military service.': '그리고 그는 군대에 갔다.',
    "The day he leaves is an ordinary day. It feels as if he'll be back tomorrow, losing to younger kids again. He hasn't changed; everyone else has, and the colour has drained out of the world.": '떠나는 날은 평범한 날이다. 내일도 여기 와서 어린 아이들에게 또 지고 있을 것만 같다. 그는 변하지 않았다. 변한 건 다른 사람들이고, 세상에서는 색이 빠져나갔다.',
    'On the morning of his first day, he sleeps through the alarm twice. His mother ties his tie for him.': '출근 첫날 아침, 그는 알람을 두 번이나 놓친다. 어머니가 넥타이를 매어 준다.',
    "He's up before the alarm and crushed on the train. The world moves faster than he does.": '알람보다 먼저 일어나 전철에 끼인다. 세상은 그보다 빠르다.',
    "And you've got filing due tomorrow, but you're sitting here? Make your own stones safe before you attack.": '내일까지 정리할 서류가 있는데 여기 앉아 있어요? 아생연후살타라고요.',
    'He said I could build it my way. Hold him to that.': '내 방식대로 하라고 했잖아. 그 말을 붙잡자.',
    "Steve suggested dinner with the buyers, and I picked the place. I'd had a few drinks.": '스티브가 바이어들이랑 저녁 하자고 해서, 장소는 내가 골랐어. 좀 마신 상태였고.',
    "I'm Kim Dong-sik, assistant manager. I'm your buddy, and Section Head Oh is your mentor. First job: take this requisition to General Affairs.": '김동식 대리다. 내가 버디고, 오 과장님이 멘토야. 첫 번째 일, 이 비품 신청서 총무팀에 갖다줘.',
    'Make the corner solid first, then fight.': '귀부터 단단히 하고, 그다음에 싸운다.',
    "At the Ulsan plant, Han is told he has one last chance and should go back to a desk if he isn't up to it. In Seoul, Jang sits at his screen beside an abandoned board. The world is far colder and more heartless than he thought.": '울산 공장에서 한석율은 마지막 기회라는 말, 자신 없으면 책상으로 돌아가라는 말을 듣는다. 서울에서 장그래는 버려진 바둑판 옆 모니터 앞에 앉아 있다. 세상은 생각보다 훨씬 차갑고 비정하다.',
    'At home, his parents cut out newspaper stories about Lee Chang-ho and Lee Sedol, their rankings and their prize money.': '집에서 부모님은 이창호와 이세돌의 순위와 상금을 다룬 신문 기사를 오려 모았다.',
    'An ambitious man is like a tornado. But the eye of a tornado is calm. If you can get to his centre, you two could make it work.': '야심가는 토네이도 같아요. 그런데 토네이도의 눈은 고요하죠. 그 사람 중심에 들어가면 두 사람 잘 해낼 수 있어요.',
    'Anything with figures on it goes in the shredder. Not one of our papers should ever turn up outside this team.': '숫자 있는 건 전부 파쇄기로. 우리 서류가 팀 밖에서 발견되는 일은 절대 없어야 해.',
    "Can I borrow your glue? Our supply cabinet's locked and nobody will give me the key.": '풀 좀 빌릴 수 있을까요? 우리 비품함은 잠겨 있는데 아무도 열쇠를 안 줘요.',
    'Our kid. He called him our kid.': '우리 애. 그를 우리 애라고 불렀다.',
    "Go had taken a buyer, and Steve, to a dog-meat restaurant and never apologised. Ever since, Steve has been sitting on Sales Team 1's approvals.": '고 과장은 바이어와 스티브를 보신탕집에 데려갔고, 끝내 사과하지 않았다. 그 뒤로 스티브는 영업 1팀의 결재를 묶어 두고 있다.',
    "The PT dates are set: the first week of next month, a whole week at the training centre. There's an individual task and a team task, so start thinking about partners.": 'PT 날짜 나왔어요. 다음 달 첫 주, 연수원에서 일주일 내내요. 개인 과제랑 팀 과제가 있으니까 파트너 생각해 둬요.',
    "His system or Mr. Kim's? Neither has to die.": '이 사람 방식이냐, 김 대리님 방식이냐. 둘 다 죽을 필요는 없어.',
    'Your old sponsor was asking after you, the man who paid for all your baduk. Go and see him.': '네 바둑 뒷바라지해 주신 예전 후원자분이 네 안부를 물으셨다. 가서 뵙고 와.',
    'We chose it together, and he agreed. Hold him to that.': '같이 골랐고, 그도 동의했어. 그 말을 붙잡자.',
    "Baduk is a war with a plain winner and loser, and he lived in it for over ten years. He may be a beaten soldier, but he was raised to compete, and he doesn't hand over sente.": '바둑은 승자와 패자가 분명한 전쟁이고, 그는 그 안에서 십 년 넘게 살았다. 패잔병일지 몰라도 싸우도록 길러졌고, 선수를 내주지 않는다.',
    'I should take the requisition to General Affairs first.': '먼저 비품 신청서를 총무팀에 갖다줘야지.',
    "Let's all do our jobs properly, shall we?": '다들 일 똑바로 합시다.',
    'A trainee sits at a board, ringed by onlookers. Everyone watching already knows how it ends.': '바둑판 앞의 연구생, 그를 둘러싼 구경꾼들. 보는 사람들은 이미 결말을 안다.',
    'His system makes sense. The trouble is, everyone on staff already knows the old one.': '이 사람 체계는 합리적이에요. 문제는 직원들이 다 예전 방식에 익숙하다는 거죠.',
    "He dreams of his heroes, the great players: Cho Nam-chul, Cho Hunhyun, Lee Chang-ho, Lee Sedol. One by one they fade away. Hasn't he let go of baduk yet?": '그는 영웅들, 위대한 기사들의 꿈을 꾼다. 조남철, 조훈현, 이창호, 이세돌. 하나씩 희미해진다. 그는 아직 바둑을 놓지 못한 걸까.',
    'Late that night, Kim Seok-ho gets home to his one-room flat. The baby is still awake and knows him at once. Her tiny hand closes round his finger.': '그날 밤 늦게, 김석호가 단칸방으로 돌아온다. 아기는 아직 깨어 있고, 아빠를 단번에 알아본다. 작은 손이 그의 손가락을 꼭 쥔다.',
    'He decides to shred the waybill later with the next batch, and leaves it on his desk: Sales Team 3, DH-14.': '그는 선하증권을 다음에 한꺼번에 파쇄하기로 하고 책상 위에 둔다. 영업 3팀, DH-14.',
    "He really does have filing due. Come on, you're going to go and apologise.": '정말 정리할 서류가 있대요. 가요, 가서 사과해요.',
    "Ha! That's my fault. The supply cabinet key's on my key ring.": '하! 그건 내 탓이야. 비품함 열쇠가 내 열쇠고리에 있거든.',
    "That filing system belongs to the company. This isn't work you do alone; it's work we do together.": '그 체계는 회사 거야. 이건 혼자 하는 일이 아니야. 같이 하는 일이야.',
    'They go looking for Kim Bu-ryeon, only to find him already on the textile floor with Go, apologising to Steve. Then Go asks whether the approvals will go faster now, and everyone laughs.': '김부련 부장을 찾으러 가 보니, 그는 이미 섬유팀 층에서 고 과장과 함께 스티브에게 사과하고 있다. 그러다 고 과장이 이제 결재가 빨리 나느냐고 묻고, 모두가 웃는다.',
    "Sure, it's on my desk.": '네, 제 책상에 있어요.',
    "I need to understand the client, not your catalogue. Who's it for? What's their climate? What do they like? Just tell me what I need.": '내가 알아야 할 건 고객이지, 당신네 카탈로그가 아니에요. 누구를 위한 건지, 어떤 기후인지, 뭘 좋아하는지. 필요한 것만 말해 줘요.',
    "Then a professional's dojang. People called him a prodigy, and the word soothed his parents like a sedative, just as his father's company went under.": '그다음은 프로기사의 도장. 사람들은 그를 영재라 불렀고, 그 말은 부모님에게 수면제 같았다. 마침 아버지의 회사가 무너지던 때였다.',
    'Give it up, and apologise.': '버리고, 사과한다.',
    'After a board where you fight alone, the world seems kinder and warmer. He emails Han three ideas for the PT.': '혼자 싸우는 바둑판에 비하면 세상은 더 친절하고 따뜻해 보인다. 그는 한석율에게 PT 아이템 세 개를 메일로 보낸다.',
    'He works all night on three new ideas, forty pages each. In the morning, Oh tears into a team document he made.': '그는 밤새 새 아이템 세 개를 각 마흔 장씩 쓴다. 아침에 오 과장이 그가 만든 팀 문서를 혼낸다.',
    'Obsessive, and responsible.': '집요하고, 책임감 있는 사람.',
    "At eleven he joined the trainees' room: rows of boards, and children who all meant to turn professional.": '열한 살에 그는 연구생실에 들어갔다. 줄지은 바둑판, 그리고 모두 프로가 되려는 아이들.',
    "But your résumé is thin, and you'll be going in with nothing. Some people will call you a parachute: someone who only got in through connections.": '하지만 네 이력은 얇고, 아무것도 없이 들어가는 거다. 낙하산이라고 부르는 사람도 있을 거다. 연줄로만 들어온 사람이라고.',
    "Everyone's going to want you. You've got no confidence and no skills, and if you pair with a sure dud, you shine.": '다들 너를 원할 거다. 자신감도 실력도 없으니까. 확실한 폭탄이랑 짝이 되면 자기가 돋보이거든.',
    "A baduk word, from someone who doesn't play. Jang can't help grinning.": '바둑 안 두는 사람 입에서 바둑 말이 나오자, 장그래는 웃음을 참지 못한다.',
    "I've lived by this all my life: make your group safe, then attack.": '평생 이렇게 살았잖아. 내 돌부터 살리고, 그다음에 공격.',
    "He's obsessive, and responsible: a man who carries everything himself.": '집요하고, 책임감 있는 사람. 모든 걸 혼자 짊어지는 사람이다.',
    "Without a word, the director kicks the team's paper box over. His aide hands Oh the waybill: they found it on the lobby floor.": '상무는 말없이 팀의 이면지 박스를 걷어찬다. 수행원이 오 과장에게 선하증권을 건넨다. 1층 로비 바닥에서 주웠다고.',
    'At fifteen he filed his game records his own way, in a system only he ever had to read.': '열다섯 살 때 그는 기보를 자기 방식대로 정리했다. 자기만 읽으면 되는 체계로.',
    "Sente is the initiative: the right to lead the game. He's always handed it over. This time he means to keep it.": '선수는 주도권, 판을 이끄는 권리다. 그는 늘 내주었다. 이번엔 지키려 한다.',
    'Well? Should I do it again?': '어떠세요? 다시 할까요?',
    "At first light he's at Incheon harbour, where cargo meant for Gunsan was unloaded by mistake, some of it damaged. He came to see it for himself; paperwork alone drifts away from what's really happening on site.": '새벽, 그는 인천항에 있다. 군산으로 가야 할 화물이 잘못 내려졌고, 일부는 파손됐다. 그는 직접 보러 왔다. 서류만으로는 현장에서 멀어진다.',
    "The interns get yelled at on the roof. Back at his desk, Oh turns the waybill over. Glued to the back is a torn scrap of someone's weekly report, with a name on it: Kim Seok-ho.": '인턴들은 옥상에서 혼난다. 자리로 돌아온 오 과장이 선하증권을 뒤집는다. 뒷면에 누군가의 주간 보고서 조각이 붙어 있고, 이름이 적혀 있다. 김석호.',
    'Everyone plays their own baduk. Whoever prepared better comes out happier.': '모두 자신만의 바둑을 둔다. 더 잘 준비한 쪽이 웃는다.',
    "If there's a light I'm meant to keep burning, I'll take responsibility for it. But is there a light allowed for someone like me?": '내가 지켜야 할 불빛이 있다면 책임지겠다. 하지만 나 같은 사람에게도 허락된 불빛이 있을까.',
    "He's late to the team dinner, so he has to down three penalty drinks. The people who use him, help him, get angry with him and scold him are all on his side. Here, he's not an outsider.": '회식에 늦어서 벌주 석 잔을 마셔야 한다. 그를 이용하고, 돕고, 화내고, 꾸짖는 사람들이 모두 그의 편이다. 여기서 그는 이방인이 아니다.',
    "It doesn't sink in for Go, but it does for Kim Seok-ho.": '고 과장은 알아듣지 못하지만, 김석호는 알아듣는다.',
    "Where are you? The buyer's waiting, and if he walks out, we're both finished. I'm sending today's new hire. We're in no position to be picky.": '어디야? 바이어가 기다리고 있어. 그냥 가 버리면 우리 둘 다 끝이야. 오늘 들어온 신입을 보낸다. 지금 가릴 처지가 아니잖아.',
    'Not yet. The scrap, the glue, the key... I need to put it together first.': '아직이야. 종잇조각, 풀, 열쇠... 먼저 맞춰 봐야 해.',
    "I said you'd share it with me. I never said I'd keep my mouth shut.": '공유하라고 했지, 내가 입 다물고 있겠다고는 안 했어요.',
    "That's a secret.": '그건 비밀.',
    "I'm at the Mangwon-dong crossroads, doing twelve kilometres an hour, with eight to go. I'll be thirty minutes late. This fear is completely rational.": '망원동 사거리입니다. 시속 12킬로, 8킬로 남았습니다. 30분 늦습니다. 이 공포는 지극히 합리적이네요.',
    'Misaeng means "not yet alive": on a go board, a group of stones that is neither alive nor dead.': '미생. 아직 살아 있지 못한 것. 바둑판 위에서 살지도 죽지도 않은 돌을 말한다.',
    "As the city lights come on, office workers spill out to drink, flatter and head home. He'll start from the bottom like everyone else, and this time he won't fail the way he failed at baduk.": '도시에 불이 켜지자 직장인들이 쏟아져 나와 마시고, 아부하고, 집으로 간다. 그도 남들처럼 바닥부터 시작할 것이다. 이번엔 바둑처럼 실패하지 않을 것이다.',
    "I'm Han Seok-yul. I came back from the Ulsan plant for the PT.": '한석율입니다. PT 때문에 울산 공장에서 올라왔어요.',
    'Han texts back one word: Again!': '한석율의 답장은 한 단어다. 다시!',
    "Whoever your partner is, trust them. The player inside the game can't see his own scheming, but everyone watching can.": '파트너가 누구든 믿어요. 판 안에 있는 사람은 자기 수가 안 보여도, 보는 사람들은 다 봐요.',
    'Oh looks at the waybill in his hands: a locked cabinet, a borrowed glue stick, and a scrap with a name on it.': '오 과장은 손에 든 선하증권을 본다. 잠긴 비품함, 빌려 간 풀, 그리고 이름이 적힌 종잇조각.',
    "Jang has told everyone the waybill was his fault. Oh takes him and Kim out for a drink, and it isn't even nine before he's tipsy.": '장그래는 선하증권이 자기 잘못이라고 다들에게 말했다. 오 과장은 그와 김 대리를 데리고 술을 마시러 가고, 아홉 시도 안 돼 벌써 취한다.',
    "...The second one's good. Let's go with that.": '...두 번째 거 괜찮네요. 그걸로 하죠.',
    'He comes over to our team a lot, to borrow supplies.': '그 친구, 비품 빌리러 우리 팀에 자주 오던데.',
    'The bar is full of interns pitching PT topics. Ahn Young-yi, top of their intake and the only woman there, is watching him.': '술집은 PT 주제를 쏟아 내는 인턴들로 가득하다. 동기 중 수석이자 유일한 여자인 안영이가 그를 지켜보고 있다.',
    "Lead this time. Don't hand it over.": '이번엔 이끌자. 내주지 말자.',
    'He draws a mind map and designs a better filing system. It takes him all afternoon.': '그는 마인드맵을 그리고 더 나은 정리 체계를 만든다. 오후 내내 걸린다.',
    "Kim Seok-ho, an intern on another team, glues his report together at Jang's desk, right on top of the waybill, and hurries off.": '다른 팀 인턴 김석호가 장그래의 책상에서, 선하증권 바로 위에서 보고서를 풀로 붙이고 서둘러 나간다.',
    "His friends from the trainees' room turned pro. When he packed up, they asked if he was really quitting, and he had no answer. He put his game records out with the rubbish, along with his board.": '연구생실 친구들은 입단했다. 짐을 쌀 때 정말 그만두냐고 물었지만, 그는 대답하지 못했다. 기보와 바둑판을 쓰레기와 함께 내다 놓았다.',
    "It wasn't talent, or luck, or all those half-point losses. It wasn't the part-time jobs, or his father's death, or his mother in bed. Those reasons would hurt too much. So he tells himself he just didn't try hard enough.": '재능 탓도, 운 탓도, 그 많은 반집 패배 탓도 아니다. 아르바이트도, 아버지의 죽음도, 누워 계신 어머니도 아니다. 그런 이유는 너무 아프니까. 그래서 그는 그저 열심히 하지 않았을 뿐이라고 스스로에게 말한다.',
    'Then what kind of idea do you want?': '그럼 어떤 아이템을 원하시는데요?',
    "I don't have time for a report this thick. A fat report is just a way for nobody to take responsibility.": '이렇게 두꺼운 보고서 볼 시간 없습니다. 두꺼운 보고서는 아무도 책임 안 지려는 방법일 뿐이에요.',
    "Kim's call to the forwarder about the B/L, the copies, the floor. All at once.": '김 대리님 대신 포워더에게 B/L 전화, 복사, 바닥 청소. 전부 한꺼번에.',
    "Often the obvious move is the hardest one to play. Some things you have to do however hard they are, and some you mustn't do however easy.": '당연한 수가 가장 두기 어려울 때가 많다. 아무리 어려워도 해야 할 일이 있고, 아무리 쉬워도 하지 말아야 할 일이 있다.',
    'It started when his uncle brought a set of stones round to the flat. The boy nearly swallowed a few, and loved them anyway.': '시작은 삼촌이 집에 들고 온 바둑돌이었다. 꼬마는 몇 개를 삼킬 뻔했지만, 그래도 그 돌이 좋았다.',
    "Keep Mr. Kim's order for the executives' file, but use Jang's cross-index from the planning stage. Then the departments could actually line up.": '임원 파일은 김 대리님 순서대로 두고, 장그래 씨 교차 색인은 기획 단계부터 쓰면 돼요. 그러면 부서끼리 맞물릴 수 있어요.',
    "If it's checkmate, don't cling to it. Don't leave it on the board.": '외통수라면 매달리지 마. 판 위에 남겨 두지 마.',
    "He's lived by that proverb his whole life, and he had to hear it from someone else. He runs back to the office.": '평생 그 격언대로 살아 왔는데, 남에게서 들어야 했다. 그는 회사로 뛰어간다.',
    'Black approaches, and the hard fight starts here.': '흑이 다가간다. 치열한 싸움은 여기서 시작된다.',
    "Interns' study group tonight. We're going to work out who the dud is.": '오늘 밤 인턴 스터디 있어. 누가 폭탄인지 알아보자고.',
    'Han snatches it back with both hands.': '한석율이 두 손으로 다시 빼앗아 간다.',
    "A friend of mine runs a trading company, One International. I've spoken to him. He's the only one there who knows about your baduk, and it'll be a simple interview.": '내 친구가 원 인터내셔널이라는 무역회사를 하는데, 얘기해 뒀다. 거기서 네 바둑 얘기를 아는 건 그 친구뿐이고, 간단한 면접일 거다.',
    "Jang Geu-rae, you'll be an intern with Sales Team 3. In two months the interns sit a PT, a presentation test. Pass it, and you stay on.": '장그래 씨는 영업 3팀 인턴입니다. 두 달 뒤 인턴들은 PT, 발표 시험을 봅니다. 통과하면 계속 남는 겁니다.',
    'She kept her own group alive, and his too. Both live.': '그녀는 자기 돌도, 그의 돌도 살렸다. 둘 다 산다.',
    'It has two liberties. If I put one here...': '활로가 두 개야. 여기 두면...',
    "Jang's first-day message told him to skip the office and go straight to a café in Jongno. The overseas buyer and his manager, Kang, have been waiting there for an hour. Jang can't talk trade, but he can talk about one thing.": '첫날 받은 메시지는 회사 대신 종로의 카페로 바로 가라는 것이었다. 해외 바이어와 강 실장이 한 시간째 기다리고 있다. 장그래는 무역 얘기는 못 하지만, 할 수 있는 얘기가 하나 있다.',
    "A total dud. Who's going to volunteer for the bomb squad?": '완전 폭탄이네. 누가 폭탄 처리반 할래?',
    "Then we chose it together. From here on I'll write the PT my way. I'll keep you posted, but I won't be taking instructions.": '그럼 같이 고른 겁니다. 이제부터 PT는 제 방식대로 쓰겠습니다. 진행은 공유하겠지만, 지시는 받지 않겠습니다.',
    'After too many short nights, he finally falls into a deep sleep, slumped in a chair in an empty meeting room.': '짧은 밤들 끝에 그는 마침내 깊이 잠든다. 빈 회의실 의자에 늘어진 채로.',
    "Geu-rae didn't do anything wrong today. Being misunderstood is a terrible thing.": '그래는 오늘 잘못한 거 없어. 오해받는 건 정말 나쁜 거야.',
    'Jang hums as he feeds the shredder. Down in the lobby, a yellow sheet slides off the security desk onto the floor, and a passing director taps it with his shoe.': '장그래는 콧노래를 부르며 파쇄기에 종이를 넣는다. 로비에서 노란 종이 한 장이 보안 데스크에서 바닥으로 미끄러지고, 지나가던 상무가 구두로 툭 건드린다.',
    'He makes it to the car, but the road into the city is crawling: five hundred metres in half an hour.': '차까지는 왔지만, 시내로 가는 길은 기어간다. 30분에 500미터.',
    "Apologising is the only way. In baduk, you don't leave dead stones lying on the board. Leave one there, and it grows into a bigger problem.": '사과하는 수밖에 없습니다. 바둑에선 죽은 돌을 판 위에 남겨 두지 않습니다. 남겨 두면 더 큰 문제로 자랍니다.',
    'Have you picked a partner yet? Meet me on the roof tonight.': '파트너 정했어요? 오늘 밤 옥상에서 봐요.',
    'Next came an academy run by a strong amateur. His mother was against it, and nobody expected him to conquer the baduk world, but no one could stop a nine-year-old who got up at dawn to work through his problem book.': '다음은 아마 고수가 운영하는 학원이었다. 어머니는 반대했고, 그가 바둑계를 제패하리라 기대한 사람도 없었다. 하지만 새벽에 일어나 문제집을 푸는 아홉 살을 말릴 수는 없었다.',
    "You were crying in your sleep. So your partner's Han? He'll use anyone to make himself shine.": '자면서 울던데요. 파트너가 한석율 씨라고요? 자기 돋보이려고 누구든 이용할 사람이에요.',
    "Wait, that's why I came! The seniors want all the interns out tonight. It's evening already; you slept the whole day.": '아, 그래서 온 건데! 선배들이 오늘 밤 인턴들 다 모이래요. 벌써 저녁이에요. 하루 종일 잤어요.',
    "A puzzle? All right. I'm Black, and it's my move?": '퍼즐이요? 좋아요. 내가 흑이고, 내 차례인가요?',
    "His partner's Han Seok-yul, and Han's a talker. I bet Jang's doing all the work.": '파트너가 한석율이에요. 말발 좋은 친구죠. 일은 장그래가 다 하고 있을 겁니다.',
    "Then let's play politics with some class. Knowing when to bow your head: that's class. Let's go.": '그럼 품위 있게 정치하자. 숙일 때 숙일 줄 아는 게 품위야. 가자.',
    "The one inside the game can't see it. Step outside.": '판 안에 있으면 안 보여. 밖으로 나와.',
    'Someone at a workshop said most fear is irrational...': '워크숍에서 누가 그러더라고요. 공포는 대부분 비합리적이라고...',
    "A smooth talker, and a kid who can't tell he's being used. Some team.": '말발 좋은 놈하고, 이용당하는 줄도 모르는 녀석이라. 팀 한번 좋네.',
    # Places (Misaeng), relabelled handoff spots (d2b51e5)
    "Hand Kim's requisition to the clerk": '김 대리의 비품 신청서를 직원에게 건네기',
    'Give Kim Dong-sik his copies': '김동식 대리에게 복사본 건네기',
}
