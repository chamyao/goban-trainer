/* ---- Three Kingdoms: music while exploring ----
   Chinese instrumental pieces, chosen by where you are and what is happening:

     towns, villages, inside buildings    Lotus Pond (guzheng, flute)
     roads, gardens                       All The Tea In China (erhu, guzheng, flute)
     hills, mountains, camps              Imperial China (guzheng, erhu, taiko, strings)
     a battle being acted out             Dragon Dance (drums, guzheng)
     a boss fight                         Taiko drums (taiko, bells, shouts)
     a victory                            Imperial China (strings, taiko)

   A cutscene can also call for music itself (["music", cue] in the story,
   and boss scenes do it on their own): it sets scene.musicCue, which wins
   while the scene plays. Cues: boss, battle, calm, victory, none.

   Pieces crossfade, the music dips while a line is voiced, and it fades out
   when you leave the campaign page. On/off is the Music button in the campaign
   header (remembered in localStorage tk-music). Browsers only let sound start
   after a click or key press, so it begins with your first one on the page.
   Sources and licences: assets/tk/CREDITS.txt. */

const TKMusic = {
  TRACKS: {
    lotus: { src: "assets/tk/music/lotus-pond.mp3", vol: .32 },
    tea: { src: "assets/tk/music/all-the-tea-in-china.mp3", vol: .3 },
    imperial: { src: "assets/tk/music/imperial-china.mp3", vol: .26 },
    dragon: { src: "assets/tk/music/dragon-dance.mp3", vol: .3 },
    taiko: { src: "assets/tk/music/taiko-drums.mp3", vol: .5 },
  },
  CUES: { boss: "taiko", battle: "dragon", victory: "imperial" },   // "calm": the place's own piece; "none": silence
  SFX: { gong: { src: "assets/tk/music/gong.mp3", vol: .8 } },
  BY_PLACE: { village: "lotus", town: "lotus", city: "lotus", interior: "lotus",
    road: "tea", garden: "tea", overworld: "tea", hills: "imperial", mountain: "imperial", camp: "imperial" },
  DUCK: .35,          // music level while a line is being voiced
  FADE: 1200,         // ms

  get on() { try { return localStorage.getItem("tk-music") !== "off"; } catch { return true; } },
  set on(v) { try { localStorage.setItem("tk-music", v ? "on" : "off"); } catch {} },

  els: {}, want: null, playing: null, unlocked: false, timer: null,

  el(name) {
    if (!this.els[name]) {
      const t = this.TRACKS[name], a = new Audio(t.src);
      a.loop = true; a.preload = "none"; a.volume = 0;
      this.els[name] = a;
    }
    return this.els[name];
  },

  // What should be playing now, from the world's state (null: silence).
  pick() {
    const s = typeof WorldView !== "undefined" && WorldView.game && WorldView.game.scene.getScene("world");
    if (!s || !s.sys || !s.sys.isActive() || !s.region) return null;
    const p = s.region.places.find(x => x.id === s.placeId);
    if (s.cine && s.musicCue) {                                    // the scene asked for it
      if (s.musicCue === "none") return null;
      if (this.CUES[s.musicCue]) return this.CUES[s.musicCue];
      return (p && this.BY_PLACE[p.archetype]) || "lotus";
    }
    if (s.cine && s.cine.cast && Object.values(s.cine.cast).some(c => c.group)) return "dragon";   // armies on stage
    return (p && this.BY_PLACE[p.archetype]) || "lotus";
  },

  tick() {
    const want = this.on && this.unlocked ? this.pick() : null;
    const voiced = typeof TKVoice !== "undefined" && TKVoice.audio && !TKVoice.audio.paused;
    for (const [name, a] of Object.entries(this.els)) {
      const target = name === want ? this.TRACKS[name].vol * (voiced ? this.DUCK : 1) : 0;
      const step = this.TRACKS[name].vol * 250 / this.FADE;
      a.volume = Math.max(0, Math.min(1, a.volume + Math.max(-step, Math.min(step, target - a.volume))));
      if (target === 0 && a.volume === 0 && !a.paused) a.pause();
    }
    if (want) {
      const a = this.el(want);
      if (a.paused) a.play().catch(() => {});
    }
  },

  // A one-off sound (the gong), when music is on.
  sfx(name) {
    const t = this.SFX[name];
    if (!t || !this.on || !this.unlocked) return;
    const a = new Audio(t.src);
    a.volume = t.vol;
    a.play().catch(() => {});
  },

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 250);
    const unlock = () => { this.unlocked = true; this.tick(); };
    addEventListener("pointerdown", unlock, { once: true, capture: true });
    addEventListener("keydown", unlock, { once: true, capture: true });
  },

  // The header button (added by tk-travel.js beside Map and Start over).
  button(btn) {
    const show = () => { btn.textContent = this.on ? "音乐 Music on" : "音乐 Music off"; btn.setAttribute("aria-pressed", String(this.on)); };
    btn.onclick = () => { this.on = !this.on; this.unlocked = true; show(); this.tick(); };
    show();
    return btn;
  },
};
TKMusic.start();
