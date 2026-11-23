/* app.js - PoleLap, sito pubblico. Nuova app del 23/11/2026: Weekend, Campionato, Track record, Analisi, Metodo.
   Legge data/previsione.json (e calibration, pace_skill, pace_hist) e disegna tutto qui: nessuno script dentro le
   pagine e nessun attributo di evento nell'HTML (CSP senza 'unsafe-inline'); i controlli hanno ascoltatori propri. */
'use strict';
const AZIONI = {};   // nessun data-clic: ogni controllo ha il suo ascoltatore qui sotto (tests/test_giunzioni.py)
const D = {};        // i dati della pagina, caricati all'avvio

(function () {
  var REPO = 'https://github.com/Roger7111/polelap';
  var NOMI = { ANT: 'Antonelli', RUS: 'Russell', LEC: 'Leclerc', HAM: 'Hamilton', NOR: 'Norris', PIA: 'Piastri', VER: 'Verstappen', HAD: 'Hadjar', HUL: 'Hülkenberg', COL: 'Colapinto', GAS: 'Gasly', BOR: 'Bortoleto', LIN: 'Lindblad', OCO: 'Ocon', BEA: 'Bearman', SAI: 'Sainz', LAW: 'Lawson', ALB: 'Albon', ALO: 'Alonso', PER: 'Pérez', BOT: 'Bottas', STR: 'Stroll', TSU: 'Tsunoda', CAM: 'Câmara', HIR: 'Hirakawa', DOO: 'Doohan', CRA: 'Crawford', BEG: 'Beganovic' };
  var TC = { 'Mercedes': '#00A88E', 'Ferrari': '#E8002D', 'McLaren': '#FF8000', 'Red Bull Racing': '#3671C6', 'Aston Martin': '#229971', 'Alpine': '#0093CC', 'Audi': '#9B1B30', 'Racing Bulls': '#6C8FF0', 'Williams': '#1868DB', 'Haas F1 Team': '#9AA0A6', 'Cadillac': '#C8A95B' };
  var SQ = { 'Haas F1 Team': 'Haas' };
  var GP = { 'Australian': 'Australia', 'Chinese': 'Cina', 'Japanese': 'Giappone', 'Miami': 'Miami', 'Canadian': 'Canada', 'Monaco': 'Monaco', 'Barcelona-Catalunya': 'Barcellona', 'Barcelona': 'Barcellona', 'Austrian': 'Austria', 'British': 'Gran Bretagna', 'Belgian': 'Belgio', 'Hungarian': 'Ungheria', 'Dutch': 'Olanda', 'Italian': 'Italia', 'Spanish': 'Spagna', 'Azerbaijan': 'Azerbaigian', 'Malaysian': 'Malesia', 'Singapore': 'Singapore', 'United States': 'Stati Uniti', 'Mexico City': 'Città del Messico', 'São Paulo': 'San Paolo', 'Sao Paulo': 'San Paolo', 'Las Vegas': 'Las Vegas', 'Qatar': 'Qatar', 'Abu Dhabi': 'Abu Dhabi', 'Bahrain': 'Bahrein', 'Saudi Arabian': 'Arabia Saudita', 'Emilia Romagna': 'Emilia-Romagna' };
  var SESS = { FP1: 'Libere 1', FP2: 'Libere 2', FP3: 'Libere 3', Qualifica: 'Qualifica', Gara: 'Gara', Sprint: 'Sprint', SQ: 'Qualifica sprint', 'Sprint Qualifying': 'Qualifica sprint', 'Sprint Shootout': 'Qualifica sprint' };
  var PISTA = { power: 'veloce', aero: 'aerodinamica', balanced: 'bilanciata', street: 'cittadina' };
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  var TZ = 'Europe/Rome';

  var nf0 = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var nf2 = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var fDay = new Intl.DateTimeFormat('it-IT', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' });
  var fTime = new Intl.DateTimeFormat('it-IT', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
  var fData = new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', day: 'numeric', month: 'short' });
  var fGiorno = new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nm(c) { return NOMI[c] || c; }
  function sq(t) { return SQ[t] || t || ''; }
  function col(t) { return TC[t] || 'var(--muted)'; }
  function gp(n) { var b = String(n || '').replace(/ \d{4}$/, '').replace(/ Sprint$/, '').replace(/ Grand Prix$/, '').replace(/ GP$/, ''); return GP[b] || b; }
  function pct(p) {
    if (p == null || isNaN(p)) return '–';
    var v = p * 100;
    if (v <= 0) return '0%';
    if (v < 0.1) return '<0,1%';
    if (v > 99.9 && v < 100) return '>99,9%';
    if (v > 99 && v < 100) return nf1.format(v) + '%';
    return (v >= 10 ? nf0.format(v) : nf1.format(v)) + '%';
  }
  function dpp(d) {
    if (d == null || isNaN(d)) return '';
    var v = d * 100;
    if (Math.abs(v) < 0.05) return 'invariato';
    return (v > 0 ? '+' : '−') + nf1.format(Math.abs(v)) + ' punti';
  }
  function itDT(d) { return fDay.format(d) + ', ' + fTime.format(d); }
  function dataBreve(iso) { return fData.format(new Date(String(iso).slice(0, 10) + 'T12:00:00Z')); }
  function oraLocale(s) {        // generato_at: ora italiana senza fuso, 'AAAA-MM-GGTHH:MM:SS'
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(s || '');
    return m ? fGiorno.format(new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12))) + ' alle ' + m[4] + ':' + m[5] : '';
  }
  function partsIn(ms, tz) {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(new Date(ms)).forEach(function (x) { if (x.type !== 'literal') o[x.type] = +x.value; });
    return o;
  }
  function zonedToUtc(s, tz) {   // 'AAAA-MM-GGTHH:MM' ora locale di tz -> Date
    var a = String(s).split('T'), d = a[0].split('-').map(Number), t = (a[1] || '00:00').split(':').map(Number);
    var want = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1]), g = want;
    for (var i = 0; i < 2; i++) { var p = partsIn(g, tz); g -= Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - want; }
    return new Date(g);
  }
  function urlCartella(nomeGara, anno) { return REPO + '/tree/main/track_record/' + encodeURIComponent(String(nomeGara).replace(/ /g, '_') + '_' + anno); }
  function drv(code, team, extra) {
    return '<div class="drv"><span class="sw" style="--c:' + col(team) + '"></span><span><b>' + esc(nm(code)) + '</b><small>' + esc(sq(team)) + (extra || '') + '</small></span></div>';
  }
  function sw(team) { return '<span class="sw" style="--c:' + col(team) + '"></span>'; }
  function pcell(p, delta) {
    var w = Math.max(0, Math.min(100, (p || 0) * 100));
    return '<div class="pc"><span class="bar"><i style="width:' + w + '%"></i></span><span class="v">' + pct(p) + (delta != null ? '<span class="dl">' + dpp(delta) + '</span>' : '') + '</span></div>';
  }
  function rcell(lo, hi, mid, n) {
    if (!lo || !hi) return '<span class="note">–</span>';
    var x = function (v) { return (v - 1) / Math.max(1, n - 1) * 100; };
    var tit = 'Fascia 80%: da P' + lo + ' a P' + hi + (mid ? ', posizione media ' + nf1.format(mid) : '');
    return '<div class="rg" title="' + tit + '"><span class="tr"><span class="s80" style="left:' + x(lo) + '%;width:' + Math.max(x(hi) - x(lo), 1.2) + '%"></span>'
      + (mid ? '<span class="dot" style="left:' + x(mid) + '%"></span>' : '') + '</span><span class="v">P' + lo + '–P' + hi + '</span></div>';
  }
  function fascia(s) { var m = /P(\d+)\D+P(\d+)/.exec(s || ''); return m ? [+m[1], +m[2]] : [0, 0]; }
  function barList(rows, opt) {   // rows: {lab, v, txt, cls, parts}; scala da 0 a opt.max, o divergente intorno a 0
    opt = opt || {};
    return '<div class="bl">' + rows.map(function (r) {
      var trk;
      if (opt.div) {
        var w = Math.min(50, Math.abs(r.v) / opt.max * 50);
        trk = '<span class="mid"></span><span class="f ' + (r.v >= 0 ? 'r' : 'l b') + '" style="' + (r.v >= 0 ? 'left:50%' : 'left:' + (50 - w) + '%') + ';width:' + w + '%"></span>';
      } else if (r.parts) {
        var left = 0;
        trk = r.parts.map(function (p, i) {
          var w2 = p.v / opt.max * 100, s = '<span class="f ' + (p.cls || '') + (i === r.parts.length - 1 ? ' r' : '') + '" style="left:calc(' + left + '% + ' + (i * 2) + 'px);width:' + w2 + '%"></span>';
          left += w2; return w2 > 0 ? s : '';
        }).join('');
      } else {
        trk = '<span class="f r ' + (r.cls || '') + '" style="left:0;width:' + Math.max(0, Math.min(100, r.v / opt.max * 100)) + '%"></span>';
      }
      return '<div class="row"><span class="lab">' + r.lab + '</span><span class="trk">' + trk + '</span><span class="val">' + r.txt + '</span></div>';
    }).join('') + '</div>';
  }
  function chipsHtml(id, voci, aria) {
    return '<div class="chips" id="' + id + '" role="group" aria-label="' + esc(aria) + '">' + voci.map(function (v) { return '<button type="button" class="chip" data-k="' + esc(v[0]) + '">' + esc(v[1]) + '</button>'; }).join('') + '</div>';
  }
  function premuto(id, k) { document.querySelectorAll('#' + id + ' [data-k]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)); }); }
  function suClic(id, fn) { document.querySelectorAll('#' + id + ' [data-k]').forEach(function (b) { b.addEventListener('click', function () { fn(b.dataset.k); }); }); }

  var cal = [], corsa = null, anno = '2026';

  /* ── Weekend ─────────────────────────────────────────────────────────────── */
  var stato = { s: 'gara', sc: 'asciutto' };
  function renderWeekend() {
    var wi = D.weather_info || {}, tz = wi.tz || TZ;
    var sess = (wi.sessions || []).map(function (s) { return { name: s.name, d: zonedToUtc(s.dt, tz) }; });
    var gara = sess.filter(function (s) { return s.name === 'Gara'; })[0];
    var ns = (D.calendar || {}).next_session, nsd = ns ? new Date(ns.dt) : null;
    var rp = (D.race_prediction || []).slice().sort(function (a, b) { return b.p_win - a.p_win || b.p_podio - a.p_podio; });
    var fav = rp[0];
    var pole = (D.griglia || []).slice().sort(function (a, b) { return b.p_pole - a.p_pole; })[0];
    var citta = gp(corsa ? corsa.name : D.gp);
    var finita = !!(D.gara_reale && (D.arrivo_reale || []).length);
    var h = '<div class="hero"><div class="hero-main">';
    h += '<p class="eyebrow">' + (corsa ? 'Round ' + corsa.round + ' di ' + cal.length + ' · ' : '') + (finita ? 'gara conclusa' : 'prossimo Gran Premio') + '</p>';
    h += '<h1>' + esc(D.gp) + '</h1>';
    h += '<p class="meta"><span>' + esc(D.circuito) + '</span><span>Pista ' + (PISTA[D.tipo] || esc(D.tipo)) + '</span>' + (D.formato === 'sprint' ? '<span>Weekend con la sprint</span>' : '')
      + (gara ? '<span>Gara ' + itDT(gara.d) + ', ora italiana</span>' : '') + '</p>';
    if (nsd && nsd.getTime() > Date.now()) {
      var altroGp = ns.gp && gp(ns.gp) !== citta;
      h += '<p class="next"><span class="eyebrow">Prossima sessione</span><b>' + (SESS[ns.name] || esc(ns.name)) + (altroGp ? ' · ' + esc(gp(ns.gp)) : '') + '</b><span>' + itDT(nsd) + '</span><span class="cd" id="cd"></span></p>';
    }
    if (D.generato_at) {
      h += '<a class="stamp" href="' + (corsa ? urlCartella(corsa.name, anno) : REPO + '/tree/main/track_record') + '" target="_blank" rel="noopener"><i></i>Previsione del '
        + oraLocale(D.generato_at) + ' · ogni versione è congelata su GitHub ↗</a>';
    }
    h += '</div>';
    if (finita) {
      var vin = D.arrivo_reale[0], pv = rp.filter(function (r) { return r.driver === vin.driver; })[0];
      var tre = (D.race_prediction || []).slice().sort(function (a, b) { return b.p_podio - a.p_podio; }).slice(0, 3).map(function (r) { return r.driver; });
      var podio = D.arrivo_reale.slice(0, 3).map(function (r) { return r.driver; });
      var presi = tre.filter(function (c) { return podio.indexOf(c) >= 0; }).length;
      h += '<aside class="fav" aria-label="Com\'è andata"><p class="eyebrow">Ha vinto</p><p class="who">' + sw(vin.team) + esc(nm(vin.driver)) + ' <small>' + esc(sq(vin.team)) + '</small></p>';
      h += '<p class="fig">' + (pv ? pct(pv.p_win) : '–') + '</p><p class="note">la probabilità di vittoria che gli davamo</p>';
      h += '<div class="split"><div class="kv"><span>Favorito · ' + (fav ? esc(nm(fav.driver)) : '–') + '</span><b>' + (fav ? pct(fav.p_win) : '–') + '</b></div>'
        + '<div class="kv"><span>I tre più probabili sul podio</span><b>' + presi + ' su 3 saliti</b></div></div></aside></div>';
    } else if (fav) {
      h += '<aside class="fav" aria-label="Favorito per la vittoria"><p class="eyebrow">Favorito per la vittoria</p><p class="fig">' + pct(fav.p_win) + '</p>';
      h += '<p class="who">' + sw(fav.team) + esc(nm(fav.driver)) + ' <small>' + esc(sq(fav.team)) + '</small></p>';
      h += '<div class="split"><div class="kv"><span>Podio</span><b>' + pct(fav.p_podio) + '</b></div>'
        + (pole ? '<div class="kv"><span>Pole · ' + esc(nm(pole.driver)) + '</span><b>' + pct(pole.p_pole) + '</b></div>' : '') + '</div>';
      h += '<p class="note">Su ' + nf0.format(D.n_sim || 0) + ' gare simulate.</p></aside></div>';
    } else {
      h += '</div>';
    }

    var bottoni = [['gara', 'Gara'], ['quali', 'Qualifica']];
    if (D.formato === 'sprint' && (D.sprint_prediction || []).length) bottoni.push(['sprint', 'Sprint']);
    if (D.formato === 'sprint' && (D.sq_griglia || []).length) bottoni.push(['sq', 'Qualifica sprint']);
    h += '<div class="block"><div class="block-head"><div><h2>' + (finita ? 'Previsione e risultato' : 'Le probabilità') + '</h2><p class="lead" id="pred-lead"></p></div>';
    h += '<div class="seg" role="group" aria-label="Sessione" id="seg-sess">' + bottoni.map(function (b) { return '<button type="button" data-k="' + b[0] + '">' + b[1] + '</button>'; }).join('') + '</div></div>';
    h += '<div class="chips" id="scen" role="group" aria-label="Scenario della gara"></div>';
    h += '<div class="tbl"><table class="t" id="tpred"></table></div><p class="note" id="pred-note"></p></div>';

    var lr = D.long_run || {};
    if ((lr.piloti || []).length) {
      var gruppi = {};
      lr.piloti.forEach(function (p) { (gruppi[p.gruppo] = gruppi[p.gruppo] || []).push(p); });
      h += '<div class="block"><div class="block-head"><div><h2>Il passo sui giri lunghi</h2><p class="lead">Dalle ' + esc(SESS[lr.sessione] || lr.sessione || 'libere') + ': chi va più forte sulle serie di giri lunghe, a gruppi di passo simile. Il gruppo 1 è il più veloce.</p></div></div><div class="lr">';
      Object.keys(gruppi).sort(function (a, b) { return a - b; }).forEach(function (g) {
        h += '<div class="g"><span>Gruppo ' + esc(g) + '</span><div class="ps">' + gruppi[g].map(function (p) {
          return '<span>' + sw(p.team) + esc(nm(p.driver)) + ' <small>' + esc(p.mescole || '') + (p.giri ? ', ' + p.giri + ' giri' : '') + '</small></span>';
        }).join('') + '</div></div>';
      });
      h += '</div><p class="note">Mescole: S morbida, M media, H dura. Solo i piloti con abbastanza giri di fila.</p></div>';
    }

    var wx = D.weather || {}, fa = new Date(wx.fetched_at || '');
    var giorni = ['friday', 'saturday', 'sunday'].map(function (k) { return wx[k]; }).filter(function (g) { return g && g.date; });
    if (giorni.length && (!wi.race_date || wx.race_date === wi.race_date)) {     // 24/11: il meteo del sito vecchio, dai dati della previsione
      var rw = wx.race_window || {};
      h += '<div class="block"><div class="block-head"><div><h2>Meteo del weekend</h2><p class="lead">Previsione di Open-Meteo per ' + esc(citta) + (isNaN(fa) ? '' : ', presa ' + itDT(fa)) + '. Il modello la usa per la pioggia in gara.</p></div></div><div class="sched">';
      giorni.forEach(function (g) {
        var temp = (g.tmin != null && g.tmax != null) ? nf0.format(g.tmin) + '–' + nf0.format(g.tmax) + ' °C · ' : '';
        h += '<div class="sess"><span class="n">' + esc(fGiorno.format(new Date(g.date + 'T12:00:00Z'))) + '</span><span class="it">' + esc(g.weather_desc || '') + '</span>'
          + '<span class="lo">' + temp + 'pioggia ' + nf0.format(g.rain_prob || 0) + '%' + (g.rain_mm ? ' (' + nf1.format(g.rain_mm) + ' mm)' : '') + (g.wind_kmh != null ? ' · vento ' + nf0.format(g.wind_kmh) + ' km/h' : '') + '</span></div>';
      });
      h += '</div>' + ((rw.prob || []).length ? '<p class="note">Nelle ore della gara: ' + (rw.massimo ? 'pioggia fino al ' + nf0.format(rw.massimo) + '%' : 'pioggia non prevista') + '.</p>' : '') + '</div>';
    }

    if (sess.length) {
      h += '<div class="block"><div class="block-head"><div><h2>Orari del weekend</h2><p class="lead">In grande l\'ora italiana, sotto quella di ' + esc(citta) + '.</p></div></div><div class="sched">';
      var now = Date.now(), segnata = false;
      sess.forEach(function (s) {
        var dopo = !segnata && s.d.getTime() > now;
        if (dopo) segnata = true;
        var loc = new Intl.DateTimeFormat('it-IT', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(s.d);
        h += '<div class="sess' + (dopo ? ' now' : '') + '"><span class="n">' + (SESS[s.name] || esc(s.name)) + (dopo ? ' <span class="st ac">la prossima</span>' : '') + '</span>'
          + '<span class="it">' + itDT(s.d) + '</span><span class="lo">' + loc + ' a ' + esc(citta) + '</span></div>';
      });
      h += '</div></div>';
    }
    $('s-weekend').innerHTML = h;

    stato.s = 'gara';
    suClic('seg-sess', function (k) { stato.s = k; tabellaWeekend(); });
    var cd = $('cd');
    if (cd) {
      var conto = function () {
        var ms = nsd.getTime() - Date.now();
        if (ms <= 0) { cd.textContent = 'in corso o conclusa'; return; }
        var m = Math.floor(ms / 60000), g = Math.floor(m / 1440), o = Math.floor((m % 1440) / 60), mi = m % 60;
        cd.textContent = 'tra ' + (g ? g + ' g ' + o + ' h' : (o ? o + ' h ' + mi + ' min' : mi + ' min'));
      };
      conto(); setInterval(conto, 30000);
    }
    tabellaWeekend();
  }

  function tabellaWeekend() {
    premuto('seg-sess', stato.s);
    var scen = $('scen'), t = $('tpred'), lead = $('pred-lead'), nota = $('pred-note');
    var rpred = D.race_prediction || [], n = rpred.length || 20;
    var base = {}; rpred.forEach(function (r) { base[r.driver] = r; });
    var parte = {}; (D.griglia_partenza || []).forEach(function (r) { parte[r.driver] = r.pos; });
    var haParte = Object.keys(parte).length > 0;
    var finita = !!(D.gara_reale && (D.arrivo_reale || []).length);
    scen.hidden = true;
    if (stato.s === 'gara' && finita) {
      lead.textContent = 'Arrivo vero accanto alla previsione congelata prima del via.';
      t.innerHTML = '<thead><tr><th class="rk">Arrivo</th><th>Pilota</th>' + (haParte ? '<th class="num hide-s">Partenza</th>' : '') + '<th class="num">Vittoria</th><th class="num">Podio</th><th class="hide-m">Fascia 80%</th></tr></thead><tbody>'
        + D.arrivo_reale.map(function (a) {
          var r = base[a.driver] || {};
          return '<tr><td class="rk">' + (a.dnf ? '<span class="rit">rit.</span>' : '<span class="pos-v">' + a.pos + '</span>') + '</td><td>' + drv(a.driver, a.team || r.team) + '</td>'
            + (haParte ? '<td class="num hide-s">' + (parte[a.driver] ? 'P' + parte[a.driver] : '–') + '</td>' : '')
            + '<td>' + pcell(r.p_win) + '</td><td>' + pcell(r.p_podio) + '</td><td class="hide-m">' + rcell(r.pos_p10, r.pos_p90, r.pos_exp, n) + '</td></tr>';
        }).join('') + '</tbody>';
      nota.textContent = 'Le probabilità sono quelle della previsione congelata prima della gara. "rit." vuol dire ritirato.';
    } else if (stato.s === 'gara') {
      var chiavi = ['asciutto', 'pioggia_gara', 'safety_car', 'pioggia_quali'].filter(function (k) { return D.scenarios && D.scenarios[k]; });
      if (chiavi.length > 1) {
        scen.hidden = false;
        scen.innerHTML = chiavi.map(function (k) { return '<button type="button" class="chip" data-k="' + k + '">' + esc(D.scenarios[k].label) + '</button>'; }).join('');
        premuto('scen', stato.sc);
        suClic('scen', function (k) { stato.sc = k; tabellaWeekend(); });
      }
      if (stato.sc === 'asciutto' || !D.scenarios || !D.scenarios[stato.sc]) {
        var rows = rpred.slice().sort(function (a, b) { return b.p_win - a.p_win || b.p_podio - a.p_podio; });
        lead.textContent = 'Previsione per la gara con pista asciutta, in ordine di probabilità di vittoria.' + (haParte ? ' Con la griglia di partenza ' + (D.griglia_partenza_fonte === 'reale' || D.griglia_partenza_fonte === 'ufficiale FIA' ? 'ufficiale.' : 'prevista.') : '');
        t.innerHTML = '<thead><tr><th>Pilota</th>' + (haParte ? '<th class="num hide-s">Partenza</th>' : '') + '<th class="num">Vittoria</th><th class="num">Podio</th><th class="num hide-s">A punti</th><th>Fascia 80%</th><th class="num hide-m">Ritiro</th></tr></thead><tbody>'
          + rows.map(function (r) {
            return '<tr><td>' + drv(r.driver, r.team) + '</td>' + (haParte ? '<td class="num hide-s">' + (parte[r.driver] ? 'P' + parte[r.driver] : '–') + '</td>' : '')
              + '<td>' + pcell(r.p_win) + '</td><td>' + pcell(r.p_podio) + '</td><td class="num hide-s">' + pct(r.p_points) + '</td><td>'
              + rcell(r.pos_p10, r.pos_p90, r.pos_exp, n) + '</td><td class="num hide-m">' + pct(r.p_dnf) + '</td></tr>';
          }).join('') + '</tbody>';
        nota.textContent = 'Fascia 80%: in 8 simulazioni su 10 il pilota arriva dentro questa fascia; il punto è la posizione media. Chi si ritira conta in fondo.';
      } else {
        var sc = D.scenarios[stato.sc];
        var rs = (sc.prediction || []).slice().sort(function (a, b) { return b.p_win - a.p_win || b.p_podio - a.p_podio; });
        lead.textContent = sc.desc || '';
        t.innerHTML = '<thead><tr><th>Pilota</th><th class="num">Vittoria</th><th class="num">Podio</th><th class="num hide-s">A punti</th></tr></thead><tbody>'
          + rs.map(function (r) {
            var b = base[r.driver] || {};
            return '<tr><td>' + drv(r.driver, r.team || b.team) + '</td><td>' + pcell(r.p_win, r.delta_win) + '</td><td>' + pcell(r.p_podio, r.delta_podio) + '</td><td class="num hide-s">' + pct(r.p_points) + '</td></tr>';
          }).join('') + '</tbody>';
        nota.textContent = 'Sotto ogni probabilità, la differenza rispetto alla gara asciutta, in punti percentuali.';
      }
    } else if (stato.s === 'quali') {
      var prev = {}; (D.griglia || []).forEach(function (r) { prev[r.driver] = r; });
      if (D.quali_reale && (D.griglia_reale || []).length) {
        lead.textContent = 'Classifica vera della qualifica, accanto alla previsione fatta prima.';
        t.innerHTML = '<thead><tr><th class="rk">Pos.</th><th>Pilota</th>' + (haParte ? '<th class="num">Parte</th>' : '') + '<th class="num">Prevista</th><th class="num">Pole data</th></tr></thead><tbody>'
          + D.griglia_reale.map(function (r) {
            var p = prev[r.driver] || {}, pp = parte[r.driver];
            return '<tr><td class="rk"><span class="pos-v">' + r.pos + '</span></td><td>' + drv(r.driver, r.team || p.team) + '</td>'
              + (haParte ? '<td class="num">' + (pp ? (pp !== r.pos ? '<b>P' + pp + '</b>' : 'P' + pp) : '–') + '</td>' : '')
              + '<td class="num">' + (p.pos ? 'P' + p.pos : '–') + '</td><td>' + pcell(p.p_pole) + '</td></tr>';
          }).join('') + '</tbody>';
        nota.textContent = haParte ? 'Parte: la casella di partenza dopo le penalità, in grassetto quando è diversa dalla posizione in qualifica.' : 'La griglia di partenza può cambiare per le penalità.';
      } else {
        var g = (D.griglia || []).slice().sort(function (a, b) { return a.pos - b.pos; }), ng = g.length;
        lead.textContent = 'Griglia prevista per la qualifica, in ordine di posizione attesa.';
        t.innerHTML = '<thead><tr><th class="rk">Griglia</th><th>Pilota</th><th class="num">Pole</th><th class="num">Prime 3</th><th class="num hide-s">In Q3</th><th>Fascia 80%</th></tr></thead><tbody>'
          + g.map(function (r) {
            var f = fascia(r.fascia);
            return '<tr><td class="rk">P' + r.pos + '</td><td>' + drv(r.driver, r.team) + '</td><td>' + pcell(r.p_pole) + '</td><td>' + pcell(r.p_top3) + '</td><td class="hide-s">' + pcell(r.p_q3) + '</td><td>'
              + rcell(f[0] || r.pos, f[1] || r.pos, r.pos_exp, ng) + '</td></tr>';
          }).join('') + '</tbody>';
        nota.textContent = 'Fascia 80%: in 8 qualifiche simulate su 10 il pilota finisce dentro questa fascia; il punto è la posizione media.';
      }
    } else if (stato.s === 'sprint') {
      var sp = (D.sprint_prediction || []).slice().sort(function (a, b) { return (a.pos || 99) - (b.pos || 99); });
      lead.textContent = 'Previsione per la sprint, in ordine di posizione attesa.';
      t.innerHTML = '<thead><tr><th class="rk">Pos.</th><th>Pilota</th><th class="num">Vittoria</th><th class="num">Podio</th><th class="hide-s">Fascia 80%</th><th class="num">Punti attesi</th></tr></thead><tbody>'
        + sp.map(function (r) {
          var f = fascia(r.fascia);
          return '<tr><td class="rk">P' + r.pos + '</td><td>' + drv(r.driver, r.team) + '</td><td>' + pcell(r.p_win) + '</td><td>' + pcell(r.p_podio) + '</td><td class="hide-s">'
            + rcell(f[0], f[1], null, sp.length) + '</td><td class="num">' + (r.exp_pts != null ? nf1.format(r.exp_pts) : '–') + '</td></tr>';
        }).join('') + '</tbody>';
      nota.textContent = '';
    } else {
      var reale = {}; (D.sq_reale ? (D.sq_griglia_reale || []) : []).forEach(function (r) { reale[r.driver] = r.pos; });
      var hr = Object.keys(reale).length > 0;
      lead.textContent = 'Griglia prevista per la qualifica sprint' + (hr ? ', con la classifica vera.' : '.');
      t.innerHTML = '<thead><tr><th class="rk">Prevista</th><th>Pilota</th>' + (hr ? '<th class="num">Vera</th>' : '') + '<th class="num">Pole</th></tr></thead><tbody>'
        + (D.sq_griglia || []).slice().sort(function (a, b) { return a.pos - b.pos; }).map(function (r) {
          return '<tr><td class="rk">P' + r.pos + '</td><td>' + drv(r.driver, r.team) + '</td>' + (hr ? '<td class="num">' + (reale[r.driver] ? 'P' + reale[r.driver] : '–') + '</td>' : '')
            + '<td>' + (r.p_pole != null ? pcell(r.p_pole) : '<span class="note">–</span>') + '</td></tr>';
        }).join('') + '</tbody>';
      nota.textContent = '';
    }
  }

  /* ── Grafico a linee con un pilota o una squadra in evidenza ────────────── */
  function grafico(el, serie, scelto, nome, etichettaX) {
    if (!el || !el.clientWidth) return;
    var chiavi = Object.keys(serie).filter(function (k) { return serie[k].length; });
    var W = el.clientWidth, H = W < 560 ? 250 : 320, m = { l: 44, r: W < 560 ? 84 : 120, t: 14, b: 30 };
    var R = 0, maxY = 0;
    chiavi.forEach(function (c) { serie[c].forEach(function (p) { R = Math.max(R, p.i); maxY = Math.max(maxY, p.v); }); });
    if (!R) { el.innerHTML = '<p class="note">Nessun dato.</p>'; return; }
    var passo = maxY <= 120 ? 20 : maxY <= 300 ? 50 : maxY <= 700 ? 100 : 200, top = Math.max(passo, Math.ceil(maxY / passo) * passo);
    var x = function (r) { return m.l + (r - 1) / Math.max(1, R - 1) * (W - m.l - m.r); };
    var y = function (v) { return m.t + (1 - v / top) * (H - m.t - m.b); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" height="' + H + '" role="img" aria-label="Punti accumulati; in evidenza ' + esc(nome(scelto)) + '"><g class="grid">';
    for (var v = 0; v <= top; v += passo) s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>';
    s += '</g><g class="ax">';
    for (var v2 = 0; v2 <= top; v2 += passo) s += '<text x="' + (m.l - 8) + '" y="' + (y(v2) + 4) + '" text-anchor="end">' + v2 + '</text>';
    var pr = W < 560 ? 6 : 3;
    for (var r = 1; r <= R; r++) if (r === 1 || r % pr === 0 || r === R) s += '<text x="' + x(r) + '" y="' + (H - 8) + '" text-anchor="middle">' + r + '</text>';
    s += '</g>';
    function path(c) { return serie[c].map(function (p, i) { return (i ? 'L' : 'M') + x(p.i).toFixed(1) + ' ' + y(p.v).toFixed(1); }).join(''); }
    chiavi.forEach(function (c) { if (c !== scelto) s += '<path class="ln" d="' + path(c) + '"/>'; });
    var sc = serie[scelto] || [], ult = sc[sc.length - 1];
    if (ult) {
      s += '<path class="ln hi" d="' + path(scelto) + '"/><circle class="end" r="4.5" cx="' + x(ult.i) + '" cy="' + y(ult.v) + '"/>';
      s += '<text class="lab" x="' + (x(ult.i) + 10) + '" y="' + (y(ult.v) - 2) + '">' + esc(nome(scelto)) + '</text><text class="lab2" x="' + (x(ult.i) + 10) + '" y="' + (y(ult.v) + 14) + '">' + ult.v + ' punti</text>';
    }
    s += '<line class="xh" y1="' + m.t + '" y2="' + (H - m.b) + '" x1="-10" x2="-10" visibility="hidden"/><rect class="hit" x="' + m.l + '" y="0" width="' + (W - m.l - m.r) + '" height="' + H + '" fill="transparent"/></svg><div class="tip" hidden></div>';
    el.innerHTML = s;
    var hit = el.querySelector('.hit'), xh = el.querySelector('.xh'), tip = el.querySelector('.tip');
    function punta(ev) {
      var b = el.getBoundingClientRect(), px = ev.clientX - b.left;
      var rr = Math.max(1, Math.min(R, Math.round((px - m.l) / (W - m.l - m.r) * (R - 1) + 1)));
      var p = sc.filter(function (q) { return q.i === rr; })[0];
      xh.setAttribute('x1', x(rr)); xh.setAttribute('x2', x(rr)); xh.setAttribute('visibility', 'visible');
      tip.hidden = false; tip.style.left = Math.max(90, Math.min(W - 90, x(rr))) + 'px'; tip.style.top = (p ? y(p.v) : m.t + 20) + 'px';
      tip.innerHTML = p ? esc(p.txt) + '<br><b>' + esc(nome(scelto)) + ' ' + p.v + ' punti</b>' + (p.d != null ? ' (+' + p.d + ')' : '') : esc(etichettaX(rr)) + '<br>' + esc(nome(scelto)) + ': nessun dato';
    }
    hit.addEventListener('pointermove', punta);
    hit.addEventListener('pointerdown', punta);
    hit.addEventListener('pointerleave', function () { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); });
  }

  /* ── Campionato ──────────────────────────────────────────────────────────── */
  var sceltoP = null, sceltoC = null, SERIE_P = {}, SERIE_C = {}, ETICHETTE_C = [];
  function renderCampionato() {
    var ch = D.championship || {}, ds = D.driver_standings || [], cs = D.constructor_standings || [], gd = D.gare_disputate || {};
    var p1 = (ch.piloti || [])[0], c1 = (ch.costruttori || [])[0];
    function titolo(p) { return p >= 99.95 ? '<span class="st ok">✓ deciso</span>' : '<span class="st ne">' + pct(p / 100) + ' nelle simulazioni</span>'; }
    var h = '<div class="intro"><p class="eyebrow">Stagione ' + anno + (gd.gp != null ? ' · ' + gd.gp + ' gare e ' + (gd.sprint || 0) + ' sprint disputate' : '') + (ch.gare_rimanenti != null ? ' · ' + ch.gare_rimanenti + ' gare da correre' : '') + '</p><h1>Campionato</h1></div>';
    h += '<div class="tiles" style="margin-top:28px">';
    if (p1) h += '<div class="tile"><span class="l">Titolo piloti</span><span class="val">' + esc(nm(p1.driver)) + '</span>' + titolo(p1.p_title) + '</div>';
    if (c1) h += '<div class="tile"><span class="l">Titolo costruttori</span><span class="val">' + esc(sq(c1.team)) + '</span>' + titolo(c1.p_title) + '</div>';
    if (ds.length > 1) h += '<div class="tile"><span class="l">Vantaggio del primo sul secondo</span><span class="val">' + (ds[0].points - ds[1].points) + ' <small>punti</small></span><span class="d">' + esc(nm(ds[0].driver)) + ' ' + ds[0].points + ', ' + esc(nm(ds[1].driver)) + ' ' + ds[1].points + '</span></div>';
    h += '</div>';

    SERIE_P = {};
    Object.keys(D.points_history || {}).forEach(function (c) {
      var v = D.points_history[c];
      SERIE_P[c] = v.map(function (p, i) {
        var sprint = /Sprint$/.test(p.race) || (v[i + 1] && v[i + 1].race === p.race);
        return { i: p.round, v: p.cum, d: p.pts, txt: (sprint ? 'Sprint · ' : 'Gara · ') + gp(p.race), dnf: p.dnf };
      });
    });
    sceltoP = sceltoP || (ds[0] || {}).driver;
    h += '<div class="block"><div class="block-head"><div><h2>Punti dei piloti, gara dopo gara</h2><p class="lead">Punti accumulati, gare e sprint in ordine. La linea colorata è quella del pilota scelto.</p></div></div>';
    h += chipsHtml('sel-p', ds.slice(0, 8).map(function (r) { return [r.driver, nm(r.driver)]; }), 'Pilota da evidenziare');
    h += '<div class="chart" id="pts"></div><details><summary>Vedi i numeri gara per gara</summary><div class="tbl"><table class="t" id="pts-t"></table></div></details></div>';

    h += '<div class="block two"><div><h2>Piloti</h2><div class="tbl"><table class="t" id="t-piloti"></table></div><button type="button" class="more" id="tutti">Mostra tutti</button></div>';
    h += '<div><h2>Costruttori</h2><div class="tbl"><table class="t"><thead><tr><th class="rk">Pos.</th><th>Squadra</th><th class="num">Punti</th><th class="num">Vittorie</th></tr></thead><tbody>'
      + cs.map(function (r) { return '<tr><td class="rk">' + r.pos + '</td><td><div class="drv">' + sw(r.team) + '<b>' + esc(sq(r.team)) + '</b></div></td><td class="num">' + r.points + '</td><td class="num">' + r.wins + '</td></tr>'; }).join('')
      + '</tbody></table></div></div></div>';

    var cb = D.constructor_battle || {};
    SERIE_C = {}; ETICHETTE_C = cb.rounds || [];
    Object.keys(cb.teams || {}).forEach(function (t) {
      SERIE_C[t] = (cb.teams[t] || []).map(function (v, i) { return { i: i + 1, v: v, txt: (ETICHETTE_C[i] || '') + '', d: i ? v - cb.teams[t][i - 1] : v }; });
    });
    if (Object.keys(SERIE_C).length) {
      sceltoC = sceltoC || (cs[0] || {}).team;
      h += '<div class="block"><div class="block-head"><div><h2>Punti delle squadre, gara dopo gara</h2><p class="lead">La stessa cosa per i costruttori.</p></div></div>';
      h += chipsHtml('sel-c', cs.slice(0, 8).map(function (r) { return [r.team, sq(r.team)]; }), 'Squadra da evidenziare') + '<div class="chart" id="pts-c"></div></div>';
    }

    var vinc = {}, spr = {};
    (D.race_history || []).forEach(function (r) { (r.type === 'sprint' ? spr : vinc)[gp(r.race)] = r.winner; });
    var squadra = {}; ds.forEach(function (d) { squadra[d.driver] = d.team; });
    h += '<div class="block"><div class="block-head"><div><h2>Calendario</h2><p class="lead">' + cal.length + ' Gran Premi, con il vincitore di ogni gara già corsa.</p></div></div><div class="tbl"><table class="t"><thead><tr><th class="rk">Round</th><th>Gran Premio</th><th>Data</th><th class="hide-s">Pista</th><th>Vincitore</th><th class="hide-m">Sprint</th></tr></thead><tbody>';
    cal.forEach(function (r) {
      var k = gp(r.name), w = vinc[k], s = spr[k];
      var esito = r.status === 'past' ? (w ? '<div class="drv">' + sw(squadra[w]) + '<b>' + esc(nm(w)) + '</b></div>' : '<span class="note">nessun dato</span>')
        : (corsa && r.round === corsa.round ? '<span class="st ac">la prossima</span>' : '<span class="note">in programma</span>');
      h += '<tr><td class="rk">' + r.round + '</td><td><b>' + esc(k) + '</b></td><td>' + dataBreve(r.date) + '</td><td class="hide-s">' + (PISTA[r.circuit] || esc(r.circuit)) + '</td><td>' + esito + '</td><td class="hide-m">'
        + (r.sprint ? (s ? esc(nm(s)) : (r.status === 'past' ? '–' : 'sì')) : '') + '</td></tr>';
    });
    h += '</tbody></table></div></div>';
    $('s-campionato').innerHTML = h;

    var tutti = false;
    function piloti() {
      var rows = tutti ? ds : ds.slice(0, 10), max = (ds[0] || {}).points || 1, forma = D.driver_form || {};
      $('t-piloti').innerHTML = '<thead><tr><th class="rk">Pos.</th><th>Pilota</th><th>Punti</th><th class="num">Vittorie</th><th class="num hide-s">Podi</th><th class="hide-m">Ultime 3</th></tr></thead><tbody>'
        + rows.map(function (r) {
          var f = (forma[r.driver] || {}).positions || [];
          return '<tr><td class="rk">' + r.pos + '</td><td>' + drv(r.driver, r.team) + '</td><td><div class="pc"><span class="bar"><i style="width:' + (r.points / max * 100) + '%"></i></span><span class="v">' + r.points + '</span></div></td><td class="num">'
            + r.wins + '</td><td class="num hide-s">' + r.podiums + '</td><td class="hide-m"><span class="forma">' + f.map(function (p) { return p == null ? '<span class="rit">rit.</span>' : '<span>' + p + '</span>'; }).join('') + '</span></td></tr>';
        }).join('') + '</tbody>';
      $('tutti').textContent = tutti ? 'Mostra solo i primi 10' : 'Mostra tutti i ' + ds.length + ' piloti';
      $('tutti').hidden = ds.length <= 10;
    }
    $('tutti').addEventListener('click', function () { tutti = !tutti; piloti(); });
    piloti();
    suClic('sel-p', function (k) { sceltoP = k; disegnaCampionato(); });
    suClic('sel-c', function (k) { sceltoC = k; disegnaCampionato(); });
  }
  function disegnaCampionato() {
    if (!$('pts')) return;
    premuto('sel-p', sceltoP);
    grafico($('pts'), SERIE_P, sceltoP, nm, function (i) { return 'Evento ' + i; });
    var sp = SERIE_P[sceltoP] || [];
    $('pts-t').innerHTML = '<thead><tr><th class="rk">N.</th><th>Evento</th><th class="num">Punti</th><th class="num">Totale</th></tr></thead><tbody>'
      + sp.map(function (p) { return '<tr><td class="rk">' + p.i + '</td><td>' + esc(p.txt) + (p.dnf ? ' <span class="st no">ritirato</span>' : '') + '</td><td class="num">' + p.d + '</td><td class="num">' + p.v + '</td></tr>'; }).join('') + '</tbody>';
    if ($('pts-c')) { premuto('sel-c', sceltoC); grafico($('pts-c'), SERIE_C, sceltoC, sq, function (i) { return ETICHETTE_C[i - 1] || 'Evento ' + i; }); }
  }

  /* ── Track record ───────────────────────────────────────────────────────── */
  function renderTrack() {
    var ma = D.model_accuracy || {}, ra = ma.race || {}, qa = ma.quali || {}, scd = ma.scorecard || {}, cb = D.calibration, ps = D.pace_skill, phs = D.pace_hist;
    var h = '<div class="intro"><p class="eyebrow">Track record ' + anno + '</p><h1>Quanto ci azzecchiamo</h1>'
      + '<p class="lead">Ogni previsione viene congelata prima della sessione e pubblicata su GitHub con l\'impronta SHA-256 di ogni file. La data è quella del commit: non la mettiamo noi, e dopo non si cambia niente.</p></div>';
    h += '<div class="tiles" style="margin-top:28px">';
    if (ra.total) {
      h += '<div class="tile"><span class="l">Vincitore previsto</span><span class="val">' + ra.win_hits + ' <small>su ' + ra.total + ' gare</small></span><span class="d">' + ra.win_pct + '% delle gare</span></div>';
      h += '<div class="tile"><span class="l">Vincitore fra i nostri primi tre</span><span class="val">' + ra.podium_hits + ' <small>su ' + ra.total + '</small></span><span class="d">' + ra.podium_pct + '% delle gare</span></div>';
    }
    if (qa.total) h += '<div class="tile"><span class="l">Pole prevista</span><span class="val">' + qa.pole_hits + ' <small>su ' + qa.total + ' qualifiche</small></span><span class="d">fra i primi tre ' + qa.top3_hits + ' volte su ' + qa.total + '</span></div>';
    if (scd.mae_avg != null) h += '<div class="tile"><span class="l">Errore medio sull\'arrivo</span><span class="val">' + nf1.format(scd.mae_avg) + ' <small>posizioni</small></span><span class="d">ordine d\'arrivo: correlazione ' + nf2.format(scd.spearman_avg) + ' su ' + scd.races + ' gare</span></div>';
    h += '</div>';

    var gare = (ra.races || []).slice().reverse();
    if (gare.length) {
      h += '<div class="block"><div class="block-head"><div><h2>Gara per gara</h2><p class="lead">Il favorito della previsione e chi ha vinto davvero. Le gare congelate avevano la previsione su GitHub prima del via; le prime della stagione no, perché il sistema è partito a luglio.</p></div></div>';
      h += '<div class="tbl"><table class="t"><thead><tr><th>Gran Premio</th><th>Favorito</th><th>Vincitore</th><th>Esito</th><th class="num hide-s">Podio in comune</th><th class="hide-m">Previsione</th></tr></thead><tbody>';
      gare.forEach(function (r) {
        var es = r.win_hit ? '<span class="st ok">✓ preso</span>' : (r.podium_hit ? '<span class="st ne">fra i primi tre</span>' : '<span class="st no">✕ mancato</span>');
        var cong = r.source === 'frozen' ? '<a class="st ok" href="' + urlCartella(r.race, (r.date || anno).slice(0, 4)) + '" target="_blank" rel="noopener">congelata ↗</a>' : '<span class="note">non congelata</span>';
        h += '<tr><td><b>' + esc(gp(r.race)) + '</b><small style="display:block;color:var(--muted)">' + (r.date ? dataBreve(r.date) : '') + '</small></td><td>' + esc(nm(r.pred_winner)) + '</td><td>' + esc(nm(r.actual_winner)) + '</td><td>' + es + '</td>'
          + '<td class="num hide-s">' + r.top3_overlap + ' su 3</td><td class="hide-m">' + cong + '</td></tr>';
      });
      h += '</tbody></table></div></div>';
    }

    if (cb || ps) {
      h += '<div class="block two">';
      if (cb && cb.win) {
        var n92 = ((cb.metodo || '').match(/(\d+) gare/) || [0, ''])[1];
        h += '<div><h2>Probabilità calibrate</h2><p class="lead">Prova su ' + (n92 ? n92 + ' gare' : 'gare') + ' delle stagioni passate, senza dati dal futuro: di quanto l\'errore del modello (Brier) è più basso di quello di una previsione che dà a tutti la stessa probabilità.</p>';
        h += barList([['Vittoria', cb.win], ['Podio', cb.podium], ['Prime 10', cb.top10]].filter(function (x) { return x[1]; }).map(function (x) { return { lab: x[0], v: x[1].skill, txt: nf0.format(x[1].skill * 100) + '% meglio' }; }), { max: 0.5 });
        h += '<p class="note">Quando diciamo 30%, l\'evento deve succedere circa 3 volte su 10.</p></div>';
      }
      if (ps && ps.season) {
        h += '<div><h2>Il passo di gara</h2><p class="lead">Quanto l\'ordine di passo previsto somiglia a quello vero: 1 vuol dire identico. Nel ' + anno + ' ' + nf2.format(ps.season.spearman_pace) + ' su ' + ps.season.n_gare + ' gare'
          + (phs && phs.spearman_pace != null ? '; nella prova sulle stagioni passate ' + nf2.format(phs.spearman_pace) + ' su ' + phs.n_gare : '') + '.</p>';
        h += barList((ps.gare || []).slice().reverse().map(function (g) { return { lab: esc(gp(g.race)), v: Math.max(0, g.spearman_pace), txt: nf2.format(g.spearman_pace) }; }), { max: 1 });
        h += '</div>';
      }
      h += '</div>';
    }

    var cartelle = {};
    (ra.races || []).forEach(function (r) { if (r.source === 'frozen') cartelle[r.race] = (r.date || anno).slice(0, 4); });
    if (corsa) cartelle[corsa.name] = anno;
    h += '<div class="block two"><div><h2>Come verificare una previsione</h2><ol class="steps">'
      + '<li><span><b>Apri la cartella su GitHub.</b>La data del commit che l\'ha creata è di GitHub: dimostra che la previsione esisteva prima della gara.</span></li>'
      + '<li><span><b>Ricalcola le impronte.</b>MANIFEST.json elenca lo SHA-256 di ogni file: se uno non combacia, il record è compromesso.</span></li>'
      + '<li><span><b>Controlla che non abbia visto il futuro.</b>Il manifest registra anche l\'impronta dei risultati usati e quante gare c\'erano al momento del congelamento.</span></li>'
      + '</ol><div class="frz">' + Object.keys(cartelle).reverse().map(function (k) { return '<div class="gp"><b>' + esc(gp(k)) + '</b><div class="ls"><a href="' + urlCartella(k, cartelle[k]) + '" target="_blank" rel="noopener">previsioni congelate ↗</a></div></div>'; }).join('') + '</div></div>';
    h += '<div><h2>Note pubbliche e protocolli</h2><p class="lead">Quando qualcosa va storto lo scriviamo, con la data. Il registro dei protocolli<span id="n-protocolli"></span> elenca ogni prova fatta sul modello, fissata prima di vedere i numeri.</p><div class="links">'
      + '<a href="' + REPO + '/tree/main/track_record" target="_blank" rel="noopener"><span>Note pubbliche</span><span>apri ↗</span></a>'
      + '<a href="' + REPO + '/blob/main/track_record/PROTOCOLLI.json" target="_blank" rel="noopener"><span>Registro dei protocolli</span><span>apri ↗</span></a>'
      + '<a href="' + REPO + '#readme" target="_blank" rel="noopener"><span>Come verificare un freeze, passo per passo</span><span>leggi ↗</span></a></div></div></div>';
    $('s-trackrecord').innerHTML = h;
    fetch('track_record/PROTOCOLLI.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (p) {
      if (p && p.protocolli && $('n-protocolli')) $('n-protocolli').textContent = ' (' + p.protocolli.length + ' finora)';
    }).catch(function () { /* fuori da GitHub Pages il registro non c'e': niente numero */ });
  }

  /* ── Analisi ────────────────────────────────────────────────────────────── */
  function calore(x) {          // x da 0 a 1: 1 = cella più carica (stessa scala del testa a testa)
    var p = Math.round(Math.max(0, Math.min(1, x)) * 80);
    return 'background:color-mix(in srgb, var(--s1) ' + p + '%, transparent);color:' + (p >= 52 ? '#fff' : 'var(--ink)');
  }
  function media(a) { var ok = (a || []).filter(function (x) { return x != null; }); return ok.length ? ok.reduce(function (s, x) { return s + x; }, 0) / ok.length : null; }
  function gomme(ts) {          // 24/11: il simulatore di strategia del sito vecchio. Degrado lineare, niente traffico né safety car.
    var c = ts.compounds || {}, N = ts.total_laps || 0, base = ts.base_lap || 0, pit = ts.pit_loss || 0, MIN = 5;
    var M = { SOFT: 'Morbida', MEDIUM: 'Media', HARD: 'Dura' }, k = ['SOFT', 'MEDIUM', 'HARD'].filter(function (x) { return c[x]; });
    function stint(m, n) { var g = c[m]; return n * (base + (g.delta_vs_soft || 0)) + (g.deg_per_lap || 0) * n * (n - 1) / 2; }
    var out = [];
    k.forEach(function (a) { k.forEach(function (b) {
      if (a === b) return;
      var best = null;
      for (var p = MIN; p <= N - MIN; p++) { var t = stint(a, p) + stint(b, N - p) + pit; if (!best || t < best.t) best = { t: t, giri: [p] }; }
      if (best) out.push({ seq: [a, b], t: best.t, giri: best.giri });
    }); });
    k.forEach(function (a) { k.forEach(function (b) { k.forEach(function (d) {
      if (a === b && b === d) return;
      var best = null;
      for (var p1 = MIN; p1 <= N - 2 * MIN; p1++) for (var p2 = p1 + MIN; p2 <= N - MIN; p2++) {
        var t = stint(a, p1) + stint(b, p2 - p1) + stint(d, N - p2) + 2 * pit;
        if (!best || t < best.t) best = { t: t, giri: [p1, p2] };
      }
      if (best) out.push({ seq: [a, b, d], t: best.t, giri: best.giri });
    }); }); });
    out.sort(function (x, y) { return x.t - y.t; });
    return out.map(function (r) { return { nome: r.seq.map(function (m) { return M[m]; }).join(' → '), soste: r.seq.length - 1, giri: r.giri, t: r.t }; });
  }

  function renderAnalisi() {
    var h = '', indice = [], squadraDi = {};
    (D.race_prediction || []).forEach(function (r) { squadraDi[r.driver] = r.team; });
    function pannello(id, titolo, corpo, wide) {
      indice.push([id, titolo]);
      return '<article class="panel' + (wide ? ' wide' : '') + '" id="' + id + '"><h3>' + titolo + '</h3>' + corpo + '</article>';
    }

    var pg = (D.race_pace_gare || []).filter(function (g) { return (g.drivers || []).length; });
    if (!pg.length && D.race_pace && (D.race_pace.drivers || []).length) pg = [D.race_pace];
    if (pg.length) {
      h += pannello('a-passo', 'Passo gara', '<label class="note" for="pg-sel">Distacco medio al giro dal più veloce, sui giri validi, corretto per il carburante. I primi 12.</label>'
        + '<select class="sel" id="pg-sel">' + pg.map(function (g, i) { return '<option value="' + i + '">' + esc(gp(g.race)) + '</option>'; }).join('') + '</select><div id="pg"></div>');
    }

    var gf = (D.grid_finish || []).filter(function (r) { return r.race; }), gare = [];
    gf.forEach(function (r) { if (gare.indexOf(r.race) < 0) gare.push(r.race); });
    var acc = {};
    gf.forEach(function (r) { if (r.finish == null || r.grid == null || r.grid <= 0) return; var a = acc[r.driver] || (acc[r.driver] = { s: 0, n: 0, team: r.team }); a.s += r.gained; a.n++; a.team = r.team; });
    var gr = Object.keys(acc).filter(function (k) { return acc[k].n >= 5; }).map(function (k) { return { d: k, v: acc[k].s / acc[k].n, team: acc[k].team }; }).sort(function (a, b) { return b.v - a.v; });
    if (gare.length) {
      var mg = Math.max.apply(null, gr.map(function (g) { return Math.abs(g.v); }).concat([1]));
      h += pannello('a-griglia', 'Griglia → Arrivo', '<label class="note" for="gf-sel">Casella di partenza e posizione d\'arrivo, gara per gara.</label>'
        + '<select class="sel" id="gf-sel">' + gare.map(function (g, i) { return '<option value="' + i + '"' + (i === gare.length - 1 ? ' selected' : '') + '>' + esc(gp(g)) + '</option>'; }).join('') + '</select><div class="tbl" id="gf"></div>'
        + (gr.length ? '<p class="note">Media della stagione, solo le gare finite, piloti con almeno 5 gare:</p><div class="key"><span><i></i>posizioni guadagnate</span><span><i class="b"></i>perse</span></div>'
          + barList(gr.map(function (g) { return { lab: sw(g.team) + esc(nm(g.d)), v: g.v, txt: (g.v > 0 ? '+' : g.v < 0 ? '−' : '') + nf1.format(Math.abs(g.v)) }; }), { max: mg, div: true }) : ''));
    }

    var stt = D.super_times || {}, cir = stt.circuits || [];
    if (cir.length) {
      var su = Object.keys(stt.drivers || {}).map(function (c) {
        var v = stt.drivers[c] || [];
        return { d: c, v: v, m: media(v), zero: v.filter(function (x) { return x === 0; }).length };
      }).filter(function (r) { return r.m != null; }).sort(function (a, b) { return a.m - b.m; });
      h += pannello('a-supertimes', 'Super Times', '<p class="note">Distacco in percentuale dal tempo più veloce del weekend, in qualunque sessione, gara per gara. ★ è il più veloce del weekend; più la cella è scura, più è vicino.</p>'
        + '<div class="tbl"><table class="hm"><thead><tr><th></th><th>Media</th><th title="Volte più veloce del weekend">★</th>' + cir.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>'
        + su.map(function (r) {
          return '<tr><th class="r">' + esc(nm(r.d)) + '</th><td class="io"><b>' + nf2.format(r.m) + '</b></td><td class="io">' + (r.zero || '') + '</td>' + r.v.map(function (x, i) {
            if (x == null) return '<td class="io">–</td>';
            return '<td style="' + calore(1 - Math.min(x, 2) / 2) + '" title="' + esc(nm(r.d)) + ', ' + esc(cir[i]) + ': ' + (x === 0 ? 'il più veloce' : '+' + nf2.format(x) + '%') + '">' + (x === 0 ? '★' : nf2.format(x)) + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>', true);
    }

    var ers = D.ers_heatmap || {}, es = ers.sessions || [], et = (ers.teams || []).filter(function (t) { return (ers.data || {})[t]; });
    if (es.length && et.length) {
      var lim = es.map(function (_, j) {
        var v = et.map(function (t) { return ers.data[t][j]; }).filter(function (x) { return x != null; });
        return [Math.min.apply(null, v), Math.max.apply(null, v)];
      });
      et = et.slice().sort(function (a, b) { return (ers.avg[b] || 0) - (ers.avg[a] || 0); });
      h += pannello('a-ers', 'ERS Deployment', '<p class="note">Velocità massima allo speed trap in qualifica, in km/h, squadra per squadra nelle ultime ' + es.length + ' gare: dice quanta energia elettrica scaricano in rettilineo. Il colore confronta le squadre nella stessa gara.</p>'
        + '<div class="tbl"><table class="hm"><thead><tr><th></th><th>Media</th>' + es.map(function (s) { return '<th>' + esc(gp(s)) + '</th>'; }).join('') + '</tr></thead><tbody>'
        + et.map(function (t) {
          return '<tr><th class="r">' + sw(t) + esc(sq(t)) + '</th><td class="io"><b>' + (ers.avg[t] != null ? nf1.format(ers.avg[t]) : '–') + '</b></td>' + ers.data[t].map(function (x, j) {
            if (x == null) return '<td class="io">–</td>';
            var a = lim[j][0], b = lim[j][1];
            return '<td style="' + calore(b > a ? (x - a) / (b - a) : 1) + '">' + nf1.format(x) + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>', true);
    }

    var td = D.team_development || {}, tc = td.circuits || [];
    if (td.teams && Object.keys(td.teams).length) {
      var svil = Object.keys(td.teams).map(function (t) { var v = td.teams[t] || []; return { t: t, v: v, a: media(v.slice(0, 5)), b: media(v.slice(-5)) }; })
        .filter(function (r) { return r.a != null && r.b != null; }).sort(function (x, y) { return x.b - y.b; });
      h += pannello('a-sviluppo', 'Sviluppo delle squadre', '<p class="note">Posizione media dei due piloti all\'arrivo, gara per gara (ritiri esclusi). Più la cella è scura, più la squadra è davanti. Accanto al nome le prime 5 gare contro le ultime 5.</p>'
        + '<div class="tbl"><table class="hm"><thead><tr><th></th><th>Prime 5</th><th>Ultime 5</th><th>Cambio</th>' + tc.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>'
        + svil.map(function (r) {
          var dlt = r.b - r.a, sgn = Math.abs(dlt) < 0.05 ? '=' : (dlt < 0 ? '<span class="st ok">▲ ' + nf1.format(-dlt) + '</span>' : '<span class="st no">▼ ' + nf1.format(dlt) + '</span>');
          return '<tr><th class="r">' + sw(r.t) + esc(sq(r.t)) + '</th><td class="io">' + nf1.format(r.a) + '</td><td class="io"><b>' + nf1.format(r.b) + '</b></td><td class="io">' + sgn + '</td>' + r.v.map(function (x, i) {
            if (x == null) return '<td class="io">–</td>';
            return '<td style="' + calore(1 - (x - 1) / 21) + '" title="' + esc(sq(r.t)) + ', ' + esc(tc[i] || '') + ': ' + nf1.format(x) + '">' + nf1.format(x) + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>', true);
    }

    var fo = D.driver_form || {}, giro = [];
    Object.keys(fo).forEach(function (c) { (fo[c].races || []).forEach(function (r) { if (giro.indexOf(r) < 0) giro.push(r); }); });
    var forme = Object.keys(fo).map(function (c) { var p = fo[c].positions || []; return { d: c, p: p, m: media(p), t: fo[c].trend }; })
      .filter(function (r) { return r.m != null; }).sort(function (a, b) { return a.m - b.m; });
    if (forme.length) {
      var TR = { up: '<span class="st ok">▲ in crescita</span>', down: '<span class="st no">▼ in calo</span>', flat: '<span class="st ne">= stabile</span>' };
      h += pannello('a-forma', 'Forma recente', '<p class="note">Le posizioni d\'arrivo nelle ultime gare' + (giro.length ? ' (' + esc(giro.join(', ')) + ')' : '') + ', in ordine di media. "rit." è un ritiro.</p>'
        + '<div class="tbl"><table class="t"><thead><tr><th>Pilota</th><th>Ultime gare</th><th class="num">Media</th><th class="hide-s">Tendenza</th></tr></thead><tbody>'
        + forme.map(function (r) {
          return '<tr><td><div class="drv">' + sw(squadraDi[r.d]) + '<b>' + esc(nm(r.d)) + '</b></div></td><td><span class="forma">' + r.p.map(function (x) { return x == null ? '<span class="rit">rit.</span>' : '<span>' + x + '</span>'; }).join('') + '</span></td>'
            + '<td class="num">' + nf1.format(r.m) + '</td><td class="hide-s">' + (TR[r.t] || '') + '</td></tr>';
        }).join('') + '</tbody></table></div>');
    }

    var rel = (D.reliability || []).slice().sort(function (a, b) { return b.dnf_rate - a.dnf_rate; });
    if (rel.length) {
      var mr = Math.max(10, Math.ceil(Math.max.apply(null, rel.map(function (r) { return r.dnf_rate; })) / 10) * 10);
      h += pannello('a-affidabilita', 'Affidabilità', '<p class="note">Quota di partenze finite con un ritiro, in questa stagione. Ogni squadra ha due macchine per gara.</p>'
        + '<div class="key"><span><i></i>guasti</span><span><i class="b"></i>incidenti</span></div>'
        + barList(rel.map(function (r) { return { lab: sw(r.team) + esc(sq(r.team)), parts: [{ v: r.dnf_mech / r.races * 100 }, { v: ((r.dnf_incident || 0) + (r.dnf_other || 0)) / r.races * 100, cls: 'b' }], txt: nf0.format(r.dnf_rate) + '% · ' + r.dnf_total + '/' + r.races }; }), { max: mr }));
    }

    var scs = (D.safety_car || []).slice().sort(function (a, b) { return a.round - b.round; });
    if (scs.length) {
      var restano = {}; cal.forEach(function (r) { if (r.status !== 'past') restano[gp(r.name)] = 1; });
      h += pannello('a-sc', 'Safety car', '<p class="note">Probabilità che entri la safety car, gara per gara, secondo il modello.</p>'
        + '<div class="key"><span><i></i>da correre</span><span><i class="dim"></i>già corse</span></div>'
        + barList(scs.map(function (r) { return { lab: esc(gp(r.name)), v: r.sc_prob, cls: restano[gp(r.name)] ? '' : 'dim', txt: pct(r.sc_prob) }; }), { max: 1 }));
    }

    var ff = (D.fantaf1 || []).slice().sort(function (a, b) { return b.exp_pts - a.exp_pts; }).slice(0, 12);
    if (ff.length) {
      h += pannello('a-fantaf1', 'FantaF1, punti attesi', '<p class="note">Media dei punti nelle gare simulate di questo Gran Premio. I primi 12.</p>'
        + barList(ff.map(function (r) { return { lab: sw(r.team) + esc(nm(r.driver)), v: r.exp_pts, txt: nf1.format(r.exp_pts) }; }), { max: Math.max(1, ff[0].exp_pts) }));
    }

    var ts = D.tyre_strategy || {};
    if (ts.compounds && ts.total_laps && ts.base_lap) {
      var st = gomme(ts).slice(0, 6), dalleLibere = /^fp/i.test(ts.source || '');
      if (st.length) {
        h += pannello('a-gomme', 'Strategia gomme', '<p class="note">Le strategie più veloci con i numeri sotto: ' + ts.total_laps + ' giri, ' + nf0.format(ts.pit_loss) + ' s persi a ogni sosta, degrado lineare. Niente traffico né safety car: dice quale strategia conviene con questi numeri, non quale useranno.</p>'
          + '<p>' + (dalleLibere ? '<span class="st ok">Parametri dalle libere</span>' : '<span class="st ne">Parametri stimati, non dalle libere di questo weekend</span>') + '</p>'
          + '<div class="tbl"><table class="t"><thead><tr><th>Strategia</th><th class="num">Soste</th><th class="num">Giri delle soste</th><th class="num">Distacco</th></tr></thead><tbody>'
          + st.map(function (r, i) {
            return '<tr><td>' + esc(r.nome) + '</td><td class="num">' + r.soste + '</td><td class="num">' + r.giri.join(', ') + '</td><td class="num">' + (i ? '+' + nf1.format(r.t - st[0].t) + ' s' : 'la più veloce') + '</td></tr>';
          }).join('') + '</tbody></table></div>'
          + '<p class="note">Degrado per giro: ' + ['SOFT', 'MEDIUM', 'HARD'].filter(function (m) { return ts.compounds[m]; }).map(function (m) { return { SOFT: 'morbida', MEDIUM: 'media', HARD: 'dura' }[m] + ' ' + nf2.format(ts.compounds[m].deg_per_lap) + ' s'; }).join(', ') + '.</p>');
      }
    }

    var po = (D.pit_optimizer || []).slice().sort(function (a, b) { return a.avg_pit_lap - b.avg_pit_lap; });
    if (po.length) {
      var fin = function (w) { return (w && w.length === 2) ? 'giri ' + w[0] + '–' + w[1] : '–'; };
      var MESC = { soft: 'morbida', medium: 'media', hard: 'dura' };
      h += pannello('a-pit', 'Strategie e pit stop', '<p class="note">Dalle soste della stagione: giro medio della prima sosta, soste per gara e finestre per anticipare o ritardare la sosta rispetto a chi sta davanti.</p>'
        + '<div class="tbl"><table class="t"><thead><tr><th>Squadra</th><th class="num">Sosta</th><th class="num">Soste</th><th class="hide-s">Mescola</th><th class="hide-m">Anticipo</th><th class="hide-m">Ritardo</th></tr></thead><tbody>'
        + po.map(function (r) {
          return '<tr><td><div class="drv">' + sw(r.team) + '<b>' + esc(sq(r.team)) + '</b></div></td><td class="num">' + nf1.format(r.avg_pit_lap) + '</td><td class="num">' + nf1.format(r.avg_stops) + '</td><td class="hide-s">' + esc(MESC[r.strategy] || r.strategy || '') + '</td><td class="hide-m">' + fin(r.undercut_window) + '</td><td class="hide-m">' + fin(r.overcut_window) + '</td></tr>';
        }).join('') + '</tbody></table></div>');
    }

    var hh = D.h2h || {};
    if ((hh.drivers || []).length && (hh.matrix || []).length) {
      var mat = {}; hh.matrix.forEach(function (r) { mat[r.driver] = r.vs || {}; });
      h += pannello('a-h2h', 'H2H, testa a testa', '<p class="note">Probabilità che il pilota della riga arrivi davanti a quello della colonna. Sopra il 50% è favorito.</p><div class="tbl"><table class="hm"><thead><tr><th></th>'
        + hh.drivers.map(function (c) { return '<th title="' + esc(nm(c)) + '">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>'
        + hh.drivers.map(function (a) {
          return '<tr><th class="r">' + esc(nm(a)) + '</th>' + hh.drivers.map(function (b) {
            if (a === b) return '<td class="io">–</td>';
            var v = (mat[a] || {})[b];
            if (v == null) return '<td class="io"></td>';
            var pc = Math.round(v * 100), forte = pc >= 62;
            return '<td style="background:color-mix(in srgb, var(--s1) ' + Math.round(v * 85) + '%, transparent);color:' + (forte ? '#fff' : 'var(--ink)') + '" title="' + esc(nm(a)) + ' davanti a ' + esc(nm(b)) + ': ' + pc + '%">' + pc + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>', true);
    }

    var tr = (D.team_radar || []).slice().sort(function (a, b) { return b.race_pace - a.race_pace; });
    if (tr.length) {
      var voci = [['quali_pace', 'Qualifica'], ['race_pace', 'Passo gara'], ['reliability', 'Affidabilità'], ['pit_speed', 'Pit stop'], ['tyre_deg', 'Gomme']]
        .filter(function (v) { var x = tr.map(function (r) { return r[v[0]]; }).filter(function (q) { return q != null; }); return x.length && Math.max.apply(null, x) > Math.min.apply(null, x); });
      h += pannello('a-squadre', 'Squadre a confronto', '<p class="note">Punteggi da 0 a 100 calcolati sulla stagione: 100 è la migliore in quella voce.</p><div class="tbl"><table class="t"><thead><tr><th>Squadra</th>'
        + voci.map(function (v, i) { return '<th class="' + (i > 2 ? 'hide-m' : '') + '">' + v[1] + '</th>'; }).join('') + '</tr></thead><tbody>'
        + tr.map(function (r) {
          return '<tr><td><div class="drv">' + sw(r.team) + '<b>' + esc(sq(r.team)) + '</b></div></td>' + voci.map(function (v, i) {
            var x = Math.max(0, Math.min(100, r[v[0]] || 0));
            return '<td class="' + (i > 2 ? 'hide-m' : '') + '"><div class="meter"><span class="bar"><i style="width:' + x + '%"></i></span><span class="v num">' + nf0.format(x) + '</span></div></td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>', true);
    }

    $('s-analisi').innerHTML = '<div class="intro"><p class="eyebrow">Analisi</p><h1>Dentro i numeri</h1><p class="lead">I dati che il modello usa, letti da vicino: passo, Super Times, ERS, sviluppo, sorpassi, ritiri, safety car e strategie.</p></div>'
      + (indice.length ? chipsHtml('a-indice', indice, 'Vai a una scheda') : '') + '<div class="panels">' + h + '</div>';
    suClic('a-indice', function (k) { var el = $(k); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

    var sel = $('pg-sel');
    if (sel) {
      var disegna = function () {
        var g = pg[+sel.value] || pg[0];
        var dr = (g.drivers || []).filter(function (d) { return !d.pochi_giri && d.gap != null; }).slice().sort(function (a, b) { return a.gap - b.gap; }).slice(0, 12);
        var mx = Math.max.apply(null, dr.map(function (d) { return d.gap; })) || 1;
        $('pg').innerHTML = dr.length ? barList(dr.map(function (d) { return { lab: sw(d.team) + esc(nm(d.driver)), v: d.gap, txt: d.gap ? '+' + nf2.format(d.gap) + ' s' : 'riferimento' }; }), { max: mx }) : '<p class="note">Nessun dato per questa gara.</p>';
      };
      sel.addEventListener('change', disegna);
      disegna();
    }
    var gs = $('gf-sel');
    if (gs) {
      var arrivi = function () {
        var g = gare[+gs.value];
        var righe = gf.filter(function (r) { return r.race === g; }).sort(function (a, b) { return (a.finish == null) - (b.finish == null) || (a.finish || 0) - (b.finish || 0) || (a.grid || 99) - (b.grid || 99); });
        $('gf').innerHTML = '<table class="t"><thead><tr><th>Pilota</th><th class="num">Partenza</th><th class="num">Arrivo</th><th class="num">±</th></tr></thead><tbody>'
          + righe.map(function (r) {
            var via = r.grid > 0 ? r.grid : 'box', fine = r.finish == null ? '<span class="rit">rit.</span>' : r.finish;
            var d = (r.finish == null || !(r.grid > 0)) ? '' : (r.gained > 0 ? '<span class="st ok">+' + r.gained + '</span>' : r.gained < 0 ? '<span class="st no">−' + (-r.gained) + '</span>' : '=');
            return '<tr><td><div class="drv">' + sw(r.team) + '<b>' + esc(nm(r.driver)) + '</b></div></td><td class="num">' + via + '</td><td class="num">' + fine + '</td><td class="num">' + d + '</td></tr>';
          }).join('') + '</tbody></table>';
        var rh = (D.race_history || []).filter(function (r) { return r.race === g && (r.type || 'race') === 'race'; })[0] || {};
        var rit = (rh.dnf_mech || []).concat(rh.dnf_incident || []);
        $('gf').innerHTML += '<p class="note">' + (rit.length ? 'Ritirati, non in tabella: ' + rit.map(nm).join(', ') + '. ' : '') + 'Chi non è partito compare all\'ultimo posto.</p>';
      };
      gs.addEventListener('change', arrivi);
      arrivi();
    }
  }

  /* ── Metodo ─────────────────────────────────────────────────────────────── */
  function renderMetodo() {
    var h = '<div class="intro"><p class="eyebrow">Metodo</p><h1>Come nascono le probabilità</h1><p class="lead">Un modello statistico simula ogni gara ' + nf0.format(D.n_sim || 0) + ' volte con i dati pubblici disponibili in quel momento, e conta quante volte succede ogni cosa.</p></div><div class="prose">';
    h += '<section><h3>Cosa entra nel modello</h3><ul><li>La griglia di partenza, o quella prevista se la qualifica non c\'è ancora.</li><li>Il passo di gara delle gare precedenti della stagione e delle libere del weekend.</li><li>L\'affidabilità di macchine e piloti: quanto spesso si ritirano.</li><li>Il tipo di pista e quanto è facile sorpassare.</li><li>La pioggia prevista nelle ore della gara, come più caos e più safety car.</li></ul></section>';
    h += '<section><h3>Cosa vuol dire 30%</h3><p>Che su dieci gare come questa l\'evento succede circa tre volte. Il modello è controllato su 92 gare delle stagioni 2022-25, senza dati dal futuro, e sulla stagione in corso: i numeri sono nella sezione Track record.</p><p>La fascia 80% dice dove finisce il pilota in 8 simulazioni su 10. È larga quando il modello è incerto: non è un difetto, è l\'informazione.</p></section>';
    h += '<section><h3>Quando si aggiorna</h3><p>Prima del weekend, dopo le libere e dopo la qualifica. Ogni versione viene congelata e pubblicata su GitHub prima della sessione che prevede, con la griglia ufficiale della FIA quando è già uscita. Le penalità annunciate dopo il congelamento non ci sono.</p></section>';
    h += '<section><h3>Cosa non sa fare</h3><ul><li>Non conosce la bravura di ogni pilota sul bagnato: la prova sulle stagioni passate non l\'ha trovata.</li><li>Chi parte molto indietro a volte prende più probabilità di quante ne meriti: è uno dei problemi in prova per il 2027.</li><li>Gli aggiornamenti tecnici delle squadre entrano solo quando si vedono nei tempi.</li></ul></section>';
    h += '<section><h3>Le regole che ci diamo</h3><ul><li>Ogni prova sul modello si scrive prima di vedere i numeri, nel registro dei protocolli, e dopo non si cambia.</li><li>Durante la stagione il modello non cambia: le idee nuove si provano a dicembre, per l\'anno dopo.</li><li>Il track record non si riscrive: gli errori si correggono con note pubbliche datate.</li></ul></section>';
    h += '<section><h3>Chi siamo</h3><p>PoleLap è un progetto amatoriale e non commerciale: niente abbonamenti, niente pubblicità, niente link a operatori di gioco. I dati vengono da OpenF1, Jolpica e FastF1; le previsioni congelate e le note sono pubbliche.</p></section>';
    h += '</div>';
    $('s-metodo').innerHTML = h;
  }

  /* ── Avvio e navigazione ────────────────────────────────────────────────── */
  var VISTE = ['weekend', 'campionato', 'trackrecord', 'analisi', 'metodo'];
  var PANNELLI = { weekend: renderWeekend, campionato: renderCampionato, trackrecord: renderTrack, analisi: renderAnalisi, metodo: renderMetodo };
  function mostra(scorri) {
    var v = location.hash.slice(1);
    if (VISTE.indexOf(v) < 0) v = 'weekend';
    document.querySelectorAll('.view').forEach(function (s) { s.hidden = s.dataset.view !== v; });
    document.querySelectorAll('.tabs a').forEach(function (a) { if (a.dataset.v === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (v === 'campionato') disegnaCampionato();
    if (scorri) window.scrollTo(0, 0);
  }
  function j(url) {
    return fetch(url + '?_=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(url + ': ' + r.status); return r.json(); });
  }
  function niente() { return null; }
  window.addEventListener('hashchange', function () { mostra(true); });
  var tm; window.addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(disegnaCampionato, 150); });
  mostra(false);
  Promise.all([j('data/previsione.json'), j('data/calibration.json').catch(niente), j('data/pace_skill.json').catch(niente), j('data/pace_hist.json').catch(niente)])
    .then(function (x) {
      Object.assign(D, x[0], { calibration: x[1], pace_skill: x[2], pace_hist: x[3] });
      cal = (D.calendar || {}).races || [];
      var rd = (D.weather_info || {}).race_date;
      corsa = cal.filter(function (r) { return rd && r.date === rd; })[0] || cal.filter(function (r) { return r.status !== 'past'; })[0] || cal[cal.length - 1] || null;
      anno = String((corsa && corsa.date) || D.aggiornato || '2026').slice(0, 4);
      [renderWeekend, renderCampionato, renderTrack, renderAnalisi, renderMetodo].forEach(function (f) {
        try { f(); } catch (e) {
          var k = Object.keys(PANNELLI).filter(function (v) { return PANNELLI[v] === f; })[0];
          if ($('s-' + k)) $('s-' + k).innerHTML = '<p class="errore">Questa sezione non si è caricata (' + esc(e.message) + '). Le previsioni congelate restano su GitHub.</p>';
        }
      });
      if (D.aggiornato) $('aggiornato').textContent = 'Dati aggiornati il ' + D.aggiornato.split('-').reverse().join('/') + '.';
      mostra(false);
    })
    .catch(function (e) {
      $('s-weekend').innerHTML = '<p class="errore">La previsione non si è caricata (' + esc(e.message) + '). Riprova tra poco: le previsioni congelate sono comunque su <a href="' + REPO + '/tree/main/track_record">GitHub</a>.</p>';
    });
})();
