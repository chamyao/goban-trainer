// One spot: solve from the flop, then dump the strategy (per hand: action frequencies and EVs) at the
// decision nodes along given lines (flop, turn, river). Spec JSON on stdin, result JSON on stdout.
use postflop_solver::*;
use serde_json::{json, Value};
use std::io::Read;

fn act_str(a: &Action) -> String {
    match a {
        Action::Fold => "fold".into(),
        Action::Check => "check".into(),
        Action::Call => "call".into(),
        Action::Bet(x) => format!("bet {}", x),
        Action::Raise(x) => format!("raise {}", x),
        Action::AllIn(x) => format!("allin {}", x),
        _ => format!("{:?}", a),
    }
}

fn r3(x: f32) -> f32 { (x * 1000.0).round() / 1000.0 }
fn r1(x: f32) -> f32 { (x * 10.0).round() / 10.0 }

fn dump(game: &mut PostFlopGame) -> Value {
    game.cache_normalized_weights();
    let p = game.current_player();
    let hands = holes_to_strings(game.private_cards(p)).unwrap();
    let acts: Vec<String> = game.available_actions().iter().map(act_str).collect();
    let st = game.strategy();
    let ev = game.expected_values_detail(p);
    let w = game.normalized_weights(p).to_vec();
    let eq = game.equity(p);
    let n = hands.len();
    let mut rows = vec![];
    let mut tot = vec![0f32; acts.len()];
    let mut ws = 0f32;
    for i in 0..n {
        if w[i] <= 0.0 { continue; }
        let f: Vec<f32> = (0..acts.len()).map(|a| r3(st[i + a * n])).collect();
        let e: Vec<f32> = (0..acts.len()).map(|a| r1(ev[i + a * n])).collect();
        for a in 0..acts.len() { tot[a] += st[i + a * n] * w[i]; }
        ws += w[i];
        rows.push(json!({"h": hands[i], "w": r3(w[i]), "f": f, "ev": e, "eq": r3(eq[i])}));
    }
    let mix: Vec<f32> = tot.iter().map(|x| r3(x / ws)).collect();
    json!({"player": p, "actions": acts, "mix": mix, "bets": game.total_bet_amount(), "hands": rows})
}

fn main() {
    let mut s = String::new();
    std::io::stdin().read_to_string(&mut s).unwrap();
    let spec: Value = serde_json::from_str(&s).unwrap();
    let g = |k: &str| spec[k].as_str().unwrap().to_string();
    let card_config = CardConfig {
        range: [g("oop").parse().unwrap(), g("ip").parse().unwrap()],
        flop: flop_from_str(&g("flop")).unwrap(),
        turn: NOT_DEALT,
        river: NOT_DEALT,
    };
    // sizes: "<street>_bets" for both players, or "<street>_bets_oop" / "<street>_bets_ip" for each
    let sz = |st: &str, who: &str| {
        let b = spec[format!("{}_bets_{}", st, who).as_str()].as_str().map(|x| x.to_string()).unwrap_or_else(|| g(&format!("{}_bets", st)));
        let r = spec[format!("{}_raises_{}", st, who).as_str()].as_str().map(|x| x.to_string()).unwrap_or_else(|| g(&format!("{}_raises", st)));
        BetSizeOptions::try_from((b.as_str(), r.as_str())).unwrap()
    };
    let pot = spec["pot"].as_i64().unwrap() as i32;
    let tree = TreeConfig {
        initial_state: BoardState::Flop,
        starting_pot: pot,
        effective_stack: spec["stack"].as_i64().unwrap() as i32,
        rake_rate: 0.0,
        rake_cap: 0.0,
        flop_bet_sizes: [sz("flop", "oop"), sz("flop", "ip")],
        turn_bet_sizes: [sz("turn", "oop"), sz("turn", "ip")],
        river_bet_sizes: [sz("river", "oop"), sz("river", "ip")],
        turn_donk_sizes: None,
        river_donk_sizes: None,
        add_allin_threshold: 1.5,
        force_allin_threshold: 0.15,
        merging_threshold: 0.1,
    };
    let at = ActionTree::new(tree).unwrap();
    let mut game = PostFlopGame::with_config(card_config, at).unwrap();
    let (m, mc) = game.memory_usage();
    eprintln!("memory {:.2} GB ({:.2} compressed)", m as f64 / 1e9, mc as f64 / 1e9);
    if spec["dry"].as_bool().unwrap_or(false) { return; }
    game.allocate_memory(spec["compress"].as_bool().unwrap_or(true));
    let t0 = std::time::Instant::now();
    let target = pot as f32 * spec["target"].as_f64().unwrap_or(0.005) as f32;
    let expl = solve(&mut game, spec["iters"].as_u64().unwrap_or(400) as u32, target, false);
    eprintln!("solved in {:.0}s, exploitability {:.2}% of the pot", t0.elapsed().as_secs_f64(), 100.0 * expl / pot as f32);

    // each line: steps that are action names ("check", "bet" = smallest bet, "bet2" = second size, "call",
    // "raise") or cards ("Qc"); the node reached is dumped
    let mut out = vec![];
    for line in spec["lines"].as_array().unwrap() {
        game.back_to_root();
        let mut ok = true;
        let mut walked = vec![];
        for step in line.as_array().unwrap() {
            let st = step.as_str().unwrap();
            if game.is_chance_node() {
                let c = card_from_str(st).unwrap();
                if game.possible_cards() & (1u64 << c) == 0 { ok = false; break; }
                game.play(c as usize);
                walked.push(st.to_string());
                continue;
            }
            let acts: Vec<String> = game.available_actions().iter().map(act_str).collect();
            let idx = if st == "bet" || st == "raise" {
                acts.iter().position(|a| a.starts_with(st))
            } else if st == "bet2" || st == "raise2" {
                acts.iter().enumerate().filter(|(_, a)| a.starts_with(&st[..st.len() - 1])).nth(1).map(|(i, _)| i)
            } else {
                acts.iter().position(|a| a == st)
            };
            match idx {
                Some(i) => { walked.push(acts[i].clone()); game.play(i); }
                None => { ok = false; break; }
            }
        }
        if !ok || game.is_terminal_node() || game.is_chance_node() {
            out.push(json!({"line": line, "error": "unreachable"}));
            continue;
        }
        let mut d = dump(&mut game);
        d["line"] = line.clone();
        d["walked"] = json!(walked);
        let b: Vec<String> = game.current_board().iter().map(|c| card_to_string(*c).unwrap()).collect();
        d["board"] = json!(b);
        out.push(d);
    }
    println!("{}", json!({"exploitability_pct": 100.0 * expl / pot as f32, "nodes": out}));
}
