/* Runs the site's own network (engine/ownnet.js) off the page: {type: "load", url} once, then {type: "eval", id,
   board, black, ko, last, komi} -> {id, policy, value}. (aiplay.js OwnPlay) */
importScripts("ownnet.js?v=1");
let net = null, loading = null;
onmessage = async e => {
  const m = e.data;
  try {
    if (m.type === "load") {
      loading = loading || fetch(m.url).then(r => { if (!r.ok) throw new Error(`weights ${r.status}`); return r.arrayBuffer(); }).then(b => { net = OwnNet.load(b); return net.head; });
      postMessage({ id: m.id, head: await loading });
    } else if (m.type === "eval") {
      if (!net) await loading;
      const r = OwnNet.forward(net, OwnNet.features(m));
      postMessage({ id: m.id, policy: Array.from(r.policy), value: r.value });
    }
  } catch (err) { postMessage({ id: m.id, error: String(err && err.message || err) }); }
};
