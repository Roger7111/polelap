// PoleLap — client Supabase condiviso (M2.1). Caricare DOPO il CDN di supabase-js.
//
// La chiave qui sotto e' la ANON key: PUBBLICA by design, e' pensata per stare nel
// browser. La sicurezza NON la fa la segretezza della chiave ma le RLS del database,
// certificate da certifica_rls.py (7/7 il 27/07). Con questa chiave si legge solo
// audience='free' + la scorecard; il payload 'pro' richiede un JWT di utente con
// profiles.tier in ('pro','elite'). NON e' un segreto: non trattarla come tale.
const SB_URL = "https://zakblhuidoiarhahzlsu.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpha2JsaHVpZG9pYXJoYWh6bHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNzgwMjIsImV4cCI6MjA5OTg1NDAyMn0.-pZBLIeZnVObOIIRA4ZXpZsnwk2wPNvtTcqAvWEwEa8";

const sb = supabase.createClient(SB_URL, SB_ANON);
const $ = s => document.querySelector(s);

// URL assoluto di una pagina vicina. Serve per emailRedirectTo: il sito vive su
// roger7111.github.io/polelap/, quindi window.location.origin da solo perderebbe
// il sottopercorso e il magic link atterrerebbe fuori dal sito.
const pagina = nome => new URL(nome, window.location.href).href;

async function sessione() {
  const { data } = await sb.auth.getSession();
  return data.session || null;
}

// Il profilo e' protetto da RLS "lettura propria": senza sessione torna null,
// con sessione torna esattamente una riga (la propria). Nessun filtro lato client.
async function profilo() {
  const { data, error } = await sb.from('profiles')
    .select('id,display_name,tier,created_at').maybeSingle();
  return error ? null : data;
}

const pct = v => (isFinite(v) ? (v * 100).toFixed(1) + '%' : '—');
const num = (v, d = 2) => (isFinite(v) ? Number(v).toFixed(d) : '—');
