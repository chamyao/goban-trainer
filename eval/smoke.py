import arena, json, sys
ck = sys.argv[1]
r = arena.play(arena.bot_spec(f"own:{ck}"), 20, True, 1, 0); print("even", r["winner"], r["how"], r["moves"], r["record"][:8])
r = arena.play(arena.bot_spec(f"own:{ck}"), 20, True, 2, 4); print("hcap4 bot black", r["winner"], r["how"], r["moves"], r["record"][:6])
r = arena.play(arena.bot_spec("frac:0.47"), 15, False, 3, 3); print("katago bot white giving 3", r["winner"], r["how"], r["moves"], r["record"][:6])
