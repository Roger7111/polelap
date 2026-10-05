// live.html - era inline nella pagina; file a parte dal 29/09/2026 (CSP senza 'unsafe-inline').
const SB_URL = "https://zakblhuidoiarhahzlsu.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpha2JsaHVpZG9pYXJoYWh6bHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNzgwMjIsImV4cCI6MjA5OTg1NDAyMn0.-pZBLIeZnVObOIIRA4ZXpZsnwk2wPNvtTcqAvWEwEa8";
const sb = supabase.createClient(SB_URL, SB_ANON);
const $ = s => document.querySelector(s);
const pct = v => (isFinite(v) ? (v*100).toFixed(1)+"%" : "—");

// una entry per (race_id): tiene la piu' recente per frozen_at_utc
function latestPerRace(rows){
  const by = {};
  for (const r of rows){
    const f = (r.payload && r.payload.frozen_at_utc) || r.computed_at || "";
    if (!by[r.race_id] || f > by[r.race_id]._f){ r._f = f; by[r.race_id] = r; }
  }
  return Object.values(by).sort((a,b)=> (b._f>a._f?1:-1));
}

function drivers(p){
  const list = p.drivers || p.race_prediction || [];
  return list.map(d => ({
    code: d.driver || d.code || "?",
    team: d.team || "",
    grid: d.grid ?? d.GridPos ?? "",
    win:  parseFloat(d.p_win ?? d.P_Win),
    pod:  parseFloat(d.p_podium ?? d.p_podio ?? d.P_Podium),
  })).sort((a,b)=> (b.win||0)-(a.win||0));
}

function render(row){
  const p = row.payload || {};
  $("#stage").textContent = (p.stage || row.stage || "").replace("-"," ") || "—";
  const gc = (p.git_commit||"").slice(0,9);
  $("#prov").textContent = (p.frozen_at_utc ? "freeze "+p.frozen_at_utc : "") + (gc ? "  ·  commit "+gc : "");
  const ds = drivers(p);
  if (!ds.length){ $("#out").innerHTML = '<div class="err">Payload senza griglia piloti.</div>'; return; }
  const max = Math.max(...ds.map(d=>d.win||0), .01);
  $("#out").innerHTML = `<table><thead><tr>
      <th class="pos">#</th><th>Pilota</th><th>Griglia</th><th>P(vittoria)</th><th>P(podio)</th>
    </tr></thead><tbody>${ds.map((d,i)=>`<tr>
      <td class="pos">${i+1}</td>
      <td><span class="code">${d.code}</span> <span class="team">${d.team}</span></td>
      <td>${d.grid||"—"}</td>
      <td class="p"><span class="fill" style="width:${((d.win||0)/max*100).toFixed(0)}%"></span><span class="val">${pct(d.win)}</span></td>
      <td>${pct(d.pod)}</td>
    </tr>`).join("")}</tbody></table>`;
}

(async () => {
  const { data, error } = await sb.from("predictions")
    .select("race_id,stage,computed_at,payload")
    .eq("audience","free").eq("prediction_type","race")
    // solo freeze PRIMA della gara: i post-race sono fotografie a gara finita, non previsioni
    .in("stage",["pre-weekend","post-fp2","post-fp3","post-quali"]);
  if (error){ $("#out").innerHTML = `<div class="err">Errore lettura DB: ${error.message}</div>`; return; }
  if (!data || !data.length){ $("#out").innerHTML = '<div class="err">Nessuna previsione nel database.</div>'; return; }
  const races = latestPerRace(data);
  const sel = $("#race");
  sel.innerHTML = races.map((r,i)=>`<option value="${i}">${(r.payload&&r.payload.race)||r.race_id}</option>`).join("");
  sel.onchange = () => render(races[+sel.value]);
  render(races[0]);
})();
